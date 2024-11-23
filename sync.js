import { getMerkleRoot, verifyItem } from './merkle.js';
import { saveMessage, getMessages, saveVote, getVotes } from './database.js';

const peers = {}; // Aktiiviset vertaisverkko-yhteydet
let signalingServer; // Signaalointipalvelin yhteyden muodostamiseksi

/**
 * Alustaa yhteyden signaalointipalvelimeen.
 * @param {string} signalingUrl - Signaalointipalvelimen URL
 */
export function initializeSignalingServer(signalingUrl) {
  signalingServer = new WebSocket(signalingUrl);

  signalingServer.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'offer') {
      handleOffer(data.from, data.offer);
    } else if (data.type === 'answer') {
      handleAnswer(data.from, data.answer);
    } else if (data.type === 'candidate') {
      handleCandidate(data.from, data.candidate);
    }
  };

  signalingServer.onopen = () => {
    console.log('Signaalointipalvelin yhdistetty');
  };
}

/**
 * Luo WebRTC-yhteyden uuteen solmuun.
 * @param {string} peerId - Toisen solmun tunniste
 */
export function connectToPeer(peerId) {
  if (peers[peerId]) return; // Yhteys on jo olemassa

  const peer = new RTCPeerConnection();
  peers[peerId] = peer;

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      signalingServer.send(
        JSON.stringify({
          type: 'candidate',
          to: peerId,
          candidate: event.candidate,
        })
      );
    }
  };

  peer.ondatachannel = (event) => {
    setupDataChannel(peerId, event.channel);
  };

  const dataChannel = peer.createDataChannel('data');
  setupDataChannel(peerId, dataChannel);

  peer.createOffer().then((offer) => {
    peer.setLocalDescription(offer);
    signalingServer.send(
      JSON.stringify({
        type: 'offer',
        to: peerId,
        offer,
      })
    );
  });
}

/**
 * Käsittelee saapuvan WebRTC-tarjouksen.
 * @param {string} peerId - Tarjouksen lähettäjän tunniste
 * @param {RTCSessionDescriptionInit} offer - Tarjous
 */
function handleOffer(peerId, offer) {
  const peer = new RTCPeerConnection();
  peers[peerId] = peer;

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      signalingServer.send(
        JSON.stringify({
          type: 'candidate',
          to: peerId,
          candidate: event.candidate,
        })
      );
    }
  };

  peer.ondatachannel = (event) => {
    setupDataChannel(peerId, event.channel);
  };

  peer.setRemoteDescription(offer).then(() => {
    return peer.createAnswer();
  }).then((answer) => {
    peer.setLocalDescription(answer);
    signalingServer.send(
      JSON.stringify({
        type: 'answer',
        to: peerId,
        answer,
      })
    );
  });
}

/**
 * Käsittelee saapuvan vastauksen.
 * @param {string} peerId - Vastauksen lähettäjän tunniste
 * @param {RTCSessionDescriptionInit} answer - Vastaus
 */
function handleAnswer(peerId, answer) {
  const peer = peers[peerId];
  peer.setRemoteDescription(answer);
}

/**
 * Käsittelee saapuvan ICE-kandidaatin.
 * @param {string} peerId - Kandidaatin lähettäjän tunniste
 * @param {RTCIceCandidate} candidate - ICE-kandidaatti
 */
function handleCandidate(peerId, candidate) {
  const peer = peers[peerId];
  peer.addIceCandidate(candidate);
}

/**
 * Asettaa DataChannelin viestintälogiikan.
 * @param {string} peerId - Solmun tunniste
 * @param {RTCDataChannel} dataChannel - DataChannel
 */
function setupDataChannel(peerId, dataChannel) {
  dataChannel.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'sync') {
      await handleSync(message.data);
    } else if (message.type === 'verify') {
      const isValid = verifyItem(message.data);
      console.log(`Data validointi ${isValid ? 'onnistui' : 'epäonnistui'}`);
    }
  };

  dataChannel.onopen = () => {
    console.log(`Yhteys avattu solmun ${peerId} kanssa`);
    syncWithPeer(peerId);
  };
}

/**
 * Synkronoi datan toisen solmun kanssa.
 * @param {string} peerId - Kohdesolmu
 */
async function syncWithPeer(peerId) {
  const messages = await getMessages();
  const votes = await getVotes();

  peers[peerId].send(
    JSON.stringify({
      type: 'sync',
      data: { messages, votes },
    })
  );
}

/**
 * Käsittelee saapuvan synkronointipyynnön.
 * @param {Object} data - Synkronoitava data
 */
async function handleSync(data) {
  for (const message of data.messages) {
    await saveMessage(message.content);
  }
  for (const vote of data.votes) {
    await saveVote(vote.option);
  }
}


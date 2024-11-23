import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { getMerkleRoot, verifyItem } from './merkle.js';
import { saveMessage, getMessages, saveVote, getVotes } from './database.js';

// Luo Y.js-dokumentti
const ydoc = new Y.Doc();

// WebRTC-synkronointi
const provider = new WebrtcProvider('room-id', ydoc);

// CRDT-taulukot viesteille ja äänestyksille
const messages = ydoc.getArray('messages');
const votes = ydoc.getArray('votes');

// Kuuntele Y.js-päivityksiä
messages.observe(() => renderMessages());
votes.observe(() => renderVotes());

/**
 * Tallenna uusi viesti Y.js-taulukkoon
 * @param {string} content - Viestin sisältö
 */
export function saveMessage(content) {
  messages.push([{ id: Date.now(), content }]);
}

/**
 * Palauttaa kaikki viestit
 * @returns {Array} - Lista viesteistä
 */
export function getMessages() {
  return messages.toArray();
}

/**
 * Lisää äänestysvaihtoehto tai kasvattaa äänten määrää
 * @param {string} option - Äänestettävä vaihtoehto
 */
export function saveVote(option) {
  const existingVote = votes.toArray().find((vote) => vote.option === option);
  if (existingVote) {
    const updatedVotes = votes.toArray().map((vote) =>
      vote.option === option
        ? { ...vote, count: vote.count + 1 }
        : vote
    );
    votes.delete(0, votes.length);
    votes.push(updatedVotes);
  } else {
    votes.push([{ id: Date.now(), option, count: 1 }]);
  }
}

/**
 * Palauttaa kaikki äänestysvaihtoehdot
 * @returns {Array} - Lista äänestysvaihtoehdoista
 */
export function getVotes() {
  return votes.toArray();
}

/**
 * Renderöi viestit käyttöliittymään
 */
function renderMessages() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';
  getMessages().forEach((msg) => {
    const p = document.createElement('p');
    p.textContent = msg.content;
    messagesDiv.appendChild(p);
  });
}

/**
 * Renderöi äänestystulokset käyttöliittymään
 */
function renderVotes() {
  const voteList = document.getElementById('vote-results');
  voteList.innerHTML = '';
  getVotes().forEach((vote) => {
    const li = document.createElement('li');
    li.textContent = `${vote.option} (${vote.count} ääntä)`;
    voteList.appendChild(li);
  });
}

// Alustetaan näkymä
renderMessages();
renderVotes();

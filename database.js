import * as Y from 'https://cdn.jsdelivr.net/npm/yjs@13.5.47/dist/yjs.mjs';
import { WebsocketProvider } from 'https://raw.githubusercontent.com/yjs/y-websocket/refs/heads/master/src/y-websocket.js';

// Luo Y.js-dokumentti
const ydoc = new Y.Doc();

// WebSocket Provider - määritä palvelinosoite ja huoneen nimi
const provider = new WebsocketProvider('wss://demos.yjs.dev', 'distributedApp', ydoc);

// CRDT-taulukot viesteille ja äänestyksille
const messages = ydoc.getArray('messages');
const votes = ydoc.getArray('votes');

/**
 * Tallenna uusi viesti Y.js-taulukkoon.
 * @param {string} content - Viestin sisältö
 */
export function saveMessage(content) {
  messages.push([{ id: Date.now(), content }]);
}

/**
 * Palauttaa kaikki viestit Y.js-taulukosta.
 * @returns {Array} - Lista viesteistä
 */
export function getMessages() {
  return messages.toArray();
}

/**
 * Lisää äänestysvaihtoehdon Y.js-taulukkoon tai kasvattaa äänten määrää.
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
 * Palauttaa kaikki äänestysvaihtoehdot Y.js-taulukosta.
 * @returns {Array} - Lista äänestysvaihtoehdoista
 */
export function getVotes() {
  return votes.toArray();
}

// Kuuntele WebSocketin synkronointitapahtumia (valinnainen debug-loki)
provider.on('status', (event) => {
  console.log(event.status === 'connected' ? 'Synkronoitu palvelimen kanssa' : 'Ei yhteyttä palvelimeen');
});

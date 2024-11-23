import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// Luo Y.js-dokumentti ja CRDT-rakenteet
const ydoc = new Y.Doc();
const messages = ydoc.getArray('messages');
const votes = ydoc.getArray('votes');

// Integroi IndexedDB tallennukseen
const persistence = new IndexeddbPersistence('distributedApp', ydoc);

/**
 * Alustaa Y.js-dokumentin ja varmistaa, että tiedot ladataan paikallisesti.
 * @returns {Promise<void>}
 */
export async function initDB() {
  return new Promise((resolve) => {
    persistence.on('synced', () => {
      console.log('Y.js-dokumentti synkronoitu IndexedDB:n kanssa.');
      resolve();
    });
  });
}

/**
 * Tallentaa viestin Y.js-taulukkoon.
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
    // Päivitä äänten määrä (Y.js ei tue suoraa objektin päivitystä, joten teemme uuden listan)
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

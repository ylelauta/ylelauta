import * as Automerge from 'automerge';

let db;
let messagesDoc = Automerge.init(); // CRDT-dokumentti viesteille
let votesDoc = Automerge.init();    // CRDT-dokumentti äänestyksille

/**
 * Alustaa IndexedDB-tietokannan ja lataa CRDT-dokumentit.
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('distributedApp', 1);
    const Automerge = window.Automerge;

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
      db.createObjectStore('votes', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      loadDocsFromDB().then(resolve).catch(reject);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Tallentaa viestin CRDT-dokumenttiin ja IndexedDB:hen.
 * @param {string} content - Viestin sisältö
 */
export async function saveMessage(content) {
  messagesDoc = Automerge.change(messagesDoc, (doc) => {
    doc.messages = doc.messages || [];
    doc.messages.push({ id: Date.now(), content });
  });

  await saveDocToDB('messages', messagesDoc);
}

/**
 * Palauttaa kaikki viestit CRDT-dokumentista.
 * @returns {Array} - Lista viesteistä
 */
export async function getMessages() {
  return messagesDoc.messages || [];
}

/**
 * Lisää äänestysvaihtoehdon CRDT-dokumenttiin ja IndexedDB:hen.
 * @param {string} option - Äänestettävä vaihtoehto
 */
export async function saveVote(option) {
  votesDoc = Automerge.change(votesDoc, (doc) => {
    doc.votes = doc.votes || [];
    const existingVote = doc.votes.find((vote) => vote.option === option);
    if (existingVote) {
      existingVote.count += 1;
    } else {
      doc.votes.push({ id: Date.now(), option, count: 1 });
    }
  });

  await saveDocToDB('votes', votesDoc);
}

/**
 * Palauttaa kaikki äänestysvaihtoehdot CRDT-dokumentista.
 * @returns {Array} - Lista äänestysvaihtoehdoista
 */
export async function getVotes() {
  return votesDoc.votes || [];
}

/**
 * Lataa CRDT-dokumentit IndexedDB:stä.
 */
async function loadDocsFromDB() {
  messagesDoc = await loadDocFromDB('messages', messagesDoc);
  votesDoc = await loadDocFromDB('votes', votesDoc);
}

/**
 * Tallentaa CRDT-dokumentin IndexedDB:hen.
 * @param {string} storeName - Tallennuskohteen nimi
 * @param {Object} doc - CRDT-dokumentti
 */
async function saveDocToDB(storeName, doc) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = store.put({
      id: 1,
      data: Automerge.save(doc),
    });

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Lataa CRDT-dokumentin IndexedDB:stä.
 * @param {string} storeName - Tallennuskohteen nimi
 * @param {Object} defaultDoc - Oletusdokumentti
 */
async function loadDocFromDB(storeName, defaultDoc) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    const request = store.get(1);

    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result) {
        resolve(Automerge.load(result.data));
      } else {
        resolve(defaultDoc);
      }
    };

    request.onerror = (event) => reject(event.target.error);
  });
}

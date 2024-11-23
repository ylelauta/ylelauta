import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// Luo Y.js-dokumentti
const ydoc = new Y.Doc();

// IndexedDB-persistenssi
const persistence = new IndexeddbPersistence('distributedApp', ydoc);

// Luo CRDT-taulukot
export const messages = ydoc.getArray('messages'); // Viestit
export const votes = ydoc.getArray('votes'); // Äänet

// Synkronointiloki
persistence.on('synced', () => {
  console.log('Y.js-dokumentti synkronoitu IndexedDB:n kanssa.');
});

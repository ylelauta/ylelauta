import { messages, votes } from './database.js';

// Lisää uusi viesti
messages.push([{ id: Date.now(), content: 'Hello Y.js!' }]);

// Tulosta kaikki viestit
console.log(messages.toArray());

// Lisää uusi äänestysvaihtoehto
votes.push([{ id: Date.now(), option: 'Option A', count: 1 }]);

// Tulosta kaikki äänestykset
console.log(votes.toArray());

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

// Luo Y.js-dokumentti
const ydoc = new Y.Doc();

// WebRTC-synkronointi
const webrtcProvider = new WebrtcProvider('your-room-id', ydoc);

// IndexedDB-persistenssi paikalliseen tallennukseen
const persistence = new IndexeddbPersistence('distributedApp', ydoc);

// Luo CRDT-taulukot
const messages = ydoc.getArray('messages');
const votes = ydoc.getArray('votes');

// Valitse HTML-elementit
const messageInput = document.getElementById('new-message');
const sendButton = document.getElementById('send-message');
const voteButton = document.getElementById('new-vote');
const messagesDiv = document.getElementById('messages');
const voteResults = document.getElementById('vote-results');

// Lähetä uusi viesti
sendButton.addEventListener('click', () => {
  const content = messageInput.value.trim();
  if (content) {
    messages.push([{ id: Date.now(), content }]); // Lisää viesti CRDT-taulukkoon
    messageInput.value = ''; // Tyhjennä kenttä
    renderMessages(); // Päivitä näkymä
  }
});

// Aloita uusi äänestys
voteButton.addEventListener('click', () => {
  const option = prompt("Kirjoita äänestettävä vaihtoehto:");
  if (option) {
    const existingVote = votes.find(vote => vote.option === option);
    if (existingVote) {
      existingVote.count += 1; // Lisää ääni olemassa olevaan vaihtoehtoon
    } else {
      votes.push([{ id: Date.now(), option, count: 1 }]); // Luo uusi vaihtoehto
    }
    renderVotes(); // Päivitä näkymä
  }
});

// Renderöi viestit HTML-näkymään
function renderMessages() {
  messagesDiv.innerHTML = ''; // Tyhjennä viestialue
  messages.toArray().forEach(msg => {
    const p = document.createElement('p');
    p.textContent = msg.content;
    messagesDiv.appendChild(p);
  });
}

// Renderöi äänestystulokset HTML-näkymään
function renderVotes() {
  voteResults.innerHTML = ''; // Tyhjennä tulokset
  votes.toArray().forEach(vote => {
    const li = document.createElement('li');
    li.textContent = `${vote.option} (${vote.count} ääntä)`;
    voteResults.appendChild(li);
  });
}

// Päivitä käyttöliittymän tilat
async function updateUI() {
  // Näyteominaisuuksia kuten roolit ja pisteet voidaan päivittää tässä, esim:
  document.getElementById('user-role').textContent = 'Roolisi: Tarkkailija';
  document.getElementById('user-score').textContent = 'Pisteesi: 10';
  document.getElementById('uptime-status').textContent = 'Ylläpitoaika: 5h';
}

// Synkronoi data ja alusta käyttöliittymä
persistence.on('synced', () => {
  console.log('Paikallinen tallennus synkronoitu.');
  renderMessages();
  renderVotes();
});

webrtcProvider.on('synced', () => {
  console.log('WebRTC-synkronointi valmis.');
  renderMessages();
  renderVotes();
});

// Ensimmäinen renderöinti
renderMessages();
renderVotes();
updateUI();

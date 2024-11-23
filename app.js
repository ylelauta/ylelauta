import { initDB, saveMessage, getMessages, saveVote, getVotes } from './database.js';
import { syncWithPeers } from './sync.js';
import { calculateUptime, updateMerkleTree } from './merkle.js';
import { updateRole, getRole } from './roles.js';
import { updateTrust, getScore } from './trust.js';

const messageInput = document.getElementById('new-message');
const sendButton = document.getElementById('send-message');
const voteButton = document.getElementById('new-vote');

// Lähetä uusi viesti
sendButton.addEventListener('click', async () => {
  const content = messageInput.value.trim();
  if (content) {
    await saveMessage(content);
    await syncWithPeers();
    renderMessages();
    messageInput.value = '';
  renderMessages();
}
});

// Aloita uusi äänestys
voteButton.addEventListener('click', async () => {
  const option = prompt("Kirjoita äänestettävä vaihtoehto:");
  if (option) {
    await saveVote(option);
    await syncWithPeers();
    renderVotes();
  }
});

async function renderMessages() {
  const messages = await getMessages();
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';
  messages.forEach(msg => {
    const p = document.createElement('p');
    p.textContent = msg;
    messagesDiv.appendChild(p);
  });
}

async function renderVotes() {
  const votes = await getVotes();
  const voteList = document.getElementById('vote-results');
  voteList.innerHTML = '';
  votes.forEach(vote => {
    const li = document.createElement('li');
    li.textContent = `${vote.option} (${vote.count} ääntä)`;
    voteList.appendChild(li);
  });
}

// Päivitä käyttöliittymän tilat
async function updateUI() {
  const role = await getRole();
  const score = await getScore();
  const uptime = await calculateUptime();

  document.getElementById('user-role').textContent = `Roolisi: ${role}`;
  document.getElementById('user-score').textContent = `Pisteesi: ${score}`;
  document.getElementById('uptime-status').textContent = `Ylläpitoaika: ${uptime}h`;
}

// Alusta sovellus
initDB().then(() => {
  syncWithPeers();
  renderMessages();
  renderVotes();
  updateUI();
});

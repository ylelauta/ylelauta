import crypto from 'crypto';

let uptimeLog = []; // Lokitieto ylläpitoajoista
let merkleTree = []; // Merkle-puu

/**
 * Lisää ylläpitoaika lokiin ja päivittää Merkle-puun.
 * @param {string} nodeId - Solmun yksilöllinen tunniste
 * @param {number} uptime - Solmun ylläpitoaika tunteina
 */
export function logUptime(nodeId, uptime) {
  const timestamp = Date.now();
  const logEntry = { nodeId, uptime, timestamp };
  uptimeLog.push(logEntry);
  updateMerkleTree(uptimeLog);
}

/**
 * Palauttaa solmun ylläpitoajan kokonaismäärän.
 * @param {string} nodeId - Solmun yksilöllinen tunniste
 * @returns {number} - Ylläpitoaika tunteina
 */
export function calculateUptime(nodeId) {
  return uptimeLog
    .filter((entry) => entry.nodeId === nodeId)
    .reduce((sum, entry) => sum + entry.uptime, 0);
}

/**
 * Päivittää Merkle-puun annetun datan perusteella.
 * @param {Array} data - Syötetiedot (esim. uptime-logit)
 */
export function updateMerkleTree(data) {
  const hashes = data.map((item) => hashItem(item));
  merkleTree = buildMerkleTree(hashes);
}

/**
 * Palauttaa Merkle-puun juurihakemiston.
 * @returns {string} - Juurihakemiston hash
 */
export function getMerkleRoot() {
  return merkleTree[0] || null;
}

/**
 * Tarkistaa, onko tietty dataosa olemassa Merkle-puussa.
 * @param {Object} item - Tarkistettava dataosa
 * @returns {boolean} - Totuusarvo, löytyykö data puusta
 */
export function verifyItem(item) {
  const itemHash = hashItem(item);
  return merkleTree.includes(itemHash);
}

/**
 * Luo yksittäisen dataosan hash SHA-256-algoritmilla.
 * @param {Object} item - Hashattava dataosa
 * @returns {string} - Dataosan hash
 */
function hashItem(item) {
  return crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex');
}

/**
 * Rakentaa Merkle-puun hash-listasta.
 * @param {Array} hashes - Alkuperäiset hashit
 * @returns {Array} - Merkle-puu
 */
function buildMerkleTree(hashes) {
  if (hashes.length === 0) return [];
  let tree = [...hashes];

  while (tree.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < tree.length; i += 2) {
      const left = tree[i];
      const right = tree[i + 1] || '';
      const combinedHash = hashItem(left + right);
      nextLevel.push(combinedHash);
    }
    tree = nextLevel;
  }

  return tree;
}

/**
 * Palauttaa ylläpitologin Merkle-puun tilan.
 * @returns {Array} - Ylläpitoloki
 */
export function getUptimeLog() {
  return uptimeLog;
}

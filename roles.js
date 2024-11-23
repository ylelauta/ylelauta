import { calculateUptime } from './merkle.js';
import { getTrustProfile } from './trust.js';

const roles = {}; // Käyttäjien roolit: { userId: role }

/**
 * Päivittää käyttäjän roolin dynaamisesti ylläpitoajan ja luottamusprofiilin perusteella.
 * @param {string} userId - Käyttäjän yksilöllinen tunniste
 */
export function updateRole(userId) {
  const uptime = calculateUptime(userId);
  const trustProfile = getTrustProfile(userId);
  const totalScore = trustProfile.score + uptime;

  let newRole;

  if (uptime > 100) {
    newRole = 'Admin'; // Pisimmän uptime-ajan omistavat käyttäjät ovat ylläpitäjiä
  } else if (trustProfile.score > 50) {
    newRole = 'Moderator'; // Korkean pisteen käyttäjät ovat moderaattoreita
  } else if (trustProfile.activity > 20) {
    newRole = 'Contributor'; // Aktiiviset käyttäjät ovat osallistujia
  } else {
    newRole = 'Observer'; // Passiiviset käyttäjät ovat tarkkailijoita
  }

  roles[userId] = newRole;
}

/**
 * Palauttaa käyttäjän nykyisen roolin.
 * @param {string} userId - Käyttäjän yksilöllinen tunniste
 * @returns {string} - Käyttäjän rooli
 */
export function getRole(userId) {
  return roles[userId] || 'Observer';
}

/**
 * Päivittää kaikkien käyttäjien roolit.
 * @param {Array} userIds - Lista käyttäjien tunnisteista
 */
export function updateAllRoles(userIds) {
  userIds.forEach((userId) => {
    updateRole(userId);
  });
}

/**
 * Palauttaa kaikki käyttäjät ja heidän roolinsa.
 * @returns {Object} - Kaikki käyttäjät ja heidän roolinsa
 */
export function getAllRoles() {
  return roles;
}

/**
 * Palauttaa käyttäjät tietyn roolin perusteella.
 * @param {string} role - Haluttu rooli (esim. 'Admin', 'Moderator')
 * @returns {Array} - Lista käyttäjätunnisteista, joilla on kyseinen rooli
 */
export function getUsersByRole(role) {
  return Object.entries(roles)
    .filter(([, userRole]) => userRole === role)
    .map(([userId]) => userId);
}

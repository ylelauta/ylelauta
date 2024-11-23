let trustProfiles = {}; // Käyttäjien luottamusprofiilit: { userId: { score, activity, feedback } }

/**
 * Päivittää käyttäjän luottamusprofiilia aktiivisuuden perusteella.
 * @param {string} userId - Käyttäjän yksilöllinen tunniste
 * @param {number} activityPoints - Aktiivisuudesta ansaitut pisteet
 */
export function updateTrustActivity(userId, activityPoints) {
  if (!trustProfiles[userId]) {
    trustProfiles[userId] = { score: 0, activity: 0, feedback: [] };
  }
  trustProfiles[userId].activity += activityPoints;
  calculateTrustScore(userId);
}

/**
 * Lisää palautetta käyttäjälle ja päivittää pisteet.
 * @param {string} userId - Käyttäjän yksilöllinen tunniste
 * @param {boolean} positive - Positiivinen palaute (true) tai negatiivinen (false)
 */
export function addFeedback(userId, positive) {
  if (!trustProfiles[userId]) {
    trustProfiles[userId] = { score: 0, activity: 0, feedback: [] };
  }
  trustProfiles[userId].feedback.push(positive ? 1 : -1);
  calculateTrustScore(userId);
}

/**
 * Laskee ja päivittää käyttäjän kokonaispistemäärän.
 * @param {string} userId - Käyttäjän yksilöllinen tunniste
 */
function calculateTrustScore(userId) {
  const profile = trustProfiles[userId];
  const feedbackScore = profile.feedback.reduce((sum, val) => sum + val, 0);
  profile.score = profile.activity + feedbackScore;
}

/**
 * Palauttaa käyttäjän luottamusprofiilin tiedot.
 * @param {string} userId - Käyttäjän yksilöllinen tunniste
 * @returns {Object} - Luottamusprofiili (score, activity, feedback)
 */
export function getTrustProfile(userId) {
  return trustProfiles[userId] || { score: 0, activity: 0, feedback: [] };
}

/**
 * Palauttaa kaikkien käyttäjien luottamusprofiilit.
 * @returns {Object} - Kaikki käyttäjät ja heidän profiilinsa
 */
export function getAllTrustProfiles() {
  return trustProfiles;
}

/**
 * Palauttaa listan käyttäjistä, jotka ansaitsevat korkeimman luottamusarvon.
 * @returns {Array} - Lista käyttäjätunnisteista korkeimman luottamuspistemäärän mukaan
 */
export function getTopTrustProfiles() {
  return Object.entries(trustProfiles)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([userId]) => userId);
}

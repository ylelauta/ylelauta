import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

// Luo Y.js-dokumentti ja synkronointimekanismi
const ydoc = new Y.Doc();
const provider = new WebrtcProvider('trust-room', ydoc);

// Hajautettu luottamusprofiilien tallennus
const trustProfiles = ydoc.getMap('trustProfiles');

// Päivitä aktiivisuuspisteet
export function updateTrustActivity(userId, activityPoints) {
  const profile = trustProfiles.get(userId) || { score: 0, activity: 0, feedback: [] };
  profile.activity += activityPoints;
  profile.score = profile.activity + profile.feedback.reduce((sum, val) => sum + val, 0);
  trustProfiles.set(userId, profile);
}

// Lisää palautepisteet
export function addFeedback(userId, positive) {
  const profile = trustProfiles.get(userId) || { score: 0, activity: 0, feedback: [] };
  profile.feedback.push(positive ? 1 : -1);
  profile.score = profile.activity + profile.feedback.reduce((sum, val) => sum + val, 0);
  trustProfiles.set(userId, profile);
}

// Hae yksittäinen käyttäjäprofiili
export function getTrustProfile(userId) {
  return trustProfiles.get(userId) || { score: 0, activity: 0, feedback: [] };
}

// Hae kaikki käyttäjäprofiilit
export function getAllTrustProfiles() {
  return Array.from(trustProfiles.entries()).reduce((obj, [userId, profile]) => {
    obj[userId] = profile;
    return obj;
  }, {});
}

// Hae korkeimman pisteen käyttäjät
export function getTopTrustProfiles() {
  return Array.from(trustProfiles.entries())
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([userId]) => userId);
}

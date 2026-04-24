import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase lazily
const app = (function() {
  if (typeof window === 'undefined') return null;
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
})();

export const db = app ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId) : null;
export const auth = app ? getAuth(app) : null;
export { app };

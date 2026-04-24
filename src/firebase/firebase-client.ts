import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from './config';

const clientConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
};

if (typeof window !== 'undefined') {
  if (!clientConfig.apiKey) {
    console.warn('[Firebase Client] API Key is missing! Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set or firebase-applet-config.json exists.');
  }
}

// Initialize Firebase lazily
const app = (function() {
  if (typeof window === 'undefined') {
    console.log('[Firebase Client] Skipping init on server');
    return null;
  }
  
  console.log('[Firebase Client] Initializing with config:', {
    projectId: clientConfig.projectId,
    authDomain: clientConfig.authDomain,
    hasApiKey: !!clientConfig.apiKey
  });

  try {
    if (getApps().length > 0) {
      console.log('[Firebase Client] App already exists, returning existing');
      return getApp();
    }
    const initializedApp = initializeApp(clientConfig);
    console.log('[Firebase Client] Successfully initialized new app');
    return initializedApp;
  } catch (error) {
    console.error('[Firebase Client] Failed to initialize Firebase:', error);
    return null;
  }
})();

export const db = app ? getFirestore(app, process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId) : null;
export const auth = app ? getAuth(app) : null;
export { app };

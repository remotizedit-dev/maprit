import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import firebaseConfig from './config';

let _app: App | null = null;
let _adminDb: Firestore | null = null;

export function getAdminApp() {
  if (_app) return _app;

  const apps = getApps();
  if (apps.length > 0) {
    _app = apps[0] as App;
    return _app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (privateKey) {
    privateKey = privateKey.trim().replace(/\\n/g, '\n');
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1).trim();
    }
  }

  if (privateKey && clientEmail && projectId && privateKey.includes('BEGIN PRIVATE KEY')) {
    try {
      _app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return _app;
    } catch (error) {
      console.error("[Firebase Admin] Init error:", error);
    }
  }

  try {
    _app = initializeApp({ projectId });
    return _app;
  } catch (error) {
    return null;
  }
}

export function getAdminDb() {
  if (_adminDb) return _adminDb;

  const app = getAdminApp();
  if (!app) {
    console.error("[Firebase Admin] Cannot get database: App not initialized");
    return null;
  }
  
  try {
    const configDbId = (firebaseConfig as any).firestoreDatabaseId;
    const dbId = process.env.FIREBASE_DATABASE_ID || configDbId || '(default)';
    const finalDbId = dbId === 'default' || !dbId ? '(default)' : dbId;
    
    console.log(`[Firebase Admin] Connecting to database: ${finalDbId} in project: ${process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId}`);
    
    _adminDb = getFirestore(app, finalDbId);
    return _adminDb;
  } catch (error) {
    console.error("[Firebase Admin] DB error:", error);
    return null;
  }
}

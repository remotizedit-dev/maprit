import { NextResponse } from 'next/server';
import firebaseConfig from '@/src/firebase/config';

export async function GET() {
  return NextResponse.json({
    env: {
      projectId: process.env.FIREBASE_PROJECT_ID || '(not set)',
      databaseId: process.env.FIREBASE_DATABASE_ID || '(not set)',
      nextPublicProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '(not set)',
      nextPublicDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || '(not set)',
      nodeEnv: process.env.NODE_ENV
    },
    localConfig: {
      projectId: firebaseConfig.projectId,
      databaseId: (firebaseConfig as any).firestoreDatabaseId
    }
  });
}

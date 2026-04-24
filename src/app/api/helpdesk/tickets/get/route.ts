import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';
import { Ticket } from '@/src/types/ticket';
import firebaseConfig from '@/src/firebase/config';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("[GET Tickets] Firebase Admin not initialized");
      return NextResponse.json({ 
        success: false, 
        message: "Firebase Admin not initialized" 
      }, { status: 500 });
    }

    console.log(`[GET Tickets] Fetching tickets from project: ${process.env.FIREBASE_PROJECT_ID || 'default'}`);

    const snapshot = await adminDb.collection('tickets')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const tickets = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        // Convert timestamps to ISO strings for JSON serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    }) as Ticket[];

    return NextResponse.json({
      success: true,
      tickets
    });

  } catch (error: any) {
    console.error("API Error fetching tickets:", error);
    
    let errorMessage = error.message || "Internal server error";
    const code = error.code || error.status;
    
    // Add more context if it's a code 5 (NOT_FOUND) error
    if (code === 5 || errorMessage.includes('NOT_FOUND')) {
      const currentProjectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || '(unknown)';
      const currentDbId = process.env.FIREBASE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId || '(default)';
      
      errorMessage = `Firestore Database resource not found. 
      This usually means the Database ID is incorrect or the database does not exist in this project.
      Project ID: ${currentProjectId}
      Database ID: ${currentDbId === 'default' ? '(default)' : currentDbId}`;
    }

    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      debug: {
        code: code,
        projectId: process.env.FIREBASE_PROJECT_ID || '(env not set)',
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
      }
    }, { status: 500 });
  }
}

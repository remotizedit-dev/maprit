import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';
import { Ticket } from '@/src/types/ticket';

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
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Internal server error" 
    }, { status: 500 });
  }
}

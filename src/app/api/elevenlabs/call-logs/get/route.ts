import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    const snapshot = await adminDb.collection('call_logs').orderBy('createdAt', 'desc').get();
    const callLogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert timestamps to serializable format if needed, but usually handled by JSON conversion
      // though admin SDK returns objects that might need helper
    }));

    return NextResponse.json({
      success: true,
      callLogs
    });

  } catch (error: any) {
    console.error("Error fetching call logs:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    const targetAgentId = process.env.ELEVENLABS_AGENT_ID || "agent_3601kv308q2jf5m8cagy8v2tfrg9";

    // Retrieve all logs to verify and filter
    const snapshot = await adminDb.collection('call_logs').orderBy('createdAt', 'desc').get();
    
    const callLogs: any[] = [];
    const deletePromises: Promise<any>[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const agentId = data.agentId;

      if (agentId === targetAgentId) {
        callLogs.push({
          id: doc.id,
          ...data,
        });
      } else {
        // Delete records belonging to different agent IDs to keep DB perfectly clean
        console.log(`Safely purging unrelated call log ${doc.id} (Agent ID: ${agentId}) to keep database synchronized with: ${targetAgentId}`);
        deletePromises.push(doc.ref.delete());
      }
    }

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} unrelated call log recordings successfully from Firestore.`);
    }

    return NextResponse.json({
      success: true,
      callLogs
    });

  } catch (error: any) {
    console.error("Error fetching and cleaning call logs:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}

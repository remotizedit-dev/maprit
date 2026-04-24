import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';
import { getBranchByAgentId } from '@/src/lib/agent-branch-map';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("Firebase Admin not initialized");
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    const payload = await req.json();
    console.log("Incoming ElevenLabs Post-Call Payload:", JSON.stringify(payload, null, 2));

    // Extract basic IDs
    const conversationId = payload.conversation_id || "";
    const agentId = payload.agent_id || "";
    
    // Extract Metadata
    const metadata = payload.metadata || {};
    const duration = metadata.call_duration_secs || 0;
    const startTime = metadata.start_time_unix_ms ? new Date(metadata.start_time_unix_ms) : null;
    const endTime = metadata.end_time_unix_ms ? new Date(metadata.end_time_unix_ms) : null;

    // Extract Analysis (Summary & Data Collection)
    const analysis = payload.analysis || {};
    const summary = analysis.transcript_summary || "";
    const dataResults = analysis.data_collection_results || {};

    // Helper to extract value from ElevenLabs data collection format
    const getVal = (key: string) => {
      const field = dataResults[key];
      if (field && typeof field === 'object') return field.value || "";
      return "";
    };

    const callerName = getVal('caller_name');
    const companyName = getVal('company_name');
    const ticketNumber = getVal('ticket_number');

    // Transcript reconstruction (if possible from array)
    let transcriptText = "";
    if (Array.isArray(payload.transcript)) {
      transcriptText = payload.transcript.map((t: any) => `${t.role}: ${t.message}`).join("\n");
    }

    // Agent Name
    const agentName = payload.agent_name || "Unknown Agent";
    const branchName = getBranchByAgentId(agentId);

    // Recording / Audio URL
    const recordingUrl = payload.audio_url || "";

    const callLogData = {
      conversationId,
      agentId,
      agentName,
      branchName,
      callerName,
      companyName,
      ticketNumber,
      callDurationSeconds: duration,
      callStatus: payload.status || "completed",
      transcript: transcriptText,
      transcriptSummary: summary,
      recordingUrl: recordingUrl,
      callStartedAt: startTime ? FieldValue.serverTimestamp() : null, // Note: startTime is JS Date, we might prefer simple date or serverTimestamp
      callEndedAt: endTime ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      rawPayload: payload
    };

    // Store in call_logs collection
    const docRef = await adminDb.collection('call_logs').add(callLogData);

    return NextResponse.json({
      success: true,
      message: "Call log stored successfully",
      id: docRef.id
    });

  } catch (error: any) {
    console.error("Error processing ElevenLabs call log:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';
import { getBranchByAgentId } from '@/src/lib/agent-branch-map';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("Firebase Admin not initialized");
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    const payload = await req.json();
    console.log("Incoming ElevenLabs Post-Call Payload:", JSON.stringify(payload, null, 2));

    // Extract basic IDs with nested fallback support
    const conversationId = payload.conversation_id || payload.conversation?.conversation_id || "";
    const agentId = payload.agent_id || payload.conversation?.agent_id || "";

    if (!conversationId) {
      console.warn("Webhook received with missing conversation_id in payload:", payload);
    }
    
    // Extract Metadata
    const metadata = payload.metadata || payload.conversation?.metadata || {};
    const duration = payload.call_duration_secs || metadata.call_duration_secs || 0;
    
    // Support root level timestamps or metadata nested timestamps
    const startTimeUnix = payload.start_time_unix_ms || metadata.start_time_unix_ms;
    const endTimeUnix = payload.end_time_unix_ms || metadata.end_time_unix_ms;
    
    const startTime = startTimeUnix ? new Date(startTimeUnix) : null;
    const endTime = endTimeUnix ? new Date(endTimeUnix) : null;

    // Extract Analysis (Summary & Data Collection)
    const analysis = payload.analysis || payload.conversation?.analysis || {};
    const summary = analysis.transcript_summary || "";
    const dataResults = analysis.data_collection_results || {};

    // Helper to extract value from ElevenLabs data collection format
    const getVal = (key: string) => {
      const field = dataResults[key];
      if (field && typeof field === 'object') return field.value || "";
      return "";
    };

    const callerName = getVal('caller_name') || "Anonymous Caller";
    const companyName = getVal('company_name') || "Unknown";
    const ticketNumber = getVal('ticket_number') || "-";

    // Transcript reconstruction (if possible from array)
    let transcriptText = "";
    const transcriptArray = payload.transcript || payload.conversation?.transcript || [];
    if (Array.isArray(transcriptArray)) {
      transcriptText = transcriptArray
        .map((t: any) => `${t.role === "user" ? "Caller" : "Agent"}: ${t.message}`)
        .join("\n");
    }

    // Agent Name
    const agentName = payload.agent_name || payload.conversation?.agent_name || "Support Assistant";
    const branchName = getBranchByAgentId(agentId);

    // Recording / Audio URL - Map to secure local proxy stream
    const recordingUrl = conversationId ? `/api/elevenlabs/audio/${conversationId}` : "";

    const callLogData = {
      conversationId,
      agentId,
      agentName,
      branchName,
      callerName,
      companyName,
      ticketNumber,
      callDurationSeconds: duration,
      callStatus: payload.status || payload.conversation?.status || "completed",
      transcript: transcriptText,
      transcriptSummary: summary,
      recordingUrl,
      callStartedAt: startTime,
      callEndedAt: endTime,
      createdAt: startTime || new Date(),
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

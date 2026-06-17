import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/src/firebase/firebase-admin";
import { getBranchByAgentId } from "@/src/lib/agent-branch-map";
import { verifyAdmin } from "@/src/lib/verify-admin";

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.isValid) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("Firebase Admin not initialized");
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Allow empty bodies
    }

    const agentId = body.agentId || process.env.ELEVENLABS_AGENT_ID || "agent_3601kv308q2jf5m8cagy8v2tfrg9";
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "ELEVENLABS_API_KEY environment variable is not configured. Please add it to your configuration settings." 
      }, { status: 400 });
    }

    console.log(`Syncing call logs from ElevenLabs for Agent ID: ${agentId}`);

    // 1. Fetch conversations list for this agent from ElevenLabs
    const listResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${agentId}&page_size=50`, {
      headers: {
        "xi-api-key": apiKey
      }
    });

    if (!listResponse.ok) {
      const errText = await listResponse.text();
      console.error("ElevenLabs list endpoint error:", errText);
      return NextResponse.json({ 
        success: false, 
        error: `ElevenLabs API error: ${listResponse.statusText} (${errText})` 
      }, { status: listResponse.status });
    }

    const listData = await listResponse.json();
    const conversationsList = listData.conversations || [];
    console.log(`Fetched ${conversationsList.length} total conversation records from ElevenLabs.`);

    // 2. Query Firestore call_logs to find which call IDs have already been synced
    const storedSnapshot = await adminDb.collection("call_logs")
      .where("agentId", "==", agentId)
      .get();
    
    const storedConvIds = new Set(storedSnapshot.docs.map(doc => doc.data().conversationId));
    console.log(`Currently have ${storedConvIds.size} synced logs for this agent in collection 'call_logs'.`);

    let syncedCount = 0;

    // 3. For each conversation not yet in our database, pull full detail and index it
    for (const item of conversationsList) {
      const convId = item.conversation_id;
      if (storedConvIds.has(convId)) {
        continue; // Skip already stored items
      }

      console.log(`Fetching detail for conversation ID: ${convId}`);
      const detailResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${convId}`, {
        headers: {
          "xi-api-key": apiKey
        }
      });

      if (!detailResponse.ok) {
        console.warn(`Failed to fetch details for conv ID ${convId}: ${detailResponse.statusText}`);
        continue;
      }

      const detail = await detailResponse.json();

      // Extract details aligned with standard Post-Call webhook extractor
      const metadata = detail.metadata || {};
      const duration = metadata.call_duration_secs || item.call_duration_secs || 0;
      
      const startTimeUnix = metadata.start_time_unix_ms || item.start_time_unix_ms;
      const endTimeUnix = metadata.end_time_unix_ms;
      
      const startTime = startTimeUnix ? new Date(startTimeUnix) : null;
      const endTime = endTimeUnix ? new Date(endTimeUnix) : null;

      const analysis = detail.analysis || {};
      const summary = analysis.transcript_summary || "";
      const dataResults = analysis.data_collection_results || {};

      // Data extraction helper
      const getVal = (key: string) => {
        const field = dataResults[key];
        if (field && typeof field === "object") return field.value || "";
        return "";
      };

      const callerName = getVal("caller_name");
      const companyName = getVal("company_name");
      const ticketNumber = getVal("ticket_number");

      // Build text-based transcripts
      let transcriptText = "";
      if (Array.isArray(detail.transcript)) {
        transcriptText = detail.transcript
          .map((t: any) => `${t.role === "user" ? "Caller" : "Agent"}: ${t.message}`)
          .join("\n");
      }

      const agentName = detail.agent_name || item.agent_name || "Support Assistant";
      const branchName = getBranchByAgentId(agentId);

      // Local proxy route used to play or stream MP3 recording reliably
      const recordingUrl = `/api/elevenlabs/audio/${convId}`;

      const callLogData = {
        conversationId: convId,
        agentId,
        agentName,
        branchName,
        callerName: callerName || "Anonymous Caller",
        companyName: companyName || "Unknown",
        ticketNumber: ticketNumber || "-",
        callDurationSeconds: duration,
        callStatus: detail.status || item.status || "completed",
        transcript: transcriptText,
        transcriptSummary: summary,
        recordingUrl,
        callStartedAt: startTime,
        callEndedAt: endTime,
        createdAt: startTime || new Date(),
        rawPayload: detail
      };

      await adminDb.collection("call_logs").add(callLogData);
      syncedCount++;
    }

    console.log(`Sync completed successfully. Synced ${syncedCount} new conversations.`);

    return NextResponse.json({
      success: true,
      message: `Sync completed successfully. Imported ${syncedCount} new call recordings.`,
      addedCount: syncedCount
    });

  } catch (error: any) {
    console.error("Crash during call log syncing:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "An unexpected error occurred during sync process."
    }, { status: 500 });
  }
}

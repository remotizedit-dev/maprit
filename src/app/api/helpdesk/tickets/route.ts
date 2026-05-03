import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';
import { CreateTicketSchema } from '@/src/lib/validators/helpdesk-ticket';
import { getNextTicketNumber } from '@/src/lib/ticket-number';
import { sendToPowerAutomate } from '@/src/lib/power-automate-webhook';
import { sendTicketNotification } from '@/src/lib/email-service';
import { TicketStatus, Ticket } from '@/src/types/ticket';
import { FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from '@/src/firebase/config';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Firebase Admin is not initialized. Please provide FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in the application Settings to enable server-side ticket creation.");
    }

    const body = await req.json();
    console.log("Incoming ElevenLabs payload:", JSON.stringify(body, null, 2));
    
    // 1. Validate with Zod
    const result = CreateTicketSchema.safeParse(body);
    
    if (!result.success) {
      console.error("Ticket validation failed:", JSON.stringify(result.error.errors, null, 2));
      return NextResponse.json({ 
        success: false, 
        error: result.error.errors, 
        message: "Validation failed" 
      }, { status: 400 });
    }

    const {
      caller_name,
      company_name,
      callback_number,
      ticket_number: ticketNumberFromCaller,
      computer_name,
      incident_title,
      incident_summary,
      vip_caller,
      next_action,
      is_issue_resolved,
      source,
      conversation_id,
      call_sid
    } = result.data;

    // 2. Generate unique ticket number via transaction
    const ticketNumber = await getNextTicketNumber();

    // 3. Store in Firestore
    const ticketRef = adminDb.collection('tickets').doc();
    const now = FieldValue.serverTimestamp();

    const ticketData: any = {
      id: ticketRef.id,
      ticketNumber,
      callerName: caller_name,
      companyName: company_name,
      callbackNumber: callback_number,
      ticketNumberFromCaller: ticketNumberFromCaller || null,
      computerName: computer_name,
      incidentTitle: incident_title,
      incidentSummary: incident_summary,
      vipCaller: vip_caller,
      nextAction: next_action,
      isIssueResolved: is_issue_resolved,
      status: is_issue_resolved ? TicketStatus.RESOLVED : TicketStatus.NEW,
      source: source || 'elevenlabs_voice_agent',
      conversationId: conversation_id || null,
      callSid: call_sid || null,
      createdAt: now,
      updatedAt: now,
    };

    await ticketRef.set(ticketData);

    // 4. Send to Power Automate (non-blocking)
    // We fetch the doc again or use the data we have
    // Note: createdAt will be the server timestamp, for webhook we might want a Date
    const webhookData = {
      ...ticketData,
      createdAt: new Date(), // Use current date for the immediate webhook
    };
    
    // We don't await this if we want to return response ASAP to the AI
    // but the user says "return JSON response immediately", usually it's fine to fire and forget
    sendToPowerAutomate(webhookData as any).catch(err => console.error("Webhook background error:", err));
    
    // 5. Send Email Notification (Awaiting for 100% reliability as requested)
    try {
      await sendTicketNotification(webhookData);
    } catch (err) {
      console.error("Email notification error:", err);
    }

    // 6. Return JSON response
    return NextResponse.json({
      success: true,
      ticket_number: ticketNumber,
      status: "created",
      message: "Ticket created successfully"
    });

  } catch (error: any) {
    console.error("API Error creating ticket:", error);
    
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
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      debug: {
        code: code,
        projectId: process.env.FIREBASE_PROJECT_ID || '(env not set)',
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        details: error.details,
        name: error.name
      }
    }, { status: 500 });
  }
}

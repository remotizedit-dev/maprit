import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';
import { TicketStatus, TicketNextAction } from '@/src/types/ticket';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Firebase Admin is not initialized. Please check environment variables.");
    }
    const ticketsCollection = adminDb.collection('tickets');
    const countersCollection = adminDb.collection('counters');

    // Initialize counter if not exists
    const counterRef = countersCollection.doc('helpdesk_ticket_counter');
    const counterDoc = await counterRef.get();
    if (!counterDoc.exists) {
      await counterRef.set({ currentNumber: 1000 });
    }

    const sampleTickets = [
      {
        ticketNumber: "1001",
        callerName: "Fayaz Hussain",
        companyName: "Cobit",
        callbackNumber: "832-612-6336",
        computerName: "FAYAZ-PC",
        incidentTitle: "VPN Connection Dropping",
        incidentSummary: "User reports VPN disconnects every 10 minutes when working from home.",
        vipCaller: true,
        nextAction: TicketNextAction.ESCALATE,
        isIssueResolved: false,
        status: TicketStatus.OPEN,
        source: "elevenlabs_voice_agent",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        ticketNumber: "1002",
        callerName: "Sarah Chen",
        companyName: "TechFlow",
        callbackNumber: "415-555-0199",
        computerName: "SARAH-MAC",
        incidentTitle: "Printer Offline",
        incidentSummary: "Office printer on 3rd floor is showing as offline for all users.",
        vipCaller: false,
        nextAction: TicketNextAction.TROUBLESHOOT,
        isIssueResolved: true,
        status: TicketStatus.RESOLVED,
        source: "manual_dashboard_entry",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        ticketNumber: "1003",
        callerName: "David Miller",
        companyName: "Global Logistics",
        callbackNumber: "212-555-0123",
        computerName: "LOG-TERM-04",
        incidentTitle: "Password Reset Required",
        incidentSummary: "User locked out of ERP system after 3 failed attempts.",
        vipCaller: false,
        nextAction: TicketNextAction.TRANSFER,
        isIssueResolved: false,
        status: TicketStatus.NEW,
        source: "elevenlabs_voice_agent",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }
    ];

    const batch = adminDb.batch();
    sampleTickets.forEach(ticket => {
      const ref = ticketsCollection.doc();
      batch.set(ref, { ...ticket, id: ref.id });
    });
    
    // Update counter to 1003
    batch.update(counterRef, { currentNumber: 1003 });

    await batch.commit();

    return NextResponse.json({ success: true, message: "Sample data seeded successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

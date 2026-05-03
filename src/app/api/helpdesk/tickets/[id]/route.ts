import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/src/firebase/firebase-admin';
import { Ticket, TicketStatus, TicketComment } from '@/src/types/ticket';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, message: "Firebase Admin not initialized" }, { status: 500 });
    }

    const doc = await adminDb.collection('tickets').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }

    const data = doc.data();
    const ticket = {
      ...data,
      id: doc.id,
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null,
      comments: data?.comments?.map((c: any) => ({
        ...c,
        createdAt: c.createdAt?.toDate?.()?.toISOString() || c.createdAt
      })) || []
    } as Ticket;

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("API Error fetching ticket:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, message: "Firebase Admin not initialized" }, { status: 500 });
    }

    const body = await req.json();
    const { status, comment, authorName, ...otherFields } = body;

    const updateData: any = {
      ...otherFields,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (status) {
      updateData.status = status;
    }

    if (comment) {
      const newComment: TicketComment = {
        id: Math.random().toString(36).substring(2, 9),
        text: comment,
        authorName: authorName || 'System',
        createdAt: new Date() // Will be converted to timestamp by Firestore
      };
      updateData.comments = FieldValue.arrayUnion(newComment);
    }

    await adminDb.collection('tickets').doc(id).update(updateData);

    return NextResponse.json({ success: true, message: "Ticket updated successfully" });
  } catch (error: any) {
    console.error("API Error updating ticket:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, message: "Firebase Admin not initialized" }, { status: 500 });
    }

    await adminDb.collection('tickets').doc(id).delete();

    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error: any) {
    console.error("API Error deleting ticket:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

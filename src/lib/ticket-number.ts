import { getAdminDb } from '@/src/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const TICKETS_COUNTER_ID = 'helpdesk_ticket_counter';
const STARTING_NUMBER = 1000;

/**
 * Safely generates the next sequential ticket number using a Firestore transaction.
 * If the counter document doesn't exist, it starts from STARTING_NUMBER.
 */
export async function getNextTicketNumber(): Promise<string> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    throw new Error("Firebase Admin is not initialized. Please provide FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in the application Settings to enable server-side ticket creation.");
  }
  const counterRef = adminDb.collection('counters').doc(TICKETS_COUNTER_ID);

  return await adminDb.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    if (!counterDoc.exists) {
      // Create it if it doesn't exist
      transaction.set(counterRef, { currentNumber: STARTING_NUMBER });
      return STARTING_NUMBER.toString();
    }

    const currentNumber = counterDoc.data()?.currentNumber || STARTING_NUMBER;
    const nextNumber = currentNumber + 1;

    transaction.update(counterRef, { currentNumber: nextNumber });

    return nextNumber.toString();
  });
}

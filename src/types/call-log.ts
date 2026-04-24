export interface CallLog {
  id?: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  branchName: string;
  callerName: string;
  companyName: string;
  ticketNumber: string;
  callDurationSeconds: number;
  callStatus: string;
  transcript: string;
  transcriptSummary: string;
  recordingUrl: string;
  callStartedAt: any; // Firestore Timestamp
  callEndedAt: any;   // Firestore Timestamp
  createdAt: any;     // Firestore Timestamp
  rawPayload: any;
}

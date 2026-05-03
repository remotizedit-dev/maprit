export enum TicketNextAction {
  TRANSFER = 'transfer',
  TROUBLESHOOT = 'troubleshoot',
  ESCALATE = 'escalate'
}

export enum TicketStatus {
  NEW = 'new',
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  WAITING_CLIENT = 'waiting_for_client_response',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface TicketComment {
  id: string;
  text: string;
  authorName: string;
  createdAt: any;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // Sequential numeric ID
  callerName: string;
  companyName: string;
  callbackNumber: string;
  ticketNumberFromCaller?: string; // If their internal system has one
  computerName: string;
  incidentTitle: string;
  incidentSummary: string;
  vipCaller: boolean;
  nextAction: TicketNextAction;
  isIssueResolved: boolean;
  status: TicketStatus;
  source: string; // default: 'elevenlabs_voice_agent'
  conversationId?: string;
  callSid?: string;
  comments?: TicketComment[];
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

import { z } from 'zod';
import { TicketNextAction, TicketStatus } from '@/src/types/ticket';

export const CreateTicketSchema = z.object({
  caller_name: z.string().optional().default("Unknown Caller"),
  company_name: z.string().optional().default("Unknown Company"),
  callback_number: z.string().optional().default(""),
  ticket_number: z.string().optional().default(""), // This is the caller's ticket number if any
  computer_name: z.string().optional().default(""),
  incident_title: z.string().optional().default("Support Request"),
  incident_summary: z.string().optional().default("Caller requested support."),
  vip_caller: z.boolean().optional().default(false),
  next_action: z.nativeEnum(TicketNextAction).optional().default(TicketNextAction.ESCALATE),
  is_issue_resolved: z.boolean().optional().default(false),
  source: z.string().optional().default('elevenlabs_voice_agent'),
  conversation_id: z.string().optional().default(""),
  call_sid: z.string().optional().default(""),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const UpdateTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  next_action: z.nativeEnum(TicketNextAction).optional(),
  is_issue_resolved: z.boolean().optional(),
  incident_summary: z.string().optional(),
});

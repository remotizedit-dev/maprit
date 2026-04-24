import { z } from 'zod';
import { TicketNextAction, TicketStatus } from '@/src/types/ticket';

export const CreateTicketSchema = z.object({
  caller_name: z.string().min(1, "Caller name is required"),
  company_name: z.string().min(1, "Company name is required"),
  callback_number: z.string().min(1, "Callback number is required"),
  ticket_number: z.string().optional(), // This is the caller's ticket number if any
  computer_name: z.string().min(1, "Computer name is required"),
  incident_title: z.string().min(1, "Incident title is required"),
  incident_summary: z.string().min(1, "Incident summary is required"),
  vip_caller: z.boolean().default(false),
  next_action: z.nativeEnum(TicketNextAction).default(TicketNextAction.TROUBLESHOOT),
  is_issue_resolved: z.boolean().default(false),
  source: z.string().default('elevenlabs_voice_agent'),
  conversation_id: z.string().optional(),
  call_sid: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const UpdateTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  next_action: z.nativeEnum(TicketNextAction).optional(),
  is_issue_resolved: z.boolean().optional(),
  incident_summary: z.string().optional(),
});

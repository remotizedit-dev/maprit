"use client";

import Link from "next/link";
import { Ticket, TicketStatus } from "@/src/types/ticket";
import { formatDate } from "@/src/lib/utils";
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronRight, User, Settings } from "lucide-react";

interface TicketTableProps {
  tickets: Ticket[];
}

export default function TicketTable({ tickets }: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">No tickets found</h3>
        <p className="text-slate-500 mt-1">New tickets will appear here as they are created.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">No.</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Caller / Company</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50 group transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    #{ticket.ticketNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 text-sm flex items-center gap-1">
                      {ticket.callerName}
                      {ticket.vipCaller && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-1">VIP</span>
                      )}
                    </span>
                    <span className="text-slate-500 text-xs">{ticket.companyName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 text-sm truncate">{ticket.incidentTitle}</span>
                    <span className="text-slate-500 text-xs truncate break-all">{ticket.incidentSummary}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors group-hover:translate-x-1 duration-200"
                  >
                    <span className="text-xs font-semibold">View</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const configs: Record<TicketStatus, { label: string; bg: string; text: string; icon: any }> = {
    [TicketStatus.NEW]: { label: "New", bg: "bg-blue-100", text: "text-blue-700", icon: Inbox },
    [TicketStatus.OPEN]: { label: "Open", bg: "bg-amber-100", text: "text-amber-700", icon: Circle },
    [TicketStatus.ASSIGNED]: { label: "Assigned", bg: "bg-indigo-100", text: "text-indigo-700", icon: User },
    [TicketStatus.IN_PROGRESS]: { label: "In Progress", bg: "bg-sky-100", text: "text-sky-700", icon: Settings },
    [TicketStatus.WAITING_CLIENT]: { label: "Waiting Client", bg: "bg-rose-100", text: "text-rose-700", icon: Clock },
    [TicketStatus.RESOLVED]: { label: "Resolved", bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
    [TicketStatus.CLOSED]: { label: "Closed", bg: "bg-slate-100", text: "text-slate-700", icon: AlertCircle },
  };

  const config = configs[status] || configs[TicketStatus.NEW];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function Inbox(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
  );
}

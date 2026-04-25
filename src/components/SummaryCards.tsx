import { TicketStatus } from "@/src/types/ticket";
import { CheckCircle, Clock, AlertCircle, Inbox, PhoneCall } from "lucide-react";

interface SummaryCardsProps {
  stats: {
    total: number;
    open: number;
    pending: number;
    resolved: number;
    totalCalls: number;
  };
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    { name: "Total Tickets", value: stats.total, icon: Inbox, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Calls", value: stats.totalCalls, icon: PhoneCall, color: "text-rose-600", bg: "bg-rose-50" },
    { name: "Open Tickets", value: stats.open, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.name}</p>
              <p className="text-3xl font-bold mt-1 font-mono tracking-tight">{card.value}</p>
            </div>
            <div className={`${card.bg} p-3 rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

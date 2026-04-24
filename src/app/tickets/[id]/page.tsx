"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket, TicketStatus, TicketComment } from "@/src/types/ticket";
import { formatDate } from "@/src/lib/utils";
import Navigation from "@/src/components/Navigation";
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Building2, 
  Phone, 
  Monitor, 
  Info, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  Circle
} from "lucide-react";
import Link from "next/link";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/helpdesk/tickets/${id}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
      } else {
        setError(data.message || "Failed to load ticket");
      }
    } catch (err) {
      setError("An error occurred while fetching the ticket.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id, fetchTicket]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/helpdesk/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          comment: comment.trim(),
          authorName: "Agent" // In a real app, this would be the logged-in user
        })
      });

      const data = await res.json();
      if (data.success) {
        setComment("");
        fetchTicket(); // Refresh ticket data
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch (err) {
      alert("Error adding comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/helpdesk/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        fetchTicket(); // Refresh ticket data
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">{error || "Ticket not found"}</h1>
        <Link href="/dashboard" className="mt-4 text-indigo-600 font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      #{ticket.ticketNumber}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                    {ticket.incidentTitle}
                  </h1>
                </div>
                
                <div className="flex gap-2">
                  {ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED ? (
                    <button
                      onClick={() => handleUpdateStatus(TicketStatus.RESOLVED)}
                      disabled={updatingStatus}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Resolve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(TicketStatus.OPEN)}
                      disabled={updatingStatus}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Re-open
                    </button>
                  )}
                  
                  {ticket.status !== TicketStatus.CLOSED && (
                    <button
                      onClick={() => handleUpdateStatus(TicketStatus.CLOSED)}
                      disabled={updatingStatus}
                      className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Close
                    </button>
                  ) || ticket.status === TicketStatus.CLOSED && (
                     <button
                      onClick={() => handleUpdateStatus(TicketStatus.OPEN)}
                      disabled={updatingStatus}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Re-open
                    </button>
                  )}
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Incident Summary</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {ticket.incidentSummary}
                </p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Internal Comments
                </h2>
              </div>
              
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto bg-slate-50/50">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment, index) => (
                    <div 
                      key={comment.id}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {comment.authorName?.[0] || "A"}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 text-sm">{comment.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-700 text-sm whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No comments yet. Start the conversation.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleAddComment} className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add an internal note..."
                    className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    rows={2}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !comment.trim()}
                    className="absolute right-2 bottom-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submittingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Caller Information</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Full Name</p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                      {ticket.callerName}
                      {ticket.vipCaller && <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">VIP</span>}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Company</p>
                    <p className="text-sm font-semibold text-slate-900">{ticket.companyName}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Callback Number</p>
                    <p className="text-sm font-semibold text-slate-900">{ticket.callbackNumber}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">System Details</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Monitor className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Computer ID</p>
                    <p className="text-sm font-semibold text-slate-900">{ticket.computerName}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Next Action</p>
                    <p className="text-sm font-semibold text-slate-900 capitalize">{ticket.nextAction}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Created</p>
                    <p className="text-sm font-semibold text-slate-900">{formatDate(ticket.createdAt)}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const configs: Record<TicketStatus, { label: string; bg: string; text: string; icon: any }> = {
    [TicketStatus.NEW]: { label: "New", bg: "bg-blue-100", text: "text-blue-700", icon: Info },
    [TicketStatus.OPEN]: { label: "Open", bg: "bg-amber-100", text: "text-amber-700", icon: Circle },
    [TicketStatus.PENDING]: { label: "Pending", bg: "bg-indigo-100", text: "text-indigo-700", icon: Clock },
    [TicketStatus.RESOLVED]: { label: "Resolved", bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
    [TicketStatus.CLOSED]: { label: "Closed", bg: "bg-slate-100", text: "text-slate-700", icon: XCircle },
  };

  const config = configs[status] || configs[TicketStatus.NEW];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

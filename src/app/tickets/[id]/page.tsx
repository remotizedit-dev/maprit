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
  Circle,
  Trash2,
  Edit2,
  Save,
  X
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
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    incidentTitle: "",
    incidentSummary: "",
    callerName: "",
    companyName: "",
    callbackNumber: "",
    computerName: "",
    vipCaller: false
  });

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/helpdesk/tickets/${id}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setEditForm({
          incidentTitle: data.ticket.incidentTitle,
          incidentSummary: data.ticket.incidentSummary,
          callerName: data.ticket.callerName,
          companyName: data.ticket.companyName,
          callbackNumber: data.ticket.callbackNumber,
          computerName: data.ticket.computerName,
          vipCaller: data.ticket.vipCaller
        });
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
        body: JSON.stringify({ 
          status: newStatus,
          comment: `Status changed to ${newStatus.replace(/_/g, ' ')}`,
          authorName: "System"
        })
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

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/helpdesk/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...editForm,
          comment: `Ticket details updated`,
          authorName: "Agent" 
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        fetchTicket();
      } else {
        alert(data.message || "Failed to update ticket");
      }
    } catch (err) {
      alert("Error updating ticket");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/helpdesk/tickets/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (data.success) {
        router.push("/tickets");
      } else {
        alert(data.message || "Failed to delete ticket");
      }
    } catch (err) {
      alert("Error deleting ticket");
    } finally {
      setDeleting(false);
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
    <div className="flex bg-slate-50 min-h-screen">
      <Navigation />
      
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/tickets" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to All Tickets
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
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                      disabled={updatingStatus}
                      className="appearance-none bg-white border border-slate-200 text-slate-700 h-10 pl-4 pr-10 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {Object.values(TicketStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {isEditing ? "Cancel" : "Edit"}
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 h-10 px-4 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Incident Summary</h3>
                {isEditing ? (
                  <form onSubmit={handleUpdateTicket} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Title</label>
                      <input 
                        type="text"
                        value={editForm.incidentTitle}
                        onChange={(e) => setEditForm({...editForm, incidentTitle: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Summary</label>
                      <textarea
                        value={editForm.incidentSummary}
                        onChange={(e) => setEditForm({...editForm, incidentSummary: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Caller Name</label>
                        <input 
                          type="text"
                          value={editForm.callerName}
                          onChange={(e) => setEditForm({...editForm, callerName: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company</label>
                        <input 
                          type="text"
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                       <button
                        type="submit"
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {ticket.incidentSummary}
                  </p>
                )}
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

        <footer className="mt-12 py-8 border-t border-slate-200 flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
            ClarioAI by Remotized IT
          </p>
          <p className="text-[10px] text-slate-400">© 2024 Remotized IT. All rights reserved.</p>
        </footer>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const configs: Record<TicketStatus, { label: string; bg: string; text: string; icon: any }> = {
    [TicketStatus.NEW]: { label: "New", bg: "bg-blue-100", text: "text-blue-700", icon: Info },
    [TicketStatus.OPEN]: { label: "Open", bg: "bg-amber-100", text: "text-amber-700", icon: Circle },
    [TicketStatus.ASSIGNED]: { label: "Assigned", bg: "bg-indigo-100", text: "text-indigo-700", icon: User },
    [TicketStatus.IN_PROGRESS]: { label: "In Progress", bg: "bg-sky-100", text: "text-sky-700", icon: RotateCcw },
    [TicketStatus.WAITING_CLIENT]: { label: "Waiting Client", bg: "bg-rose-100", text: "text-rose-700", icon: Clock },
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

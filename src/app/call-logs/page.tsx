"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import Navigation from "@/src/components/Navigation";
import { 
  PhoneCall, 
  Search, 
  Filter, 
  RefreshCw, 
  FileText, 
  Play, 
  X, 
  Calendar,
  Clock,
  User,
  Building,
  Hash,
  Activity
} from "lucide-react";
import { CallLog } from "@/src/types/call-log";

export default function CallAnalyticsPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCallLogs();
  }, [user]);

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/elevenlabs/call-logs/get");
      const data = await res.json();
      if (data.success) {
        setCallLogs(data.callLogs);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch call logs");
      }
    } catch (err: any) {
      console.error("Error fetching call logs:", err);
      setError("Network error fetching call logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = callLogs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.callerName?.toLowerCase().includes(term) ||
        log.companyName?.toLowerCase().includes(term) ||
        log.ticketNumber?.toLowerCase().includes(term) ||
        log.transcript?.toLowerCase().includes(term) ||
        log.agentName?.toLowerCase().includes(term)
      );
    }

    if (branchFilter !== "all") {
      result = result.filter(log => log.branchName === branchFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter(log => log.callStatus === statusFilter);
    }

    setFilteredLogs(result);
  }, [searchTerm, branchFilter, statusFilter, callLogs]);

  const branches = Array.from(new Set(callLogs.map(l => l.branchName))).filter(Boolean);
  const statuses = Array.from(new Set(callLogs.map(l => l.callStatus))).filter(Boolean);

  const stats = {
    total: callLogs.length,
    avgDuration: callLogs.length > 0 
      ? Math.round(callLogs.reduce((acc, curr) => acc + (curr.callDurationSeconds || 0), 0) / callLogs.length)
      : 0,
    withTickets: callLogs.filter(l => l.ticketNumber && l.ticketNumber !== "-").length,
    escalated: callLogs.filter(l => l.transcriptSummary?.toLowerCase().includes("escalate")).length,
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    
    let date: Date;
    if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp?._seconds) { // Admin SDK format sometimes
      date = new Date(timestamp._seconds * 1000);
    } else {
      return "-";
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Navigation />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Call Analytics</h1>
            <p className="text-slate-500 mt-1">Intelligence and transcripts from ElevenLabs voice interactions.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchCallLogs}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { name: "Total Calls", value: stats.total, icon: PhoneCall, color: "text-blue-600", bg: "bg-blue-50" },
            { name: "Avg Duration", value: `${stats.avgDuration}s`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { name: "With Tickets", value: stats.withTickets, icon: Hash, color: "text-indigo-600", bg: "bg-indigo-50" },
            { name: "Escalated", value: stats.escalated, icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
          ].map((card) => (
            <div key={card.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
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

        {error && (
          <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-xl">
            <p className="text-rose-600 font-medium">{error}</p>
          </div>
        )}

        <section>
          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search caller, company, ticket, or transcript..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">All Branches</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="relative flex-1 lg:w-48">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Branch / Agent</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Caller / Company</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket #</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{formatDate(log.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700">{log.branchName}</p>
                          <p className="text-xs text-slate-400 font-medium">{log.agentName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{log.callerName || "-"}</p>
                          <p className="text-xs text-slate-500 font-medium">{log.companyName || "-"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3 h-3" />
                            {log.callDurationSeconds}s
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-mono font-bold text-slate-600">{log.ticketNumber || "-"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            log.callStatus === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                          }`}>
                            {log.callStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setSelectedLog(log)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="View Transcript"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {log.recordingUrl ? (
                              <a 
                                href={log.recordingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Play Recording"
                              >
                                <Play className="w-4 h-4" />
                              </a>
                            ) : (
                              <button disabled className="p-2 text-slate-200 cursor-not-allowed">
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No call logs found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {!loading && filteredLogs.length > 0 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Showing {filteredLogs.length} interactions
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-2 rounded-xl">
                    <PhoneCall className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Call Intelligence</h2>
                    <p className="text-xs text-slate-500 font-medium">ID: {selectedLog.conversationId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interaction Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Date</p>
                          <p className="text-sm font-bold text-slate-700">{formatDate(selectedLog.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
                          <p className="text-sm font-bold text-slate-700">{selectedLog.callDurationSeconds}s</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Caller</p>
                          <p className="text-sm font-bold text-slate-700">{selectedLog.callerName || "Anonymous"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Company</p>
                          <p className="text-sm font-bold text-slate-700">{selectedLog.companyName || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Ticket Number</p>
                          <p className="text-sm font-mono font-bold text-indigo-600">{selectedLog.ticketNumber || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Discovery Summary</h3>
                      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
                        <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                          {selectedLog.transcriptSummary || "No summary available for this interaction."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Full Transcript</h3>
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl max-h-64 overflow-y-auto">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                          {selectedLog.transcript || "No transcript available."}
                        </p>
                      </div>
                    </div>

                    {selectedLog.recordingUrl && (
                      <div className="pt-4">
                         <a 
                          href={selectedLog.recordingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
                        >
                          <Play className="w-5 h-5" />
                          Listen to Call Recording
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 py-8 border-t border-slate-200 flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
            ClarioAI by Remotized IT
          </p>
          <p className="text-[10px] text-slate-400">© 2024 Remotized IT. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

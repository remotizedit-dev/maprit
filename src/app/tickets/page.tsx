"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { Ticket, TicketStatus, TicketNextAction } from "@/src/types/ticket";
import TicketTable from "@/src/components/TicketTable";
import Navigation from "@/src/components/Navigation";
import { Search, Filter, RefreshCw, Settings, Plus } from "lucide-react";
import Link from "next/link";

export default function AllTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [nextActionFilter, setNextActionFilter] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch("/api/helpdesk/tickets/get");
        const data = await res.json();
        if (data.success) {
          setTickets(data.tickets);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch tickets");
        }
      } catch (error: any) {
        console.error("Error fetching tickets:", error);
        setError("Network error fetching tickets.");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/helpdesk/tickets/get");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      } else {
        setError(data.message || "Failed to refresh tickets");
      }
    } catch (error) {
      console.error("Error refreshing tickets:", error);
      setError("Network error refreshing tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = tickets;

    if (searchTerm) {
      result = result.filter(t => 
        t.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.incidentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticketNumber.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }

    if (nextActionFilter !== "all") {
      result = result.filter(t => t.nextAction === nextActionFilter);
    }

    setFilteredTickets(result);
  }, [searchTerm, statusFilter, nextActionFilter, tickets]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Navigation />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Tickets</h1>
            <p className="text-slate-500 mt-1">Browse and filter all voice-captured incidents.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link 
              href="/tickets/new"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-xl">
             <p className="text-rose-600 font-medium whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <section>
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by caller, company, ticket #..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {Object.values(TicketStatus).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 md:w-48">
                <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                  value={nextActionFilter}
                  onChange={(e) => setNextActionFilter(e.target.value)}
                >
                  <option value="all">All Actions</option>
                  {Object.values(TicketNextAction).map(a => (
                    <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <TicketTable tickets={filteredTickets} />
          
          {!loading && filteredTickets.length > 0 && (
            <p className="text-xs text-slate-400 mt-4 font-medium text-right uppercase tracking-widest">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>
          )}

          {!loading && filteredTickets.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <p className="text-slate-400 font-medium">No tickets found matching your filters.</p>
            </div>
          )}
        </section>

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

"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/src/firebase/firebase-client";
import { useAuth } from "@/src/components/AuthProvider";
import { Ticket, TicketStatus, TicketNextAction } from "@/src/types/ticket";
import SummaryCards from "@/src/components/SummaryCards";
import TicketTable from "@/src/components/TicketTable";
import Navigation from "@/src/components/Navigation";
import { Search, Filter, Plus, Settings, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
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
        }
      } catch (error) {
        console.error("Error fetching tickets via API:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
    
    // Optional: Poll every 30 seconds for updates
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/helpdesk/tickets/get");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error("Error refreshing tickets:", error);
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

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.NEW).length,
    pending: tickets.filter(t => t.status === TicketStatus.PENDING).length,
    resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Navigation />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Helpdesk Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time overview of all caller incidents.</p>
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
              Create Ticket
            </Link>
          </div>
        </header>

        <SummaryCards stats={stats} />

        <section className="mt-10">
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
        </section>
      </main>
    </div>
  );
}

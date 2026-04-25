"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/src/firebase/firebase-client";
import { useAuth } from "@/src/components/AuthProvider";
import { Ticket, TicketStatus, TicketNextAction } from "@/src/types/ticket";
import SummaryCards from "@/src/components/SummaryCards";
import TicketTable from "@/src/components/TicketTable";
import Navigation from "@/src/components/Navigation";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [callCount, setCallCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketsRes, callsRes] = await Promise.all([
          fetch("/api/helpdesk/tickets/get"),
          fetch("/api/elevenlabs/call-logs/get")
        ]);

        const ticketsData = await ticketsRes.json();
        const callsData = await callsRes.json();

        if (ticketsData.success) {
          setTickets(ticketsData.tickets);
        } else {
          setError(ticketsData.message || "Failed to fetch tickets");
        }

        if (callsData.success) {
          setCallCount(callsData.callLogs.length);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setError("Network error fetching data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsRes, callsRes] = await Promise.all([
        fetch("/api/helpdesk/tickets/get"),
        fetch("/api/elevenlabs/call-logs/get")
      ]);

      const ticketsData = await ticketsRes.json();
      const callsData = await callsRes.json();

      if (ticketsData.success) {
        setTickets(ticketsData.tickets);
      }
      if (callsData.success) {
        setCallCount(callsData.callLogs.length);
      }
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      setError("Network error refreshing data.");
    } finally {
      setLoading(false);
    }
  };


  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.NEW).length,
    pending: tickets.filter(t => t.status === TicketStatus.PENDING).length,
    resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
    totalCalls: callCount,
  };

  const recentTickets = [...tickets]
    .sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Navigation />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ClarioAI Dashboard</h1>
            <p className="text-slate-500 mt-1">Voice-activated support intelligence overview.</p>
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
          </div>
        </header>

        <SummaryCards stats={stats} />

        {error && (
          <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-xl">
            <h2 className="text-rose-800 font-bold mb-2">System Error</h2>
            <p className="text-rose-600 font-medium whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Incidents</h2>
            <Link 
              href="/tickets"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-bold uppercase tracking-wider"
            >
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
               <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            </div>
          ) : recentTickets.length > 0 ? (
            <TicketTable tickets={recentTickets} />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <p className="text-slate-400 font-medium">No recent tickets captured yet.</p>
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

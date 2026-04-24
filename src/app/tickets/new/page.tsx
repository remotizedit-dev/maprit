"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/src/components/Navigation";
import { ArrowLeft, Send, Loader2, User, Building2, Phone, Monitor, Info, ClipboardList } from "lucide-react";
import Link from "next/link";
import { TicketNextAction } from "@/src/types/ticket";

export default function NewTicket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      caller_name: formData.get("caller_name"),
      company_name: formData.get("company_name"),
      callback_number: formData.get("callback_number"),
      computer_name: formData.get("computer_name"),
      incident_title: formData.get("incident_title"),
      incident_summary: formData.get("incident_summary"),
      vip_caller: formData.get("vip_caller") === "on",
      next_action: formData.get("next_action"),
      is_issue_resolved: formData.get("is_issue_resolved") === "on",
      source: "manual_dashboard_entry",
    };

    try {
      const res = await fetch("/api/helpdesk/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await res.json();
      } catch (e) {
        console.error("Failed to parse API response as JSON", e);
        throw new Error("Server returned an invalid response. Please check your connection.");
      }

      if (!res.ok) {
        console.error("API Error Response:", result);
        throw new Error(result.message || result.error?.[0]?.message || "Failed to create ticket");
      }

      console.log("Ticket created successfully:", result);
      router.push("/tickets");
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Navigation />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <Link href="/tickets" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to All Tickets
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manual Ticket Entry</h1>
          <p className="text-slate-500 mt-1">Create a new support ticket manually for walk-in or offline callers.</p>
        </header>

        <div className="max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Caller Info */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Caller Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="caller_name" className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="caller_name" required name="caller_name" type="text" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. John Doe" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company_name" className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="company_name" required name="company_name" type="text" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Acme Corp" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="callback_number" className="block text-sm font-semibold text-slate-700 mb-1">Callback Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="callback_number" required name="callback_number" type="tel" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. 555-0123" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <input name="vip_caller" type="checkbox" id="vip" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="vip" className="text-sm font-bold text-slate-700 select-none cursor-pointer flex items-center gap-2">
                       VIP Caller
                       <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded">High Priority</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Technical Info */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Incident Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="computer_name" className="block text-sm font-semibold text-slate-700 mb-1">Computer Name / ID</label>
                    <div className="relative">
                      <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="computer_name" required name="computer_name" type="text" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. LAPTOP-X123" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="incident_title" className="block text-sm font-semibold text-slate-700 mb-1">Incident Title</label>
                    <div className="relative">
                      <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="incident_title" required name="incident_title" type="text" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Wi-Fi Connectivity Issue" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="next_action" className="block text-sm font-semibold text-slate-700 mb-1">Next Action</label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select id="next_action" name="next_action" className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-medium">
                        <option value={TicketNextAction.TROUBLESHOOT}>Troubleshoot</option>
                        <option value={TicketNextAction.ESCALATE}>Escalate</option>
                        <option value={TicketNextAction.TRANSFER}>Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <input name="is_issue_resolved" type="checkbox" id="resolved" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                    <label htmlFor="resolved" className="text-sm font-bold text-emerald-700 select-none cursor-pointer">
                       Mark as Resolved Immediately
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="incident_summary" className="block text-sm font-semibold text-slate-700 mb-1">Incident Summary</label>
                <textarea 
                  id="incident_summary"
                  required 
                  name="incident_summary" 
                  rows={4} 
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50/50" 
                  placeholder="Describe the issue in detail..."
                ></textarea>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
              <Link href="/tickets" className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Cancel
              </Link>
              <button
                disabled={loading}
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-indigo-200 shadow-lg active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Create Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useAuth } from "@/src/components/AuthProvider";
import { LogIn, Headset } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-6 shadow-lg shadow-indigo-100">
            <Headset className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Helpcenter</h1>
          <p className="text-slate-500 mt-2 font-medium text-center">
            Sign in with your verified helpdesk account to manage caller incidents.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6,23.6c0-1.4-0.1-2.8-0.4-4.2H24v8h11.1c-0.5,2.6-1.9,4.8-4.1,6.3v5.2h6.6C41.5,35.2,43.6,29.8,43.6,23.6z"></path>
              <path fill="#FF3D00" d="M24,44c5.4,0,9.9-1.8,13.2-4.9l-6.6-5.2c-1.8,1.2-4.1,1.9-6.6,1.9c-5.1,0-9.4-3.4-10.9-8H6.3v5.3C9.6,39.7,16.3,44,24,44z"></path>
              <path fill="#4CAF50" d="M13.1,27.8c-0.4-1.1-0.6-2.4-0.6-3.8c0-1.4,0.2-2.7,0.6-3.8V14.9H6.3C4.8,17.7,4,20.8,4,24c0,3.2,0.8,6.3,2.3,9.1L13.1,27.8z"></path>
              <path fill="#1976D2" d="M24,12c2.9,0,5.6,1,7.6,2.9L37.3,9c-3.6-3.4-8.4-5.2-13.3-5.2c-7.7,0-14.4,4.3-17.7,10.7l6.8,5.3C14.6,15.4,18.9,12,24,12z"></path>
            </svg>
          )}
          Sign in with Google
        </button>

        <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
          Secure Access Only<br/>
          Internal Corporate Tool
        </p>
      </div>
    </div>
  );
}

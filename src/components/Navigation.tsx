"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Headset, LogOut, User as UserIcon, PhoneCall } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "./AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Ticket", href: "/tickets/new", icon: PlusCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const { signOut, user, isAdmin } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "All Tickets", href: "/tickets", icon: Headset },
    ...(isAdmin ? [
      { name: "Call Analytics", href: "/call-logs", icon: PhoneCall },
      { name: "User Management", href: "/admin/users", icon: UserIcon }
    ] : [])
  ];

  return (
    <nav className="flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Headset className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">ClarioAI</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">by Remotized IT</span>
        </div>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-3">
            {user.photoURL ? (
              <div className="relative w-8 h-8">
                <Image 
                  src={user.photoURL} 
                  alt={user.displayName || ""} 
                  fill
                  className="rounded-full border border-slate-200 object-cover" 
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <UserIcon className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || "Agent"}</p>
              <p className={cn("text-[10px] font-bold truncate uppercase tracking-tighter", isAdmin ? "text-indigo-600" : "text-slate-400")}>
                {isAdmin ? "Super Admin" : "Helpdesk Staff"}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
          Sign Out
        </button>

        <div className="pt-4 border-t border-slate-100 px-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Product of</p>
          <div className="flex items-center gap-2 text-slate-900 group cursor-default">
            <span className="font-bold text-sm tracking-tight text-indigo-600">Remotized IT</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 italic">Empowering support with voice AI.</p>
        </div>
      </div>
    </nav>
  );
}

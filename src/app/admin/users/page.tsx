"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import Navigation from "@/src/components/Navigation";
import { useRouter } from "next/navigation";
import { 
  UserPlus, 
  Key, 
  Trash2, 
  ShieldAlert, 
  RefreshCw, 
  Mail, 
  Lock,
  X,
  AlertCircle,
  CheckCircle,
  UserCheck
} from "lucide-react";

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create User Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Reset Password Form State
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserRecord | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Delete User State
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Network error fetching users list.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    
    setCreateLoading(true);
    setCreateError(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail, password: newPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessMessage(`User account for ${newEmail} created successfully.`);
        setNewEmail("");
        setNewPassword("");
        setShowCreateModal(false);
        fetchUsers();
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setCreateError(data.error || "Failed to create user");
      }
    } catch (err: any) {
      console.error("Create user error:", err);
      setCreateError("Network error creating user.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !resetPassword) return;

    setResetLoading(true);
    setResetError(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ uid: selectedUserForReset.uid, password: resetPassword })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage(`Password updated successfully for ${selectedUserForReset.email}.`);
        setResetPassword("");
        setSelectedUserForReset(null);
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setResetError(data.error || "Failed to reset password");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setResetError("Network error updating password.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/users?uid=${selectedUserForDelete.uid}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage(`User ${selectedUserForDelete.email} has been deleted successfully.`);
        setSelectedUserForDelete(null);
        fetchUsers();
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setDeleteError(data.error || "Failed to delete user");
      }
    } catch (err: any) {
      console.error("Delete user error:", err);
      setDeleteError("Network error deleting user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCreationDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Navigation />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              User Management
            </h1>
            <p className="text-slate-500 mt-1">Manage portal access credentials for support staff agents.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Support Agent
            </button>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center gap-3 transition-all animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-850 rounded-xl flex items-center gap-3 transition-all">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Users Table Grid */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User UID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Created At</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Scope Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u) => {
                    const isSuper = u.email && [
                      "remotizedit@gmail.com",
                      "faiyaz.hossain@gmail.com",
                      "faiyaz.hossain@cobait.com"
                    ].includes(u.email.toLowerCase());

                    const isTargetRootAdmin = u.email?.toLowerCase() === "remotizedit@gmail.com";
                    const isCurrentRootAdmin = user?.email?.toLowerCase() === "remotizedit@gmail.com";
                    
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-mono font-medium text-slate-400 select-all">{u.uid}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-600">{formatCreationDate(u.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuper 
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {isSuper ? "Super Admin" : "Staff Agent"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {(!isTargetRootAdmin || isCurrentRootAdmin) ? (
                              <button
                                onClick={() => setSelectedUserForReset(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-pointer animate-pulse-subtle"
                                title="Reset Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                                Reset Pass
                              </button>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
                                title="Only remotizedit@gmail.com can manage this account"
                              >
                                <Key className="w-3.5 h-3.5" />
                                Reset Pass
                              </button>
                            )}
                            
                            {!isTargetRootAdmin ? (
                              u.uid !== user?.uid ? (
                                <button
                                  onClick={() => setSelectedUserForDelete(u)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <button disabled className="p-1.5 text-slate-200 cursor-not-allowed" title="Self account cannot be deleted">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )
                            ) : (
                              <button disabled className="p-1.5 text-slate-200 cursor-not-allowed animate-none" title="Primary admin account cannot be deleted">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No staff users registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all">
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 border border-indigo-100">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Add Support Agent</h2>
                </div>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                    setNewEmail("");
                    setNewPassword("");
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </header>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                {createError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="agent@company.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 text-sm font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-6 cursor-pointer"
                >
                  {createLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {selectedUserForReset && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all">
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-600 border border-amber-100">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Reset Password</h2>
                    <p className="text-xs text-slate-500 font-medium">User: {selectedUserForReset.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedUserForReset(null);
                    setResetError(null);
                    setResetPassword("");
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </header>

              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                {resetError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="password"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 text-sm font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-6 cursor-pointer"
                >
                  {resetLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {selectedUserForDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all">
              <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-50 p-2 rounded-lg text-rose-600 border border-rose-100">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Revoke Access</h2>
                    <p className="text-xs text-rose-600 font-medium">Warning: Revoking access</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedUserForDelete(null);
                    setDeleteError(null);
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </header>

              <div className="p-6 space-y-4">
                {deleteError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-605 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Are you absolutely sure you want to delete the support staff account for <span className="font-bold text-slate-900">{selectedUserForDelete.email}</span>?
                  This action cannot be undone and will revoke their dashboard login capability immediately.
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setSelectedUserForDelete(null)}
                    className="flex-1 px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={deleteLoading}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {deleteLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete Agent"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

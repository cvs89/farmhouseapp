"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateUser, adminUpdateUser } from "@/lib/admin-actions";
import { Info, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserFormProps {
  profile?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: "admin" | "owner" | "staff" | "customer";
  };
}

export default function UserForm({ profile }: UserFormProps) {
  const router = useRouter();
  const isEditMode = !!profile;

  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    role: profile?.role || "customer" as "admin" | "owner" | "staff" | "customer",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isEditMode && !form.password) {
      setError("Password is required for new accounts.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (isEditMode && profile) {
        res = await adminUpdateUser(profile.id, form);
      } else {
        res = await adminCreateUser(form);
      }

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Redirect back to admin page showing the users tab
        router.push("/admin?tab=users");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      
      {/* Back to admin console button */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin?tab=users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS
        </Link>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-stone-200/40 dark:border-slate-800/40 shadow-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100">
            {isEditMode ? "Modify User Account" : "Register Platform User"}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {isEditMode 
              ? "Update profile details and role configurations." 
              : "Register a verified customer, owner, caretaker, or moderator account."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
            <Info className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Phone Number (Optional)</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Platform Access Level</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
            >
              <option value="customer">customer (Standard Guest)</option>
              <option value="owner">owner (Property Manager)</option>
              <option value="staff">staff (Property Caretaker)</option>
              <option value="admin">admin (Platform Moderator)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">
              {isEditMode ? "Account Password (Leave blank to keep current)" : "Account Password"}
            </label>
            <input
              type="password"
              required={!isEditMode}
              placeholder={isEditMode ? "••••••••" : "Choose a secure password"}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200/40 dark:border-slate-800/40">
            <Link
              href="/admin?tab=users"
              className="flex-1 py-2.5 border border-stone-200 dark:border-slate-800 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-850 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditMode ? "Save Changes" : "Register User"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

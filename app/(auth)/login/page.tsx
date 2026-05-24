"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth-actions";
import { Trees, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-stone-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Visual background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        
        {/* Brand Link */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="p-2 rounded-xl bg-green-800 text-white shadow-lg shadow-green-900/20 group-hover:scale-105 transition-transform duration-300">
            <Trees className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-display bg-gradient-to-r from-green-950 to-amber-900 dark:from-green-200 dark:to-amber-300 bg-clip-text text-transparent">
            Farmhouse
          </span>
        </Link>

        {/* Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-none">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              Welcome back
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Sign in to manage your listings or book your next stay.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-sm transition-all duration-300 text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Password
                </label>
                <Link 
                  href="#" 
                  className="text-xs text-green-700 dark:text-green-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-sm transition-all duration-300 text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-green-800 hover:bg-green-700 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-green-950/10 hover:shadow-green-950/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

          </form>

          {/* Footer Toggle */}
          <div className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/40 dark:border-slate-800/40 pt-4">
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="font-semibold text-green-700 dark:text-green-400 hover:underline"
            >
              Sign up
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

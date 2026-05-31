"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/client";
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

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
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

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200/50 dark:border-slate-800/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#FAF9F6] dark:bg-[#090D16] px-2 text-stone-400 dark:text-stone-500 font-semibold bg-clip-border rounded-md">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/40 hover:bg-stone-50 dark:hover:bg-slate-900 text-stone-700 dark:text-stone-200 font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>

          {/* Footer Toggle */}
          <div className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/40 dark:border-slate-800/40 pt-4">
            Don&apos;t have an account?{" "}
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

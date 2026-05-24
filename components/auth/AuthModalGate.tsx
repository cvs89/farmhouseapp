"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trees, Mail, Lock, User, AlertCircle, Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function AuthModalGate() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        // Success: Refresh the page state to verify auth and remove the blur
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!fullName) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "customer",
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess("Registration successful! Please check your email to verify your account, or sign in if already verified.");
        // Clear fields
        setFullName("");
        setEmail("");
        setPassword("");
        setActiveTab("signin");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 select-none">
      
      {/* Outer Glow Blobs */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-green-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Modal Container */}
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/40 relative animate-fade-in text-left">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="p-2.5 rounded-xl bg-green-800 text-white shadow-lg shadow-green-950/20">
            <Trees className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-stone-850 dark:text-stone-100 flex items-center gap-1.5 font-display mt-2">
            Unlock Stay Details <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </h2>
          <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
            Authentication is required to view live bookings, full galleries, brochures, and reserve farmhouse stays.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100/60 dark:bg-slate-900/40 rounded-xl mb-6 text-xs font-bold border border-stone-200/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 rounded-lg text-center transition-all ${
              activeTab === "signin"
                ? "bg-white dark:bg-slate-950 text-green-850 dark:text-green-400 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 rounded-lg text-center transition-all ${
              activeTab === "signup"
                ? "bg-white dark:bg-slate-950 text-green-850 dark:text-green-400 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3.5 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 text-xs border border-red-500/20 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-2 p-3.5 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 text-xs border border-green-500/20 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Forms */}
        {activeTab === "signin" ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-850 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-850 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  Register <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </form>
        )}

      </div>

    </div>
  );
}

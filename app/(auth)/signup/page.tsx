"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/auth-actions";
import { Trees, Mail, Lock, User, AlertCircle, CheckCircle, Compass, LayoutDashboard, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"customer" | "owner">("customer");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("role", selectedRole);

    const result = await signup(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
  };

  return (
    <div className="flex-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-stone-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background visual blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 animate-fade-in">
        
        {/* Brand Link */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 group">
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
              Create an account
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Join us to book retreats or host your property.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="flex flex-col items-center text-center p-6 bg-green-50 dark:bg-green-950/20 border border-green-200/40 dark:border-green-800/30 rounded-2xl animate-fade-in">
              <CheckCircle className="w-12 h-12 text-green-700 dark:text-green-400 mb-3" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-1">
                Verify your email
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {success}
              </p>
              <Link 
                href="/login"
                className="mt-6 px-6 py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-md"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Select your role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Customer Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("customer")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedRole === "customer"
                        ? "border-green-800 bg-green-800/5 dark:bg-green-900/10 ring-2 ring-green-800/10"
                        : "border-stone-200/60 dark:border-slate-800/40 hover:border-stone-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      selectedRole === "customer" 
                        ? "bg-green-800 text-white" 
                        : "bg-stone-100 dark:bg-slate-800 text-stone-500"
                    }`}>
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
                        Customer
                      </div>
                      <div className="text-xs text-stone-400 dark:text-stone-500">
                        I want to book stays
                      </div>
                    </div>
                  </button>

                  {/* Owner Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("owner")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedRole === "owner"
                        ? "border-green-800 bg-green-800/5 dark:bg-green-900/10 ring-2 ring-green-800/10"
                        : "border-stone-200/60 dark:border-slate-800/40 hover:border-stone-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      selectedRole === "owner" 
                        ? "bg-green-800 text-white" 
                        : "bg-stone-100 dark:bg-slate-800 text-stone-500"
                    }`}>
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
                        Owner
                      </div>
                      <div className="text-xs text-stone-400 dark:text-stone-500">
                        I want to list property
                      </div>
                    </div>
                  </button>

                </div>
              </div>

              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-sm transition-all duration-300 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

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
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Password
                </label>
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
                {loading ? "Registering..." : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>

            </form>
          )}

          {/* Footer Toggle */}
          <div className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/40 dark:border-slate-800/40 pt-4">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="font-semibold text-green-700 dark:text-green-400 hover:underline"
            >
              Sign in
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

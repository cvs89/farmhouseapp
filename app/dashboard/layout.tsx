import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
import { 
  Trees, 
  LayoutDashboard, 
  Home, 
  Calendar, 
  Users, 
  LogOut, 
  ShieldAlert,
  TrendingUp
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Retrieve user role profile details
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-950 p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Profile Loading Error</h2>
          <p className="text-sm text-stone-500">Failed to load user credentials. Please try signing in again.</p>
          <form action={signOut}>
            <button className="px-6 py-2 bg-green-800 text-white rounded-xl text-sm font-semibold">Sign Out</button>
          </form>
        </div>
      </div>
    );
  }

  // Role Guard Check
  if (profile.role !== "owner" && profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 to-stone-50 dark:from-slate-950 dark:to-black p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Access Denied</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              This dashboard is restricted to **Farmhouse Owners** only. Your current role is **{profile.role.toUpperCase()}**.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link 
              href="/"
              className="px-4 py-2 border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold hover:bg-stone-100 dark:hover:bg-slate-900 transition-colors"
            >
              Go Home
            </Link>
            <form action={signOut}>
              <button 
                type="submit"
                className="px-4 py-2 bg-destructive text-white rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-stone-50/50 dark:bg-slate-950/20 min-h-screen">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-stone-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg flex flex-col justify-between p-6">
        
        <div className="space-y-8">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-green-800/10 overflow-hidden flex items-center justify-center p-0.5 border border-green-800/20">
              <img src="/bhilwara_farms_logo.png" alt="Bhilwara Farms Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg font-display text-stone-850 dark:text-stone-100">
              Owner Panel
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1">
            <Link 
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-green-800/5 hover:text-green-800 dark:hover:bg-green-950/20 dark:hover:text-green-400 transition-all duration-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>
            <Link 
              href="/dashboard/properties"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-green-800/5 hover:text-green-800 dark:hover:bg-green-950/20 dark:hover:text-green-400 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              My Properties
            </Link>
            <Link 
              href="/dashboard/calendar"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-green-800/5 hover:text-green-800 dark:hover:bg-green-950/20 dark:hover:text-green-400 transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
              Calendar Sync
            </Link>
            <Link 
              href="/dashboard/reports"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-green-800/5 hover:text-green-800 dark:hover:bg-green-950/20 dark:hover:text-green-400 transition-all duration-200"
            >
              <TrendingUp className="w-4 h-4" />
              Revenue & Pricing
            </Link>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-400 dark:text-stone-600 cursor-not-allowed select-none"
              title="Caretaker management is planned for Phase 4"
            >
              <Users className="w-4 h-4 text-stone-300 dark:text-stone-700" />
              Caretakers <span className="text-[9px] bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-stone-400 dark:text-stone-500 font-bold ml-auto">SOON</span>
            </div>
          </nav>

        </div>

        {/* Footer profile & Sign Out */}
        <div className="space-y-4 pt-6 border-t border-stone-200/50 dark:border-slate-800/40">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">
              {profile.full_name}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 truncate">
              {profile.email}
            </span>
          </div>

          <form action={signOut}>
            <button 
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-500 dark:text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto p-8">
        <div className="max-w-5xl w-full mx-auto animate-fade-in">
          {children}
        </div>
      </main>

    </div>
  );
}

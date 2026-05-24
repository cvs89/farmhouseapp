import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
import { 
  Trees, 
  UserCog, 
  LogOut, 
  ShieldAlert 
} from "lucide-react";

export default async function AdminLayout({
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

  // Fetch admin profile details
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
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Error</h2>
          <p className="text-sm text-stone-550">Failed to load admin profile.</p>
          <form action={signOut}>
            <button className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold">Sign Out</button>
          </form>
        </div>
      </div>
    );
  }

  // Admin role check guard
  if (profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 to-stone-50 dark:from-slate-955 dark:to-black p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-stone-850 dark:text-stone-100">Access Restricted</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              This area is restricted to **Platform Administrators** only. Your current role is **{profile.role.toUpperCase()}**.
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
      
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-stone-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg flex flex-col justify-between p-6">
        
        <div className="space-y-8">
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-slate-800/10 overflow-hidden flex items-center justify-center p-0.5 border border-slate-800/20">
              <img src="/bhilwara_farms_logo.png" alt="Bhilwara Farms Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg font-display text-stone-850 dark:text-stone-100">
              Admin Console
            </span>
          </Link>

          <nav className="space-y-1">
            <Link 
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              <UserCog className="w-4 h-4" />
              Platform CMS
            </Link>
          </nav>

        </div>

        {/* Admin Footer */}
        <div className="space-y-4 pt-6 border-t border-stone-200/50 dark:border-slate-800/40">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-250 truncate">
              {profile.full_name}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 truncate">
              {profile.email}
            </span>
          </div>

          <form action={signOut}>
            <button 
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-500 dark:text-stone-400 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>

      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto p-8">
        <div className="max-w-5xl w-full mx-auto animate-fade-in">
          {children}
        </div>
      </main>

    </div>
  );
}

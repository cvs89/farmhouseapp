"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth-actions";
import {
  Trees,
  Compass,
  LogOut,
  Sparkles,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Users,
  Layers,
  MapPin,
  HelpCircle,
  TrendingUp,
  Sliders,
  CheckCircle2
} from "lucide-react";

export default function AboutUsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [roleTab, setRoleTab] = useState<"guest" | "owner">("guest");
  const [activeStep, setActiveStep] = useState(0);

  // Retrieve user session client-side
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Reset active step when changing perspective tab
  useEffect(() => {
    setActiveStep(0);
  }, [roleTab]);

  const guestSteps = [
    {
      title: "AI Vibe Matching",
      tagline: "Describe your dream escape",
      desc: "Forget rigid tags. Simply describe what you want (e.g., 'Green lawn with a large pool and barbecue setup near Pur Road') and our advanced vector-embedding AI matches you with properties fitting that exact vibe.",
      preview: (
        <div className="bg-stone-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-stone-200/50 dark:border-slate-800/40 space-y-3 shadow-inner animate-scale-in">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500/10" /> AI Vibe Search
          </div>
          <div className="text-xs bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 text-stone-600 dark:text-stone-300 italic">
            &quot;Pool farmhouse with lush gardens for family weekend getaway...&quot;
          </div>
          <div className="flex gap-2">
            <div className="h-2 w-16 bg-green-800/20 rounded-full" />
            <div className="h-2 w-10 bg-green-800/20 rounded-full" />
          </div>
        </div>
      )
    },
    {
      title: "Flexible Reservation",
      tagline: "Book instantly or submit enquiries",
      desc: "Enjoy real-time availability filters. Depending on the farmhouse settings, pay secure deposit holds instantly via Razorpay, or submit a custom booking inquiry form directly to the owner.",
      preview: (
        <div className="bg-stone-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-stone-200/50 dark:border-slate-800/40 space-y-3 shadow-inner animate-scale-in">
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
            <span>AVAILABILITY CALENDAR</span>
            <span className="text-green-800 dark:text-green-400">● LIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-2 bg-white dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/40 rounded-lg">
              <p className="text-[8px] text-stone-400 font-bold uppercase">CHECK-IN</p>
              <p className="text-[10px] font-bold text-stone-700 dark:text-stone-300">12 June 2026</p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/40 rounded-lg">
              <p className="text-[8px] text-stone-400 font-bold uppercase">CHECK-OUT</p>
              <p className="text-[10px] font-bold text-stone-700 dark:text-stone-300">14 June 2026</p>
            </div>
          </div>
          <button type="button" className="w-full py-2 bg-green-800 text-white rounded-xl text-[10px] font-bold shadow-md hover:bg-green-700 transition-colors">
            Secure dates
          </button>
        </div>
      )
    },
    {
      title: "24/7 AI Concierge Assistance",
      tagline: "Your personal local stay assistant",
      desc: "Instantly chat with our OpenAI-powered assistant. From local recommendations to amenities, parking info, and check-in assistance, the AI Stay Concierge handles your queries in real-time.",
      preview: (
        <div className="bg-stone-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-stone-200/50 dark:border-slate-800/40 space-y-3 shadow-inner max-w-xs mx-auto animate-scale-in text-left">
          <div className="flex items-center gap-1.5 border-b border-stone-200/40 dark:border-slate-800/40 pb-2">
            <div className="w-5 h-5 rounded-full bg-green-800/10 flex items-center justify-center p-0.5">
              <Trees className="w-3.5 h-3.5 text-green-850" />
            </div>
            <span className="text-[10px] font-bold text-stone-850 dark:text-stone-200">Concierge Bot</span>
          </div>
          <div className="space-y-2">
            <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-stone-100 dark:border-slate-800/20 text-[9px] text-stone-600 dark:text-stone-300 max-w-[85%] ml-auto">
              How big is the pool?
            </div>
            <div className="bg-green-800/5 dark:bg-green-950/20 p-2 rounded-xl text-[9px] text-stone-700 dark:text-stone-300 max-w-[85%]">
              The pool at Harni Greens is 25x15 ft with a separate kid zone! 🏊‍♂️
            </div>
          </div>
        </div>
      )
    }
  ];

  const ownerSteps = [
    {
      title: "Host Onboarding Wizard",
      tagline: "List your property in minutes",
      desc: "Seamless onboarding wizard leads you through listing details, rules, pricing, geo-coordinates, and high-resolution galleries, making hosting simple and clear.",
      preview: (
        <div className="bg-stone-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-stone-200/50 dark:border-slate-800/40 space-y-3 shadow-inner animate-scale-in text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-800 dark:text-green-400">
            <Layers className="w-3.5 h-3.5" /> Wizard: Step 2 of 4
          </div>
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-stone-200/60 dark:border-slate-800/40 space-y-2">
            <p className="text-[10px] font-bold text-stone-800 dark:text-stone-300">Base Price (₹ / night)</p>
            <input type="text" disabled defaultValue="15,000" className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-slate-900/50 rounded-lg text-xs font-semibold focus:outline-none border border-stone-100 dark:border-slate-800/40 text-stone-700 dark:text-stone-300" />
          </div>
        </div>
      )
    },
    {
      title: "Selective Payments Control",
      tagline: "Choose how you receive bookings",
      desc: "Turn online payments on/off per property. If enabled, process instant deposits. If disabled, receive custom inquiries that you can manually convert to confirmed bookings with cash/transfer references.",
      preview: (
        <div className="bg-stone-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-stone-200/50 dark:border-slate-800/40 space-y-3 shadow-inner animate-scale-in text-left">
          <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40">
            <span className="text-[9px] font-bold text-stone-700 dark:text-stone-300">Online Payments & Deposits</span>
            <div className="w-8 h-4 bg-green-800 rounded-full flex items-center justify-end p-0.5">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
          <div className="text-[8px] text-stone-400 italic">Toggle payments dynamically to accept direct holds or inquiry submissions.</div>
        </div>
      )
    },
    {
      title: "Realtime Analytics & Sync",
      tagline: "Manage stays like a hospitality pro",
      desc: "Sync bookings with calendar visualizers, allocate caretaker tasks automatically, check monthly revenue statements, and view automated pricing optimization charts based on booking densities.",
      preview: (
        <div className="bg-stone-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-stone-200/50 dark:border-slate-800/40 space-y-3 shadow-inner animate-scale-in text-left">
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
            <span>PERFORMANCE STATEMENT</span>
            <span className="text-green-800 dark:text-green-400">+12% vs last mo.</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-stone-200/60 dark:border-slate-800/40">
              <span className="text-[8px] text-stone-400 uppercase font-bold">Occupancy</span>
              <p className="text-sm font-bold text-stone-850 dark:text-stone-200">84%</p>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-stone-200/60 dark:border-slate-800/40">
              <span className="text-[8px] text-stone-400 uppercase font-bold">Earnings</span>
              <p className="text-sm font-bold text-stone-850 dark:text-stone-200">₹1.4L</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeStepsList = roleTab === "guest" ? guestSteps : ownerSteps;

  return (
    <div className="flex-1 bg-stone-50/50 dark:bg-slate-950/20 min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl w-full mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-green-800/10 overflow-hidden flex items-center justify-center p-0.5 border border-green-800/20">
              <img src="/bhilwara_farms_logo.png" alt="Bhilwara Farms Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg font-display text-stone-850 dark:text-stone-100 font-sans">
              Bhilwara Farms
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            <Link href="/" className="hover:text-green-850 transition-colors">Stays Directory</Link>
            <Link href="/about" className="text-green-850 border-b-2 border-green-800 pb-0.5">About Us</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-green-850 transition-colors">Owner Dashboard</Link>
                <form action={signOut}>
                  <button type="submit" className="flex items-center gap-1 hover:text-red-650 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-green-850 transition-colors">Host Your Stay</Link>
                <Link href="/login" className="px-3.5 py-1.5 bg-green-850 hover:bg-green-800 text-white rounded-lg transition-colors">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex-1 flex flex-col space-y-12 justify-center text-center">
        
        {/* Title */}
        <div className="space-y-3 max-w-2xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-800/5 text-green-800 dark:text-green-400 border border-green-800/10 font-bold text-xs">
            <Compass className="w-3.5 h-3.5 text-green-800" /> Platform Concept
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-display text-stone-850 dark:text-stone-100 leading-tight">
            Connecting Nature Retrets with Seamless Hospitality
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed font-sans">
            Bhilwara Farms is a curated staycation portal optimized for events, weekend escapes, and pool lawns in Bhilwara, Rajasthan. We bridge the gap between local farmhouse owners and travelers seeking premium outdoor stays.
          </p>
        </div>

        {/* Perspective Switcher Tab */}
        <div className="flex justify-center animate-fade-in">
          <div className="grid grid-cols-2 p-1.5 bg-stone-200/50 dark:bg-slate-900/40 rounded-2xl border border-stone-200/30 dark:border-slate-800/20 max-w-md w-full">
            <button
              onClick={() => setRoleTab("guest")}
              className={`py-3 px-6 text-xs font-bold rounded-xl transition-all duration-300 ${
                roleTab === "guest"
                  ? "bg-white dark:bg-slate-950 text-green-850 dark:text-green-400 shadow-md scale-[1.01]"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              The Traveler Experience
            </button>
            <button
              onClick={() => setRoleTab("owner")}
              className={`py-3 px-6 text-xs font-bold rounded-xl transition-all duration-300 ${
                roleTab === "owner"
                  ? "bg-white dark:bg-slate-950 text-green-850 dark:text-green-400 shadow-md scale-[1.01]"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              The Host Platform
            </button>
          </div>
        </div>

        {/* Dynamic Concept Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center bg-white/40 dark:bg-slate-900/20 glass-panel p-8 rounded-3xl animate-slide-up border border-stone-200/40 dark:border-slate-800/40 shadow-sm text-left">
          
          {/* Stepper controls (left 2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100 font-display">
              {roleTab === "guest" ? "How it works for Guests" : "How it works for Stays Owners"}
            </h3>
            
            <div className="space-y-2">
              {activeStepsList.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-300 group ${
                    activeStep === idx
                      ? "border-green-800 bg-green-800/5 text-green-850 dark:border-green-400 dark:bg-green-950/20 dark:text-green-400 shadow-sm"
                      : "border-transparent text-stone-500 hover:bg-stone-100/50 dark:hover:bg-slate-900/30"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                    activeStep === idx
                      ? "bg-green-800 text-white dark:bg-green-400 dark:text-slate-950"
                      : "bg-stone-200/60 dark:bg-slate-800/60 text-stone-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold transition-colors group-hover:text-stone-800 dark:group-hover:text-stone-150">
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{step.tagline}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ml-auto self-center shrink-0 transition-transform ${
                    activeStep === idx ? "transform translate-x-0.5 text-green-800 dark:text-green-400" : "text-stone-300"
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Stepper view info (right 3 cols) */}
          <div className="md:col-span-3 flex flex-col md:flex-row gap-6 p-6 bg-stone-50/40 dark:bg-slate-900/40 rounded-2xl border border-stone-200/20 dark:border-slate-800/20 min-h-[220px] items-center justify-center">
            <div className="flex-1 space-y-3">
              <span className="text-[9px] font-extrabold tracking-wider bg-green-800/10 dark:bg-green-400/10 text-green-800 dark:text-green-400 px-2 py-0.5 rounded font-display uppercase">
                {activeStepsList[activeStep].tagline}
              </span>
              <h4 className="text-base font-extrabold text-stone-850 dark:text-stone-100 font-sans">
                {activeStepsList[activeStep].title}
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                {activeStepsList[activeStep].desc}
              </p>
            </div>
            
            {/* Animated Interactive Mock Render */}
            <div className="w-full md:w-56 shrink-0 flex items-center justify-center p-2">
              {activeStepsList[activeStep].preview}
            </div>
          </div>

        </div>

        {/* Feature Cards Grids (Traveler or Host perspective features) */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display text-stone-850 dark:text-stone-150 animate-fade-in text-center">
            {roleTab === "guest" ? "Designed for Curated Stays" : "Hospitality Management Suite"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
            {roleTab === "guest" ? (
              <>
                {/* Traveler Card 1 */}
                <div className="glass-panel p-6 rounded-2xl border border-stone-200/40 dark:border-slate-800/40 text-left space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
                    <Sparkles className="w-5 h-5 fill-amber-500/15" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-850 dark:text-stone-100">Natural Match</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Search farmhouses by typing conversational descriptions. No keywords limit. Finding stay vibes feels native.
                  </p>
                </div>

                {/* Traveler Card 2 */}
                <div className="glass-panel p-6 rounded-2xl border border-stone-200/40 dark:border-slate-800/40 text-left space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-xl bg-green-800/10 flex items-center justify-center text-green-800 dark:text-green-400 group-hover:scale-105 transition-transform duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-850 dark:text-stone-100">Verified Reviews</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Read feedback written exclusively by authenticated guests who actually booked and stayed at the farmhouse.
                  </p>
                </div>

                {/* Traveler Card 3 */}
                <div className="glass-panel p-6 rounded-2xl border border-stone-200/40 dark:border-slate-800/40 text-left space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-850 dark:text-stone-100">Secure Payments</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Deposit holds are processed safely via Razorpay, securing your booking block directly into our real-time calendars.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Owner Card 1 */}
                <div className="glass-panel p-6 rounded-2xl border border-stone-200/40 dark:border-slate-800/40 text-left space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-xl bg-green-800/10 flex items-center justify-center text-green-800 dark:text-green-400 group-hover:scale-105 transition-transform duration-300">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-850 dark:text-stone-100">Payment Toggles</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Decide listing policies. Turn Razorpay deposits off to let guests submit enquiry requests, giving hosts total pricing control.
                  </p>
                </div>

                {/* Owner Card 2 */}
                <div className="glass-panel p-6 rounded-2xl border border-stone-200/40 dark:border-slate-800/40 text-left space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-850 dark:text-stone-100">Calendar Synchronizer</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Block calendars manually for maintenance, sync dates with caretaker schedules, and prevent any reservation overlaps.
                  </p>
                </div>

                {/* Owner Card 3 */}
                <div className="glass-panel p-6 rounded-2xl border border-stone-200/40 dark:border-slate-800/40 text-left space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-850 dark:text-stone-100">Smart Optimization</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Access historical occupancy metrics and receive smart suggestions to increase price during peak demand days.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="glass-panel p-10 rounded-3xl bg-green-800 text-white text-center space-y-5 relative overflow-hidden shadow-xl animate-fade-in">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-700/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="text-2xl font-bold font-display leading-tight">
            Ready to experience Bhilwara Farms?
          </h3>
          <p className="text-xs text-green-100/90 max-w-md mx-auto leading-relaxed">
            Whether you want to escape into a cozy weekend farm retreat or optimize your property&apos;s hospitality returns, we provide the ultimate platform tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              href="/"
              className="px-6 py-2.5 bg-white text-green-850 hover:bg-stone-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              Discover Farmhouses <ArrowRight className="w-4 h-4 text-green-850" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 border border-white/40 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
            >
              Create Host Account
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

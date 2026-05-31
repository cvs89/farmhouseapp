import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/60 dark:border-slate-800/50 bg-white dark:bg-slate-950/80 backdrop-blur-md w-full">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        
        {/* Brand identity column */}
        <div className="space-y-4 md:col-span-1 text-left">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-green-800/10 overflow-hidden flex items-center justify-center p-0.5 border border-green-800/20">
              <img src="/bhilwara_farms_logo.png" alt="Bhilwara Farms Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-base font-display text-stone-850 dark:text-stone-100 font-sans">
              Bhilwara Farms
            </span>
          </Link>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
            A premium curated portal connecting travelers with luxury farmhouses, event lawns, and pool villas in Bhilwara, Rajasthan. Escape into nature with seamless hospitality.
          </p>
        </div>

        {/* Quick Navigation column */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-stone-850 dark:text-stone-200 uppercase tracking-wider font-display">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs text-stone-500 dark:text-stone-400 font-sans">
            <li>
              <Link href="/" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                Stays Directory
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                Host Your Farmhouse
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* Popular Vibes column */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-stone-850 dark:text-stone-200 uppercase tracking-wider font-display">
            Popular Vibes
          </h4>
          <ul className="space-y-2 text-xs text-stone-500 dark:text-stone-400 font-sans">
            <li>
              <Link href="/?tab=vibe&vibe=farmhouse+with+swimming+pool" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                Pool Farmhouses
              </Link>
            </li>
            <li>
              <Link href="/?tab=vibe&vibe=large+lawn+for+wedding+and+events" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                Event Lawns
              </Link>
            </li>
            <li>
              <Link href="/?tab=vibe&vibe=cozy+garden+retreat+for+weekend+staycation" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                Weekend Retreats
              </Link>
            </li>
            <li>
              <Link href="/?tab=vibe&vibe=farmhouse+with+barbecue+and+bonfire" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                Bonfire & Grill Stays
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact/Support Column */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-stone-850 dark:text-stone-200 uppercase tracking-wider font-display">
            Contact Support
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-500 dark:text-stone-400 font-sans">
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
              <span>Bhilwara, Rajasthan, 311001</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
              <a href="mailto:support@bhilwarafarms.com" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                support@bhilwarafarms.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
              <a href="tel:+919414000000" className="hover:text-green-850 dark:hover:text-green-400 transition-colors">
                +91 94140 00000
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-100 dark:border-slate-900 py-6 bg-stone-50/50 dark:bg-slate-950/40 w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-medium text-stone-400 dark:text-stone-500">
          <div>
            © {new Date().getFullYear()} Bhilwara Farms. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

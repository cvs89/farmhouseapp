import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Trees, Compass, Calendar, AlertCircle, FileText, Star, ShieldCheck } from "lucide-react";

export default async function CustomerBookingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Retrieve customer stays
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("id, start_date, end_date, total_amount, deposit_paid, status, invoice_pdf_url, property_id, properties(title, slug)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });
  const bookings = bookingsData || [];

  return (
    <div className="flex-1 bg-stone-50/50 dark:bg-slate-950/20 min-h-screen">
      
      {/* Header Banner */}
      <header className="border-b border-stone-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-6xl w-full mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-green-800 text-white">
              <Trees className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg font-display text-stone-800 dark:text-stone-100 font-sans">
              Stay History
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            <Link href="/properties" className="hover:text-green-850">All Stays</Link>
            <Link href="/dashboard" className="hover:text-green-850">Host Panel</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 space-y-8 text-left">
        
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-stone-850 dark:text-stone-100 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-green-800" /> My Stay Bookings
          </h1>
          <p className="text-sm text-stone-500">
            Monitor stay availability holds, check payments, and write verified reviews.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-panel py-16 px-4 rounded-3xl text-center space-y-4 max-w-md mx-auto">
            <Compass className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100">No Reservations Yet</h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              You haven't booked any farmhouses. Explore published properties to find your first escape!
            </p>
            <Link
              href="/properties"
              className="inline-flex px-6 py-2.5 bg-green-800 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Explore Farmhouses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const stay = booking.properties as any;
              const isConfirmed = booking.status === "confirmed";

              return (
                <div 
                  key={booking.id}
                  className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-stone-200/40"
                >
                  {/* Left detail info */}
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-lg font-bold text-stone-850 dark:text-stone-150 truncate">
                      {stay?.title || "Luxury Stay"}
                    </h3>
                    <p className="text-xs text-stone-500">
                      📅 {booking.start_date} to {booking.end_date}
                    </p>
                    <div className="flex gap-4 text-xs font-semibold pt-1 text-stone-400">
                      <span>Total: ₹{Number(booking.total_amount).toLocaleString()}</span>
                      <span>Paid: ₹{Number(booking.deposit_paid).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    
                    {/* Status Badge */}
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending_payment"
                        ? "bg-amber-100 text-amber-800 animate-pulse"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {booking.status === "confirmed" ? "Confirmed" : "Hold"}
                    </span>

                    {/* PDF Invoice link */}
                    {isConfirmed && (
                      <a
                        href={booking.invoice_pdf_url || "#"}
                        title={booking.invoice_pdf_url ? "Download digital invoice" : "Invoice is being generated"}
                        className={`inline-flex items-center gap-1 text-[11px] px-3.5 py-2 border border-stone-200 dark:border-slate-800 rounded-xl font-bold transition-all ${
                          booking.invoice_pdf_url
                            ? "text-stone-600 dark:text-stone-300 hover:bg-stone-50"
                            : "opacity-40 cursor-not-allowed text-stone-300"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Invoice
                      </a>
                    )}

                    {/* Review submission action */}
                    {isConfirmed && (
                      <Link
                        href={`/profile/bookings/${booking.id}/review?propertyId=${booking.property_id}`}
                        className="inline-flex items-center gap-1 text-[11px] px-3.5 py-2 bg-green-800 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Review Stay
                      </Link>
                    )}

                    {!isConfirmed && booking.status === "pending_payment" && (
                      <Link
                        href={`/properties/${stay?.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] px-3.5 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-500 transition-colors"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Complete Checkout
                      </Link>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
}

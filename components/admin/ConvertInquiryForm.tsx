"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminConvertInquiryToBooking } from "@/lib/admin-actions";
import { Info, Loader2, ArrowLeft, Calendar, User, FileText, IndianRupee, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ConvertInquiryFormProps {
  inquiry: {
    id: string;
    property_id: string;
    customer_id: string | null;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    message: string;
    dates_interested: {
      startDate: string;
      endDate: string;
    };
    status: string;
    properties: {
      title: string;
      base_price: number;
      weekend_price: number;
      deposit_percentage: number;
    };
  };
}

export default function ConvertInquiryForm({ inquiry }: ConvertInquiryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested price calculations
  const [suggestedTotal, setSuggestedTotal] = useState(0);
  const [suggestedDeposit, setSuggestedDeposit] = useState(0);

  // Form states
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [depositPaid, setDepositPaid] = useState<number>(0);
  const [paymentReference, setPaymentReference] = useState("");

  const startDate = inquiry.dates_interested?.startDate;
  const endDate = inquiry.dates_interested?.endDate;

  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) return;

    let weekdays = 0;
    let weekends = 0;
    const current = new Date(start);

    while (current < end) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
      if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
        weekends++;
      } else {
        weekdays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const base = Number(inquiry.properties?.base_price || 0);
    const weekend = Number(inquiry.properties?.weekend_price || 0);
    const depositPct = Number(inquiry.properties?.deposit_percentage || 20);

    const calculatedTotal = (weekdays * base) + (weekends * weekend);
    const calculatedDeposit = (calculatedTotal * depositPct) / 100;

    setSuggestedTotal(calculatedTotal);
    setSuggestedDeposit(calculatedDeposit);

    // Prefill form values with calculated suggestions
    setTotalPrice(calculatedTotal);
    setDepositPaid(calculatedDeposit);
  }, [startDate, endDate, inquiry.properties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (totalPrice < 0 || depositPaid < 0) {
      setError("Price and deposit amounts must be non-negative.");
      setLoading(false);
      return;
    }

    if (depositPaid > totalPrice) {
      setError("Deposit amount cannot exceed the total booking price.");
      setLoading(false);
      return;
    }

    if (!paymentReference.trim()) {
      setError("Please provide a payment reference (e.g. 'Cash', 'GPay ref 1283', 'Bank Transfer').");
      setLoading(false);
      return;
    }

    try {
      const res = await adminConvertInquiryToBooking(inquiry.id, {
        total_amount: totalPrice,
        deposit_paid: depositPaid,
        payment_reference: paymentReference,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin?tab=bookings");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const remainingBalance = totalPrice - depositPaid;

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-left">
      
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin?tab=inquiries"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Booking Enquiries
        </Link>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-stone-200/40 dark:border-slate-800/40 shadow-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg">
        
        <div className="mb-6 border-b border-stone-200/40 dark:border-slate-800/40 pb-4">
          <span className="text-[10px] bg-green-800/10 text-green-800 dark:bg-green-950/40 dark:text-green-400 font-extrabold uppercase px-2.5 py-1 rounded-full">
            Inquiry Converter
          </span>
          <h2 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100 mt-2">
            Approve & Convert to Booking
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Confirm the dates and manual payment details to block calendar availability.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-xl text-xs flex items-center gap-2 border border-red-100 dark:border-red-950/30">
            <Info className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Guest Card */}
          <div className="p-4 bg-stone-50 dark:bg-slate-950/35 border border-stone-200/60 dark:border-slate-850/60 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-stone-700 dark:text-stone-300 uppercase flex items-center gap-1.5 border-b border-stone-200/40 dark:border-slate-800/40 pb-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" /> Guest Details
            </h4>
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <div><strong>Name:</strong> {inquiry.guest_name}</div>
              <div><strong>Email:</strong> {inquiry.guest_email}</div>
              <div><strong>Phone:</strong> {inquiry.guest_phone || "—"}</div>
              {inquiry.customer_id && (
                <div className="text-[10px] text-green-700 font-bold flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Registered User
                </div>
              )}
            </div>
          </div>

          {/* Stay Info Card */}
          <div className="p-4 bg-stone-50 dark:bg-slate-950/35 border border-stone-200/60 dark:border-slate-850/60 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-stone-700 dark:text-stone-300 uppercase flex items-center gap-1.5 border-b border-stone-200/40 dark:border-slate-800/40 pb-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" /> Stay Details
            </h4>
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <div><strong>Stay:</strong> {inquiry.properties?.title}</div>
              <div><strong>Dates:</strong> <span className="font-semibold text-green-800 dark:text-green-400">{startDate} to {endDate}</span></div>
              <div className="text-[10px] text-stone-400 mt-1">
                Weekday rate: ₹{inquiry.properties?.base_price?.toLocaleString()} | Weekend rate: ₹{inquiry.properties?.weekend_price?.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Custom Message Card */}
          <div className="md:col-span-2 p-4 bg-amber-50/15 dark:bg-slate-950/20 border border-stone-200/50 dark:border-slate-800/45 rounded-2xl space-y-2">
            <h4 className="text-xs font-extrabold text-stone-700 dark:text-stone-300 uppercase flex items-center gap-1.5 pb-1 border-b border-stone-200/20">
              <FileText className="w-3.5 h-3.5 text-stone-400" /> Guest Requirements
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
              {inquiry.message || "No special requests mentioned."}
            </p>
          </div>

        </div>

        {/* Suggested prices badge */}
        <div className="mb-6 p-3 bg-green-800/5 border border-green-800/20 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-green-800 dark:text-green-400">System Suggested Cost Calculator:</span>
          <div className="flex gap-4">
            <span>Total: <strong>₹{suggestedTotal.toLocaleString()}</strong></span>
            <span>Required Deposit ({inquiry.properties?.deposit_percentage}%): <strong>₹{suggestedDeposit.toLocaleString()}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Total Stay price (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <IndianRupee className="w-3.5 h-3.5" />
                </span>
                <input
                  type="number"
                  required
                  value={totalPrice}
                  onChange={e => setTotalPrice(parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-slate-955 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Deposit Amount Paid (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <IndianRupee className="w-3.5 h-3.5" />
                </span>
                <input
                  type="number"
                  required
                  value={depositPaid}
                  onChange={e => setDepositPaid(parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-slate-955 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="md:col-span-2 p-3 bg-stone-50/70 dark:bg-slate-955/30 border border-stone-200/40 rounded-xl flex justify-between text-xs font-bold text-stone-600 dark:text-stone-300">
              <span>Unpaid Remaining Balance:</span>
              <span className="text-stone-850 dark:text-stone-100 font-extrabold flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3" />
                {remainingBalance.toLocaleString()}
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Manual Payment Details / Reference</label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={e => setPaymentReference(e.target.value)}
                placeholder="e.g. Cash paid on spot, GPay ref 98218938, Bank Transfer"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-955 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all text-stone-850 dark:text-stone-100"
              />
            </div>

          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200/40 dark:border-slate-800/40">
            <Link
              href="/admin?tab=inquiries"
              className="flex-1 py-2.5 border border-stone-200 dark:border-slate-850 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-850 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Booking & Block Calendar
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}

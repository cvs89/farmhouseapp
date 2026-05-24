"use client";

import { useState, useEffect } from "react";
import { IndianRupee, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BookingWidgetProps {
  propertyId: string;
  basePrice: number;
  weekendPrice: number;
  depositPercentage: number;
  blockedDates?: string[];
  acceptsPayments?: boolean;
}

export default function BookingWidget({
  propertyId,
  basePrice,
  weekendPrice,
  depositPercentage = 20,
  blockedDates = [],
  acceptsPayments = true,
}: BookingWidgetProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Local blocked dates tracking realtime additions
  const [localBlockedDates, setLocalBlockedDates] = useState<string[]>(blockedDates);

  // Cost states
  const [daysCount, setDaysCount] = useState(0);
  const [weekdayCount, setWeekdayCount] = useState(0);
  const [weekendCount, setWeekendCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [depositCost, setDepositCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated guest profile states (for enquiry)
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    full_name: string;
    email: string;
    phone: string;
  } | null>(null);
  
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const supabase = createClient();

  // Load authenticated user profile
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) {
          setCurrentUser({
            id: user.id,
            full_name: profile.full_name || "",
            email: profile.email || user.email || "",
            phone: profile.phone || "",
          });
        } else {
          setCurrentUser({
            id: user.id,
            full_name: user.user_metadata?.full_name || "Guest",
            email: user.email || "",
            phone: user.phone || "",
          });
        }
      }
    };
    fetchUser();
  }, [supabase]);

  // Sync profile details to guest form inputs
  useEffect(() => {
    if (currentUser) {
      setGuestName(currentUser.full_name);
      setGuestEmail(currentUser.email);
      setGuestPhone(currentUser.phone);
    }
  }, [currentUser]);

  // 1. Supabase Realtime Listener setup
  useEffect(() => {
    setLocalBlockedDates(blockedDates);

    const channel = supabase
      .channel(`availability-updates-${propertyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availability",
          filter: `property_id=eq.${propertyId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newDate = payload.new.blocked_date;
            setLocalBlockedDates((prev) => [...prev, newDate]);
          } else if (payload.eventType === "DELETE") {
            const oldDate = payload.old.blocked_date;
            setLocalBlockedDates((prev) => prev.filter((d) => d !== oldDate));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, blockedDates, supabase]);

  // 2. Pricing & Conflict Checks
  useEffect(() => {
    setError(null);

    if (!startDate || !endDate) {
      setDaysCount(0);
      setTotalCost(0);
      setDepositCost(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setDaysCount(0);
      setTotalCost(0);
      setDepositCost(0);
      return;
    }

    // Generate date range and verify double bookings conflicts
    let days = 0;
    let weekdays = 0;
    let weekends = 0;
    const current = new Date(start);
    let conflict = false;

    while (current < end) {
      const dateStr = current.toISOString().split("T")[0];
      
      // Check if this date is blocked
      if (localBlockedDates.includes(dateStr)) {
        conflict = true;
        break;
      }

      days++;
      const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday, 5 = Friday
      if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
        weekends++;
      } else {
        weekdays++;
      }
      current.setDate(current.getDate() + 1);
    }

    if (conflict) {
      setError("One or more dates in your selected range are already booked. Please choose other dates.");
      setDaysCount(0);
      setTotalCost(0);
      setDepositCost(0);
      return;
    }

    const cost = (weekdays * basePrice) + (weekends * weekendPrice);
    const deposit = (cost * depositPercentage) / 100;

    setDaysCount(days);
    setWeekdayCount(weekdays);
    setWeekendCount(weekends);
    setTotalCost(cost);
    setDepositCost(deposit);

  }, [startDate, endDate, basePrice, weekendPrice, depositPercentage, localBlockedDates]);

  // Dynamic Razorpay Script Loader
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load payment checkout SDK. Check your internet connection.");
      }

      // Hold API Lock
      const holdRes = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          startDate,
          endDate,
          totalAmount: totalCost,
          depositPaid: depositCost,
          remainingBalance: totalCost - depositCost,
        }),
      });

      const holdData = await holdRes.json();
      if (!holdRes.ok) {
        throw new Error(holdData.error || "Failed to reserve selected dates.");
      }

      const { bookingId } = holdData;

      // Initiate Razorpay Order parameters
      const orderRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: depositCost,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create checkout order transaction.");
      }

      // Fire Razorpay Modal Dialog
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Farmhouse Booking Platform",
        description: `Split Deposit to Lock Stay`,
        order_id: orderData.orderId,
        handler: function (response: any) {
          alert(`Stay reserved! Verification check is in progress.`);
          window.location.reload(); 
        },
        prefill: {
          name: currentUser?.full_name || "Verified Customer",
          email: currentUser?.email || "customer@example.com",
        },
        theme: {
          color: "#1E3A27",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initiate payment transaction.");
      setLoading(false);
    }
  };

  const handleSendEnquiry = async () => {
    setError(null);
    setLoading(true);

    if (!guestName || !guestEmail || !guestPhone || !enquiryMessage) {
      setError("Please fill out all contact fields and message details.");
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("inquiries")
        .insert({
          property_id: propertyId,
          customer_id: currentUser?.id || null,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          message: enquiryMessage,
          dates_interested: { startDate, endDate },
          status: "open",
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setEnquirySuccess(true);
      setEnquiryMessage("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-200/40 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/60 backdrop-blur-lg space-y-6">
      
      {/* Price header */}
      <div className="flex justify-between items-baseline">
        <div className="text-left">
          <span className="text-2xl font-extrabold text-stone-850 dark:text-stone-100 flex items-center gap-0.5">
            <IndianRupee className="w-5 h-5" />
            {basePrice.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-stone-400 font-semibold uppercase"> / Weekday night</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-amber-700 dark:text-amber-400 flex items-center justify-end gap-0.5">
            <IndianRupee className="w-4 h-4" />
            {weekendPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-stone-400 font-semibold uppercase"> / Weekend night</span>
        </div>
      </div>

      {enquirySuccess ? (
        <div className="p-5 bg-green-800/5 border border-green-800/20 rounded-2xl text-center space-y-3 animate-fade-in text-left">
          <h4 className="font-bold text-green-800 dark:text-green-400 text-sm">Enquiry Sent Successfully!</h4>
          <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
            Your inquiry for <strong>{startDate}</strong> to <strong>{endDate}</strong> has been shared directly with the owner. They will reach out to you shortly.
          </p>
          <button
            type="button"
            onClick={() => setEnquirySuccess(false)}
            className="w-full mt-2 py-2 border border-green-800 text-green-800 dark:text-green-400 font-semibold rounded-xl text-xs hover:bg-green-800/5 transition-colors"
          >
            Submit Another Enquiry
          </button>
        </div>
      ) : (
        <>
          {/* Date selectors */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Check-In</label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-250"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Check-Out</label>
                <div className="relative">
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-250"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-left">
              {error}
            </div>
          )}

          {/* Pricing Breakdown details */}
          {daysCount > 0 && !error && (
            <div className="space-y-3 pt-4 border-t border-stone-200/40 dark:border-slate-800/40 text-xs text-left animate-fade-in">
              <h4 className="font-bold text-stone-800 dark:text-stone-200">Price Details:</h4>
              
              <div className="space-y-2">
                
                {/* Weekday calculation */}
                {weekdayCount > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Weekday Rent ({weekdayCount} nights × ₹{basePrice.toLocaleString()})</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ₹{(weekdayCount * basePrice).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Weekend calculation */}
                {weekendCount > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span className="text-amber-700 dark:text-amber-400">Weekend Rent ({weekendCount} nights × ₹{weekendPrice.toLocaleString()})</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ₹{(weekendCount * weekendPrice).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Total stays */}
                <div className="flex justify-between text-base font-bold text-stone-800 dark:text-stone-100 pt-2 border-t border-stone-200/20">
                  <span>Total Stay Cost</span>
                  <span>₹{totalCost.toLocaleString()}</span>
                </div>

                {/* Split payments card (Online payment allowed properties) */}
                {acceptsPayments ? (
                  <div className="p-3 bg-green-800/5 border border-green-800/20 rounded-xl space-y-1 mt-2">
                    <div className="flex justify-between text-green-800 dark:text-green-400 font-bold text-sm">
                      <span>Split Lock Deposit ({depositPercentage}%)</span>
                      <span>₹{depositCost.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed">
                      Pay only the deposit to reserve dates immediately. The remaining balance (₹{(totalCost - depositCost).toLocaleString()}) is collected at check-in.
                    </p>
                  </div>
                ) : (
                  /* Enquiry details form (Direct enquiry allowed properties) */
                  <div className="space-y-3 pt-3 border-t border-stone-200/20 mt-3">
                    <h4 className="font-bold text-[11px] text-stone-800 dark:text-stone-200 uppercase">Contact & Inquiry Details:</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-250"
                          placeholder="e.g. Rahul Sharma"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 uppercase block mb-1">Email</label>
                          <input
                            type="email"
                            required
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-250"
                            placeholder="name@email.com"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 uppercase block mb-1">Phone</label>
                          <input
                            type="tel"
                            required
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-250"
                            placeholder="e.g. +91 9876543210"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase block mb-1">Inquiry Message</label>
                        <textarea
                          required
                          rows={3}
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 text-xs text-stone-800 dark:text-stone-250"
                          placeholder="Tell us about guest counts, check-in requirements, or any specific questions..."
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Action CTA */}
          <button
            type="button"
            onClick={acceptsPayments ? handleCheckout : handleSendEnquiry}
            disabled={daysCount === 0 || loading || !!error}
            className="w-full py-3 rounded-2xl bg-green-800 hover:bg-green-700 text-white font-bold text-sm shadow-lg shadow-green-950/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none group transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {acceptsPayments ? "Securing Dates..." : "Submitting Enquiry..."}
              </>
            ) : daysCount === 0 ? (
              acceptsPayments ? "Select Dates to Book" : "Select Dates to Inquire"
            ) : acceptsPayments ? (
              `Reserve with Deposit (₹${depositCost.toLocaleString()})`
            ) : (
              "Submit Booking Enquiry"
            )}
            {!loading && daysCount > 0 && !error && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
          </button>

          {/* Safety notes */}
          <div className="flex gap-2 items-start text-[10px] text-stone-400 pt-2 text-left leading-relaxed">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-stone-300" />
            <span>
              {acceptsPayments
                ? "Dates are secured instantly upon deposit confirmation. Realtime availability sync is enabled."
                : "Direct enquiry booking. Dates are reserved manually by the owner after review."
              }
            </span>
          </div>
        </>
      )}

    </div>
  );
}

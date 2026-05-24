"use client";

import { useState } from "react";
import { blockDatesAction } from "@/lib/calendar-actions";
import { Lock, Info, Loader2 } from "lucide-react";

interface ManualBlockFormProps {
  activePropertyId: string;
}

export default function ManualBlockForm({ activePropertyId }: ManualBlockFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("propertyId", activePropertyId);

    const res = await blockDatesAction(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess(res.success);
      // Reset date fields
      const form = e.target as HTMLFormElement;
      form.reset();
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-4 text-left">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-150/10 border border-green-200/20 text-green-700 text-xs rounded-xl">
            {success}
          </div>
        )}

        {/* Blocker reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Lock Reason</label>
          <select
            name="reason"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs"
          >
            <option value="maintenance">🧹 Under Scheduled Maintenance</option>
            <option value="owner_use">🏡 Reserved for Owner Personal Use</option>
            <option value="booked">💼 Offline Walk-In Booking</option>
          </select>
        </div>

        {/* Check-in */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Block Start Date</label>
          <input
            type="date"
            name="startDate"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs"
          />
        </div>

        {/* Check-out */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Block End Date (Checkout)</label>
          <input
            type="date"
            name="endDate"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving Block...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Save Calendar Block
            </>
          )}
        </button>

      </form>

      {/* Alert instructions */}
      <div className="flex gap-2 items-start text-[10px] text-stone-400 leading-relaxed border-t border-stone-200/20 pt-4">
        <Info className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
        <span>Blocked dates are updated in realtime across guest calendars, instantly disabling those checkout selections.</span>
      </div>

    </div>
  );
}

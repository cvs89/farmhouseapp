"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, ArrowRight, IndianRupee } from "lucide-react";
import { getPricingSuggestions, updatePropertyPrice } from "@/lib/property-actions";

interface Property {
  id: string;
  title: string;
  base_price: number;
  weekend_price: number;
}

interface PricingOptimizerProps {
  properties: Property[];
}

export default function PricingOptimizer({ properties }: PricingOptimizerProps) {
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    suggestedBasePrice: number;
    suggestedWeekendPrice: number;
    rationale: string;
  } | null>(null);

  const activeProperty = properties.find((p) => p.id === selectedId);

  const handleFetchSuggestions = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setSuggestions(null);

    try {
      const res = await getPricingSuggestions(selectedId);
      if ("error" in res && res.error) {
        setError(res.error);
      } else if (!("error" in res)) {
        setSuggestions(res);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRates = async () => {
    if (!selectedId || !suggestions) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updatePropertyPrice(
        selectedId,
        suggestions.suggestedBasePrice,
        suggestions.suggestedWeekendPrice
      );

      if ("error" in res && res.error) {
        setError(res.error);
      } else if (!("error" in res)) {
        setSuccess("Pricing optimization successfully applied! Database rates updated.");
        // Dynamically update local prices for visual sync
        activeProperty!.base_price = suggestions.suggestedBasePrice;
        activeProperty!.weekend_price = suggestions.suggestedWeekendPrice;
        setSuggestions(null); // Reset
      }
    } catch (err: any) {
      setError(err.message || "Failed to apply suggested rates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-stone-200/40 dark:border-slate-800/40 shadow-md space-y-6">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/20 dark:border-slate-800/20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/30 rounded-xl text-amber-700 dark:text-amber-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-stone-850 dark:text-stone-100 text-base">AI Pricing Optimizer</h3>
            <p className="text-xs text-stone-400">Leverage smart insights to adjust seasonal rates.</p>
          </div>
        </div>
      </div>

      {/* Select Box */}
      <div className="space-y-2 text-left">
        <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Select Farmhouse</label>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setSuggestions(null);
            setError(null);
            setSuccess(null);
          }}
          className="w-full px-4 py-3 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-800 dark:text-stone-200"
        >
          <option value="">-- Choose a property --</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Property Current Price Info */}
      {activeProperty && (
        <div className="p-4 rounded-2xl bg-stone-50/50 dark:bg-slate-900/30 border border-stone-200/10 flex justify-between items-center animate-fade-in">
          <div>
            <div className="text-[10px] text-stone-400 font-bold uppercase">Current Rates</div>
            <div className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-0.5">
              Weekday Base: ₹{Number(activeProperty.base_price).toLocaleString("en-IN")}
            </div>
            <div className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Weekend Stay: ₹{Number(activeProperty.weekend_price).toLocaleString("en-IN")}
            </div>
          </div>
          <button
            onClick={handleFetchSuggestions}
            disabled={loading}
            className="px-4 py-2 bg-green-850 hover:bg-green-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-green-950/15"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Analyze Listing
              </>
            )}
          </button>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/30 text-red-700 dark:text-red-400 text-xs flex gap-2 items-center animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200/30 text-green-700 dark:text-green-400 text-xs flex gap-2 items-center animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Suggestions Results Display */}
      {suggestions && (
        <div className="space-y-4 animate-fade-in text-left">
          
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/20 space-y-4">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-xs uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Adjustments
            </h4>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-stone-200/10 space-y-1">
                <div className="text-[10px] text-stone-400 font-bold">WEEKDAY PRICE</div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                  ₹{Number(activeProperty!.base_price).toLocaleString("en-IN")}
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-green-700 dark:text-green-400 font-extrabold flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {suggestions.suggestedBasePrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-stone-200/10 space-y-1">
                <div className="text-[10px] text-stone-400 font-bold">WEEKEND PRICE</div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                  ₹{Number(activeProperty!.weekend_price).toLocaleString("en-IN")}
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-green-700 dark:text-green-400 font-extrabold flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {suggestions.suggestedWeekendPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Rationale Text */}
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Strategic Insight</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                &ldquo;{suggestions.rationale}&rdquo;
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleApplyRates}
            disabled={saving}
            className="w-full py-3 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex justify-center items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>Apply Recommended Rates</>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!activeProperty && (
        <div className="py-8 text-center border border-dashed border-stone-200/60 dark:border-slate-800/40 rounded-2xl text-stone-400 text-xs">
          Please select a property listing from the menu above to generate dynamic pricing insights.
        </div>
      )}

    </div>
  );
}

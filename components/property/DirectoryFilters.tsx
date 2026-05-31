"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DirectoryFilters({
  initialSearch = "",
  initialCapacity = "",
  initialMaxPrice = "",
  initialStartDate = "",
  initialEndDate = "",
}: {
  initialSearch?: string;
  initialCapacity?: number | string;
  initialMaxPrice?: number | string;
  initialStartDate?: string;
  initialEndDate?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [capacity, setCapacity] = useState(initialCapacity);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Sync state if initial props change
  useEffect(() => {
    setSearch(initialSearch);
    setCapacity(initialCapacity);
    setMaxPrice(initialMaxPrice);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [initialSearch, initialCapacity, initialMaxPrice, initialStartDate, initialEndDate]);

  // Min check-in date is today
  const today = new Date().toISOString().split("T")[0];

  // Min check-out is check-in + 1 day
  const getMinEndDate = () => {
    if (!startDate) return today;
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  };

  // Adjust end date if it is invalid relative to start date
  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setEndDate(nextDay.toISOString().split("T")[0]);
      }
    }
  }, [startDate, endDate]);

  const handleClear = () => {
    setSearch("");
    setCapacity("");
    setMaxPrice("");
    setStartDate("");
    setEndDate("");
    
    // Navigate to homepage with just the active tab
    const tab = searchParams.get("tab") || "filters";
    router.push(`/?tab=${tab}`);
  };

  return (
    <form action="/" method="GET" className="glass-panel p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end shadow-sm animate-fade-in">
      <input type="hidden" name="tab" value="filters" />
      
      {/* Search Stay */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Search Stay</label>
        <input
          type="text"
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="e.g. Harni Greens..."
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-850 dark:text-stone-200"
        />
      </div>

      {/* Guests Capacity */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Guests Capacity</label>
        <input
          type="number"
          name="capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="e.g. 10"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-850 dark:text-stone-200"
        />
      </div>

      {/* Max Price */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Max Price / night (₹)</label>
        <input
          type="number"
          name="maxPrice"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="e.g. 20000"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-850 dark:text-stone-200"
        />
      </div>

      {/* Check-in Date */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Check-In</label>
        <input
          type="date"
          name="startDate"
          min={today}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-850 dark:text-stone-200"
        />
      </div>

      {/* Check-out Date */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Check-Out</label>
        <input
          type="date"
          name="endDate"
          min={getMinEndDate()}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-850 dark:text-stone-200"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-2.5 border border-stone-200/60 dark:border-slate-800/40 bg-white/20 hover:bg-stone-100 dark:hover:bg-slate-900 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold transition-all duration-300"
        >
          Clear
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md"
        >
          Apply
        </button>
      </div>
    </form>
  );
}

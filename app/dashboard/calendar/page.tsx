import { createClient } from "@/lib/supabase/server";
import { Calendar as CalendarIcon, Info, Home, Plus } from "lucide-react";
import ManualBlockForm from "@/components/calendar/ManualBlockForm";

export default async function OwnerCalendarPage({
  searchParams,
}: {
  searchParams: { propertyId?: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Retrieve properties owned by user
  const { data: propertiesData } = await supabase
    .from("properties")
    .select("id, title")
    .eq("owner_id", user.id);
  const properties = propertiesData || [];

  const activePropertyId = searchParams.propertyId || (properties && properties.length > 0 ? properties[0].id : "");

  let blockedDates: any[] = [];
  if (activePropertyId) {
    const { data } = await supabase
      .from("availability")
      .select("blocked_date, reason")
      .eq("property_id", activePropertyId);
    blockedDates = data || [];
  }

  // Map reasons for rendering styling colors
  const blockedMap = new Map<string, string>();
  blockedDates.forEach((b) => blockedMap.set(b.blocked_date, b.reason));

  // Generate current month days
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan

  const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6)
  const totalDays = new Date(year, month + 1, 0).getDate(); // Days in current month

  const daysArray: (number | null)[] = [];
  // Populate starting empty offsets
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Populate days numbers
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  const monthName = now.toLocaleString("default", { month: "long" });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-stone-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-stone-850 dark:text-stone-100 flex items-center gap-2.5">
            <CalendarIcon className="w-8 h-8 text-green-800" /> Calendar Sync
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Block custom dates for walk-in guests, offline events, or scheduled maintenance.
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="glass-panel py-16 px-4 rounded-3xl text-center max-w-md mx-auto space-y-4">
          <CalendarIcon className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">No properties found</h3>
          <p className="text-sm text-stone-500">You must list a farmhouse before configuring calendar details.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Calendar Grid Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Property dropdown */}
            <form className="flex items-center gap-3">
              <label className="text-xs font-bold text-stone-500 uppercase">View Property:</label>
              <select
                name="propertyId"
                defaultValue={activePropertyId}
                // Automatically submit form on change to refresh calendar dates
                className="px-4 py-2 text-sm rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-955 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-stone-800 dark:text-stone-200"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <noscript>
                <button type="submit" className="px-3 py-1 bg-green-800 text-white rounded text-xs">Load</button>
              </noscript>
            </form>

            {/* Calendar card */}
            <div className="glass-panel p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-display text-stone-850 dark:text-stone-150">
                  {monthName} {year}
                </h3>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600" /> Free
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Booked
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Blocked
                  </span>
                </div>
              </div>

              {/* Grid layout */}
              <div className="grid grid-cols-7 gap-2 text-center">
                
                {/* Weekdays headers */}
                {weekdays.map((w) => (
                  <div key={w} className="text-xs font-bold text-stone-400 py-2">
                    {w}
                  </div>
                ))}

                {/* Days cells */}
                {daysArray.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="aspect-square" />;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const reason = blockedMap.get(dateStr);
                  const isBlocked = !!reason;

                  return (
                    <div
                      key={`day-${day}`}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-between p-2 border transition-all ${
                        isBlocked
                          ? reason === "booked"
                            ? "bg-red-500/10 border-red-500/30 text-red-750"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-750"
                          : "bg-white/40 dark:bg-slate-900/20 border-stone-200/20 dark:border-slate-800/10 text-stone-850 dark:text-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <span className="text-sm font-bold">{day}</span>
                      
                      {/* Subtitle status dot */}
                      <span className={`w-2 h-2 rounded-full ${
                        isBlocked
                          ? reason === "booked"
                            ? "bg-red-500"
                            : "bg-amber-500"
                          : "bg-green-600"
                      }`} />
                    </div>
                  );
                })}

              </div>

            </div>

          </div>

          {/* Manual Blocker Form Column (Right 1/3) */}
          <div className="lg:col-span-1 space-y-4 text-left">
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-800" /> Manual Override
            </h3>
            
            <ManualBlockForm activePropertyId={activePropertyId} />
          </div>

        </div>
      )}

    </div>
  );
}

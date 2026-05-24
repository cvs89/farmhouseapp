import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  IndianRupee, 
  TrendingUp, 
  Percent, 
  CalendarRange, 
  Clock, 
  AlertCircle,
  BarChart3
} from "lucide-react";
import PricingOptimizer from "@/components/dashboard/PricingOptimizer";

export default async function OwnerReportsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch properties owned by user
  const { data: propertiesData } = await supabase
    .from("properties")
    .select("id, title, base_price, weekend_price, capacity")
    .eq("owner_id", user.id);
  const properties = propertiesData || [];
  const propertyIds = properties.map((p) => p.id);

  let bookings: any[] = [];
  if (propertyIds.length > 0) {
    // Fetch bookings for these properties
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("id, property_id, start_date, end_date, total_amount, status")
      .in("property_id", propertyIds)
      .order("start_date", { ascending: true });
    bookings = bookingsData || [];
  }

  // 2. Metric computations
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const pendingBookings = bookings.filter((b) => b.status === "pending_payment");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const avgBookingValue = confirmedBookings.length > 0 ? Math.round(totalRevenue / confirmedBookings.length) : 0;
  
  // Calculate total booked days for occupancy rate
  let totalBookedDays = 0;
  confirmedBookings.forEach((b) => {
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    totalBookedDays += diff;
  });

  // Occupancy rate calculation (based on last 90 days capacity)
  const daysInPeriod = 90; 
  const totalCapacityDays = properties.length * daysInPeriod;
  const occupancyRate = totalCapacityDays > 0 
    ? Math.min(100, Math.round((totalBookedDays / totalCapacityDays) * 100)) 
    : 0;

  // 3. Monthly Revenue Grouping (for Current Year)
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array(12).fill(0);
  const monthsAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  confirmedBookings.forEach((b) => {
    const startDate = new Date(b.start_date);
    if (startDate.getFullYear() === currentYear) {
      const monthIndex = startDate.getMonth();
      monthlyRevenue[monthIndex] += Number(b.total_amount);
    }
  });

  const maxMonthlyRevenue = Math.max(...monthlyRevenue, 1000);

  // 4. Booking Distribution Proportions
  const totalBookingsCount = bookings.length;
  const confirmedPct = totalBookingsCount > 0 ? Math.round((confirmedBookings.length / totalBookingsCount) * 100) : 0;
  const pendingPct = totalBookingsCount > 0 ? Math.round((pendingBookings.length / totalBookingsCount) * 100) : 0;
  const cancelledPct = totalBookingsCount > 0 ? Math.round((cancelledBookings.length / totalBookingsCount) * 100) : 0;

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b border-stone-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-stone-850 dark:text-stone-100">
            Revenue & Pricing Optimization
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Analyze earnings trends, monitor occupancy, and optimize rates with machine insights.
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Earnings */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-green-100/80 dark:bg-green-950/40 text-green-700 dark:text-green-300">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-850 dark:text-stone-100">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Total Revenue</div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-blue-100/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-850 dark:text-stone-100">
              ₹{avgBookingValue.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Avg Booking Value</div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-purple-100/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-850 dark:text-stone-100">{occupancyRate}%</div>
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">90-Day Occupancy</div>
          </div>
        </div>

        {/* Active Holds */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-850 dark:text-stone-100">{pendingBookings.length}</div>
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Active holds</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Revenue Charts & AI Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Analytics Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Chart Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-stone-200/40 dark:border-slate-800/40 shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200/10">
              <BarChart3 className="w-4 h-4 text-stone-400" />
              <h3 className="font-bold text-sm text-stone-850 dark:text-stone-100">
                Monthly Earnings Trend ({currentYear})
              </h3>
            </div>

            {totalRevenue === 0 ? (
              <div className="h-64 flex flex-col justify-center items-center text-stone-400 space-y-2">
                <AlertCircle className="w-8 h-8" />
                <span className="text-xs">No revenue data recorded for {currentYear} yet.</span>
              </div>
            ) : (
              <div className="w-full">
                {/* SVG Bar Chart */}
                <svg viewBox="0 0 600 280" className="w-full h-auto text-stone-400 dark:text-stone-500 font-sans">
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75, 1].map((val, idx) => {
                    const yPos = 240 - val * 200;
                    const gridVal = Math.round(maxMonthlyRevenue * val);
                    return (
                      <g key={idx}>
                        <line x1="50" y1={yPos} x2="570" y2={yPos} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3,3" />
                        <text x="45" y={yPos + 4} textAnchor="end" className="text-[10px] fill-stone-400 font-semibold">
                          ₹{gridVal >= 1000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {monthlyRevenue.map((val, idx) => {
                    const barWidth = 26;
                    const spacing = 42;
                    const xPos = 65 + idx * spacing;
                    const height = (val / maxMonthlyRevenue) * 200;
                    const yPos = 240 - height;

                    return (
                      <g key={idx} className="group">
                        {/* Bar Segment */}
                        <rect
                          x={xPos}
                          y={yPos}
                          width={barWidth}
                          height={Math.max(2, height)}
                          rx="4"
                          className="fill-green-800 dark:fill-green-700 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        {/* Value Display on Hover/Static */}
                        {val > 0 && (
                          <text
                            x={xPos + barWidth / 2}
                            y={yPos - 6}
                            textAnchor="middle"
                            className="text-[9px] fill-stone-700 dark:fill-stone-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                          </text>
                        )}
                        {/* Month Label */}
                        <text
                          x={xPos + barWidth / 2}
                          y="260"
                          textAnchor="middle"
                          className="text-[10px] fill-stone-400 font-medium"
                        >
                          {monthsAbbr[idx]}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Base Axis Line */}
                  <line x1="50" y1="240" x2="570" y2="240" stroke="currentColor" strokeOpacity="0.2" />
                </svg>
              </div>
            )}
          </div>

          {/* Booking Distribution Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-stone-200/40 dark:border-slate-800/40 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-stone-850 dark:text-stone-100 text-left">
              Booking Status Distribution
            </h3>

            {totalBookingsCount === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                No booking records found to calculate status distribution.
              </div>
            ) : (
              <div className="space-y-6 text-left">
                {/* Horizontal Progress Bar */}
                <div className="h-4 w-full bg-stone-100 dark:bg-slate-900 rounded-full overflow-hidden flex">
                  {confirmedPct > 0 && (
                    <div 
                      className="bg-green-700 h-full" 
                      style={{ width: `${confirmedPct}%` }}
                      title={`Confirmed: ${confirmedPct}%`}
                    />
                  )}
                  {pendingPct > 0 && (
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${pendingPct}%` }}
                      title={`Holds: ${pendingPct}%`}
                    />
                  )}
                  {cancelledPct > 0 && (
                    <div 
                      className="bg-red-500 h-full" 
                      style={{ width: `${cancelledPct}%` }}
                      title={`Cancelled: ${cancelledPct}%`}
                    />
                  )}
                </div>

                {/* Legend badges */}
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-700 block shrink-0" />
                    <div className="min-w-0">
                      <div className="text-stone-800 dark:text-stone-200">{confirmedPct}%</div>
                      <div className="text-[10px] text-stone-400">Confirmed ({confirmedBookings.length})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 block shrink-0" />
                    <div className="min-w-0">
                      <div className="text-stone-800 dark:text-stone-200">{pendingPct}%</div>
                      <div className="text-[10px] text-stone-400">Holds ({pendingBookings.length})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 block shrink-0" />
                    <div className="min-w-0">
                      <div className="text-stone-800 dark:text-stone-200">{cancelledPct}%</div>
                      <div className="text-[10px] text-stone-400">Cancelled ({cancelledBookings.length})</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Pricing Optimizer */}
        <div className="lg:col-span-1">
          <PricingOptimizer properties={properties} />
        </div>

      </div>

    </div>
  );
}

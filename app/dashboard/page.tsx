import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Home, Calendar, Users, IndianRupee, AlertCircle } from "lucide-react";

export default async function OwnerDashboardPage() {
  const supabase = createClient();

  // Retrieve logged in user details
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch owner's properties
  const { data: propertiesData } = await supabase
    .from("properties")
    .select("id, title, is_published, base_price, capacity")
    .eq("owner_id", user.id);
  const properties = propertiesData || [];

  // Fetch bookings linked to owner's properties
  // Note: Since properties is an array, we can filter bookings by property_id.
  const propertyIds = properties?.map((p) => p.id) || [];
  
  let bookings: any[] = [];
  if (propertyIds.length > 0) {
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("id, property_id, start_date, end_date, total_amount, status, profiles(full_name)")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });
    bookings = bookingsData || [];
  }

  // Statistics calculations
  const totalProperties = properties?.length || 0;
  const activeBookings = bookings?.filter((b) => b.status === "confirmed").length || 0;
  const pendingPayments = bookings?.filter((b) => b.status === "pending_payment").length || 0;
  const totalRevenue = bookings
    ?.filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-stone-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-stone-800 dark:text-stone-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Track performance, listing approvals, and incoming stays.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-green-950/15"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Properties */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100/80 dark:bg-green-950/40 text-green-700 dark:text-green-300">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{totalProperties}</div>
            <div className="text-xs text-stone-400 font-semibold">Total Listings</div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{activeBookings}</div>
            <div className="text-xs text-stone-400 font-semibold">Active Bookings</div>
          </div>
        </div>

        {/* Pending Holds */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{pendingPayments}</div>
            <div className="text-xs text-stone-400 font-semibold">Pending Payments</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-stone-400 font-semibold">Total Revenue</div>
          </div>
        </div>

      </div>

      {/* Main Grid: My Listings & Stays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Listings Summary Column */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">My Farmhouses</h3>
          
          {properties.length === 0 ? (
            <div className="glass-panel p-6 rounded-2xl text-center space-y-3">
              <Home className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm text-stone-500">No properties added yet.</p>
              <Link
                href="/dashboard/properties/new"
                className="inline-block text-xs text-green-700 dark:text-green-400 font-bold hover:underline"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className="glass-panel p-4 rounded-xl flex justify-between items-center hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 truncate">
                      {property.title}
                    </h4>
                    <p className="text-xs text-stone-400">
                      ₹{Number(property.base_price).toLocaleString("en-IN")} / night
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    property.is_published 
                      ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400" 
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}>
                    {property.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Stays Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Recent Stays & Holds</h3>

          {bookings.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm text-stone-500">No booking transactions recorded yet.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden border border-stone-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/10">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-stone-200/40 dark:border-slate-800/40 bg-stone-100/40 dark:bg-slate-900/30 text-stone-500 font-semibold">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      className="border-b border-stone-200/20 dark:border-slate-800/20 hover:bg-stone-50/40 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="p-4 font-bold text-stone-800 dark:text-stone-200">
                        {booking.profiles?.full_name || "Guest"}
                      </td>
                      <td className="p-4 text-xs text-stone-500">
                        {booking.start_date} to {booking.end_date}
                      </td>
                      <td className="p-4 font-semibold text-stone-700 dark:text-stone-300">
                        ₹{Number(booking.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold ${
                          booking.status === "confirmed" 
                            ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400" 
                            : booking.status === "pending_payment"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {booking.status === "confirmed" ? "Confirmed" : "Hold"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

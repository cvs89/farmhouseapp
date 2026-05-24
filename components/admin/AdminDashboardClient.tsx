"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  updateUserRole, 
  togglePropertyPublish,
  adminDeleteUser,
  adminDeleteProperty,
  adminCloseInquiry
} from "@/lib/admin-actions";
import { 
  Users, 
  Home, 
  Calendar, 
  UserPlus, 
  Check, 
  X, 
  TrendingUp, 
  Edit2,
  Trash2,
  Plus,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface AdminDashboardClientProps {
  profiles: any[];
  properties: any[];
  bookings: any[];
  inquiries?: any[];
}

export default function AdminDashboardClient({
  profiles = [],
  properties = [],
  bookings = [],
  inquiries = [],
}: AdminDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read active tab from URL search parameters to preserve memory navigation state
  const tabParam = searchParams.get("tab");
  const initialTab = (tabParam === "users" || tabParam === "properties" || tabParam === "bookings" || tabParam === "inquiries") ? tabParam : "users";

  const [activeTab, setActiveTab] = useState<"users" | "properties" | "bookings" | "inquiries">(initialTab);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleTabChange = (tab: "users" | "properties" | "bookings" | "inquiries") => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
  };

  // Moderator Switches
  const handleRoleChange = async (userId: string, newRole: any) => {
    setLoadingId(userId);
    const res = await updateUserRole(userId, newRole);
    setLoadingId(null);
    if (res.error) alert(res.error);
  };

  const handlePublishToggle = async (propertyId: string, currentState: boolean) => {
    setLoadingId(propertyId);
    const res = await togglePropertyPublish(propertyId, !currentState);
    setLoadingId(null);
    if (res.error) alert(res.error);
  };

  // Close enquiry handler
  const handleCloseInquiry = async (inquiryId: string) => {
    if (!confirm("Are you sure you want to mark this enquiry as closed?")) return;
    setLoadingId(inquiryId);
    const res = await adminCloseInquiry(inquiryId);
    setLoadingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  // Purge handlers
  const handleUserDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? This cannot be undone.")) return;
    setLoadingId(userId);
    const res = await adminDeleteUser(userId);
    setLoadingId(null);
    if (res.error) alert(res.error);
  };

  const handlePropertyDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property listing? This will cancel any active holds or logs attached to it.")) return;
    setLoadingId(propertyId);
    const res = await adminDeleteProperty(propertyId);
    setLoadingId(null);
    if (res.error) alert(res.error);
  };

  // Summaries
  const ownerCount = profiles.filter((p) => p.role === "owner").length;
  const customerCount = profiles.filter((p) => p.role === "customer").length;
  const totalStays = bookings.length;

  return (
    <div className="space-y-8 text-left relative">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-stone-200/50 dark:border-slate-800/40 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-stone-850 dark:text-stone-100">
            Platform Administration
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Moderate listings, manage user details, configure farmhouses, and monitor bookings.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </Link>
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Farmhouse
          </Link>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 text-slate-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{ownerCount} Owners</div>
            <div className="text-xs text-stone-400 font-semibold">{customerCount} Customer Profiles</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100/80 dark:bg-green-950/40 text-green-700">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{properties.length} Listings</div>
            <div className="text-xs text-stone-400 font-semibold">
              {properties.filter((p) => p.is_published).length} Published / {properties.filter((p) => !p.is_published).length} Drafts
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/40 text-amber-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{totalStays} Stays</div>
            <div className="text-xs text-stone-400 font-semibold">Global Reservation Logs</div>
          </div>
        </div>
      </div>

      {/* Tab Menu Header */}
      <div className="flex border-b border-stone-200/40 dark:border-slate-800/40 gap-6 text-sm font-semibold">
        <button
          onClick={() => handleTabChange("users")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "users" 
              ? "border-slate-800 text-slate-800 dark:border-white dark:text-white" 
              : "border-transparent text-stone-400 hover:text-stone-600"
          }`}
        >
          <Users className="w-4 h-4" />
          User Profiles ({profiles.length})
        </button>
        <button
          onClick={() => handleTabChange("properties")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "properties" 
              ? "border-slate-800 text-slate-800 dark:border-white dark:text-white" 
              : "border-transparent text-stone-400 hover:text-stone-600"
          }`}
        >
          <Home className="w-4 h-4" />
          Farmhouses ({properties.length})
        </button>
        <button
          onClick={() => handleTabChange("bookings")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "bookings" 
              ? "border-slate-800 text-slate-800 dark:border-white dark:text-white" 
              : "border-transparent text-stone-400 hover:text-stone-600"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Reservation Logs ({bookings.length})
        </button>
        <button
          onClick={() => handleTabChange("inquiries")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "inquiries" 
              ? "border-slate-800 text-slate-800 dark:border-white dark:text-white" 
              : "border-transparent text-stone-400 hover:text-stone-600"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Booking Enquiries ({inquiries.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="animate-fade-in">
        
        {/* Tab 1: User Profiles Table */}
        {activeTab === "users" && (
          <div className="glass-panel rounded-2xl overflow-x-auto shadow-sm border border-stone-200/40 bg-white/40 dark:bg-slate-900/10">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-stone-200/40 dark:border-slate-800/40 bg-stone-100/40 dark:bg-slate-900/30 text-stone-500 font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr 
                    key={profile.id} 
                    className="border-b border-stone-200/20 dark:border-slate-800/20 hover:bg-stone-50/40 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="p-4 font-bold text-stone-800 dark:text-stone-200">{profile.full_name}</td>
                    <td className="p-4 text-stone-500">{profile.email}</td>
                    <td className="p-4 text-stone-500">{profile.phone || "—"}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        profile.role === "admin"
                          ? "bg-slate-800 text-white"
                          : profile.role === "owner"
                          ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                          : "bg-stone-100 text-stone-800 dark:bg-slate-800 dark:text-stone-300"
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${profile.id}/edit`}
                          className="p-2 border border-stone-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-stone-600 dark:text-stone-300 transition-colors inline-flex items-center"
                          title="Edit User Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          disabled={loadingId === profile.id}
                          onClick={() => handleUserDelete(profile.id)}
                          className="p-2 border border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl text-red-650 dark:border-red-950/45 dark:hover:bg-red-950/15 transition-colors disabled:opacity-40"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Properties approvals */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {properties.length === 0 ? (
              <div className="glass-panel p-8 text-center text-stone-500">
                No property listings registered on the platform.
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-x-auto shadow-sm border border-stone-200/40 bg-white/40 dark:bg-slate-900/10">
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-stone-200/40 dark:border-slate-800/40 bg-stone-100/40 dark:bg-slate-900/30 text-stone-500 font-semibold">
                      <th className="p-4">Farmhouse Title</th>
                      <th className="p-4">Owner Name</th>
                      <th className="p-4">Price / night</th>
                      <th className="p-4">Approval State</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr 
                        key={property.id} 
                        className="border-b border-stone-200/20 dark:border-slate-800/20 hover:bg-stone-50/40 dark:hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="p-4 font-bold text-stone-850 dark:text-stone-200">{property.title}</td>
                        <td className="p-4 text-stone-500">{property.profiles?.full_name || "Owner"}</td>
                        <td className="p-4 font-semibold text-stone-700 dark:text-stone-300">
                          ₹{Number(property.base_price).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            property.is_published 
                              ? "bg-green-150 text-green-800 dark:bg-green-950/40 dark:text-green-400" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}>
                            {property.is_published ? "Active" : "Flagged/Draft"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              disabled={loadingId === property.id}
                              onClick={() => handlePublishToggle(property.id, property.is_published)}
                              className={`inline-flex items-center gap-1 text-[10px] px-3 py-1.5 border rounded-lg font-bold transition-colors disabled:opacity-40 ${
                                property.is_published
                                  ? "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-950/40 dark:hover:bg-amber-950/15"
                                  : "border-green-200 text-green-700 hover:bg-green-50 dark:border-green-950/40 dark:hover:bg-green-950/15"
                              }`}
                            >
                              {property.is_published ? (
                                <>
                                  <X className="w-3.5 h-3.5" /> Flag
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </>
                              )}
                            </button>
                            <Link
                              href={`/admin/properties/${property.id}/edit`}
                              className="p-2 border border-stone-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-stone-600 dark:text-stone-300 transition-colors inline-flex items-center"
                              title="Edit Property details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              disabled={loadingId === property.id}
                              onClick={() => handlePropertyDelete(property.id)}
                              className="p-2 border border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl text-red-650 dark:border-red-950/45 dark:hover:bg-red-950/15 transition-colors disabled:opacity-40"
                              title="Delete Property"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Booking Stays Log */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="glass-panel p-8 text-center text-stone-500">
                No stay records found.
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-x-auto shadow-sm border border-stone-200/40 bg-white/40 dark:bg-slate-900/10">
                <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-stone-200/40 dark:border-slate-800/40 bg-stone-100/40 dark:bg-slate-900/30 text-stone-500 font-semibold">
                      <th className="p-4">Guest</th>
                      <th className="p-4">Property</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Total Price</th>
                      <th className="p-4 text-right">Checkout Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr 
                        key={booking.id} 
                        className="border-b border-stone-200/20 dark:border-slate-800/20 hover:bg-stone-50/40 dark:hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="p-4 font-bold text-stone-850 dark:text-stone-200">
                          {booking.profiles?.full_name || "Guest"}
                        </td>
                        <td className="p-4 text-stone-500">{booking.properties?.title}</td>
                        <td className="p-4 text-xs text-stone-400">
                          {booking.start_date} to {booking.end_date}
                        </td>
                        <td className="p-4 font-semibold text-stone-750 dark:text-stone-300">
                          ₹{Number(booking.total_amount).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded font-extrabold ${
                            booking.status === "confirmed" 
                              ? "bg-green-100 text-green-800" 
                              : booking.status === "pending_payment"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {booking.status === "confirmed" ? "Paid" : "Hold"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Booking Enquiries */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="glass-panel p-8 text-center text-stone-500">
                No active booking inquiries registered on the platform.
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-x-auto shadow-sm border border-stone-200/40 bg-white/40 dark:bg-slate-900/10">
                <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-stone-200/40 dark:border-slate-800/40 bg-stone-100/40 dark:bg-slate-900/30 text-stone-500 font-semibold">
                      <th className="p-4">Farmhouse Stay</th>
                      <th className="p-4">Guest Contact Info</th>
                      <th className="p-4">Dates Interested</th>
                      <th className="p-4">Message / Requirements</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inq) => {
                      const dates = inq.dates_interested as any;
                      const dateRangeStr = dates && dates.startDate && dates.endDate
                        ? `${dates.startDate} to ${dates.endDate}`
                        : "—";

                      return (
                        <tr 
                          key={inq.id} 
                          className="border-b border-stone-200/20 dark:border-slate-800/20 hover:bg-stone-50/40 dark:hover:bg-slate-900/20 transition-colors"
                        >
                          <td className="p-4 font-bold text-stone-850 dark:text-stone-250">
                            {inq.properties?.title || "Stay"}
                          </td>
                          <td className="p-4 space-y-0.5">
                            <div className="font-semibold text-stone-700 dark:text-stone-300">{inq.guest_name}</div>
                            <div className="text-[10px] text-stone-400">{inq.guest_email}</div>
                            <div className="text-[10px] text-stone-400">{inq.guest_phone || "—"}</div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-green-800 dark:text-green-400">
                            {dateRangeStr}
                          </td>
                          <td className="p-4 max-w-[250px]">
                            <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                              {inq.message}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              inq.status === "open"
                                ? "bg-green-150 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                                : "bg-stone-100 text-stone-450 dark:bg-slate-800 dark:text-stone-500"
                            }`}>
                              {inq.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {inq.status === "open" ? (
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/admin/inquiries/${inq.id}/convert`}
                                  className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 bg-green-800 hover:bg-green-700 text-white rounded-lg font-bold transition-colors shadow-sm"
                                  title="Approve & Convert to Booking"
                                >
                                  <Check className="w-3 h-3" /> Convert
                                </Link>
                                <button
                                  disabled={loadingId === inq.id}
                                  onClick={() => handleCloseInquiry(inq.id)}
                                  className="p-1.5 border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-850 rounded-lg text-stone-500 dark:text-stone-400 transition-colors disabled:opacity-40"
                                  title="Mark as Closed / Dismiss"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-stone-400 italic">No action</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}

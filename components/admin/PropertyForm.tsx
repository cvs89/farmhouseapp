"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateProperty, adminUpdateProperty } from "@/lib/admin-actions";
import { Info, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Owner {
  id: string;
  full_name: string;
  email: string;
}

interface PropertyFormProps {
  owners: Owner[];
  property?: {
    id: string;
    owner_id: string;
    title: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    base_price: number;
    weekend_price: number;
    deposit_percentage: number;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    activities: string[];
    rules: string[];
    images: string[];
    accepts_payments?: boolean;
  };
}

export default function PropertyForm({ owners, property }: PropertyFormProps) {
  const router = useRouter();
  const isEditMode = !!property;

  const [form, setForm] = useState({
    owner_id: property?.owner_id || "",
    title: property?.title || "",
    description: property?.description || "",
    address: property?.address || "",
    latitude: property?.latitude || 25.3463,
    longitude: property?.longitude || 74.6391,
    base_price: property?.base_price || 5000,
    weekend_price: property?.weekend_price || 7000,
    deposit_percentage: property?.deposit_percentage || 20,
    capacity: property?.capacity || 10,
    bedrooms: property?.bedrooms || 3,
    bathrooms: property?.bathrooms || 3,
    amenities: property?.amenities ? property.amenities.join(", ") : "",
    activities: property?.activities ? property.activities.join(", ") : "",
    rules: property?.rules ? property.rules.join(", ") : "",
    images: property?.images ? property.images.join(", ") : "",
    accepts_payments: property?.accepts_payments !== undefined ? property.accepts_payments : true,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.owner_id) {
      setError("An owner must be selected to allocate this listing.");
      setLoading(false);
      return;
    }

    const formattedData = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      base_price: Number(form.base_price),
      weekend_price: Number(form.weekend_price),
      deposit_percentage: Number(form.deposit_percentage),
      capacity: Number(form.capacity),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      amenities: form.amenities.split(",").map(s => s.trim()).filter(Boolean),
      activities: form.activities.split(",").map(s => s.trim()).filter(Boolean),
      rules: form.rules.split(",").map(s => s.trim()).filter(Boolean),
      images: form.images.split(",").map(s => s.trim()).filter(Boolean),
    };

    try {
      let res;
      if (isEditMode && property) {
        res = await adminUpdateProperty(property.id, formattedData);
      } else {
        res = await adminCreateProperty(formattedData);
      }

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/admin?tab=properties");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Back to admin console button */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin?tab=properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS
        </Link>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-stone-200/40 dark:border-slate-800/40 shadow-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100">
            {isEditMode ? "Modify Farmhouse Details" : "Register New Farmhouse"}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Configure rates, specs, locations, and media resources for the stay.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
            <Info className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Farmhouse Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Allocated Owner</label>
              <select
                required
                value={form.owner_id}
                onChange={e => setForm({ ...form, owner_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              >
                <option value="">-- Choose Profile Owner --</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.full_name} ({o.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Physical Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Latitude (Bhilwara Bound: 25.25 - 25.45)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Longitude (Bhilwara Bound: 74.50 - 75.10)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Base Price (Weekday)</label>
              <input
                type="number"
                required
                value={form.base_price}
                onChange={e => setForm({ ...form, base_price: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Weekend Price</label>
              <input
                type="number"
                required
                value={form.weekend_price}
                onChange={e => setForm({ ...form, weekend_price: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Required Deposit % (10 - 100)</label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={form.deposit_percentage}
                onChange={e => setForm({ ...form, deposit_percentage: parseInt(e.target.value) || 20 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-stone-50 dark:bg-slate-950/40 border border-stone-200/60 dark:border-slate-800/60 rounded-xl">
              <input
                type="checkbox"
                id="accepts_payments"
                checked={form.accepts_payments}
                onChange={e => setForm({ ...form, accepts_payments: e.target.checked })}
                className="w-4 h-4 rounded border-stone-300 text-green-800 focus:ring-green-800 cursor-pointer"
              />
              <label htmlFor="accepts_payments" className="text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                Enable Online Payments & Deposits
                <span className="block text-[10px] font-normal text-stone-400 mt-0.5">
                  If enabled, users can block dates by paying a deposit via Razorpay. Otherwise, they submit a direct booking enquiry.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Guest Capacity</label>
              <input
                type="number"
                required
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Bedrooms Count</label>
              <input
                type="number"
                required
                value={form.bedrooms}
                onChange={e => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Bathrooms Count</label>
              <input
                type="number"
                required
                value={form.bathrooms}
                onChange={e => setForm({ ...form, bathrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Stay Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Amenities (comma-separated)</label>
              <input
                type="text"
                value={form.amenities}
                onChange={e => setForm({ ...form, amenities: e.target.value })}
                placeholder="Pool, BBQ Grill, Wi-Fi, Kitchen, Bonfire, DJ Sounds"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Activities (comma-separated)</label>
              <input
                type="text"
                value={form.activities}
                onChange={e => setForm({ ...form, activities: e.target.value })}
                placeholder="Pool Volleyball, Badminton match, Karaoke night, Organic Farming"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Stay Rules (comma-separated)</label>
              <input
                type="text"
                value={form.rules}
                onChange={e => setForm({ ...form, rules: e.target.value })}
                placeholder="No smoking indoors, Loud music until 10 PM, Pets allowed"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Image URLs (comma-separated)</label>
              <textarea
                rows={2}
                value={form.images}
                onChange={e => setForm({ ...form, images: e.target.value })}
                placeholder="https://example.com/pool.jpg, https://example.com/garden.jpg"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-950 border border-stone-200/60 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all"
              />
            </div>

          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200/40 dark:border-slate-800/40">
            <Link
              href="/admin?tab=properties"
              className="flex-1 py-2.5 border border-stone-200 dark:border-slate-800 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-850 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Farmhouse"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

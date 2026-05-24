import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Home, IndianRupee, Users, Bed, Bath, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default async function MyPropertiesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Retrieve properties owned by the user
  const { data: propertiesData } = await supabase
    .from("properties")
    .select("id, title, slug, address, base_price, capacity, bedrooms, bathrooms, images, is_published")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const properties = propertiesData || [];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-stone-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-stone-800 dark:text-stone-100">
            My Farmhouses
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage your property listings, update media assets, and check details.
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

      {/* Grid List */}
      {properties.length === 0 ? (
        <div className="glass-panel py-16 px-4 rounded-3xl text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-stone-100 dark:bg-slate-900 text-stone-400 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">No Farmhouses Listed</h3>
            <p className="text-sm text-stone-550 max-w-xs mx-auto">
              Start hosting and monetize your property by listing it on our platform today.
            </p>
          </div>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex px-6 py-2.5 bg-green-800 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => {
            const hasImage = property.images && property.images.length > 0;
            const imageUrl = hasImage ? property.images[0] : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000";

            return (
              <div 
                key={property.id} 
                className="glass-panel overflow-hidden rounded-2xl flex flex-col justify-between border border-stone-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/10 group hover:shadow-lg transition-all duration-300"
              >
                
                {/* Visual Image Banner */}
                <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-955/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 text-stone-800 dark:text-stone-100">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{Number(property.base_price).toLocaleString("en-IN")} / night</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm ${
                      property.is_published 
                        ? "bg-green-850 text-white" 
                        : "bg-amber-500 text-white"
                    }`}>
                      {property.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold font-display text-stone-850 dark:text-stone-100 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-1">
                      📍 {property.address}
                    </p>
                  </div>

                  {/* Specs row */}
                  <div className="flex items-center gap-4 text-xs text-stone-500 border-t border-stone-200/20 dark:border-slate-800/20 pt-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4.5 h-4.5 text-stone-400" /> Max {property.capacity} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-4.5 h-4.5 text-stone-400" /> {property.bedrooms} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4.5 h-4.5 text-stone-400" /> {property.bathrooms} Bath
                    </span>
                  </div>

                  {/* Actions footer */}
                  <div className="flex gap-3 pt-2">
                    <Link
                      href={`/properties/${property.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-stone-200 dark:border-slate-800 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      View Live Stay
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/dashboard/properties/${property.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-800 hover:bg-green-750 text-white rounded-xl text-xs font-semibold transition-all duration-300"
                    >
                      Edit Listing
                    </Link>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

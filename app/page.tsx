import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IndianRupee, Users, Bed, Bath, Trees, Compass, Sparkles, Filter, LogOut } from "lucide-react";
import Image from "next/image";
import OpenAI from "openai";
import DiscoveryMap from "@/components/property/DiscoveryMap";
import { signOut } from "@/lib/auth-actions";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey || "mock_api_key",
});

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string; capacity?: string; maxPrice?: string; vibe?: string; tab?: string };
}) {
  const supabase = createClient();

  // Check auth state for header portal navigation
  const { data: { user } } = await supabase.auth.getUser();

  const search = searchParams.search || "";
  const minCapacity = Number(searchParams.capacity) || 0;
  const maxPrice = Number(searchParams.maxPrice) || 999999;
  const vibe = searchParams.vibe || "";
  const activeTab = searchParams.tab || "filters"; // 'filters' or 'vibe'

  let properties: any[] = [];
  let isVibeMatched = false;

  // 1. RUN VIBE SEARCH (OPENAI VECTOR SIMILARITY)
  if (activeTab === "vibe" && vibe) {
    isVibeMatched = true;
    if (process.env.OPENAI_API_KEY) {
      try {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: vibe,
        });
        const [{ embedding }] = embeddingResponse.data;

        const { data: matchedData, error: matchError } = await supabase.rpc(
          "match_properties",
          {
            query_embedding: embedding,
            match_threshold: 0.15,
            match_count: 6,
          }
        );

        if (!matchError && matchedData) {
          properties = matchedData;
        }
      } catch (err) {
        console.warn("Vector search failed on server, falling back to text search.", err);
      }
    }

    // Fallback: ILIKE match if vector fails/is unconfigured
    if (properties.length === 0) {
      const { data } = await supabase
        .from("properties")
        .select("id, title, slug, address, base_price, capacity, latitude, longitude, images")
        .eq("is_published", true)
        .or(`title.ilike.%${vibe}%,description.ilike.%${vibe}%`)
        .limit(6);
      properties = data || [];
    }
  } else {
    // 2. RUN STANDARD FILTER SEARCH
    let query = supabase
      .from("properties")
      .select("id, title, slug, address, base_price, capacity, bedrooms, bathrooms, latitude, longitude, images, amenities")
      .eq("is_published", true);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: propertiesData } = await query.order("created_at", { ascending: false });
    properties = propertiesData || [];

    if (minCapacity > 0) {
      properties = properties.filter((p) => p.capacity >= minCapacity);
    }
    if (maxPrice < 999999) {
      properties = properties.filter((p) => Number(p.base_price) <= maxPrice);
    }
  }

  return (
    <div className="flex-1 bg-stone-50/50 dark:bg-slate-950/20 min-h-screen flex flex-col">
      
      {/* Header */}
      <header className="border-b border-stone-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl w-full mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-green-800/10 overflow-hidden flex items-center justify-center p-0.5 border border-green-800/20">
              <img src="/bhilwara_farms_logo.png" alt="Bhilwara Farms Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg font-display text-stone-850 dark:text-stone-100 font-sans">
              Bhilwara Farms
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-green-850">Owner Dashboard</Link>
                <form action={signOut}>
                  <button type="submit" className="flex items-center gap-1 hover:text-red-650 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-green-850">Host Your Stay</Link>
                <Link href="/login" className="px-3.5 py-1.5 bg-green-850 hover:bg-green-800 text-white rounded-lg">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 space-y-8 flex-1 flex flex-col">
        
        {/* Title */}
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-4xl font-extrabold font-display text-stone-850 dark:text-stone-100 flex items-center gap-2.5">
            <Compass className="w-8 h-8 text-green-800" /> Discover Bhilwara Farmhouses
          </h1>
          <p className="text-sm text-stone-500 font-sans">
            Explore and book premium staycations, pool lawns, and weekend retreats in Bhilwara, Rajasthan.
          </p>
        </div>

        {/* Tab Selector: Filters vs Vibe Search */}
        <div className="flex gap-4 border-b border-stone-200/40 dark:border-slate-800/40 text-sm font-semibold">
          <Link
            href={`/?tab=filters`}
            className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "filters"
                ? "border-green-800 text-green-800 dark:border-green-400 dark:text-green-400"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter Directory
          </Link>
          <Link
            href={`/?tab=vibe`}
            className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "vibe"
                ? "border-green-800 text-green-800 dark:border-green-400 dark:text-green-400"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            Search by Vibe <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold uppercase ml-1 animate-pulse">AI</span>
          </Link>
        </div>

        {/* Search Containers */}
        {activeTab === "filters" ? (
          /* Standard filters form */
          <form className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-sm animate-fade-in">
            <input type="hidden" name="tab" value="filters" />
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Search Stay</label>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="e.g. Harni Greens, Pur Road..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-800 dark:text-stone-200"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Guests Capacity</label>
              <input
                type="number"
                name="capacity"
                defaultValue={minCapacity || ""}
                placeholder="e.g. 10"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-800 dark:text-stone-200"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Max Price / night (₹)</label>
              <input
                type="number"
                name="maxPrice"
                defaultValue={maxPrice === 999999 ? "" : maxPrice}
                placeholder="e.g. 20000"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-800 dark:text-stone-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md"
            >
              Apply Filters
            </button>
          </form>
        ) : (
          /* NLP Vibe Search prompt */
          <form className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-sm animate-fade-in text-left w-full">
            <input type="hidden" name="tab" value="vibe" />
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Describe your ideal farmhouse stay vibe</label>
              <input
                type="text"
                name="vibe"
                defaultValue={vibe}
                placeholder="e.g. Luxury green farm stay with a large swimming pool for family gatherings near Harni Mahadev."
                className="w-full px-4 py-3 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm text-stone-800 dark:text-stone-200"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-850 to-green-800 hover:scale-[1.01] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 self-end"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Matches Vibe
            </button>
          </form>
        )}

        {/* Listings & Split Map Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start flex-grow">
          
          {/* Left Column: Listings cards (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            {properties.length === 0 ? (
              <div className="glass-panel py-16 px-4 rounded-3xl text-center max-w-md mx-auto space-y-4">
                <Compass className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100">No Farmhouses Found</h3>
                <p className="text-sm text-stone-500">
                  Try adjusting your search criteria or modifying your vibe prompt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => {
                  const hasImage = property.images && property.images.length > 0;
                  const imageUrl = hasImage ? property.images[0] : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000";

                  return (
                    <Link
                      key={property.id}
                      href={`/properties/${property.slug}`}
                      className="glass-panel overflow-hidden rounded-2xl flex flex-col justify-between border border-stone-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-905/10 group hover:shadow-xl hover:scale-[1.01] transition-all duration-300 text-left"
                    >
                      {/* Media banner */}
                      <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm flex items-center gap-0.5 text-stone-800 dark:text-stone-100">
                          <IndianRupee className="w-3 h-3" />
                          <span>{Number(property.base_price).toLocaleString("en-IN")} / night</span>
                        </div>
                      </div>

                      {/* Details card content */}
                      <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center gap-2">
                            <h3 className="text-base font-bold font-display text-stone-850 dark:text-stone-100 group-hover:text-green-800 transition-colors truncate">
                              {property.title}
                            </h3>
                            {isVibeMatched && property.similarity !== undefined && (
                              <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold uppercase shrink-0">
                                {Math.round(property.similarity * 100)}% Match
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 line-clamp-1">
                            📍 {property.address}
                          </p>
                        </div>

                        {/* Specs badges */}
                        <div className="flex items-center gap-3 text-[10px] text-stone-500 border-t border-stone-200/20 dark:border-slate-800/20 pt-3">
                          <span className="flex items-center gap-0.5">
                            <Users className="w-3.5 h-3.5 text-stone-400" /> Max {property.capacity}
                          </span>
                          {property.bedrooms !== undefined && (
                            <span className="flex items-center gap-0.5">
                              <Bed className="w-3.5 h-3.5 text-stone-400" /> {property.bedrooms} Bed
                            </span>
                          )}
                          {property.bathrooms !== undefined && (
                            <span className="flex items-center gap-0.5">
                              <Bath className="w-3.5 h-3.5 text-stone-400" /> {property.bathrooms} Bath
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Discovery Map (2/5 width) */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 h-[400px] lg:h-[calc(100vh-180px)] w-full">
            <DiscoveryMap properties={properties} />
          </div>

        </div>

      </main>

    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { 
  Trees, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Download, 
  ShieldCheck, 
  Compass, 
  FileText, 
  HelpCircle,
  Star,
  LogOut
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("title, description, images")
    .eq("slug", params.slug)
    .single();

  if (!property) {
    return {
      title: "Stay Details | Bhilwara Farms",
    };
  }

  const imageUrl = property.images && property.images.length > 0 ? property.images[0] : "";

  return {
    title: `${property.title} - Book Farmhouse Stay | Bhilwara Farms`,
    description: property.description
      ? property.description.substring(0, 160)
      : "Book premium staycations in Bhilwara, Rajasthan.",
    openGraph: {
      images: imageUrl ? [imageUrl] : [],
    },
  };
}
import { signOut } from "@/lib/auth-actions";
import PropertyGallery from "@/components/property/PropertyGallery";
import BookingWidget from "@/components/property/BookingWidget";
import PropertyMap from "@/components/property/PropertyMap";
import ChatConcierge from "@/components/property/ChatConcierge";
import AuthModalGate from "@/components/auth/AuthModalGate";
import Footer from "@/components/Footer";

export default async function PropertyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Fetch property details matching slug
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !property) {
    notFound();
  }

  // Fetch reviews for the property
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, images, videos, created_at, profiles(full_name)")
    .eq("property_id", property.id)
    .order("created_at", { ascending: false });
  const reviews = reviewsData || [];

  // Fetch active blocked availability dates
  const todayStr = new Date().toISOString().split("T")[0];
  const { data: availabilityData } = await supabase
    .from("availability")
    .select("blocked_date")
    .eq("property_id", property.id)
    .gte("blocked_date", todayStr);
  const blockedDates = availabilityData?.map((a) => a.blocked_date) || [];

  // Calculate review metrics
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)) 
    : 0;

  // Set default mock values for city distances if empty
  const distanceInfo = property.city_distance_info && Object.keys(property.city_distance_info).length > 0
    ? property.city_distance_info
    : {
        "International Airport": "45 mins (35 km)",
        "Train Station": "30 mins (20 km)",
        "City Center Hub": "40 mins (25 km)",
        "Emergency Hospital": "12 mins (7 km)"
      };

  // JSON-LD structured data for Google Search snippet integration
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "name": property.title,
    "description": property.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": "Bhilwara",
      "addressRegion": "Rajasthan",
      "addressCountry": "IN"
    },
    "priceRange": `INR ${property.base_price}`,
    "offers": {
      "@type": "Offer",
      "price": property.base_price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="flex-1 bg-stone-50/50 dark:bg-slate-950/20 min-h-screen relative flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Header Banner */}
      <header className="border-b border-stone-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-6xl w-full mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/properties" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-green-800/10 overflow-hidden flex items-center justify-center p-0.5 border border-green-800/20">
              <img src="/bhilwara_farms_logo.png" alt="Bhilwara Farms Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg font-display text-stone-800 dark:text-stone-100 font-sans">
              Property Detail
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            <Link href="/" className="hover:text-green-850">All Stays</Link>
            <Link href="/about" className="hover:text-green-850 transition-colors">About Us</Link>
            {isAuthenticated ? (
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

      {/* Main Content Area */}
      <main className={`max-w-6xl w-full mx-auto px-6 py-10 space-y-12 ${!isAuthenticated ? "filter blur-[8px] pointer-events-none select-none" : ""}`}>
        
        {/* Title and Ratings Header */}
        <div className="space-y-2 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold font-display text-stone-850 dark:text-stone-100 leading-tight">
              {property.title}
            </h1>
            {reviewCount > 0 && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/30 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{averageRating} ({reviewCount} reviews)</span>
              </div>
            )}
          </div>
          <p className="text-sm text-stone-500 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-stone-400" /> {property.address}
          </p>
        </div>

        {/* Dynamic Gallery & Media Slider */}
        <PropertyGallery 
          images={property.images} 
          videos={property.videos} 
        />

        {/* Grid Column Layout: Details vs Booking Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Details Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Specs row */}
            <div className="glass-panel p-6 rounded-2xl grid grid-cols-3 gap-4 text-center divide-x divide-stone-200/40 dark:divide-slate-800/40">
              <div className="flex flex-col items-center">
                <Users className="w-5 h-5 text-stone-400 mb-1" />
                <span className="text-sm font-bold text-stone-800 dark:text-stone-200">Max {property.capacity}</span>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Guests</span>
              </div>
              <div className="flex flex-col items-center">
                <Bed className="w-5 h-5 text-stone-400 mb-1" />
                <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{property.bedrooms} Bed</span>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Rooms</span>
              </div>
              <div className="flex flex-col items-center">
                <Bath className="w-5 h-5 text-stone-400 mb-1" />
                <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{property.bathrooms} Bath</span>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Restrooms</span>
              </div>
            </div>

            {/* About Story */}
            <div className="space-y-4 text-left">
              <h3 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100">About the Stay</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
              
              {/* PDF brochure link if uploaded */}
              {property.documents && property.documents.length > 0 && (
                <a
                  href={property.documents[0]}
                  download
                  className="inline-flex items-center gap-2 mt-2 text-xs font-bold text-green-800 hover:text-green-700 hover:underline border border-green-800/25 bg-green-800/5 px-4 py-2.5 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Farmhouse Brochure (PDF)
                </a>
              )}
            </div>

            {/* Activities grid */}
            {property.activities && property.activities.length > 0 && (
              <div className="space-y-4 text-left">
                <h3 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100 flex items-center gap-2">
                  <Compass className="w-6 h-6 text-green-800" /> Experiences & Activities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.activities.map((act: string) => (
                    <div 
                      key={act} 
                      className="glass-panel p-4 rounded-xl border border-stone-200/40 dark:border-slate-800/40 text-sm font-bold text-stone-800 dark:text-stone-200"
                    >
                      🔥 {act}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commute Connectivity Timeline */}
            <div className="space-y-4 text-left">
              <h3 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100">Commute & Connectivity</h3>
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                {Object.entries(distanceInfo).map(([landmark, distance]: [string, any]) => (
                  <div key={landmark} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-500">{landmark}</span>
                    <div className="h-0.5 flex-grow mx-4 border-t border-dashed border-stone-200 dark:border-slate-800" />
                    <span className="font-bold text-stone-800 dark:text-stone-200">{distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RLS Protected Location Map */}
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100">Location Map</h3>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-green-800 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 flex items-center gap-1 transition-all underline decoration-dotted"
                >
                  Open in Google Maps &rarr;
                </a>
              </div>
              <PropertyMap 
                latitude={property.latitude} 
                longitude={property.longitude} 
              />
            </div>

            {/* Customer reviews with uploader */}
            <div className="space-y-6 text-left">
              <h3 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100">Verified Reviews</h3>
              {reviews.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-stone-500 text-sm">
                  No verified guest reviews yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="glass-panel p-6 rounded-2xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-stone-850 dark:text-stone-250">
                            {Array.isArray(rev.profiles) 
                              ? (rev.profiles[0] as any)?.full_name 
                              : (rev.profiles as any)?.full_name || "Guest"}
                          </h4>
                          <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Stay
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating 
                                  ? "fill-amber-500 text-amber-500" 
                                  : "text-stone-300"
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {rev.comment}
                      </p>
                      
                      {/* Review Photos & Videos Grid */}
                      {((rev.images && rev.images.length > 0) || (rev.videos && rev.videos.length > 0)) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {rev.images?.map((url: string, index: number) => (
                            <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-150 border border-stone-200/20">
                              <img src={url} alt="Review attachment" className="object-cover w-full h-full" />
                            </div>
                          ))}
                          {rev.videos?.map((url: string, index: number) => (
                            <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-stone-200/20 flex items-center justify-center cursor-pointer">
                              <span className="text-[9px] font-bold text-white uppercase">🎥 Play</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FAQs and house rules */}
            <div className="space-y-4 text-left">
              <h3 className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-green-800" /> House Rules & FAQ
              </h3>
              <div className="glass-panel p-6 rounded-2xl space-y-4 text-sm">
                
                {property.rules && property.rules.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-bold text-stone-800 dark:text-stone-200">Stay Guidelines:</h4>
                    <ul className="list-disc list-inside text-xs text-stone-500 space-y-1 pl-2">
                      {property.rules.map((rule: string) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">Standard check-in: 2:00 PM | Check-out: 11:00 AM.</p>
                )}

                <div className="border-t border-stone-200/20 dark:border-slate-800/20 pt-4 space-y-2">
                  <h4 className="font-bold text-stone-800 dark:text-stone-200">Refund Policy:</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Full refund up to 7 days before check-in. Partial (50%) refund up to 48 hours. Stays are locked instantly upon receipt of the deposit.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Booking Widget Column (Right 1/3) */}
          <div className="lg:col-span-1 sticky top-24 z-20">
            <BookingWidget 
              propertyId={property.id} 
              basePrice={Number(property.base_price)} 
              weekendPrice={Number(property.weekend_price)} 
              depositPercentage={property.deposit_percentage} 
              blockedDates={blockedDates}
              acceptsPayments={property.accepts_payments}
            />
          </div>

        </div>

      </main>

      {/* Floating AI Chatbot overlay */}
      <div className={!isAuthenticated ? "filter blur-[8px] pointer-events-none select-none" : ""}>
        <ChatConcierge 
          propertyId={property.id} 
          rules={property.rules} 
          description={property.description} 
        />
      </div>

      {!isAuthenticated && <AuthModalGate />}

      <Footer />

    </div>
  );
}

"use client";

import { useState } from "react";
import { MapPin, X, Users, IndianRupee, Compass, Eye } from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  slug: string;
  address: string;
  base_price: number;
  capacity: number;
  latitude: number;
  longitude: number;
  images?: string[];
}

interface DiscoveryMapProps {
  properties: Property[];
}

export default function DiscoveryMap({ properties }: DiscoveryMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedId);

  // Map Bounds for Bhilwara Region
  const latMin = 25.25;
  const latMax = 25.45;
  const lngMin = 74.50;
  const lngMax = 75.10;

  const latDiff = latMax - latMin;
  const lngDiff = lngMax - lngMin;

  // Key Local Landmarks in Bhilwara (shown as reference text in background)
  const landmarks = [
    { name: "Bhilwara City Center", lat: 25.3463, lng: 74.6391 },
    { name: "Harni Mahadev", lat: 25.3780, lng: 74.6621 },
    { name: "Pur Udan Hills", lat: 25.3104, lng: 74.5950 },
    { name: "Triveni Sangam", lat: 25.2854, lng: 75.0254 },
    { name: "Mandal Highway", lat: 25.4200, lng: 74.5700 }
  ];

  const getPosition = (lat: number, lng: number) => {
    // Restrict within bounds
    const safeLat = Math.min(latMax, Math.max(latMin, lat));
    const safeLng = Math.min(lngMax, Math.max(lngMin, lng));

    // Convert to percentage coordinates
    const x = ((safeLng - lngMin) / lngDiff) * 100;
    const y = (1 - (safeLat - latMin) / latDiff) * 100;

    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl bg-[#f4f1ea] dark:bg-slate-950 border border-stone-200/40 dark:border-slate-800/40 shadow-inner flex flex-col justify-between p-4 transition-colors duration-300">
      
      {/* Background Illustrated Topographic Map Design */}
      <div className="absolute inset-0 pointer-events-none opacity-90 select-none">
        {/* Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,_transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,_transparent_1px)] [background-size:20px_20px]" />
        
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Shaded Hills (Pur Hills & Mandal Range) */}
          <path d="M 30 100 Q 100 60 180 120 T 320 80" fill="none" stroke="currentColor" className="text-emerald-850/10 dark:text-emerald-400/5 stroke-[45px] stroke-linecap-round" />
          <path d="M 450 300 Q 520 280 570 330" fill="none" stroke="currentColor" className="text-emerald-850/10 dark:text-emerald-400/5 stroke-[55px] stroke-linecap-round" />

          {/* Triveni River Confluence - Blue winding path */}
          <path d="M -20 280 Q 250 190 450 290 T 700 340" fill="none" stroke="currentColor" className="text-sky-300/40 dark:text-sky-950/60 stroke-[8px] stroke-linecap-round" />
          <path d="M 450 290 Q 550 160 680 50" fill="none" stroke="currentColor" className="text-sky-300/30 dark:text-sky-950/40 stroke-[4px]" />

          {/* Main Road Networks */}
          {/* Pur Road */}
          <path d="M 80 400 Q 220 280 480 230 T 700 80" fill="none" stroke="currentColor" className="text-stone-300/80 dark:text-slate-800/50 stroke-[5px]" />
          <path d="M 80 400 Q 220 280 480 230 T 700 80" fill="none" stroke="currentColor" className="text-stone-200/50 dark:text-slate-800/30 stroke-[1px] stroke-dasharray-[4,4]" />
          {/* Mandal Highway */}
          <path d="M 180 -20 Q 200 150 230 280 T 500 450" fill="none" stroke="currentColor" className="text-stone-300/80 dark:text-slate-800/50 stroke-[4px]" />
        </svg>
      </div>
      
      {/* Compass Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-stone-700 dark:text-stone-300 shadow-md border border-stone-200/30 dark:border-slate-800/40 flex items-center gap-1.5 uppercase tracking-wider">
        <Compass className="w-4 h-4 text-green-800 dark:text-green-500 animate-spin-slow animate-pulse" />
        Bhilwara Stays Map
      </div>

      {/* Grid Coordinates Label */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] text-stone-500 dark:text-stone-400 font-mono shadow-sm border border-stone-200/30 dark:border-slate-800/40">
        GRID MODE: LOCAL TOPOGRAPHY
      </div>

      {/* Interactive Map Canvas area */}
      <div className="flex-1 w-full relative min-h-[300px] md:min-h-[500px] mt-8">
        
        {/* Render Landmark Reference Labels in Background */}
        {landmarks.map((lm, idx) => {
          const pos = getPosition(lm.lat, lm.lng);
          return (
            <div
              key={idx}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 text-left"
              style={pos}
            >
              <div className="w-1.5 h-1.5 bg-stone-700 rounded-full mx-auto opacity-30" />
              <span className="text-[9px] text-stone-600 dark:text-stone-700 font-bold uppercase tracking-wider block text-center mt-1 select-none">
                {lm.name}
              </span>
            </div>
          );
        })}

        {/* Render Property Pins */}
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;
          const pos = getPosition(property.latitude, property.longitude);
          const isSelected = selectedId === property.id;

          return (
            <div
              key={property.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
              style={pos}
            >
              <button
                type="button"
                onClick={() => setSelectedId(isSelected ? null : property.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold shadow-lg transition-all duration-300 flex items-center gap-0.5 border ${
                  isSelected
                    ? "bg-green-800 text-white scale-110 border-white"
                    : "bg-white dark:bg-slate-900 text-stone-850 dark:text-stone-100 hover:scale-105 border-stone-200/60 dark:border-slate-800/60 hover:border-green-800/45"
                }`}
              >
                <MapPin className="w-3 h-3 text-green-750 dark:text-green-550 shrink-0" />
                <span>₹{Math.round(property.base_price / 1000)}k</span>
              </button>
            </div>
          );
        })}

        {/* Selected Property Preview Popup Modal Card */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 z-30 max-w-sm mx-auto glass-panel p-4 rounded-2xl border border-white/20 dark:border-slate-800/40 shadow-2xl animate-fade-in text-left">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 min-w-0">
                <h4 className="font-extrabold text-xs text-stone-850 dark:text-stone-100 truncate">
                  {selectedProperty.title}
                </h4>
                <p className="text-[10px] text-stone-400 truncate">
                  📍 {selectedProperty.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-900 text-stone-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Stats & Image */}
            <div className="mt-3 flex gap-3 items-center">
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{Number(selectedProperty.base_price).toLocaleString("en-IN")} / night</span>
                </div>
                <div className="text-[10px] text-stone-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>Max {selectedProperty.capacity} guests</span>
                </div>
              </div>
            </div>

            {/* Action links */}
            <div className="mt-3 flex gap-2">
              <Link
                href={`/properties/${selectedProperty.slug}`}
                className="flex-1 py-2 bg-green-800 hover:bg-green-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-green-950/10 text-center"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </Link>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedProperty.latitude},${selectedProperty.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-300 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-stone-200/60 dark:border-slate-800/60 shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-stone-500" /> Google Maps
              </a>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

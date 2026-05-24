"use client";

import { MapPin, Info, Compass } from "lucide-react";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  // Map Bounds for Bhilwara Region
  const latMin = 25.25;
  const latMax = 25.45;
  const lngMin = 74.50;
  const lngMax = 75.10;

  const latDiff = latMax - latMin;
  const lngDiff = lngMax - lngMin;

  const getPosition = (lat: number, lng: number) => {
    // Restrict within bounds
    const safeLat = Math.min(latMax, Math.max(latMin, lat));
    const safeLng = Math.min(lngMax, Math.max(lngMin, lng));

    // Convert to percentage coordinates
    const x = ((safeLng - lngMin) / lngDiff) * 100;
    const y = (1 - (safeLat - latMin) / latDiff) * 100;

    return { left: `${x}%`, top: `${y}%` };
  };

  // Key Local Landmarks in Bhilwara (shown as reference text in background)
  const landmarks = [
    { name: "Bhilwara City Center", lat: 25.3463, lng: 74.6391 },
    { name: "Harni Mahadev", lat: 25.3780, lng: 74.6621 },
    { name: "Pur Udan Hills", lat: 25.3104, lng: 74.5950 },
    { name: "Triveni Sangam", lat: 25.2854, lng: 75.0254 },
    { name: "Mandal Highway", lat: 25.4200, lng: 74.5700 }
  ];

  const stayPosition = getPosition(latitude, longitude);

  return (
    <div className="w-full space-y-3 text-left">
      
      {/* Map box Frame */}
      <div className="relative w-full h-[250px] md:h-[320px] rounded-3xl overflow-hidden bg-[#f4f1ea] dark:bg-slate-950 border border-stone-200/40 dark:border-slate-800/40 shadow-inner transition-colors duration-300">
        
        {/* Background Illustrated Topographic Map Design */}
        <div className="absolute inset-0 pointer-events-none opacity-90 select-none">
          {/* Grids */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,_transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,_transparent_1px)] [background-size:20px_20px]" />
          
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Shaded Hills (Pur Hills & Mandal Range) */}
            <path d="M 30 80 Q 100 40 180 100 T 320 60" fill="none" stroke="currentColor" className="text-emerald-850/10 dark:text-emerald-400/5 stroke-[45px] stroke-linecap-round" />
            <path d="M 450 250 Q 520 230 570 280" fill="none" stroke="currentColor" className="text-emerald-850/10 dark:text-emerald-400/5 stroke-[55px] stroke-linecap-round" />

            {/* Triveni River Confluence - Blue winding path */}
            <path d="M -20 230 Q 250 140 450 240 T 700 290" fill="none" stroke="currentColor" className="text-sky-300/40 dark:text-sky-950/60 stroke-[8px] stroke-linecap-round" />
            <path d="M 450 240 Q 550 110 680 0" fill="none" stroke="currentColor" className="text-sky-300/30 dark:text-sky-950/40 stroke-[4px]" />

            {/* Main Road Networks */}
            {/* Pur Road */}
            <path d="M 80 350 Q 220 230 480 180 T 700 30" fill="none" stroke="currentColor" className="text-stone-300/80 dark:text-slate-800/50 stroke-[5px]" />
            <path d="M 80 350 Q 220 230 480 180 T 700 30" fill="none" stroke="currentColor" className="text-stone-200/50 dark:text-slate-800/30 stroke-[1px] stroke-dasharray-[4,4]" />
            {/* Mandal Highway */}
            <path d="M 180 -20 Q 200 100 230 230 T 500 400" fill="none" stroke="currentColor" className="text-stone-300/80 dark:text-slate-800/50 stroke-[4px]" />
          </svg>
        </div>

        {/* Render Landmark Reference Labels in Background */}
        {landmarks.map((lm, idx) => {
          const pos = getPosition(lm.lat, lm.lng);
          return (
            <div
              key={idx}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 text-left"
              style={pos}
            >
              <div className="w-1 h-1 bg-stone-700 rounded-full mx-auto opacity-30" />
              <span className="text-[8px] text-stone-600 dark:text-stone-700 font-bold uppercase tracking-wider block text-center mt-1 select-none">
                {lm.name}
              </span>
            </div>
          );
        })}

        {/* Masked Privacy Circle Radius Layer */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-green-700/10 dark:bg-green-500/10 border-2 border-green-750/30 dark:border-green-500/30 rounded-full flex items-center justify-center animate-pulse z-20"
          style={stayPosition}
        >
          <MapPin className="w-5 h-5 text-green-800 dark:text-green-500" />
        </div>

        {/* Overlay Compass Badge */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-stone-750 dark:text-stone-300 shadow-md border border-stone-200/30 dark:border-slate-800/40 flex items-center gap-1.5 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-green-850 dark:text-green-500 animate-spin-slow animate-pulse" />
          Stay Area Radius Shield
        </div>

        {/* Dynamic coordinate status indicator */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] text-stone-500 dark:text-stone-400 font-semibold shadow-md border border-stone-200/30 dark:border-slate-800/40">
          Location: <span className="font-bold text-stone-850 dark:text-stone-200">{latitude.toFixed(4)}° N</span>, <span className="font-bold text-stone-850 dark:text-stone-200">{longitude.toFixed(4)}° E</span>
        </div>

      </div>

      {/* Info Callout */}
      <div className="flex gap-2 p-3 bg-stone-100/60 dark:bg-slate-900/40 border border-stone-200/20 dark:border-slate-800/20 rounded-xl text-xs text-stone-500 leading-relaxed">
        <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <span>To protect host privacy, exact coordinates are hidden until stay booking is **confirmed**. A 500m general radius is shown above.</span>
      </div>

    </div>
  );
}

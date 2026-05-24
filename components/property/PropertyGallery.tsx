"use client";

import { useState } from "react";
import { Play, Image as ImageIcon, Film, X } from "lucide-react";
import Image from "next/image";

interface PropertyGalleryProps {
  images: string[];
  videos?: string[];
}

export default function PropertyGallery({ images = [], videos = [] }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: "image" | "video"; url: string } | null>(null);

  const hasImages = images.length > 0;
  const hasVideos = videos && videos.length > 0;

  const defaultImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000";
  const mainImage = hasImages ? images[0] : defaultImage;
  const secondImage = images.length > 1 ? images[1] : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000";
  const thirdImage = images.length > 2 ? images[2] : "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000";

  const openLightbox = (type: "image" | "video", url: string) => {
    setActiveMedia({ type, url });
    setLightboxOpen(true);
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      
      {/* Masonry Grid Hero Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[350px] md:h-[450px]">
        
        {/* Main Hero Shot (2/3 width) */}
        <div 
          onClick={() => openLightbox("image", mainImage)}
          className="md:col-span-2 relative rounded-3xl overflow-hidden bg-stone-100 cursor-pointer group shadow-md"
        >
          <Image
            src={mainImage}
            alt="Property Main View"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Side Stack (1/3 width) */}
        <div className="grid grid-rows-2 gap-4 h-full">
          
          {/* Top side card */}
          <div 
            onClick={() => openLightbox("image", secondImage)}
            className="relative rounded-3xl overflow-hidden bg-stone-100 cursor-pointer group shadow-sm"
          >
            <Image
              src={secondImage}
              alt="Property Detail View"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
          </div>

          {/* Bottom side card (shows walkthrough video card if uploaded, else image) */}
          {hasVideos ? (
            <div 
              onClick={() => openLightbox("video", videos[0])}
              className="relative rounded-3xl overflow-hidden bg-slate-900 cursor-pointer group shadow-sm flex items-center justify-center border-2 border-green-800/10 hover:border-green-800/30 transition-colors"
            >
              {/* Thumbnail backdrop if available */}
              <Image
                src={thirdImage}
                alt="Walkthrough Video preview"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-60 group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-green-950/20 group-hover:bg-green-950/10 transition-colors" />

              {/* Pulsing Play Button */}
              <div className="relative p-4 rounded-full bg-green-850 text-white shadow-xl group-hover:scale-105 transition-transform duration-300 z-10 flex items-center justify-center animate-pulse">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <span className="absolute bottom-4 left-4 z-10 text-[10px] font-bold text-white bg-slate-950/60 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <Film className="w-3.5 h-3.5" /> Walkthrough Tour
              </span>
            </div>
          ) : (
            <div 
              onClick={() => openLightbox("image", thirdImage)}
              className="relative rounded-3xl overflow-hidden bg-stone-100 cursor-pointer group shadow-sm"
            >
              <Image
                src={thirdImage}
                alt="Property Detail View 2"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          )}

        </div>

      </div>

      {/* Grid footer controls */}
      <div className="flex justify-end gap-2 text-xs">
        <button
          onClick={() => openLightbox("image", mainImage)}
          className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-stone-200/60 dark:border-slate-800/40 px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-stone-50 transition-colors"
        >
          <ImageIcon className="w-4 h-4 text-stone-500" />
          View All Photos ({images.length})
        </button>
      </div>

      {/* Lightbox Modal Overlay */}
      {lightboxOpen && activeMedia && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full max-h-[85vh] relative flex items-center justify-center">
            {activeMedia.type === "image" ? (
              <div className="relative w-full h-[60vh] md:h-[80vh]">
                <Image
                  src={activeMedia.url}
                  alt="Lightbox view"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5">
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

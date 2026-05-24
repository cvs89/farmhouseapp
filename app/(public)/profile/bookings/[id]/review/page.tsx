"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createReviewAction } from "@/lib/review-actions";
import MediaUploader from "@/components/MediaUploader";
import { Trees, Star, ArrowLeft, Loader2, Save, Smile } from "lucide-react";
import Link from "next/link";

export default function SubmitReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") || "";

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Review attachments media states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      setError("Missing stay property association details.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a stay review description.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await createReviewAction({
      bookingId: params.id,
      propertyId,
      rating,
      comment,
      images: uploadedImages,
      videos: uploadedVideos,
    });

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess(res.success);
      setTimeout(() => {
        router.push("/profile/bookings");
      }, 1500);
    }
  };

  return (
    <div className="flex-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-stone-50 to-white dark:from-slate-900 dark:via-slate-955 dark:to-black min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background visual blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 animate-fade-in text-left">
        
        {/* Brand Link */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 group">
          <div className="p-2 rounded-xl bg-green-800 text-white shadow-md">
            <Trees className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold font-display text-stone-850 dark:text-stone-100">
            Farmhouse
          </span>
        </Link>

        {/* Card Frame */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl">
          
          <div className="flex items-center gap-3 pb-4 border-b border-stone-200/20 mb-6">
            <Link
              href="/profile/bookings"
              className="p-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 hover:bg-stone-50 dark:hover:bg-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-stone-850 dark:text-stone-150">
                Write a Review
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Share your verified stay experiences with photos & video clips.
              </p>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col items-center text-center p-6 bg-green-50 dark:bg-green-950/20 border border-green-200/25 rounded-2xl animate-fade-in">
              <Smile className="w-12 h-12 text-green-700 dark:text-green-400 mb-3" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-1">
                Review Published
              </h3>
              <p className="text-sm text-stone-650 dark:text-stone-400">
                {success}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl">
                  {error}
                </div>
              )}

              {/* Star selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase">Rate your Stay</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 rounded-lg hover:bg-stone-50 dark:hover:bg-slate-900 transition-colors"
                      >
                        <Star className={`w-8 h-8 ${
                          isActive 
                            ? "fill-amber-500 text-amber-500" 
                            : "text-stone-300 dark:text-slate-800"
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase">Review Details</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about cleanliness, hospitality, lawn space, pool hygiene, and host interactions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs text-stone-800 dark:text-stone-200"
                />
              </div>

              {/* Review attachments uploader */}
              <div className="space-y-4 pt-2 border-t border-stone-200/20">
                
                {/* Images */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase">Upload Stay Photos (Optional)</label>
                  <MediaUploader
                    bucket="review-media"
                    category="image"
                    propertyId={propertyId}
                    multiple
                    onUploadComplete={(urls) => setUploadedImages(urls)}
                  />
                </div>

                {/* Videos */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase">Upload Stay Video Clips (Optional)</label>
                  <MediaUploader
                    bucket="review-media"
                    category="video"
                    propertyId={propertyId}
                    onUploadComplete={(urls) => setUploadedVideos(urls)}
                  />
                </div>

              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-950/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Review...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Publish Verified Review
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

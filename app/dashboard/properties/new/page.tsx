"use client";

import { useState } from "react";
import { createProperty } from "@/lib/property-actions";
import MediaUploader from "@/components/MediaUploader";
import { ArrowLeft, ArrowRight, Save, Loader2, Sparkles, Building, Landmark, Image, CheckSquare } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    latitude: 19.076,
    longitude: 72.877,
    base_price: 15000,
    weekend_price: 18000,
    deposit_percentage: 20,
    capacity: 15,
    bedrooms: 4,
    bathrooms: 4,
    rules: "",
    accepts_payments: true,
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Media state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["latitude", "longitude", "base_price", "weekend_price", "deposit_percentage", "capacity", "bedrooms", "bathrooms"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.description || !formData.address) {
      setError("Please fill out all basic information fields.");
      setStep(1);
      return;
    }

    if (uploadedImages.length === 0) {
      setError("Please upload at least one image of the farmhouse.");
      setStep(4);
      return;
    }

    setError(null);
    setLoading(true);

    const rulesArray = formData.rules
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const result = await createProperty({
      ...formData,
      amenities: selectedAmenities,
      activities: selectedActivities,
      rules: rulesArray,
      images: uploadedImages,
      videos: uploadedVideos,
      documents: uploadedDocuments,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Options checklist
  const amenitiesList = ["Swimming Pool", "BBQ Grill", "DJ Allowed", "High-speed Wi-Fi", "Generator Backup", "Full Kitchen", "Pet Friendly", "AC Rooms"];
  const activitiesList = ["Bonfire Nights", "Nature Trekking", "Pool Volleyball", "Indoor Board Games", "Karaoke & Music", "Lawn Badminton", "Stargazing"];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-stone-200/50 dark:border-slate-800/40">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 hover:bg-stone-100 dark:hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-display text-stone-800 dark:text-stone-100">
            List Your Farmhouse
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Complete the steps below to onboard and publish your property.
          </p>
        </div>
      </div>

      {/* Steps Progress Visual */}
      <div className="grid grid-cols-4 gap-4 pb-2">
        {[
          { icon: Building, label: "Stay Info" },
          { icon: Landmark, label: "Pricing & Rules" },
          { icon: CheckSquare, label: "Activities" },
          { icon: Image, label: "Media Uploads" },
        ].map((item, index) => {
          const stepNum = index + 1;
          const Icon = item.icon;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;

          return (
            <div 
              key={stepNum} 
              className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                isActive 
                  ? "border-green-800 bg-green-800/5" 
                  : isCompleted 
                  ? "border-green-800/30 bg-green-800/5" 
                  : "border-stone-200/40 dark:border-slate-850/40"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive || isCompleted ? "text-green-800 dark:text-green-400" : "text-stone-400"}`} />
              <span className={`text-[10px] font-bold ${isActive || isCompleted ? "text-stone-700 dark:text-stone-300" : "text-stone-400"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <div className="glass-panel p-8 rounded-3xl shadow-xl shadow-stone-200/40 dark:shadow-none min-h-[400px] flex flex-col justify-between">
        
        <div className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          {/* STEP 1: Basic Stay Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-800" /> Basic Information
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Farmhouse Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. The Green Meadow Villa"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Map Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Map Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Exact Location Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Karjat Hills, Maharashtra, India"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Property Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your beautiful farmhouse layout, capacity, visual appeal, and special retreat parameters..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Pricing, Specifications & Policies */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-green-800" /> Pricing & House Rules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Base Price (Weekday ₹)</label>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm font-semibold text-stone-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Weekend Price (Fri-Sun ₹)</label>
                  <input
                    type="number"
                    name="weekend_price"
                    value={formData.weekend_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm font-semibold text-stone-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Deposit % (To Lock Date)</label>
                  <input
                    type="number"
                    name="deposit_percentage"
                    min="10"
                    max="100"
                    value={formData.deposit_percentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-955/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm font-semibold text-stone-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-slate-950/40 border border-stone-200/60 dark:border-slate-800/60 rounded-xl">
                <input
                  type="checkbox"
                  id="accepts_payments"
                  checked={formData.accepts_payments}
                  onChange={e => setFormData(prev => ({ ...prev, accepts_payments: e.target.checked }))}
                  className="w-4 h-4 rounded border-stone-300 text-green-800 focus:ring-green-800 cursor-pointer"
                />
                <label htmlFor="accepts_payments" className="text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                  Enable Online Payments & Deposits
                  <span className="block text-[10px] font-normal text-stone-400 mt-0.5">
                    If enabled, users can block dates by paying a deposit via Razorpay. Otherwise, they submit a direct booking enquiry.
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Max Guest Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Bedrooms Count</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Bathrooms Count</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">House Rules (One rule per line)</label>
                <textarea
                  name="rules"
                  rows={3}
                  value={formData.rules}
                  onChange={handleInputChange}
                  placeholder="e.g. Loud music permitted indoors only after 10 PM.&#13;Pets allowed under supervision.&#13;No smoking inside bedrooms."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Amenities & Experiences Checklist */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="space-y-3">
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-800" /> Select Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all duration-200 ${
                          isChecked
                            ? "border-green-800 bg-green-800/10 text-green-800 dark:text-green-400"
                            : "border-stone-200/60 dark:border-slate-800/40 text-stone-500 hover:border-stone-300"
                        }`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-800" /> Select On-Site Activities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {activitiesList.map((activity) => {
                    const isChecked = selectedActivities.includes(activity);
                    return (
                      <button
                        key={activity}
                        type="button"
                        onClick={() => toggleActivity(activity)}
                        className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all duration-200 ${
                          isChecked
                            ? "border-green-800 bg-green-800/10 text-green-800 dark:text-green-400"
                            : "border-stone-200/60 dark:border-slate-800/40 text-stone-500 hover:border-stone-300"
                        }`}
                      >
                        {activity}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: Media Uploads (Photos, Video, PDF Guides) */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100 flex items-center gap-2">
                <Image className="w-5 h-5 text-green-800" /> Upload Farmhouse Assets
              </h3>

              {/* Photos Uploader */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Property Photos (At least 1 required)
                </label>
                <MediaUploader
                  bucket="property-media"
                  category="image"
                  propertyId="temp-listing"
                  multiple
                  onUploadComplete={(urls) => setUploadedImages(urls)}
                />
              </div>

              {/* Tour Video Uploader */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Walk-Through Video (Optional)
                  </label>
                  <MediaUploader
                    bucket="property-media"
                    category="video"
                    propertyId="temp-listing"
                    onUploadComplete={(urls) => setUploadedVideos(urls)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    PDF Brochure / Guidelines (Optional)
                  </label>
                  <MediaUploader
                    bucket="property-documents"
                    category="pdf"
                    propertyId="temp-listing"
                    onUploadComplete={(urls) => setUploadedDocuments(urls)}
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-stone-200/50 dark:border-slate-800/40 mt-8">
          
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-green-800 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md group"
            >
              Next
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-850 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Publish Listing
                </>
              )}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

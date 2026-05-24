"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OpenAI from "openai";

export async function createProperty(data: {
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
  videos: string[];
  documents: string[];
  accepts_payments: boolean;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User session expired. Please sign in again." };
  }

  // Create slug from title
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 6);

  const { error } = await supabase.from("properties").insert({
    owner_id: user.id,
    title: data.title,
    slug,
    description: data.description,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    base_price: data.base_price,
    weekend_price: data.weekend_price,
    deposit_percentage: data.deposit_percentage,
    capacity: data.capacity,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    amenities: data.amenities,
    activities: data.activities,
    rules: data.rules,
    images: data.images,
    videos: data.videos,
    documents: data.documents,
    accepts_payments: data.accepts_payments,
    is_published: true, // Auto-publishing for MVP, Admin can flag later
  });

  if (error) {
    console.error("Supabase insert error", error);
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function updatePropertyPrice(
  propertyId: string,
  basePrice: number,
  weekendPrice: number
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User session expired. Please sign in again." };
  }

  const { error } = await supabase
    .from("properties")
    .update({
      base_price: basePrice,
      weekend_price: weekendPrice,
    })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error updating price:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function getPricingSuggestions(propertyId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User session expired. Please sign in again." };
  }

  // Fetch property details
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id, title, base_price, weekend_price, capacity, description")
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .single();

  if (propError || !property) {
    return { error: propError?.message || "Property not found." };
  }

  // Fetch confirmed bookings count to assess demand
  const { count: bookingsCount, error: countError } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("status", "confirmed");

  const recentBookings = bookingsCount || 0;

  // If OpenAI key is set, call OpenAI chat completions
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      const prompt = `
Analyze this farmhouse property listing and generate optimal pricing recommendations.
Title: "${property.title}"
Current Weekday Base Price: ₹${property.base_price}
Current Weekend Price: ₹${property.weekend_price}
Guest Capacity: ${property.capacity} guests
Listing Description: "${property.description || "N/A"}"
Confirmed Recent Bookings: ${recentBookings}

Task:
Suggest a new weekday base price and a new weekend price (values should be logical round numbers, roughly +/- 30% of current prices).
Provide a clear, professional marketing & revenue strategy explanation (maximum 2-3 sentences) detailing the reason for these price modifications based on capacity, occupancy rates, and listing characteristics.

Output MUST be a valid JSON object matching this structure:
{
  "suggestedBasePrice": number,
  "suggestedWeekendPrice": number,
  "rationale": "string"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert revenue manager and dynamic pricing assistant specialized in vacation rentals and farmhouses.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const resultText = response.choices[0].message?.content;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        return {
          suggestedBasePrice: Number(parsed.suggestedBasePrice),
          suggestedWeekendPrice: Number(parsed.suggestedWeekendPrice),
          rationale: parsed.rationale,
        };
      }
    } catch (err: any) {
      console.warn("OpenAI pricing generation failed, falling back to rules.", err);
    }
  }

  // Fallback: Custom rule-based pricing generator
  let suggestedBasePrice = Number(property.base_price);
  let suggestedWeekendPrice = Number(property.weekend_price);
  let rationale = "";

  if (recentBookings >= 3) {
    // High demand rules
    suggestedBasePrice = Math.round(Number(property.base_price) * 1.15);
    suggestedWeekendPrice = Math.round(Number(property.weekend_price) * 1.25);
    rationale = `Strong booking traffic (${recentBookings} confirmed bookings) suggests excellent demand. We recommend a 15% increase in your weekday rate and a 25% increase for weekends to capitalize on premium weekend stays and family events.`;
  } else if (recentBookings === 0) {
    // Low demand rules
    suggestedBasePrice = Math.round(Number(property.base_price) * 0.90);
    suggestedWeekendPrice = Math.round(Number(property.weekend_price) * 0.95);
    rationale = `No confirmed bookings recorded recently. We recommend launching a promotional 10% discount on weekdays to stimulate booking interest, while slightly adjusting weekend prices to maximize conversions.`;
  } else {
    // Moderate demand rules
    suggestedBasePrice = Math.round(Number(property.base_price) * 1.05);
    suggestedWeekendPrice = Math.round(Number(property.weekend_price) * 1.10);
    rationale = `Steady occupancy observed. We recommend a minor weekend rate adjustment (+10%) to leverage premium weekend event demand, while raising weekday rates by 5% to optimize occupancy.`;
  }

  // Round values to nearest 100 for clean look
  suggestedBasePrice = Math.round(suggestedBasePrice / 100) * 100;
  suggestedWeekendPrice = Math.round(suggestedWeekendPrice / 100) * 100;

  return {
    suggestedBasePrice,
    suggestedWeekendPrice,
    rationale,
  };
}

export async function updateProperty(propertyId: string, data: {
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
  videos?: string[];
  documents?: string[];
  accepts_payments: boolean;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User session expired. Please sign in again." };
  }

  const { error } = await supabase
    .from("properties")
    .update({
      title: data.title,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      base_price: data.base_price,
      weekend_price: data.weekend_price,
      deposit_percentage: data.deposit_percentage,
      capacity: data.capacity,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      amenities: data.amenities,
      activities: data.activities,
      rules: data.rules,
      images: data.images,
      videos: data.videos || [],
      documents: data.documents || [],
      accepts_payments: data.accepts_payments,
    })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error updating property:", error);
    return { error: error.message };
  }

  return { success: true };
}

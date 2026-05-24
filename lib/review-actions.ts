"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReviewAction(data: {
  bookingId: string;
  propertyId: string;
  rating: number;
  comment: string;
  images: string[];
  videos: string[];
}) {
  const { bookingId, propertyId, rating, comment, images, videos } = data;

  if (!bookingId || !propertyId || !rating || !comment) {
    return { error: "Rating and review comments are required." };
  }

  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated. Please log in." };

  // Verify guest stay is confirmed
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", bookingId)
    .eq("customer_id", user.id)
    .single();

  if (fetchError || !booking) {
    return { error: "No matching stay booking found for your account." };
  }

  if (booking.status !== "confirmed") {
    return { error: "Reviews are only permitted for confirmed, completed stays." };
  }

  // Insert verified review
  const { error: insertError } = await supabase
    .from("reviews")
    .insert({
      booking_id: bookingId,
      property_id: propertyId,
      customer_id: user.id,
      rating,
      comment,
      images,
      videos,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "You have already submitted a review for this stay." };
    }
    return { error: insertError.message };
  }

  revalidatePath(`/properties`);
  return { success: "Thank you! Your verified review has been published." };
}

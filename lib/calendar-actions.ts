"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function blockDatesAction(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const reason = formData.get("reason") as string; // 'maintenance', 'owner_use', 'booked' (offline)

  if (!propertyId || !startDate || !endDate || !reason) {
    return { error: "All fields are required." };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return { error: "Check-in date must be before check-out date." };
  }

  const supabase = createClient();

  // Validate owner permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.owner_id !== user.id) {
    return { error: "Unauthorized. You do not own this property." };
  }

  // Generate dates range array
  const dateStrings: string[] = [];
  const current = new Date(start);
  while (current < end) {
    dateStrings.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  // Check for conflicts
  const { data: conflicts, error: checkError } = await supabase
    .from("availability")
    .select("blocked_date")
    .eq("property_id", propertyId)
    .in("blocked_date", dateStrings);

  if (checkError) return { error: checkError.message };
  if (conflicts && conflicts.length > 0) {
    return { error: "Selected dates overlap with an existing booking or hold." };
  }

  // Bulk insert availability locks
  const blocks = dateStrings.map((date) => ({
    property_id: propertyId,
    blocked_date: date,
    reason: reason,
  }));

  const { error: insertError } = await supabase
    .from("availability")
    .insert(blocks);

  if (insertError) return { error: insertError.message };

  revalidatePath("/dashboard/calendar");
  return { success: "Dates successfully blocked in calendar." };
}

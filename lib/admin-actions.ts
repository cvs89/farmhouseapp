"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Service role client helper for administrative auth operations
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Security verification helper
async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    throw new Error("Unauthorized. Admin rights required.");
  }
}

export async function updateUserRole(userId: string, newRole: "customer" | "owner" | "staff" | "admin") {
  try {
    await verifyAdmin();
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: `Successfully updated user role to ${newRole}.` };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function togglePropertyPublish(propertyId: string, publishState: boolean) {
  try {
    await verifyAdmin();
    const supabase = createClient();
    const { error } = await supabase
      .from("properties")
      .update({ is_published: publishState })
      .eq("id", propertyId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: `Successfully updated property publication state.` };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 1. Create a user (Auth + Profile)
export async function adminCreateUser(data: {
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "owner" | "staff" | "customer";
  password?: string;
}) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();
    
    const password = data.password || "Password123";
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: data.role
      }
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create auth user" };

    // Update phone and role in profiles table (trigger already creates the basic profile)
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        phone: data.phone || null,
        role: data.role
      })
      .eq("id", authData.user.id);

    if (profileError) return { error: profileError.message };

    revalidatePath("/admin");
    return { success: "User created successfully" };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 2. Update user details (Auth + Profile)
export async function adminUpdateUser(userId: string, data: {
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "owner" | "staff" | "customer";
  password?: string;
}) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();

    // Update auth user parameters
    const updateData: any = {
      email: data.email,
      user_metadata: {
        full_name: data.full_name,
        role: data.role
      }
    };
    if (data.password) {
      updateData.password = data.password;
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, updateData);
    if (authError) return { error: authError.message };

    // Update profiles table
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        role: data.role
      })
      .eq("id", userId);

    if (profileError) return { error: profileError.message };

    revalidatePath("/admin");
    return { success: "User updated successfully" };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 3. Delete user account
export async function adminDeleteUser(userId: string) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: "User deleted successfully" };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 4. Create property with specified owner
export async function adminCreateProperty(data: {
  owner_id: string;
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
  accepts_payments: boolean;
}) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 6);

    const { error } = await adminClient.from("properties").insert({
      owner_id: data.owner_id,
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
      accepts_payments: data.accepts_payments,
      is_published: true
    });

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: "Property created successfully" };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 5. Update property details
export async function adminUpdateProperty(propertyId: string, data: {
  owner_id: string;
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
  accepts_payments: boolean;
}) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("properties")
      .update({
        owner_id: data.owner_id,
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
        accepts_payments: data.accepts_payments
      })
      .eq("id", propertyId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: "Property updated successfully" };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 6. Delete property listing
export async function adminDeleteProperty(propertyId: string) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("properties").delete().eq("id", propertyId);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: "Property deleted successfully" };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 7. Close an inquiry without booking
export async function adminCloseInquiry(inquiryId: string) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("inquiries")
      .update({ status: "closed" })
      .eq("id", inquiryId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: "Inquiry successfully marked as closed." };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 8. Convert an inquiry to a manual confirmed booking
export async function adminConvertInquiryToBooking(
  inquiryId: string,
  data: {
    total_amount: number;
    deposit_paid: number;
    payment_reference: string;
  }
) {
  try {
    await verifyAdmin();
    const adminClient = createAdminClient();

    // Fetch inquiry details
    const { data: inquiry, error: fetchErr } = await adminClient
      .from("inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (fetchErr || !inquiry) {
      return { error: fetchErr?.message || "Inquiry not found." };
    }

    const dates = inquiry.dates_interested as any;
    if (!dates || !dates.startDate || !dates.endDate) {
      return { error: "Inquiry does not contain valid booking dates." };
    }

    const startDate = dates.startDate;
    const endDate = dates.endDate;

    // Check availability conflicts
    const { data: conflicts, error: conflictErr } = await adminClient
      .from("availability")
      .select("blocked_date")
      .eq("property_id", inquiry.property_id)
      .gte("blocked_date", startDate)
      .lt("blocked_date", endDate);

    if (conflictErr) return { error: conflictErr.message };
    if (conflicts && conflicts.length > 0) {
      return { error: "One or more dates in this enquiry are already booked or blocked." };
    }

    let customerId = inquiry.customer_id;
    if (!customerId) {
      // Fetch user profile id matching email
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", inquiry.guest_email)
        .single();
      
      if (existingProfile) {
        customerId = existingProfile.id;
      } else {
        return { error: "Could not find a registered user account matching this guest's email. Please have the guest sign up first." };
      }
    }

    // Insert booking
    const remainingBalance = Number(data.total_amount) - Number(data.deposit_paid);
    const { data: booking, error: bookingErr } = await adminClient
      .from("bookings")
      .insert({
        property_id: inquiry.property_id,
        customer_id: customerId,
        start_date: startDate,
        end_date: endDate,
        status: "confirmed",
        total_amount: Number(data.total_amount),
        deposit_paid: Number(data.deposit_paid),
        remaining_balance: remainingBalance,
        razorpay_order_id: "MANUAL",
        razorpay_payment_id: data.payment_reference || "MANUAL_ENTRY",
      })
      .select("id")
      .single();

    if (bookingErr || !booking) {
      return { error: bookingErr?.message || "Failed to create confirmed booking." };
    }

    // Block dates in availability
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availabilityInserts = [];
    const curr = new Date(start);

    while (curr < end) {
      availabilityInserts.push({
        property_id: inquiry.property_id,
        blocked_date: curr.toISOString().split("T")[0],
        reason: "booked",
        booking_id: booking.id,
      });
      curr.setDate(curr.getDate() + 1);
    }

    const { error: availErr } = await adminClient
      .from("availability")
      .insert(availabilityInserts);

    if (availErr) {
      // Rollback booking if availability fails
      await adminClient.from("bookings").delete().eq("id", booking.id);
      return { error: availErr.message };
    }

    // Update inquiry status to closed
    const { error: inqUpdateErr } = await adminClient
      .from("inquiries")
      .update({ status: "closed" })
      .eq("id", inquiryId);

    if (inqUpdateErr) {
      console.warn("Could not update inquiry status:", inqUpdateErr.message);
    }

    revalidatePath("/admin");
    return { success: "Successfully converted inquiry to a confirmed booking!" };

  } catch (err: any) {
    return { error: err.message };
  }
}

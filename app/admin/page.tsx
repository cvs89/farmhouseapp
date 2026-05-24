import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const supabase = createClient();

  // Fetch all user profiles
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, phone")
    .order("created_at", { ascending: false });
  const profiles = profilesData || [];

  // Fetch all properties with owner profile info
  const { data: propertiesData } = await supabase
    .from("properties")
    .select("id, owner_id, title, description, address, latitude, longitude, base_price, weekend_price, deposit_percentage, capacity, bedrooms, bathrooms, amenities, activities, rules, images, is_published, profiles(full_name)")
    .order("created_at", { ascending: false });
  const properties = propertiesData || [];

  // Fetch all bookings with customer and property info
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("id, start_date, end_date, total_amount, status, profiles(full_name), properties(title)")
    .order("created_at", { ascending: false });
  const bookings = bookingsData || [];

  // Fetch all inquiries with property title info
  const { data: inquiriesData } = await supabase
    .from("inquiries")
    .select("id, property_id, customer_id, guest_name, guest_email, guest_phone, message, dates_interested, status, created_at, properties(title)")
    .order("created_at", { ascending: false });
  const inquiries = inquiriesData || [];

  return (
    <AdminDashboardClient 
      profiles={profiles} 
      properties={properties} 
      bookings={bookings} 
      inquiries={inquiries}
    />
  );
}

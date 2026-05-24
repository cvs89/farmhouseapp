import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 410 });
    }

    const { 
      propertyId, 
      startDate, 
      endDate, 
      totalAmount, 
      depositPaid, 
      remainingBalance 
    } = await request.json();

    if (!propertyId || !startDate || !endDate || !totalAmount) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({ error: "Check-in date must be before check-out date." }, { status: 400 });
    }

    // Generate date range arrays (excluding check-out date itself)
    const dateStrings: string[] = [];
    const current = new Date(start);
    while (current < end) {
      dateStrings.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    // 1. Check for availability conflicts (active bookings or holds)
    const { data: conflicts, error: checkError } = await supabase
      .from("availability")
      .select("blocked_date")
      .eq("property_id", propertyId)
      .in("blocked_date", dateStrings);

    if (checkError) throw checkError;

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ 
        error: "One or more selected dates are already locked. Please choose a different range." 
      }, { status: 409 });
    }

    // 2. Insert Booking with 'pending_payment' status and 10-minute expiry
    const paymentExpiry = new Date();
    paymentExpiry.setMinutes(paymentExpiry.getMinutes() + 10);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: propertyId,
        customer_id: user.id,
        start_date: startDate,
        end_date: endDate,
        status: "pending_payment",
        total_amount: totalAmount,
        deposit_paid: depositPaid,
        remaining_balance: remainingBalance,
        payment_expires_at: paymentExpiry.toISOString(),
      })
      .select("id")
      .single();

    if (bookingError || !booking) throw bookingError;

    // 3. Bulk insert dates into availability table with reason 'payment_hold'
    const availabilityBlocks = dateStrings.map((date) => ({
      property_id: propertyId,
      blocked_date: date,
      reason: "payment_hold",
      booking_id: booking.id,
    }));

    const { error: blockError } = await supabase
      .from("availability")
      .insert(availabilityBlocks);

    if (blockError) {
      // Cleanup booking if availability block fails
      await supabase.from("bookings").delete().eq("id", booking.id);
      throw blockError;
    }

    return NextResponse.json({ 
      bookingId: booking.id, 
      expiresAt: paymentExpiry.toISOString() 
    });

  } catch (err: any) {
    console.error("Booking hold error", err);
    return NextResponse.json({ error: err.message || "Failed to create stay hold." }, { status: 500 });
  }
}

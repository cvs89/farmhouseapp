import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Authenticated user check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 410 });
    }

    const { bookingId, amount } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // Retrieve booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, status, payment_expires_at")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking record not found." }, { status: 404 });
    }

    // Check expiry
    if (booking.status !== "pending_payment") {
      return NextResponse.json({ error: "Stay reservation is not in pending payment state." }, { status: 400 });
    }

    const isExpired = new Date() > new Date(booking.payment_expires_at);
    if (isExpired) {
      return NextResponse.json({ error: "Booking hold has expired. Please try again." }, { status: 400 });
    }

    // Create Razorpay Order (amount is passed in INR, convert to paise)
    const orderOptions = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: booking.id,
      notes: {
        bookingId: booking.id,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save order ID to bookings table
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ razorpay_order_id: order.id })
      .eq("id", booking.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID || "mock_key_id",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
    });

  } catch (err: any) {
    console.error("Razorpay order creation error", err);
    return NextResponse.json({ error: err.message || "Failed to initiate payment transaction." }, { status: 500 });
  }
}

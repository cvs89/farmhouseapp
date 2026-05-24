import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { 
  generateAndUploadInvoice, 
  sendBookingConfirmationEmail, 
  sendBookingConfirmationSMS 
} from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Signature header missing." }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Invalid webhook signature received.");
        return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
      }
    } else {
      console.warn("RAZORPAY_WEBHOOK_SECRET is missing. Skipping verification for testing.");
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment capture events
    if (event === "order.paid" || event === "payment.captured") {
      const paymentObj = payload.payload.payment.entity;
      const orderId = paymentObj.order_id;
      const paymentId = paymentObj.id;
      const amountPaise = paymentObj.amount;
      const depositPaidVal = Number((amountPaise / 100).toFixed(2));

      // Find booking matching razorpay_order_id
      const { data: booking, error: fetchError } = await supabaseAdmin
        .from("bookings")
        .select("id, status")
        .eq("razorpay_order_id", orderId)
        .single();

      if (fetchError || !booking) {
        console.warn(`Booking with order ID ${orderId} not found in database.`);
        return NextResponse.json({ received: true });
      }

      if (booking.status === "pending_payment") {
        // 1. Update Booking record
        const { error: bookingError } = await supabaseAdmin
          .from("bookings")
          .update({
            status: "confirmed",
            deposit_paid: depositPaidVal,
            razorpay_payment_id: paymentId,
          })
          .eq("id", booking.id);

        if (bookingError) throw bookingError;

        // 2. Update Availability table block states
        const { error: blockError } = await supabaseAdmin
          .from("availability")
          .update({ reason: "booked" })
          .eq("booking_id", booking.id);

        if (blockError) throw blockError;

        // 3. Retrieve Customer and Property details to trigger notifications
        const { data: details } = await supabaseAdmin
          .from("bookings")
          .select("id, start_date, end_date, profiles(full_name, email, phone), properties(title)")
          .eq("id", booking.id)
          .single();

        if (details) {
          const profile = details.profiles as any;
          const property = details.properties as any;

          // Generate & upload invoice PDF
          await generateAndUploadInvoice(
            booking.id,
            profile?.full_name || "Guest",
            property?.title || "Farmhouse",
            depositPaidVal
          );

          // Email receipt via Resend
          if (profile?.email) {
            await sendBookingConfirmationEmail(profile.email, profile.full_name || "Guest", {
              title: property?.title || "Farmhouse",
              startDate: details.start_date,
              endDate: details.end_date,
              amount: depositPaidVal,
            });
          }

          // SMS notification alert via Twilio
          if (profile?.phone) {
            await sendBookingConfirmationSMS(profile.phone, profile.full_name || "Guest", {
              title: property?.title || "Farmhouse",
              startDate: details.start_date,
            });
          }
        }

        console.log(`Successfully processed payment capture webhook for booking ID ${booking.id}.`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error("Webhook processing error", err);
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 500 });
  }
}

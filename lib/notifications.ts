import { createClient } from "@supabase/supabase-js";

/**
 * Sends a booking confirmation email using Resend REST API.
 */
export async function sendBookingConfirmationEmail(
  email: string,
  guestName: string,
  bookingDetails: {
    title: string;
    startDate: string;
    endDate: string;
    amount: number;
  }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_SENDER_EMAIL || "noreply@farmhouseplatform.com";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. Skipping email notification.");
    return false;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #1E3A27; font-family: Georgia, serif;">Stay Reservation Confirmed!</h2>
        <p>Dear ${guestName},</p>
        <p>Your deposit payment has been processed successfully, and your dates have been locked at the farmhouse.</p>
        
        <div style="background-color: #f7f9f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1E3A27;">${bookingDetails.title}</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Check-In:</strong> ${bookingDetails.startDate}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Check-Out:</strong> ${bookingDetails.endDate}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Paid Deposit:</strong> ₹${bookingDetails.amount.toLocaleString()}</p>
        </div>

        <p>You can view your stay history and invoice details in your Customer Profile.</p>
        <p>Warm regards,<br/>The Farmhouse Team</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: email,
        subject: `Booking Confirmed: ${bookingDetails.title}`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error: ${errText}`);
    }

    console.log(`Booking confirmation email sent to ${email}.`);
    return true;

  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
    return false;
  }
}

/**
 * Sends a booking status SMS using Twilio REST API.
 */
export async function sendBookingConfirmationSMS(
  phone: string,
  guestName: string,
  bookingDetails: {
    title: string;
    startDate: string;
  }
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials are missing. Skipping SMS notification.");
    return false;
  }

  try {
    const textBody = `Hi ${guestName}, your booking at ${bookingDetails.title} starting ${bookingDetails.startDate} is CONFIRMED! Your stay deposit has been processed. Log in to view details.`;

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", phone);
    params.append("From", fromNumber);
    params.append("Body", textBody);

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Twilio API error: ${errText}`);
    }

    console.log(`Booking confirmation SMS sent to ${phone}.`);
    return true;

  } catch (err) {
    console.error("Failed to send booking confirmation SMS:", err);
    return false;
  }
}

/**
 * Mocks generating and saving a billing invoice PDF to Supabase Storage.
 */
export async function generateAndUploadInvoice(
  bookingId: string,
  guestName: string,
  propertyName: string,
  amount: number
): Promise<string | null> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Generate a textual PDF mockup / metadata log
    const invoiceText = `
      INVOICE FOR STAY RESERVATION
      Booking ID: ${bookingId}
      Guest Name: ${guestName}
      Property: ${propertyName}
      Amount Paid: INR ${amount.toLocaleString()}
      Payment Date: ${new Date().toISOString()}
      Status: PAID
    `;

    const blob = new Blob([invoiceText], { type: "application/pdf" });
    const buffer = Buffer.from(await blob.arrayBuffer());

    const filePath = `${bookingId}.pdf`;

    // Upload to property-documents bucket under /invoices
    const { data, error } = await supabaseAdmin.storage
      .from("property-documents")
      .upload(`invoices/${filePath}`, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("property-documents")
      .getPublicUrl(`invoices/${filePath}`);

    // Update bookings record with invoice url
    await supabaseAdmin
      .from("bookings")
      .update({ invoice_pdf_url: publicUrl })
      .eq("id", bookingId);

    console.log(`Digital invoice PDF uploaded successfully: ${publicUrl}`);
    return publicUrl;

  } catch (err) {
    console.error("Failed to generate and upload digital invoice:", err);
    return null;
  }
}

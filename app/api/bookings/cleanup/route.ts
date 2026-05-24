import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Basic auth check: Verify security header to prevent arbitrary cleanup triggers
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized trigger" }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Retrieve expired booking holds
    const { data: expiredBookings, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("status", "pending_payment")
      .lt("payment_expires_at", now);

    if (fetchError) throw fetchError;

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({ cleanedCount: 0, message: "No expired holds found." });
    }

    const expiredIds = expiredBookings.map((b) => b.id);

    // Delete expired bookings
    // Cascade constraints automatically delete matching availability holds
    const { error: deleteError } = await supabaseAdmin
      .from("bookings")
      .delete()
      .in("id", expiredIds);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      cleanedCount: expiredIds.length,
      cleanedIds: expiredIds,
    });

  } catch (err: any) {
    console.error("Cleanup cron task error", err);
    return NextResponse.json({ error: err.message || "Cleanup failed" }, { status: 500 });
  }
}

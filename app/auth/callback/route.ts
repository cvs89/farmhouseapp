import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // If "next" is in parameters, use it as redirect destination, defaulting to "/"
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Retrieve profile role to dynamically route
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (profile?.role === "owner") {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login page with error flag if code exchange failed
  return NextResponse.redirect(`${origin}/login?error=OAuth authentication failed`);
}

import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "@/lib/supabaseAuth";

export async function GET(request: Request) {
  const supabase = await getSupabaseAuthClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=supabase-auth-not-configured", request.url));
  }

  const origin = new URL(request.url).origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=google-oauth-not-configured", request.url));
  }

  return NextResponse.redirect(data.url);
}

import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "@/lib/supabaseAuth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
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

  const response = NextResponse.redirect(data.url);
  response.cookies.set("reachlyst_marketing_consent", requestUrl.searchParams.get("marketing_consent") === "1" ? "1" : "0", {
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return response;
}

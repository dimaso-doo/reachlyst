import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "@/lib/supabaseAuth";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await getSupabaseAuthClient();

  if (!code || !supabase) {
    return NextResponse.redirect(new URL("/login?error=auth-callback-failed", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth-session-failed", request.url));
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const response = NextResponse.redirect(new URL("/app/dashboard", request.url));
  const marketingConsent = url.searchParams.get("marketing_consent") === "1" || request.headers.get("cookie")?.includes("reachlyst_marketing_consent=1");

  if (user) {
    const admin = getSupabaseServerClient();
    const profile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      ...(marketingConsent ? { marketing_email_consent: true, marketing_email_consent_at: new Date().toISOString() } : {})
    };
    await admin?.from("profiles").upsert(profile, { onConflict: "id" });
  }

  response.cookies.delete("reachlyst_marketing_consent");
  return response;
}

import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "@/lib/supabaseAuth";

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

  return NextResponse.redirect(new URL("/app/dashboard", request.url));
}

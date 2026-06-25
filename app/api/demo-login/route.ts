import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") === "super_admin" ? "super_admin" : "workspace_owner";
  const demoAllowed = process.env.NODE_ENV === "development" || process.env.SHOW_DEMO_LOGIN === "true";

  if (!demoAllowed) return NextResponse.redirect(new URL("/login", request.url));

  const response = NextResponse.redirect(new URL(role === "super_admin" ? "/app/admin" : "/app/dashboard", request.url));
  response.cookies.set("reachlyst_demo_role", role, { httpOnly: true, sameSite: "lax", path: "/" });
  response.cookies.set("reachlyst_demo_name", encodeURIComponent(role === "super_admin" ? "Admin Demo" : "Predrag"), { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}

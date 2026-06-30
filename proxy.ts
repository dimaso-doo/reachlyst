import { NextRequest, NextResponse } from "next/server";

const cookieName = "reachlyst_construction_access";

function isGateEnabled() {
  return process.env.UNDER_CONSTRUCTION_ENABLED !== "false";
}

function constructionUser() {
  return process.env.UNDER_CONSTRUCTION_USERNAME || (process.env.NODE_ENV === "production" ? "" : "reachlyst");
}

function constructionPassword() {
  return process.env.UNDER_CONSTRUCTION_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "launch2026");
}

function constructionSecret() {
  return process.env.UNDER_CONSTRUCTION_SECRET || constructionPassword();
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/under-construction" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".ico")
  );
}

async function hmac(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(constructionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hasAccess(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return false;
  const [user, signature] = token.split(".");
  if (user !== constructionUser() || !signature) return false;
  return signature === await hmac(user);
}

export async function proxy(request: NextRequest) {
  if (!isGateEnabled() || isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  if (await hasAccess(request)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/under-construction";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};

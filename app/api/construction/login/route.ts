import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const cookieName = "reachlyst_construction_access";

const schema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(240)
});

function constructionUser() {
  return process.env.UNDER_CONSTRUCTION_USERNAME || (process.env.NODE_ENV === "production" ? "" : "reachlyst");
}

function constructionPassword() {
  return process.env.UNDER_CONSTRUCTION_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "launch2026");
}

function constructionSecret() {
  return process.env.UNDER_CONSTRUCTION_SECRET || constructionPassword();
}

function sign(value: string) {
  return createHmac("sha256", constructionSecret()).update(value).digest("hex");
}

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const username = body.username.trim();
  const expectedUser = constructionUser();
  const expectedPassword = constructionPassword();
  const isValid = Boolean(expectedUser && expectedPassword && username === expectedUser && body.password === expectedPassword);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, `${username}.${sign(username)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
  return response;
}

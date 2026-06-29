import { NextResponse } from "next/server";
import { z } from "zod";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { chatAboutAiPlaybook } from "@/lib/openai";
import { recordAiUsage } from "@/lib/store";

const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000)
  })).min(1).max(40)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const websiteContexts = await collectWebsiteContexts(body.messages.map((message) => message.content).join("\n"));
  const reply = await chatAboutAiPlaybook({ ...body, websiteContexts });
  await recordAiUsage("message_generated");
  return NextResponse.json({ reply });
}

function extractUrls(text: string) {
  const matches = text.match(/https?:\/\/[^\s<>"')]+/gi) ?? [];
  return Array.from(new Set(matches.map((url) => url.replace(/[.,;:!?]+$/, "")))).slice(0, 3);
}

async function collectWebsiteContexts(text: string) {
  const urls = extractUrls(text);
  const contexts = await Promise.all(urls.map((url) => fetchWebsiteContext(url).catch(() => null)));
  return contexts.filter((context): context is { url: string; title?: string; text: string } => Boolean(context));
}

async function fetchWebsiteContext(rawUrl: string, redirects = 0): Promise<{ url: string; title?: string; text: string } | null> {
  if (redirects > 3) return null;
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!(await isPublicHostname(url.hostname))) return null;

  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "Reachlyst AI Playbook website reader" },
    signal: AbortSignal.timeout(8000)
  });

  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    if (!location) return null;
    return fetchWebsiteContext(new URL(location, url).toString(), redirects + 1);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("text/html")) return null;
  const html = (await response.text()).slice(0, 250000);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, "\"")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
  if (!text) return null;
  return { url: url.toString(), title, text };
}

async function isPublicHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".local")) return false;
  const addresses = isIP(lower) ? [{ address: lower }] : await lookup(lower, { all: true, verbatim: true }).catch(() => []);
  if (!addresses.length) return false;
  return addresses.every(({ address }) => isPublicAddress(address));
}

function isPublicAddress(address: string) {
  if (address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return false;
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  return true;
}

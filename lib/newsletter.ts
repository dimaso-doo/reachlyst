/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { getSupabaseServerClient } from "@/lib/supabase";

type NewsletterRecord = {
  email: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

const dbPath = process.env.VERCEL ? join(tmpdir(), "reachlyst-newsletter.json") : join(process.cwd(), "data", "reachlyst-newsletter.json");

function now() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readLocal(): NewsletterRecord[] {
  if (!existsSync(dbPath)) return [];
  return JSON.parse(readFileSync(dbPath, "utf8")) as NewsletterRecord[];
}

function writeLocal(records: NewsletterRecord[]) {
  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, JSON.stringify(records, null, 2));
}

export async function subscribeForNews(input: { email: string; source?: string; userAgent?: string | null }) {
  const email = normalizeEmail(input.email);
  const source = input.source || "under_construction";
  const timestamp = now();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.from("newsletter_subscribers").upsert({
      email,
      source,
      user_agent: input.userAgent ?? null,
      updated_at: timestamp
    }, { onConflict: "email" });
    if (!error) return { email };
    if (!/newsletter_subscribers/i.test(error.message)) throw error;
  }

  const records = readLocal();
  const existing = records.find((record) => record.email === email);
  if (existing) {
    existing.source = source;
    existing.updatedAt = timestamp;
  } else {
    records.unshift({ email, source, createdAt: timestamp, updatedAt: timestamp });
  }
  writeLocal(records);
  return { email };
}

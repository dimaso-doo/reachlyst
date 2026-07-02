/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { activities as seedActivities, leads as seedLeads, searches as seedSearches } from "@/data/mock";
import { createEmbedding } from "@/lib/embeddings";
import { normalizeLinkedInUrl, sanitizeText } from "@/lib/mockDb";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { LeadStatus } from "@/types/domain";

type SearchRecord = (typeof seedSearches)[number] & { lastSyncedAt?: string; synced?: string };
type LeadRecord = {
  id: string;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  snippet?: string;
  linkedinUrl?: string;
  salesNavigatorUrl?: string;
  normalizedLinkedInUrl: string;
  status: LeadStatus;
  campaignIds: string[];
  campaign?: string;
  aiReason?: string;
  aiConfidence?: number;
  generatedMessage?: string;
  updatedAt: string;
};
type ActivityRecord = { label: string; time: string; type?: string; leadId?: string; searchId?: string; createdAt?: string };
type MessageRecord = { id: string; leadId?: string; threadUrl?: string; senderType: string; body: string; source: string; syncedAt: string };
export type AiMessageGrantRecord = { id: string; userId: string; amount: number; note?: string; createdAt: string };
export type AiPlaybookStatus = "not_trained" | "ready";
export type AiPlaybookRecord = {
  status: AiPlaybookStatus;
  rawNotes: string;
  offer?: string;
  icp?: string;
  exclusions?: string;
  tone?: string;
  cta?: string;
  defaultMessageTypes: string[];
  updatedAt?: string;
};
export type AiMemoryCategory = "offer" | "icp" | "buying_signals" | "tone" | "cta" | "message_style" | "objection" | "example" | "general";
export type AiMemoryRecord = {
  id: string;
  category: AiMemoryCategory;
  content: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};
type LocalDb = { searches: SearchRecord[]; leads: LeadRecord[]; activities: ActivityRecord[]; messages: MessageRecord[]; aiPlaybook: AiPlaybookRecord; aiMessageGrants: AiMessageGrantRecord[]; aiMemories: AiMemoryRecord[] };
type DashboardData = { searches: SearchRecord[]; leads: LeadRecord[]; activities: ActivityRecord[]; messages: MessageRecord[] };

export const workspaceId = "00000000-0000-4000-8000-000000000001";
const dbPath = process.env.VERCEL ? join(tmpdir(), "reachlyst-local-db.json") : join(process.cwd(), "data", "reachlyst-local-db.json");
const defaultMessageTypes = ["Short connection invite", "Warmer connection invite", "Direct relevance message", "Follow-up after connection", "Not-now response"];

function now() {
  return new Date().toISOString();
}

function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function stableUuid(value: string) {
  const hex = createHash("sha1").update(value).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function seedDb(): LocalDb {
  return {
    searches: seedSearches.map((search) => ({ ...search, lastSyncedAt: search.synced })),
    leads: seedLeads.map((lead) => ({
      ...lead,
      normalizedLinkedInUrl: normalizeLinkedInUrl(`https://www.linkedin.com/in/${lead.name.toLowerCase().replace(/\s+/g, "-")}`),
      linkedinUrl: `https://www.linkedin.com/in/${lead.name.toLowerCase().replace(/\s+/g, "-")}`,
      campaignIds: [seedSearches.find((search) => search.name === lead.campaign)?.id ?? "agency"],
      updatedAt: now()
    })),
    activities: seedActivities,
    messages: [],
    aiPlaybook: defaultAiPlaybook(),
    aiMessageGrants: [],
    aiMemories: []
  };
}

function defaultAiPlaybook(): AiPlaybookRecord {
  return { status: "not_trained", rawNotes: "", defaultMessageTypes, updatedAt: now() };
}

export function readDb(): LocalDb {
  if (!existsSync(dbPath)) return seedDb();
  const parsed = JSON.parse(readFileSync(dbPath, "utf8")) as Partial<LocalDb>;
  return { ...seedDb(), ...parsed, aiPlaybook: parsed.aiPlaybook ?? defaultAiPlaybook(), aiMessageGrants: parsed.aiMessageGrants ?? [], aiMemories: parsed.aiMemories ?? [] };
}

export function writeDb(db: LocalDb) {
  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function ensureWorkspace() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("workspaces").upsert({ id: workspaceId, name: "Reachlyst Demo Workspace" }, { onConflict: "id" });
}

function matchingSeed(url: string) {
  const decoded = decodeURIComponent(url).toLowerCase();
  return seedSearches.find((search) =>
    (decoded.includes("marketing agency") && search.id === "agency") ||
    (decoded.includes("saas") && search.id === "saas-founders") ||
    (decoded.includes("revops") && search.id === "revops")
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  if (hasSupabase()) return getSupabaseDashboardData();
  const db = readDb();
  const searches = db.searches.map((search) => {
    const searchLeads = db.leads.filter((lead) => lead.campaignIds.includes(search.id));
    return {
      ...search,
      leads: searchLeads.length,
      good: searchLeads.filter((lead) => lead.status === "good_fit").length,
      invited: searchLeads.filter((lead) => ["invite_likely_sent", "invite_sent"].includes(lead.status)).length,
      replied: searchLeads.filter((lead) => lead.status === "replied").length,
      synced: search.lastSyncedAt ?? search.synced
    };
  });
  return { searches, leads: db.leads, activities: db.activities, messages: db.messages };
}

export async function getAiPlaybook(): Promise<AiPlaybookRecord> {
  if (hasSupabase()) return getSupabaseAiPlaybook();
  return readDb().aiPlaybook;
}

export async function saveAiPlaybook(input: Partial<AiPlaybookRecord> & { rawNotes: string }): Promise<AiPlaybookRecord> {
  const record: AiPlaybookRecord = {
    ...defaultAiPlaybook(),
    ...input,
    rawNotes: sanitizeText(input.rawNotes).slice(0, 8000),
    status: input.status ?? "ready",
    defaultMessageTypes: input.defaultMessageTypes?.length ? input.defaultMessageTypes : defaultMessageTypes,
    updatedAt: now()
  };
  if (hasSupabase()) {
    const saved = await saveSupabaseAiPlaybook(record);
    await learnAiMemoriesFromPlaybook(saved).catch(() => undefined);
    return saved;
  }
  const db = readDb();
  db.aiPlaybook = record;
  db.activities.unshift({ label: "AI Playbook updated", time: "Just now", type: "ai_playbook_updated", createdAt: now() });
  writeDb(db);
  await learnAiMemoriesFromPlaybook(record).catch(() => undefined);
  return record;
}

export async function resetAiPlaybook(): Promise<AiPlaybookRecord> {
  const record = defaultAiPlaybook();
  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    await ensureWorkspace();
    await supabase?.from("ai_playbooks").delete().eq("workspace_id", workspaceId);
    await supabase?.from("activities").insert({ workspace_id: workspaceId, type: "ai_playbook_reset", metadata: { label: "AI Playbook reset" } });
    return record;
  }
  const db = readDb();
  db.aiPlaybook = record;
  db.activities.unshift({ label: "AI Playbook reset", time: "Just now", type: "ai_playbook_reset", createdAt: now() });
  writeDb(db);
  return record;
}

export function formatAiPlaybookContext(playbook: AiPlaybookRecord) {
  if (playbook.status !== "ready" || !playbook.rawNotes.trim()) return "";
  return [
    "Reachlyst AI Playbook:",
    playbook.rawNotes,
    playbook.offer ? `Offer: ${playbook.offer}` : "",
    playbook.icp ? `ICP: ${playbook.icp}` : "",
    playbook.tone ? `Preferred tone: ${playbook.tone}` : "",
    playbook.cta ? `CTA: ${playbook.cta}` : "",
    playbook.defaultMessageTypes.length ? `Default message types: ${playbook.defaultMessageTypes.join(", ")}` : "",
    "Use this Playbook as the primary outreach strategy. Still rely only on visible LinkedIn page context for personalization."
  ].filter(Boolean).join("\n");
}

function contentHash(value: string) {
  return createHash("sha1").update(value.trim().toLowerCase()).digest("hex");
}

function memoryId(category: AiMemoryCategory, content: string) {
  return stableUuid(`${category}:${contentHash(content)}`);
}

function sectionFromPlaybook(rawNotes: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = rawNotes.match(new RegExp(`${escaped}:\\s*([\\s\\S]*?)(?=\\n\\n(?:Offer|ICP|Buying signals|Tone|CTA):|$)`, "i"));
  return sanitizeText(match?.[1] ?? "").slice(0, 1800);
}

function memoryFromPlaybook(playbook: AiPlaybookRecord): Array<Omit<AiMemoryRecord, "id" | "createdAt" | "updatedAt">> {
  const rawNotes = playbook.rawNotes;
  const memories = [
    { category: "offer" as const, source: "ai_playbook", content: playbook.offer || sectionFromPlaybook(rawNotes, "Offer") },
    { category: "icp" as const, source: "ai_playbook", content: playbook.icp || sectionFromPlaybook(rawNotes, "ICP") },
    { category: "buying_signals" as const, source: "ai_playbook", content: sectionFromPlaybook(rawNotes, "Buying signals") },
    { category: "tone" as const, source: "ai_playbook", content: playbook.tone || sectionFromPlaybook(rawNotes, "Tone") },
    { category: "cta" as const, source: "ai_playbook", content: playbook.cta || sectionFromPlaybook(rawNotes, "CTA") }
  ];
  return memories
    .map((memory) => ({ ...memory, content: sanitizeText(memory.content).slice(0, 1800) }))
    .filter((memory) => memory.content.length >= 12);
}

export async function getAiMemories(limit = 80): Promise<AiMemoryRecord[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      ?.from("ai_memories")
      .select("id,category,content,source,created_at,updated_at")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(limit) ?? { data: [], error: null };
    if (error) return [];
    return (data ?? []).map((memory: any) => ({
      id: memory.id,
      category: memory.category,
      content: memory.content ?? "",
      source: memory.source ?? "manual",
      createdAt: memory.created_at ?? now(),
      updatedAt: memory.updated_at ?? memory.created_at ?? now()
    }));
  }
  return readDb().aiMemories
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export async function getSemanticAiMemories(query: string, limit = 8): Promise<AiMemoryRecord[]> {
  if (!hasSupabase()) return [];
  const embedding = await createEmbedding(query);
  if (!embedding?.length) return [];

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase?.rpc("match_ai_memories", {
    target_workspace: workspaceId,
    query_embedding: embedding,
    match_count: limit,
    min_similarity: 0.12
  }) ?? { data: [], error: null };
  if (error) return [];

  return (data ?? []).map((memory: any) => ({
    id: memory.id,
    category: memory.category,
    content: memory.content ?? "",
    source: memory.source ?? "manual",
    createdAt: memory.created_at ?? now(),
    updatedAt: memory.updated_at ?? memory.created_at ?? now()
  }));
}

export async function rememberAiMemory(input: Omit<AiMemoryRecord, "id" | "createdAt" | "updatedAt">) {
  const content = sanitizeText(input.content).slice(0, 1800);
  if (content.length < 12) return null;
  const category = input.category;
  const hash = contentHash(content);
  const id = memoryId(category, content);
  const timestamp = now();

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const embedding = await createEmbedding(content);
    const { error } = await supabase?.from("ai_memories").upsert({
      id,
      workspace_id: workspaceId,
      category,
      content,
      source: input.source,
      content_hash: hash,
      ...(embedding?.length ? { embedding } : {}),
      updated_at: timestamp
    }, { onConflict: "workspace_id,content_hash" }) ?? { error: null };
    if (error) return null;
    return { id, category, content, source: input.source, createdAt: timestamp, updatedAt: timestamp };
  }

  const db = readDb();
  const existingIndex = db.aiMemories.findIndex((memory) => contentHash(memory.content) === hash);
  const record: AiMemoryRecord = existingIndex >= 0
    ? { ...db.aiMemories[existingIndex], category, content, source: input.source, updatedAt: timestamp }
    : { id, category, content, source: input.source, createdAt: timestamp, updatedAt: timestamp };
  if (existingIndex >= 0) db.aiMemories[existingIndex] = record;
  else db.aiMemories.unshift(record);
  db.aiMemories = db.aiMemories.slice(0, 200);
  writeDb(db);
  return record;
}

export async function learnAiMemoriesFromPlaybook(playbook: AiPlaybookRecord) {
  if (playbook.status !== "ready" || !playbook.rawNotes.trim()) return [];
  const memories = memoryFromPlaybook(playbook);
  const saved = await Promise.all(memories.map((memory) => rememberAiMemory(memory)));
  return saved.filter(Boolean);
}

export async function applyAiPlaybookToLeadInput<T extends Record<string, unknown>>(input: T): Promise<T> {
  const playbook = await getAiPlaybook();
  const playbookContext = formatAiPlaybookContext(playbook);
  if (!playbookContext) return input;
  const existingContext = typeof input.campaignContext === "string" ? input.campaignContext : "";
  return {
    ...input,
    campaignContext: [playbookContext, existingContext].filter(Boolean).join("\n\n"),
    tone: typeof input.tone === "string" && input.tone.trim() ? input.tone : playbook.tone ?? "Professional, concise, human",
    useCase: typeof input.useCase === "string" && input.useCase.trim() ? input.useCase : "sales_navigator_outreach"
  };
}

async function getSupabaseAiPlaybook(): Promise<AiPlaybookRecord> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return defaultAiPlaybook();
  await ensureWorkspace();
  const { data } = await supabase.from("ai_playbooks").select("*").eq("workspace_id", workspaceId).maybeSingle();
  if (!data) return defaultAiPlaybook();
  return {
    status: data.status === "ready" ? "ready" : "not_trained",
    rawNotes: data.raw_notes ?? "",
    offer: data.offer ?? undefined,
    icp: data.icp ?? undefined,
    exclusions: data.exclusions ?? undefined,
    tone: data.tone ?? undefined,
    cta: data.cta ?? undefined,
    defaultMessageTypes: Array.isArray(data.default_message_types) && data.default_message_types.length ? data.default_message_types : defaultMessageTypes,
    updatedAt: data.updated_at ?? undefined
  };
}

async function saveSupabaseAiPlaybook(playbook: AiPlaybookRecord): Promise<AiPlaybookRecord> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return playbook;
  await ensureWorkspace();
  await supabase.from("ai_playbooks").upsert({
    workspace_id: workspaceId,
    status: playbook.status,
    raw_notes: playbook.rawNotes,
    offer: playbook.offer ?? null,
    icp: playbook.icp ?? null,
    exclusions: playbook.exclusions ?? null,
    tone: playbook.tone ?? null,
    cta: playbook.cta ?? null,
    default_message_types: playbook.defaultMessageTypes,
    updated_at: playbook.updatedAt ?? now()
  }, { onConflict: "workspace_id" });
  await supabase.from("activities").insert({ workspace_id: workspaceId, type: "note_added", metadata: { label: "AI Playbook updated" } });
  return playbook;
}

async function getSupabaseDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return seedDb();
  await ensureWorkspace();
  const [campaignsResult, leadsResult, linksResult, analysesResult, generatedResult, activitiesResult, messagesResult] = await Promise.all([
    supabase.from("search_campaigns").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("leads").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }),
    supabase.from("lead_campaigns").select("*"),
    supabase.from("ai_analyses").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("generated_messages").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("activities").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
    supabase.from("linkedin_messages").select("*").eq("workspace_id", workspaceId).order("synced_at", { ascending: false }).limit(100)
  ]);
  const campaigns = campaignsResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const links = linksResult.data ?? [];
  const analyses = analysesResult.data ?? [];
  const generated = generatedResult.data ?? [];
  const activities = activitiesResult.data ?? [];
  const messages = messagesResult.data ?? [];

  const uiLeads: LeadRecord[] = leads.map((lead: any) => {
    const leadLinks = links.filter((link: any) => link.lead_id === lead.id);
    const latestAnalysis = analyses.find((analysis: any) => analysis.lead_id === lead.id);
    const latestMessage = generated.find((message: any) => message.lead_id === lead.id);
    const campaign = campaigns.find((item: any) => leadLinks.some((link: any) => link.search_campaign_id === item.id));
    return {
      id: lead.id,
      name: lead.name,
      title: lead.title,
      company: lead.company,
      location: lead.location,
      snippet: lead.snippet,
      linkedinUrl: lead.linkedin_url,
      salesNavigatorUrl: lead.sales_navigator_url,
      normalizedLinkedInUrl: lead.normalized_linkedin_url,
      status: lead.status,
      campaignIds: leadLinks.map((link: any) => link.search_campaign_id),
      campaign: campaign?.name,
      aiReason: latestAnalysis?.reason,
      aiConfidence: latestAnalysis?.confidence,
      generatedMessage: latestMessage?.body,
      updatedAt: lead.updated_at
    };
  });

  const searches = campaigns.map((campaign: any) => {
    const campaignLeads = uiLeads.filter((lead) => lead.campaignIds.includes(campaign.id));
    return {
      id: campaign.id,
      name: campaign.name,
      url: campaign.sales_navigator_url,
      created: campaign.created_at?.slice(0, 10),
      synced: campaign.last_synced_at?.slice(0, 10),
      lastSyncedAt: campaign.last_synced_at,
      leads: campaignLeads.length,
      good: campaignLeads.filter((lead) => lead.status === "good_fit").length,
      invited: campaignLeads.filter((lead) => ["invite_likely_sent", "invite_sent"].includes(lead.status)).length,
      replied: campaignLeads.filter((lead) => lead.status === "replied").length,
      aiUseCase: campaign.ai_use_case,
      aiIcp: campaign.ai_icp,
      aiOffer: campaign.ai_offer,
      aiTone: campaign.ai_tone,
      aiInstructions: campaign.ai_instructions
    };
  });

  return {
    searches,
    leads: uiLeads,
    activities: activities.map((activity: any) => ({ label: activity.type.replaceAll("_", " "), time: "Just now", type: activity.type, leadId: activity.lead_id, searchId: activity.search_campaign_id, createdAt: activity.created_at })),
    messages: messages.map((message: any) => ({ id: message.id, leadId: message.lead_id, senderType: message.sender_type, body: message.body, source: message.source, syncedAt: message.synced_at }))
  };
}

export async function upsertSearch(input: { id?: string; name?: string; url: string; aiPlaybook?: Partial<SearchRecord> }): Promise<SearchRecord> {
  if (hasSupabase()) return upsertSupabaseSearch(input);
  const db = readDb();
  const seededMatch = matchingSeed(input.url);
  const id = input.id ?? seededMatch?.id ?? `search-${Math.abs(hash(input.url))}`;
  const existing = db.searches.find((search) => search.id === id || search.url === input.url);
  const base = seededMatch ?? existing;
  const record: SearchRecord = { ...(base as SearchRecord), id, name: input.name || base?.name || "Sales Navigator search", url: input.url, created: base?.created ?? now().slice(0, 10), synced: now().slice(0, 10), lastSyncedAt: now(), leads: base?.leads ?? 0, good: base?.good ?? 0, invited: base?.invited ?? 0, replied: base?.replied ?? 0 };
  if (existing) db.searches[db.searches.indexOf(existing)] = record;
  else db.searches.unshift(record);
  db.activities.unshift({ label: `Search synced: ${record.name}`, time: "Just now", type: "search_detected", searchId: record.id, createdAt: now() });
  writeDb(db);
  return record;
}

async function upsertSupabaseSearch(input: { id?: string; name?: string; url: string }): Promise<SearchRecord> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return upsertSearch(input);
  await ensureWorkspace();
  const seed = matchingSeed(input.url);
  const id = stableUuid(input.id ?? seed?.id ?? input.url);
  const record = {
    id,
    workspace_id: workspaceId,
    name: input.name || seed?.name || "Sales Navigator search",
    sales_navigator_url: input.url,
    ai_use_case: seed?.aiUseCase ?? "sales_outreach",
    ai_icp: seed?.aiIcp,
    ai_offer: seed?.aiOffer,
    ai_tone: seed?.aiTone,
    ai_instructions: seed?.aiInstructions,
    last_synced_at: now()
  };
  await supabase.from("search_campaigns").upsert(record, { onConflict: "id" });
  await supabase.from("activities").insert({ workspace_id: workspaceId, search_campaign_id: id, type: "search_detected" });
  return { id, name: record.name, url: input.url, aiUseCase: record.ai_use_case, aiIcp: record.ai_icp ?? "", aiOffer: record.ai_offer ?? "", aiTone: record.ai_tone ?? "", aiInstructions: record.ai_instructions ?? "", created: now().slice(0, 10), synced: now().slice(0, 10), leads: 0, good: 0, invited: 0, replied: 0 };
}

export async function importLeads(searchId: string, rawLeads: Array<Record<string, unknown>>): Promise<LeadRecord[]> {
  if (hasSupabase()) return importSupabaseLeads(searchId, rawLeads);
  const db = readDb();
  const campaign = db.searches.find((search) => search.id === searchId);
  const imported: LeadRecord[] = [];
  for (const raw of rawLeads) {
    const name = sanitizeText(raw.name);
    if (!name) continue;
    const normalizedLinkedInUrl = normalizeLinkedInUrl(String(raw.linkedinUrl ?? raw.salesNavigatorUrl ?? name));
    const existing = db.leads.find((lead) => lead.normalizedLinkedInUrl === normalizedLinkedInUrl);
    const record: LeadRecord = { id: existing?.id ?? `lead-${Math.abs(hash(normalizedLinkedInUrl))}`, name, title: sanitizeText(raw.title) || existing?.title, company: sanitizeText(raw.company) || existing?.company, location: sanitizeText(raw.location) || existing?.location, snippet: sanitizeText(raw.about ?? raw.snippet) || existing?.snippet, linkedinUrl: sanitizeText(raw.linkedinUrl) || existing?.linkedinUrl, salesNavigatorUrl: sanitizeText(raw.salesNavigatorUrl) || existing?.salesNavigatorUrl, normalizedLinkedInUrl, status: existing?.status ?? "new", campaignIds: Array.from(new Set([...(existing?.campaignIds ?? []), searchId])), campaign: campaign?.name ?? existing?.campaign, aiReason: existing?.aiReason, aiConfidence: existing?.aiConfidence, generatedMessage: existing?.generatedMessage, updatedAt: now() };
    if (existing) db.leads[db.leads.indexOf(existing)] = record;
    else db.leads.unshift(record);
    imported.push(record);
  }
  const search = db.searches.find((item) => item.id === searchId);
  if (search) search.lastSyncedAt = now();
  if (imported.length) db.activities.unshift({ label: `Imported ${imported.length} visible leads`, time: "Just now", type: "lead_imported", searchId, createdAt: now() });
  writeDb(db);
  return imported;
}

async function importSupabaseLeads(searchId: string, rawLeads: Array<Record<string, unknown>>): Promise<LeadRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return importLeads(searchId, rawLeads);
  await ensureWorkspace();
  const imported: LeadRecord[] = [];
  for (const raw of rawLeads) {
    const name = sanitizeText(raw.name);
    if (!name) continue;
    const normalized = normalizeLinkedInUrl(String(raw.linkedinUrl ?? raw.salesNavigatorUrl ?? name));
    const id = stableUuid(normalized);
    const lead = { id, workspace_id: workspaceId, normalized_linkedin_url: normalized, linkedin_url: sanitizeText(raw.linkedinUrl) || null, sales_navigator_url: sanitizeText(raw.salesNavigatorUrl) || null, name, title: sanitizeText(raw.title) || null, company: sanitizeText(raw.company) || null, location: sanitizeText(raw.location) || null, updated_at: now() };
    await supabase.from("leads").upsert(lead, { onConflict: "workspace_id,normalized_linkedin_url" });
    await supabase.from("lead_campaigns").upsert({ lead_id: id, search_campaign_id: searchId }, { onConflict: "lead_id,search_campaign_id" });
    imported.push({ id, name, title: lead.title ?? undefined, company: lead.company ?? undefined, location: lead.location ?? undefined, snippet: sanitizeText(raw.about ?? raw.snippet) || undefined, linkedinUrl: lead.linkedin_url ?? undefined, salesNavigatorUrl: lead.sales_navigator_url ?? undefined, normalizedLinkedInUrl: normalized, status: "new", campaignIds: [searchId], updatedAt: lead.updated_at });
  }
  if (imported.length) await supabase.from("activities").insert({ workspace_id: workspaceId, search_campaign_id: searchId, type: "lead_imported", metadata: { count: imported.length } });
  await supabase.from("search_campaigns").update({ last_synced_at: now() }).eq("id", searchId);
  return imported;
}

export async function saveAnalysis(input: Record<string, unknown>, result: { fit?: LeadStatus; reason?: string; confidence?: number; suggestedConnectionMessage?: string }) {
  if (hasSupabase()) return saveSupabaseAnalysis(input, result);
  const db = readDb();
  const key = normalizeLinkedInUrl(String(input.linkedinUrl ?? input.salesNavigatorUrl ?? input.name));
  const lead = db.leads.find((item) => item.normalizedLinkedInUrl === key || item.name === input.name);
  if (lead) {
    lead.status = result.fit ?? lead.status;
    lead.aiReason = result.reason;
    lead.aiConfidence = result.confidence;
    lead.generatedMessage = result.suggestedConnectionMessage;
    lead.updatedAt = now();
    db.activities.unshift({ label: `AI analyzed ${lead.name}: ${lead.status}`, time: "Just now", type: "ai_analyzed", leadId: lead.id, createdAt: now() });
    writeDb(db);
  }
}

async function saveSupabaseAnalysis(input: Record<string, unknown>, result: { fit?: LeadStatus; reason?: string; confidence?: number; suggestedConnectionMessage?: string }) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const key = normalizeLinkedInUrl(String(input.linkedinUrl ?? input.salesNavigatorUrl ?? input.name));
  const id = stableUuid(key);
  await supabase.from("leads").update({ status: result.fit ?? "new", updated_at: now() }).eq("id", id);
  await supabase.from("ai_analyses").insert({ workspace_id: workspaceId, lead_id: id, fit: result.fit ?? "maybe", reason: result.reason, confidence: result.confidence, model: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock" });
  if (result.suggestedConnectionMessage) await supabase.from("generated_messages").insert({ workspace_id: workspaceId, lead_id: id, message_type: "invite", body: result.suggestedConnectionMessage });
  await supabase.from("activities").insert({ workspace_id: workspaceId, lead_id: id, type: "ai_analyzed" });
}

export async function saveGeneratedMessage(input: Record<string, unknown>, message: string) {
  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const id = stableUuid(normalizeLinkedInUrl(String(input.linkedinUrl ?? input.salesNavigatorUrl ?? input.name)));
    await supabase?.from("generated_messages").insert({ workspace_id: workspaceId, lead_id: id, message_type: "invite", body: message });
    await supabase?.from("activities").insert({ workspace_id: workspaceId, lead_id: id, type: "message_generated" });
    return;
  }
  const db = readDb();
  const key = normalizeLinkedInUrl(String(input.linkedinUrl ?? input.salesNavigatorUrl ?? input.name));
  const lead = db.leads.find((item) => item.normalizedLinkedInUrl === key || item.name === input.name);
  if (lead) {
    lead.generatedMessage = message;
    lead.updatedAt = now();
    db.activities.unshift({ label: `Generated message for ${lead.name}`, time: "Just now", type: "message_generated", leadId: lead.id, createdAt: now() });
    writeDb(db);
  }
}

export async function recordAiUsage(type: "ai_analyzed" | "message_generated" = "message_generated") {
  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    await supabase?.from("activities").insert({ workspace_id: workspaceId, type });
    return;
  }
  const db = readDb();
  db.activities.unshift({ label: type.replaceAll("_", " "), time: "Just now", type, createdAt: now() });
  writeDb(db);
}

export async function grantAiMessages(input: { userId: string; amount: number; note?: string }): Promise<AiMessageGrantRecord> {
  const amount = Math.max(0, Math.floor(Number(input.amount)));
  const record: AiMessageGrantRecord = {
    id: stableUuid(`ai-message-grant-${input.userId}-${amount}-${now()}-${input.note ?? ""}`),
    userId: input.userId,
    amount,
    note: sanitizeText(input.note ?? "").slice(0, 240) || undefined,
    createdAt: now()
  };

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    await supabase?.from("activities").insert({
      workspace_id: workspaceId,
      type: "ai_messages_granted",
      metadata: { userId: record.userId, amount: record.amount, note: record.note }
    });
    return record;
  }

  const db = readDb();
  db.aiMessageGrants.unshift(record);
  db.activities.unshift({ label: `Granted ${record.amount} AI messages`, time: "Just now", type: "ai_messages_granted", createdAt: record.createdAt });
  writeDb(db);
  return record;
}

export async function getAiMessageGrantTotalsByUser(): Promise<Record<string, number>> {
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const totals: Record<string, number> = {};

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const result = supabase
      ? await supabase.from("activities").select("metadata,created_at").eq("workspace_id", workspaceId).eq("type", "ai_messages_granted")
      : { data: [] };
    const data = result.data ?? [];
    for (const item of data ?? []) {
      if (!String(item.created_at ?? "").startsWith(monthPrefix)) continue;
      const metadata = item.metadata as { userId?: string; amount?: number } | null;
      const userId = metadata?.userId;
      const amount = Number(metadata?.amount ?? 0);
      if (userId && amount > 0) totals[userId] = (totals[userId] ?? 0) + amount;
    }
    return totals;
  }

  for (const grant of readDb().aiMessageGrants) {
    if (!grant.createdAt.startsWith(monthPrefix)) continue;
    totals[grant.userId] = (totals[grant.userId] ?? 0) + grant.amount;
  }
  return totals;
}

export async function getGrantedAiMessages(userId?: string): Promise<number> {
  const totals = await getAiMessageGrantTotalsByUser();
  if (userId) return totals[userId] ?? 0;
  return Object.values(totals).reduce((total, amount) => total + amount, 0);
}

export async function saveLeadAction(leadId: string, action: string, metadata: Record<string, unknown> = {}) {
  const message = sanitizeText(metadata.message);
  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const status = action === "message_copied" ? "copied" : action === "invite_likely_sent" ? "invite_likely_sent" : action === "invite_confirmed_if_detected" ? "invite_sent" : action === "skipped" ? "skip" : undefined;
    if (status) await supabase?.from("leads").update({ status, updated_at: now() }).eq("id", leadId);
    if (message) await supabase?.from("generated_messages").insert({ workspace_id: workspaceId, lead_id: leadId, message_type: action === "invite_likely_sent" ? "invite_used" : "invite", body: message, copied_at: action === "message_copied" ? now() : null });
    await supabase?.from("activities").insert({ workspace_id: workspaceId, lead_id: leadId, type: action, metadata });
    return;
  }
  const db = readDb();
  const lead = db.leads.find((item) => item.id === leadId || item.name === leadId || item.normalizedLinkedInUrl === normalizeLinkedInUrl(leadId));
  if (lead) {
    if (action === "message_copied") lead.status = "copied";
    if (action === "invite_likely_sent") lead.status = "invite_likely_sent";
    if (action === "invite_confirmed_if_detected") lead.status = "invite_sent";
    if (action === "skipped") lead.status = "skip";
    if (message) lead.generatedMessage = message;
    lead.updatedAt = now();
  }
  db.activities.unshift({ label: `${action.replaceAll("_", " ")}${lead ? `: ${lead.name}` : ""}`, time: "Just now", type: action, leadId: lead?.id ?? leadId, createdAt: now() });
  writeDb(db);
}

export async function saveThread(input: { leadId?: string; threadUrl?: string; source: string; messages: Array<{ senderType: string; body: string; sentAt?: string }> }) {
  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    for (const message of input.messages) await supabase?.from("linkedin_messages").insert({ workspace_id: workspaceId, lead_id: input.leadId, sender_type: message.senderType, body: sanitizeText(message.body), sent_at: message.sentAt, source: input.source });
    await supabase?.from("activities").insert({ workspace_id: workspaceId, lead_id: input.leadId, type: "message_thread_synced", metadata: { count: input.messages.length, threadUrl: input.threadUrl } });
    return;
  }
  const db = readDb();
  const syncedAt = now();
  for (const message of input.messages) db.messages.push({ id: `msg-${Math.abs(hash(`${input.threadUrl}-${message.body}-${syncedAt}`))}`, leadId: input.leadId, threadUrl: input.threadUrl, senderType: message.senderType, body: sanitizeText(message.body), source: input.source, syncedAt });
  db.activities.unshift({ label: `Synced ${input.messages.length} visible messages`, time: "Just now", type: "message_thread_synced", leadId: input.leadId, createdAt: syncedAt });
  writeDb(db);
}

function hash(value: string) {
  let hashValue = 0;
  for (let index = 0; index < value.length; index += 1) hashValue = ((hashValue << 5) - hashValue + value.charCodeAt(index)) | 0;
  return hashValue;
}

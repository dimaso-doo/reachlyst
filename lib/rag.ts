import { formatAiPlaybookContext, getAiMemories, getAiPlaybook, getDashboardData, getSemanticAiMemories, learnAiMemoriesFromPlaybook } from "@/lib/store";

type RagCandidate = {
  type: "memory" | "playbook" | "search" | "lead" | "message" | "activity";
  title: string;
  content: string;
  score: number;
};

export type ReachlystRagInput = {
  query: string;
  limit?: number;
  searchName?: string;
  leadName?: string;
  leadCompany?: string;
};

const stopWords = new Set([
  "and", "the", "for", "with", "that", "this", "you", "your", "from", "about", "into", "what", "when", "where",
  "kako", "sta", "sto", "sve", "ovo", "ono", "meni", "mene", "koji", "koje", "koja", "lead", "chat", "ai"
]);

function compact(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function textFrom(parts: Array<unknown>) {
  return parts.map(compact).filter(Boolean).join("\n");
}

function tokenize(text: string) {
  return Array.from(new Set(
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !stopWords.has(token))
  ));
}

function scoreText(queryTokens: string[], text: string, boosts: string[] = []) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (lower.includes(token)) score += token.length > 5 ? 2 : 1;
  }
  for (const boost of boosts.map((item) => item.toLowerCase()).filter(Boolean)) {
    if (lower.includes(boost)) score += 8;
  }
  return score;
}

function truncate(text: string, limit: number) {
  const clean = compact(text);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).trim()}...`;
}

function field(record: unknown, key: string) {
  if (!record || typeof record !== "object") return "";
  const value = (record as Record<string, unknown>)[key];
  return compact(value);
}

export async function buildReachlystRagContext(input: ReachlystRagInput) {
  const query = compact(input.query);
  const queryTokens = tokenize([
    query,
    input.searchName,
    input.leadName,
    input.leadCompany
  ].filter(Boolean).join(" "));

  const [playbook, dashboard, initialMemories, semanticMemories] = await Promise.all([getAiPlaybook(), getDashboardData(), getAiMemories(), getSemanticAiMemories(query, input.limit ?? 8)]);
  const learnedMemories = initialMemories.length || playbook.status !== "ready"
    ? initialMemories
    : await learnAiMemoriesFromPlaybook(playbook).then(() => getAiMemories()).catch(() => initialMemories);
  const semanticIds = new Set(semanticMemories.map((memory) => memory.id));
  const memories = [
    ...semanticMemories,
    ...learnedMemories.filter((memory) => !semanticIds.has(memory.id))
  ];
  const candidates: RagCandidate[] = [];
  const boosts = [input.searchName, input.leadName, input.leadCompany].map(compact).filter(Boolean);
  const playbookContext = formatAiPlaybookContext(playbook);

  if (playbook.rawNotes.trim() || playbookContext) {
    const content = playbookContext || textFrom([
      "Reachlyst AI Playbook draft:",
      playbook.rawNotes,
      playbook.offer ? `Offer: ${playbook.offer}` : "",
      playbook.icp ? `ICP: ${playbook.icp}` : "",
      playbook.tone ? `Tone: ${playbook.tone}` : "",
      playbook.cta ? `CTA: ${playbook.cta}` : ""
    ]);
    candidates.push({
      type: "playbook",
      title: "AI Playbook",
      content,
      score: 6 + scoreText(queryTokens, content, boosts)
    });
  }

  for (const memory of memories) {
    const content = textFrom([
      `Memory category: ${memory.category}`,
      `Source: ${memory.source}`,
      memory.content,
      memory.updatedAt ? `Updated: ${memory.updatedAt}` : ""
    ]);
    candidates.push({
      type: "memory",
      title: memory.category.replace(/_/g, " "),
      content,
      score: (semanticIds.has(memory.id) ? 18 : 9) + scoreText(queryTokens, content, boosts)
    });
  }

  for (const search of dashboard.searches) {
    const content = textFrom([
      `Search: ${field(search, "name")}`,
      `Sales Navigator URL: ${field(search, "url")}`,
      field(search, "aiUseCase") ? `Use case: ${field(search, "aiUseCase")}` : "",
      field(search, "aiIcp") ? `ICP: ${field(search, "aiIcp")}` : "",
      field(search, "aiOffer") ? `Offer: ${field(search, "aiOffer")}` : "",
      field(search, "aiTone") ? `Tone: ${field(search, "aiTone")}` : "",
      field(search, "aiInstructions") ? `Instructions: ${field(search, "aiInstructions")}` : "",
      field(search, "synced") ? `Last synced: ${field(search, "synced")}` : "",
      `Counts: ${field(search, "leads") || "0"} leads, ${field(search, "good") || "0"} good fits, ${field(search, "replied") || "0"} replies`
    ]);
    candidates.push({
      type: "search",
      title: field(search, "name") || "Sales Navigator search",
      content,
      score: scoreText(queryTokens, content, boosts)
    });
  }

  for (const lead of dashboard.leads) {
    const content = textFrom([
      `Lead: ${field(lead, "name")}`,
      [field(lead, "title"), field(lead, "company")].filter(Boolean).join(" at "),
      field(lead, "location") ? `Location: ${field(lead, "location")}` : "",
      field(lead, "campaign") ? `Search/Campaign: ${field(lead, "campaign")}` : "",
      field(lead, "status") ? `Status: ${field(lead, "status")}` : "",
      field(lead, "snippet") ? `Visible context: ${field(lead, "snippet")}` : "",
      field(lead, "aiReason") ? `AI fit reason: ${field(lead, "aiReason")}` : "",
      field(lead, "generatedMessage") ? `Latest generated message: ${field(lead, "generatedMessage")}` : ""
    ]);
    candidates.push({
      type: "lead",
      title: field(lead, "name") || "Lead",
      content,
      score: scoreText(queryTokens, content, boosts)
    });
  }

  const leadLookup = new Map(dashboard.leads.map((lead) => [field(lead, "id"), lead]));
  for (const message of dashboard.messages) {
    const lead = leadLookup.get(field(message, "leadId"));
    const leadTitle = lead ? [field(lead, "name"), field(lead, "company")].filter(Boolean).join(" - ") : "";
    const content = textFrom([
      leadTitle ? `Lead: ${leadTitle}` : "",
      `Sender: ${field(message, "senderType") || "unknown"}`,
      field(message, "body") ? `Message: ${field(message, "body")}` : "",
      field(message, "threadUrl") ? `Thread URL: ${field(message, "threadUrl")}` : "",
      field(message, "source") ? `Source: ${field(message, "source")}` : "",
      field(message, "syncedAt") ? `Synced: ${field(message, "syncedAt")}` : ""
    ]);
    candidates.push({
      type: "message",
      title: leadTitle || "LinkedIn message thread",
      content,
      score: scoreText(queryTokens, content, boosts)
    });
  }

  for (const activity of dashboard.activities.slice(0, 20)) {
    const content = textFrom([
      field(activity, "label"),
      field(activity, "type") ? `Type: ${field(activity, "type")}` : "",
      field(activity, "createdAt") ? `Created: ${field(activity, "createdAt")}` : ""
    ]);
    candidates.push({
      type: "activity",
      title: field(activity, "label") || "Recent activity",
      content,
      score: Math.max(0, scoreText(queryTokens, content, boosts) - 2)
    });
  }

  const selected = candidates
    .filter((candidate) => candidate.content && (candidate.score > 0 || candidate.type === "playbook" || candidate.type === "memory"))
    .sort((a, b) => b.score - a.score)
    .slice(0, input.limit ?? 8);

  if (!selected.length) return "";

  const lines = selected.map((candidate, index) =>
    `${index + 1}. [${candidate.type}: ${candidate.title}] ${truncate(candidate.content, 900)}`
  );

  return [
    "Retrieved Reachlyst workspace context (RAG). Use this as background memory, not as a script.",
    "Prefer semantic AI memories and the AI Playbook when they conflict with older lead/search notes. Do not invent personal details beyond visible context.",
    ...lines
  ].join("\n\n").slice(0, 7000);
}

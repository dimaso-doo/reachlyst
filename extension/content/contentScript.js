const EXTENSION_VERSION = "0.1.0";
const PARSER_VERSION = "2026.06.25";
const DEFAULT_SETTINGS = {
  reachlystApiBase: "https://reachlyst.com",
  reachlystToken: "reachlyst-browser-session",
  reachlystUseCase: "sales_outreach",
  reachlystIcp: "Sales Navigator leads that match the active Reachlyst search playbook.",
  reachlystTone: "Professional, concise, human, non-spammy",
  reachlystEnabled: false
};
const analyzedLeads = new Map();
const inFlightAnalyses = new Set();
const regenerationCounts = new Map();
const MAX_ANALYSES_PER_SCAN = 8;
let isMutatingReachlystUi = false;
let activeSearchPlaybook = null;

async function getSettings() {
  const values = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  return { ...DEFAULT_SETTINGS, ...values };
}

async function reachlystIsEnabled() {
  const settings = await getSettings();
  return settings.reachlystEnabled === true;
}

async function reachlystApi(path, init = {}) {
  const settings = await getSettings();
  const proxied = await chrome.runtime.sendMessage({
    type: "reachlyst_api",
    path,
    method: init.method || "GET",
    headers: init.headers || {},
    body: init.body
  });
  if (!proxied?.ok) throw new Error(proxied?.error || `API error ${proxied?.status || 0}`);
  return {
    ok: proxied.ok,
    status: proxied.status,
    json: async () => JSON.parse(proxied.text || "{}"),
    text: async () => proxied.text || ""
  };
}

function setStatus(message, tone = "neutral") {
  let status = document.querySelector(".reachlyst-status");
  if (!status) {
    status = document.createElement("aside");
    status.className = "reachlyst-status";
    document.body.append(status);
  }
  status.dataset.tone = tone;
  status.textContent = message;
}

function removeReachlystUi() {
  clearTimeout(reachlystRunTimer);
  document.querySelectorAll(".reachlyst-status, .reachlyst-panel, .reachlyst-inline").forEach((element) => element.remove());
}

function showLoginNotice() {
  if (document.querySelector(".reachlyst-panel")) return;
  const panel = document.createElement("aside");
  panel.className = "reachlyst-panel";
  panel.textContent = "Please log in to LinkedIn Sales Navigator first.";
  document.body.append(panel);
}

function leadCardFromAnchor(anchor) {
  return anchor.closest('li, article, [role="listitem"], .artdeco-list__item') || anchor.parentElement;
}

function safeDomKey(value) {
  let hash = 0;
  const input = String(value || "");
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  }
  return `rly-${Math.abs(hash)}`;
}

function ensureInlineControls(anchor, lead) {
  const card = leadCardFromAnchor(anchor);
  if (!card) return null;
  const key = safeDomKey(leadKey(lead));
  let controls = card.querySelector(`.reachlyst-inline[data-reachlyst-key="${key}"]`) || card.querySelector(".reachlyst-inline");
  if (!controls) {
    isMutatingReachlystUi = true;
    controls = document.createElement("div");
    controls.className = "reachlyst-inline";
    controls.dataset.reachlystKey = key;
    controls.innerHTML = `
      <span class="reachlyst-badge" data-status="new">New</span>
      <span class="reachlyst-message">Generating invite...</span>
      <button class="reachlyst-button" data-action="copy" title="Copy suggested invite. You paste and send manually.">Copy</button>
      <button class="reachlyst-button reachlyst-button-secondary" data-action="regenerate" title="Generate a new suggested invite">Regenerate</button>
    `;
    card.append(controls);
    queueMicrotask(() => { isMutatingReachlystUi = false; });
  }
  controls.dataset.reachlystKey = key;
  controls.reachlystLead = lead;

  const copyButton = controls.querySelector('[data-action="copy"]');
  const regenerateButton = controls.querySelector('[data-action="regenerate"]');
  if (!copyButton.dataset.bound) {
    copyButton.dataset.bound = "true";
    copyButton.addEventListener("click", () => copyInviteMessage(controls.reachlystLead, copyButton));
  }
  if (!regenerateButton.dataset.bound) {
    regenerateButton.dataset.bound = "true";
    regenerateButton.addEventListener("click", () => regenerateInviteMessage(controls.reachlystLead, regenerateButton));
  }
  return controls;
}

function addBadge(anchor, status = "New", lead) {
  const controls = lead ? ensureInlineControls(anchor, lead) : leadCardFromAnchor(anchor);
  const existing = controls?.querySelector(".reachlyst-badge");
  if (existing) {
    existing.textContent = status;
    existing.dataset.status = status.toLowerCase().replace(/\s+/g, "_");
    return existing;
  }
  const badge = document.createElement("span");
  badge.className = "reachlyst-badge";
  badge.dataset.status = status.toLowerCase().replace(/\s+/g, "_");
  badge.textContent = status;
  isMutatingReachlystUi = true;
  anchor.insertAdjacentElement("afterend", badge);
  queueMicrotask(() => { isMutatingReachlystUi = false; });
  return badge;
}

function addActionButton(anchor, lead) {
  ensureInlineControls(anchor, lead);
}

function leadAnchors() {
  return Array.from(document.querySelectorAll('a[href*="/sales/lead/"], a[href*="/in/"]')).filter((anchor) => {
    const name = anchor.textContent?.replace(/\s+/g, " ").trim() || "";
    const rect = anchor.getBoundingClientRect();
    const href = anchor.href || "";
    return href.includes("/sales/lead/") && name.length > 1 && rect.width > 0 && rect.height > 0;
  });
}

function sameLead(anchor, lead) {
  const href = anchor.href || "";
  const name = anchor.textContent?.replace(/\s+/g, " ").trim() || "";
  return href === lead.salesNavigatorUrl || href === lead.linkedinUrl || name === lead.name;
}

function savedLeadResult(lead) {
  return analyzedLeads.get(leadKey(lead)) || null;
}

function savedLeadLabel(lead) {
  const result = savedLeadResult(lead);
  return result ? fitLabel(result.fit) : null;
}

function restoreLeadUi(lead) {
  const result = savedLeadResult(lead);
  if (!result) return false;
  updateLeadBadge(lead, fitLabel(result.fit));
  updateLeadMessage(lead, result.suggestedConnectionMessage);
  return true;
}

function attachLeadControls(leads) {
  const anchors = leadAnchors();
  const usedCards = new Set();
  for (const lead of leads) {
    const anchor = anchors.find((candidate) => {
      const card = leadCardFromAnchor(candidate);
      return card && !usedCards.has(card) && sameLead(candidate, lead);
    });
    if (!anchor) continue;
    usedCards.add(leadCardFromAnchor(anchor));
    addActionButton(anchor, lead);
    const restored = restoreLeadUi(lead);
    if (!restored) {
      const existingBadge = ensureInlineControls(anchor, lead)?.querySelector(".reachlyst-badge");
      const existingStatus = existingBadge?.dataset.status;
      if (!existingStatus || existingStatus === "new") addBadge(anchor, lead.statusLabel || "New", lead);
    }
  }
  return usedCards.size;
}

function updateLeadBadge(lead, status) {
  const anchor = leadAnchors().find((candidate) => sameLead(candidate, lead));
  if (anchor) addBadge(anchor, status, lead);
}

function updateLeadMessage(lead, message) {
  const anchor = leadAnchors().find((candidate) => sameLead(candidate, lead));
  if (!anchor) return;
  const controls = ensureInlineControls(anchor, lead);
  const messageEl = controls?.querySelector(".reachlyst-message");
  if (messageEl) {
    messageEl.textContent = message || "No suggestion yet";
    messageEl.title = message || "";
  }
}

function leadKey(lead) {
  const raw = lead.salesNavigatorUrl || lead.linkedinUrl || lead.name;
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return String(raw || lead.name || "").trim().toLowerCase();
  }
}

function fitLabel(fit) {
  if (fit === "good_fit") return "Good fit";
  if (fit === "maybe") return "Maybe";
  return "Skip";
}

async function leadPayload(lead, extra = {}) {
  const settings = await getSettings();
  const playbook = activeSearchPlaybook || {};
  const campaignContext = [
    `Use case: ${playbook.useCase || settings.reachlystUseCase || "sales_outreach"}`,
    `ICP: ${playbook.icp || settings.reachlystIcp || "Not configured"}`,
    `Offer: ${playbook.offer || "Not configured"}`,
    `Tone: ${playbook.tone || settings.reachlystTone || "Professional, concise, human"}`,
    `Rules: ${playbook.instructions || "Avoid fake personalization. Keep it concise."}`,
    "LinkedIn action policy: suggest copy only; user manually pastes and sends."
  ].join("\n");
  return { ...lead, campaignContext, tone: playbook.tone || settings.reachlystTone, useCase: playbook.useCase || settings.reachlystUseCase, ...extra };
}

async function analyzeLeadInline(lead) {
  const key = leadKey(lead);
  if (analyzedLeads.has(key) || inFlightAnalyses.has(key)) return;
  inFlightAnalyses.add(key);
  updateLeadBadge(lead, "Analyzing");
  updateLeadMessage(lead, "Generating invite...");
  try {
    const response = await reachlystApi("/api/extension/ai/analyze", { method: "POST", body: JSON.stringify(await leadPayload(lead)) });
    const result = await response.json();
    analyzedLeads.set(key, result);
    updateLeadBadge(lead, fitLabel(result.fit));
    updateLeadMessage(lead, result.suggestedConnectionMessage);
  } catch (error) {
    updateLeadBadge(lead, "New");
    updateLeadMessage(lead, "Could not generate. Try regenerate.");
    throw error;
  } finally {
    inFlightAnalyses.delete(key);
  }
}

function autoAnalyzeVisibleLeads(leads) {
  leads.forEach((lead) => restoreLeadUi(lead));
  const candidates = leads.filter((lead) => !savedLeadLabel(lead) && !inFlightAnalyses.has(leadKey(lead)));
  candidates.slice(0, MAX_ANALYSES_PER_SCAN).forEach((lead) => {
    analyzeLeadInline(lead).catch((error) => setStatus(`Reachlyst: ${error.message}`, "danger"));
  });
}

async function copyInviteMessage(lead, button) {
  const key = leadKey(lead);
  let result = analyzedLeads.get(key);
  if (!result) {
    button.textContent = "Wait";
    await analyzeLeadInline(lead);
    result = analyzedLeads.get(key);
  }
  const message = result?.suggestedConnectionMessage || `Hi ${lead.name.split(" ")[0]}, noticed your work${lead.company ? ` at ${lead.company}` : ""}. Thought it would be useful to connect.`;
  await navigator.clipboard.writeText(message);
  await reachlystApi("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "message_copied" }) });
  button.textContent = "Copied";
  setTimeout(() => { button.textContent = "Copy"; }, 1400);
}

async function regenerateInviteMessage(lead, button) {
  const key = leadKey(lead);
  const current = analyzedLeads.get(key) || {};
  const nextVariant = (regenerationCounts.get(key) || 0) + 1;
  regenerationCounts.set(key, nextVariant);
  button.textContent = "Generating";
  updateLeadMessage(lead, "Generating another invite...");
  const response = await reachlystApi("/api/extension/ai/generate-message", {
    method: "POST",
    body: JSON.stringify(await leadPayload(lead, { variant: nextVariant, previousMessage: current.suggestedConnectionMessage }))
  });
  const result = await response.json();
  analyzedLeads.set(key, { ...current, suggestedConnectionMessage: result.message });
  updateLeadMessage(lead, result.message);
  button.textContent = "Regenerate";
}

async function runSalesNavigator() {
  if (!(await reachlystIsEnabled())) {
    removeReachlystUi();
    return;
  }
  if (!/linkedin\.com\/sales/.test(location.href)) return;
  setStatus("Reachlyst: scanning Sales Navigator...");
  if (/login|checkpoint/.test(location.href)) return showLoginNotice();
  const detected = await reachlystApi("/api/extension/search/detect", { method: "POST", body: JSON.stringify({ url: location.href, title: document.title }) }).then((r) => r.json());
  activeSearchPlaybook = detected.aiPlaybook || null;
  const parsed = parseSalesNavigatorLeads();
  await reachlystApi("/api/extension/search/import-leads", { method: "POST", body: JSON.stringify({ searchId: detected.id, leads: parsed.leads }) });
  await reportParser("sales_search", parsed.leads.length, parsed.failures);
  const attached = attachLeadControls(parsed.leads);
  autoAnalyzeVisibleLeads(parsed.leads);
  setStatus(`Reachlyst: ${parsed.leads.length} visible leads found · ${attached} tagged`, attached ? "good" : "warn");
}

async function runMessages() {
  if (!(await reachlystIsEnabled())) {
    removeReachlystUi();
    return;
  }
  if (!/linkedin\.com\/messaging/.test(location.href)) return;
  setStatus("Reachlyst: syncing visible messages...");
  const parsed = parseVisibleMessages();
  await reachlystApi("/api/extension/messages/sync-thread", { method: "POST", body: JSON.stringify({ source: "linkedin_messages", threadUrl: location.href, messages: parsed.messages }) });
  await reportParser("linkedin_messages", parsed.messages.length, parsed.failures);
  setStatus(`Reachlyst: ${parsed.messages.length} visible messages found`, parsed.messages.length ? "good" : "warn");
}

async function reportParser(pageType, extractedCount, failures) {
  await reachlystApi("/api/extension/parser/report", { method: "POST", body: JSON.stringify({ parserVersion: PARSER_VERSION, extensionVersion: EXTENSION_VERSION, pageType, extractedCount, failures, url: location.href }) }).catch(() => undefined);
}

let reachlystRunTimer;
async function scheduleReachlystRun() {
  if (isMutatingReachlystUi) return;
  clearTimeout(reachlystRunTimer);
  if (!(await reachlystIsEnabled())) {
    removeReachlystUi();
    return;
  }
  reachlystRunTimer = setTimeout(() => {
    runSalesNavigator().catch((error) => setStatus(`Reachlyst: ${error.message}`, "danger"));
    runMessages().catch((error) => setStatus(`Reachlyst: ${error.message}`, "danger"));
  }, 500);
}

scheduleReachlystRun();
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "reachlyst_stop") {
    removeReachlystUi();
    sendResponse({ ok: true });
    return false;
  }

  if (message?.type === "reachlyst_start") {
    scheduleReachlystRun();
    sendResponse({ ok: true });
    return false;
  }

  return false;
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes.reachlystEnabled) return;
  if (changes.reachlystEnabled.newValue) scheduleReachlystRun();
  else removeReachlystUi();
});
new MutationObserver((mutations) => {
  if (mutations.every((mutation) => {
    const target = mutation.target;
    return target instanceof Element && (target.closest(".reachlyst-inline") || target.closest(".reachlyst-status"));
  })) return;
  scheduleReachlystRun();
}).observe(document.body, { childList: true, subtree: true });

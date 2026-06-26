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
const syncedMessageKeys = new Set();
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
  document.querySelectorAll(".reachlyst-status, .reachlyst-panel, .reachlyst-inline, .reachlyst-side-badge").forEach((element) => element.remove());
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
      <div class="reachlyst-inline-header">
        <span class="reachlyst-badge" data-status="new" title="AI fit reason will appear here after analysis.">New</span>
        <span class="reachlyst-reason">Waiting for AI fit reason...</span>
      </div>
      <label class="reachlyst-suggestion">
        <span>Suggested invite</span>
        <textarea class="reachlyst-message" readonly rows="2">Generating invite...</textarea>
      </label>
      <div class="reachlyst-actions">
        <button class="reachlyst-button" data-action="copy" title="Copy suggested invite. You paste and send manually.">Copy</button>
        <button class="reachlyst-button reachlyst-button-secondary" data-action="regenerate" title="Generate a new suggested invite">Regenerate</button>
        <button class="reachlyst-button reachlyst-button-secondary" data-action="ask" title="Ask AI to polish this lead's message">Ask AI</button>
        <button class="reachlyst-button reachlyst-button-secondary" data-action="invited" title="Log this lead as manually invited">Mark invited</button>
      </div>
      <div class="reachlyst-mini-chat" hidden>
        <textarea data-role="prompt" rows="2" placeholder="Ask AI to make it shorter, warmer, more direct, or adjust the angle..."></textarea>
        <button class="reachlyst-button" data-action="sendPrompt">Send</button>
        <p class="reachlyst-chat-status"></p>
      </div>
    `;
    card.append(controls);
    ensureSideBadge(anchor, "Not invited");
    queueMicrotask(() => { isMutatingReachlystUi = false; });
  }
  controls.dataset.reachlystKey = key;
  controls.reachlystLead = lead;
  ensureSideBadge(anchor, outreachLabelForLead(lead));

  const copyButton = controls.querySelector('[data-action="copy"]');
  const regenerateButton = controls.querySelector('[data-action="regenerate"]');
  const askButton = controls.querySelector('[data-action="ask"]');
  const promptButton = controls.querySelector('[data-action="sendPrompt"]');
  const invitedButton = controls.querySelector('[data-action="invited"]');
  if (!copyButton.dataset.bound) {
    copyButton.dataset.bound = "true";
    copyButton.addEventListener("click", () => copyInviteMessage(controls.reachlystLead, copyButton));
  }
  if (!regenerateButton.dataset.bound) {
    regenerateButton.dataset.bound = "true";
    regenerateButton.addEventListener("click", () => regenerateInviteMessage(controls.reachlystLead, regenerateButton));
  }
  if (!askButton.dataset.bound) {
    askButton.dataset.bound = "true";
    askButton.addEventListener("click", () => {
      const chat = controls.querySelector(".reachlyst-mini-chat");
      if (chat) chat.hidden = !chat.hidden;
    });
  }
  if (!promptButton.dataset.bound) {
    promptButton.dataset.bound = "true";
    promptButton.addEventListener("click", () => askAiForLeadMessage(controls.reachlystLead, controls, promptButton));
  }
  if (!invitedButton.dataset.bound) {
    invitedButton.dataset.bound = "true";
    invitedButton.addEventListener("click", () => markLeadInvited(controls.reachlystLead, invitedButton));
  }
  return controls;
}

function addBadge(anchor, status = "New", lead, reason = "") {
  const controls = lead ? ensureInlineControls(anchor, lead) : leadCardFromAnchor(anchor);
  const existing = controls?.querySelector(".reachlyst-badge");
  const reasonEl = controls?.querySelector(".reachlyst-reason");
  const title = reason || (status === "New" ? "AI has not analyzed this lead yet." : `AI marked this lead as ${status}.`);
  if (existing) {
    existing.textContent = status;
    existing.dataset.status = status.toLowerCase().replace(/\s+/g, "_");
    existing.title = title;
    if (reasonEl) reasonEl.textContent = reason || "No AI reason yet.";
    return existing;
  }
  const badge = document.createElement("span");
  badge.className = "reachlyst-badge";
  badge.dataset.status = status.toLowerCase().replace(/\s+/g, "_");
  badge.textContent = status;
  badge.title = title;
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

function sameLeadRecord(a, b) {
  return leadKey(a) === leadKey(b) || (a.name && b.name && a.name === b.name);
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
  updateLeadBadge(lead, fitLabel(result.fit), result.reason);
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

function updateLeadBadge(lead, status, reason = "") {
  const anchor = leadAnchors().find((candidate) => sameLead(candidate, lead));
  if (anchor) addBadge(anchor, status, lead, reason);
}

function updateLeadMessage(lead, message) {
  const anchor = leadAnchors().find((candidate) => sameLead(candidate, lead));
  if (!anchor) return;
  const controls = ensureInlineControls(anchor, lead);
  const messageEl = controls?.querySelector(".reachlyst-message");
  if (messageEl) {
    if ("value" in messageEl) messageEl.value = message || "No suggestion yet";
    else messageEl.textContent = message || "No suggestion yet";
    messageEl.title = message || "";
  }
}

function currentLeadMessage(lead) {
  const anchor = leadAnchors().find((candidate) => sameLead(candidate, lead));
  const controls = anchor ? ensureInlineControls(anchor, lead) : null;
  const messageEl = controls?.querySelector(".reachlyst-message");
  if (!messageEl) return "";
  return "value" in messageEl ? messageEl.value : messageEl.textContent || "";
}

function ensureSideBadge(anchor, label = "Not invited") {
  const card = leadCardFromAnchor(anchor);
  if (!card) return null;
  if (getComputedStyle(card).position === "static") card.style.position = "relative";
  let badge = card.querySelector(".reachlyst-side-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "reachlyst-side-badge";
    card.append(badge);
  }
  badge.textContent = label;
  badge.dataset.status = label.toLowerCase().replace(/\s+/g, "_");
  badge.title = `Reachlyst outreach status: ${label}`;
  return badge;
}

function updateSideBadge(lead, label) {
  const anchor = leadAnchors().find((candidate) => sameLead(candidate, lead));
  if (anchor) ensureSideBadge(anchor, label);
}

function outreachLabelForLead(lead) {
  const status = lead.status || "";
  if (status === "copied") return "Copied";
  if (/invite|connected|message|follow|replied/.test(status)) return "Invited";
  return "Not invited";
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
    updateLeadBadge(lead, fitLabel(result.fit), result.reason);
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
  updateSideBadge(lead, "Copied");
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

async function askAiForLeadMessage(lead, controls, button) {
  const prompt = controls.querySelector('[data-role="prompt"]');
  const status = controls.querySelector(".reachlyst-chat-status");
  const instruction = prompt?.value?.trim();
  if (!instruction) {
    if (status) status.textContent = "Write what you want AI to change.";
    return;
  }
  const key = leadKey(lead);
  const current = analyzedLeads.get(key) || {};
  button.textContent = "Thinking";
  if (status) status.textContent = "AI is polishing this invite...";
  const response = await reachlystApi("/api/extension/ai/generate-message", {
    method: "POST",
    body: JSON.stringify(await leadPayload(lead, { instruction, previousMessage: currentLeadMessage(lead) || current.suggestedConnectionMessage }))
  });
  const result = await response.json();
  analyzedLeads.set(key, { ...current, suggestedConnectionMessage: result.message });
  updateLeadMessage(lead, result.message);
  if (prompt) prompt.value = "";
  if (status) status.textContent = "Saved to Reachlyst suggestions.";
  button.textContent = "Send";
}

async function markLeadInvited(lead, button) {
  button.textContent = "Saving";
  await reachlystApi("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "invite_likely_sent" }) });
  updateSideBadge(lead, "Invited");
  button.textContent = "Invited";
  setTimeout(() => { button.textContent = "Mark invited"; }, 1400);
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
  const imported = await reachlystApi("/api/extension/search/import-leads", { method: "POST", body: JSON.stringify({ searchId: detected.id, leads: parsed.leads }) }).then((r) => r.json());
  const hydratedLeads = parsed.leads.map((lead) => ({ ...lead, ...(imported.leads || []).find((item) => sameLeadRecord(item, lead)) }));
  await reportParser("sales_search", parsed.leads.length, parsed.failures);
  const attached = attachLeadControls(hydratedLeads);
  autoAnalyzeVisibleLeads(hydratedLeads);
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
  const newMessages = parsed.messages.filter((message) => {
    const key = `${location.href}|${message.senderType}|${message.body}`.slice(0, 1200);
    if (syncedMessageKeys.has(key)) return false;
    syncedMessageKeys.add(key);
    return true;
  });
  if (newMessages.length) await reachlystApi("/api/extension/messages/sync-thread", { method: "POST", body: JSON.stringify({ source: "linkedin_messages", threadUrl: location.href, messages: newMessages }) });
  await reportParser("linkedin_messages", parsed.messages.length, parsed.failures);
  setStatus(`Reachlyst: ${parsed.messages.length} visible messages found · ${newMessages.length} new`, parsed.messages.length ? "good" : "warn");
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
document.addEventListener("scroll", () => scheduleReachlystRun(), true);

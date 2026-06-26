declare const chrome: any;
declare function parseSalesNavigatorLeads(root?: ParentNode): { leads: any[]; failures: string[] };
const EXTENSION_VERSION = "0.1.0";
const PARSER_VERSION = "2026.06.26";
const DEFAULT_SETTINGS = {
  reachlystApiBase: "https://reachlyst.com",
  reachlystToken: "",
  reachlystEnabled: false,
  reachlystVerified: false
};

const leadChatState = new Map();
let isMutatingReachlystUi = false;
let reachlystRunTimer;
let activeSearchPlaybook = null;
let selectedLead = null;

async function getSettings() {
  const values = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  return { ...DEFAULT_SETTINGS, ...values };
}

async function reachlystIsEnabled() {
  const settings = await getSettings();
  return settings.reachlystEnabled === true && settings.reachlystVerified === true && Boolean(settings.reachlystToken);
}

async function reachlystApi(path, init = {}) {
  const proxied = await chrome.runtime.sendMessage({
    type: "reachlyst_api",
    path,
    method: init.method || "GET",
    headers: init.headers || {},
    body: init.body
  });
  if (!proxied?.ok) {
    let message = proxied?.error || `API error ${proxied?.status || 0}`;
    try {
      const parsed = JSON.parse(proxied?.text || "{}");
      message = parsed.message || parsed.error || message;
    } catch {
      // Keep proxy error message.
    }
    throw new Error(message);
  }
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
  selectedLead = null;
  document.querySelectorAll(".reachlyst-status, .reachlyst-lead-button, .reachlyst-floating-chat").forEach((element) => element.remove());
}

function showLinkedInNotice() {
  setStatus("Please log in to LinkedIn Sales Navigator first.", "warn");
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

function leadKey(lead) {
  const raw = lead.salesNavigatorUrl || lead.linkedinUrl || lead.name;
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return String(raw || lead.name || "").trim().toLowerCase();
  }
}

function leadAnchors() {
  return Array.from(document.querySelectorAll('a[href*="/sales/lead/"]')).filter((anchor) => {
    const name = anchor.textContent?.replace(/\s+/g, " ").trim() || "";
    const rect = anchor.getBoundingClientRect();
    return name.length > 1 && rect.width > 0 && rect.height > 0;
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

function firstName(name) {
  return String(name || "").split(" ")[0] || "there";
}

function leadSubtitle(lead) {
  return [lead.title, lead.company, lead.location].filter(Boolean).join(" · ");
}

function leadPayload(lead, extra = {}) {
  const playbook = activeSearchPlaybook || {};
  const campaignContext = [
    `Use case: ${playbook.useCase || "sales_outreach"}`,
    `ICP: ${playbook.icp || "Not configured"}`,
    `Offer: ${playbook.offer || "Not configured"}`,
    `Tone: ${playbook.tone || "Professional, concise, human"}`,
    `Rules: ${playbook.instructions || "Avoid fake personalization. Keep it concise."}`,
    "LinkedIn action policy: suggest copy only; user manually pastes and sends."
  ].join("\n");
  return { ...lead, campaignContext, tone: playbook.tone || "Professional, concise, human", useCase: playbook.useCase || "sales_outreach", ...extra };
}

function chatStateForLead(lead) {
  const key = leadKey(lead);
  if (!leadChatState.has(key)) {
    leadChatState.set(key, {
      messages: [{
        role: "assistant",
        content: `Selected ${firstName(lead.name)}. Click Generate invite or tell me how to shape the message.`
      }],
      latestInvite: ""
    });
  }
  return leadChatState.get(key);
}

function renderThread(chat, lead) {
  const state = chatStateForLead(lead);
  const thread = chat.querySelector(".reachlyst-chat-thread");
  if (!thread) return;
  thread.innerHTML = "";
  state.messages.slice(-10).forEach((message) => {
    const row = document.createElement("div");
    row.className = message.role === "user" ? "reachlyst-message-row reachlyst-message-user" : "reachlyst-message-row reachlyst-message-assistant";
    const bubble = document.createElement("p");
    bubble.textContent = message.content;
    row.append(bubble);
    if (message.role === "assistant") {
      const copyButton = document.createElement("button");
      copyButton.className = "reachlyst-copy-message";
      copyButton.type = "button";
      copyButton.title = "Copy this AI message";
      copyButton.setAttribute("aria-label", "Copy this AI message");
      copyButton.addEventListener("click", () => copyAiMessage(lead, message.content, copyButton));
      row.append(copyButton);
    }
    thread.append(row);
  });
  thread.scrollTop = thread.scrollHeight;
}

function ensureFloatingChat() {
  let chat = document.querySelector(".reachlyst-floating-chat");
  if (chat) return chat;

  isMutatingReachlystUi = true;
  chat = document.createElement("aside");
  chat.className = "reachlyst-floating-chat";
  chat.innerHTML = `
    <div class="reachlyst-chat-top">
      <span class="reachlyst-r">R</span>
      <div>
        <strong data-role="leadName">Reachlyst AI</strong>
        <small data-role="leadMeta">Select a lead to start.</small>
      </div>
      <button class="reachlyst-close" data-action="close" type="button" aria-label="Close Reachlyst chat">×</button>
    </div>
    <div class="reachlyst-chat-thread"></div>
    <textarea class="reachlyst-chat-input" rows="3" placeholder="Ask for a shorter, warmer, direct, or more specific invite..."></textarea>
    <div class="reachlyst-chat-actions">
      <button class="reachlyst-button" data-action="generate" type="button">Generate invite</button>
      <button class="reachlyst-button reachlyst-button-secondary" data-action="send" type="button">Send</button>
      <label class="reachlyst-enter-toggle"><input data-role="sendOnEnter" type="checkbox" /> Send on Enter</label>
    </div>
    <p class="reachlyst-chat-status"></p>
  `;
  document.body.append(chat);
  bindFloatingChat(chat);
  queueMicrotask(() => { isMutatingReachlystUi = false; });
  return chat;
}

function bindFloatingChat(chat) {
  const closeButton = chat.querySelector('[data-action="close"]');
  const generateButton = chat.querySelector('[data-action="generate"]');
  const sendButton = chat.querySelector('[data-action="send"]');
  const input = chat.querySelector(".reachlyst-chat-input");
  const sendOnEnter = chat.querySelector('[data-role="sendOnEnter"]');

  closeButton.addEventListener("click", () => {
    chat.hidden = true;
  });
  generateButton.addEventListener("click", () => selectedLead && generateInvite(selectedLead, chat, generateButton));
  sendButton.addEventListener("click", () => selectedLead && sendLeadChat(selectedLead, chat, sendButton));
  input.addEventListener("keydown", (event) => {
    const shouldSend = event.key === "Enter" && selectedLead && ((sendOnEnter.checked && !event.shiftKey) || event.metaKey || event.ctrlKey);
    if (shouldSend) {
      event.preventDefault();
      sendLeadChat(selectedLead, chat, sendButton);
    }
  });
}

function openFloatingChat(lead) {
  selectedLead = lead;
  const chat = ensureFloatingChat();
  chat.hidden = false;
  chat.querySelector('[data-role="leadName"]').textContent = lead.name;
  chat.querySelector('[data-role="leadMeta"]').textContent = leadSubtitle(lead) || "Sales Navigator lead";
  chat.querySelector(".reachlyst-chat-status").textContent = "Chat is tied to this selected lead.";
  renderThread(chat, lead);
  chat.querySelector(".reachlyst-chat-input").focus();
}

function ensureLeadButton(anchor, lead) {
  const card = leadCardFromAnchor(anchor);
  if (!card) return null;
  const key = safeDomKey(leadKey(lead));
  let button = card.querySelector(`.reachlyst-lead-button[data-reachlyst-key="${key}"]`) || card.querySelector(".reachlyst-lead-button");
  if (!button) {
    isMutatingReachlystUi = true;
    if (getComputedStyle(card).position === "static") card.style.position = "relative";
    button = document.createElement("button");
    button.className = "reachlyst-lead-button";
    button.type = "button";
    button.textContent = "R";
    button.setAttribute("aria-label", "Open Reachlyst AI");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openFloatingChat(button.reachlystLead);
    });
    card.append(button);
    queueMicrotask(() => { isMutatingReachlystUi = false; });
  }
  button.dataset.reachlystKey = key;
  button.reachlystLead = lead;
  button.title = `Open Reachlyst chat for ${lead.name}`;
  return button;
}

function attachLeadButtons(leads) {
  const anchors = leadAnchors();
  const usedCards = new Set();
  for (const lead of leads) {
    const anchor = anchors.find((candidate) => {
      const card = leadCardFromAnchor(candidate);
      return card && !usedCards.has(card) && sameLead(candidate, lead);
    });
    if (!anchor) continue;
    usedCards.add(leadCardFromAnchor(anchor));
    ensureLeadButton(anchor, lead);
  }
  return usedCards.size;
}

async function generateInvite(lead, chat, button) {
  const state = chatStateForLead(lead);
  const status = chat.querySelector(".reachlyst-chat-status");
  button.textContent = "Generating";
  if (status) status.textContent = "Generating a copyable invite...";

  const response = await reachlystApi("/api/extension/ai/generate-message", {
    method: "POST",
    body: JSON.stringify(leadPayload(lead, { instruction: "Generate a concise LinkedIn connection invite for this specific lead.", previousMessage: state.latestInvite }))
  });
  const result = await response.json();
  state.latestInvite = result.message;
  state.messages.push({ role: "assistant", content: result.message });
  renderThread(chat, lead);
  if (status) status.textContent = "Invite saved as a Reachlyst suggestion.";
  button.textContent = "Generate invite";
}

async function sendLeadChat(lead, chat, button) {
  const input = chat.querySelector(".reachlyst-chat-input");
  const status = chat.querySelector(".reachlyst-chat-status");
  const prompt = input?.value?.trim();
  if (!prompt) {
    if (status) status.textContent = "Write what you want AI to change.";
    return;
  }

  const state = chatStateForLead(lead);
  state.messages.push({ role: "user", content: prompt });
  input.value = "";
  renderThread(chat, lead);
  button.textContent = "Thinking";
  if (status) status.textContent = "AI is working on this lead...";

  const response = await reachlystApi("/api/extension/ai/lead-chat", {
    method: "POST",
    body: JSON.stringify({
      lead: leadPayload(lead, { currentMessage: state.latestInvite }),
      messages: state.messages
    })
  });
  const result = await response.json();
  state.latestInvite = result.reply;
  state.messages.push({ role: "assistant", content: result.reply });
  renderThread(chat, lead);
  if (status) status.textContent = "Suggestion saved in Reachlyst usage log.";
  button.textContent = "Send";
}

async function copyAiMessage(lead, message, button) {
  await navigator.clipboard.writeText(message);
  chatStateForLead(lead).latestInvite = message;
  await reachlystApi("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "message_copied", message }) });
  button.dataset.copied = "true";
  button.title = "Copied";
  setTimeout(() => {
    button.dataset.copied = "false";
    button.title = "Copy this AI message";
  }, 1400);
}

async function runSalesNavigator() {
  if (!(await reachlystIsEnabled())) {
    removeReachlystUi();
    return;
  }

  if (!/linkedin\.com\/sales\/search/.test(location.href)) {
    removeReachlystUi();
    return;
  }

  if (/login|checkpoint/.test(location.href)) return showLinkedInNotice();

  setStatus("Reachlyst: reading visible Sales Navigator leads...");
  const detected = await reachlystApi("/api/extension/search/detect", {
    method: "POST",
    body: JSON.stringify({ url: location.href, title: document.title })
  }).then((response) => response.json());
  activeSearchPlaybook = detected.aiPlaybook || null;

  const parsed = parseSalesNavigatorLeads();
  const imported = await reachlystApi("/api/extension/search/import-leads", {
    method: "POST",
    body: JSON.stringify({ searchId: detected.id, leads: parsed.leads })
  }).then((response) => response.json());
  const hydratedLeads = parsed.leads.map((lead) => ({ ...lead, ...(imported.leads || []).find((item) => sameLeadRecord(item, lead)) }));

  await reportParser("sales_search", parsed.leads.length, parsed.failures);
  const attached = attachLeadButtons(hydratedLeads);
  setStatus(`Reachlyst: ${parsed.leads.length} visible leads found · ${attached} buttons ready`, attached ? "good" : "warn");
}

async function reportParser(pageType, extractedCount, failures) {
  await reachlystApi("/api/extension/parser/report", {
    method: "POST",
    body: JSON.stringify({ parserVersion: PARSER_VERSION, extensionVersion: EXTENSION_VERSION, pageType, extractedCount, failures, url: location.href })
  }).catch(() => undefined);
}

async function scheduleReachlystRun() {
  if (isMutatingReachlystUi) return;
  clearTimeout(reachlystRunTimer);
  if (!(await reachlystIsEnabled())) {
    removeReachlystUi();
    return;
  }
  reachlystRunTimer = setTimeout(() => {
    runSalesNavigator().catch((error) => setStatus(`Reachlyst: ${error.message}`, "danger"));
  }, 600);
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
  if (areaName !== "sync") return;
  if (changes.reachlystEnabled || changes.reachlystVerified || changes.reachlystToken) scheduleReachlystRun();
});

new MutationObserver((mutations) => {
  if (mutations.every((mutation) => {
    const target = mutation.target;
    return target instanceof Element && (target.closest(".reachlyst-floating-chat") || target.closest(".reachlyst-lead-button") || target.closest(".reachlyst-status"));
  })) return;
  scheduleReachlystRun();
}).observe(document.body, { childList: true, subtree: true });

document.addEventListener("scroll", () => scheduleReachlystRun(), true);

declare const chrome: any;
declare function parseSalesNavigatorLeads(root?: ParentNode): { leads: any[]; failures: string[] };
declare function parseVisibleMessages(root?: ParentNode): { messages: Array<{ senderType: "user" | "lead" | "unknown"; body: string; sentAt?: string }>; failures: string[] };
const EXTENSION_VERSION = "0.1.3";
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
const SALES_NAV_PAGE_SIZE = 25;

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
    status.innerHTML = '<span class="reachlyst-status-loader" aria-hidden="true"></span><strong></strong>';
    document.body.append(status);
  }
  status.dataset.tone = tone;
  status.querySelector("strong").textContent = message;
}

function setFetchStatus(count) {
  setStatus(`Fetched: ${count}/${SALES_NAV_PAGE_SIZE}`, "loading");
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

function reachlystLogoUrl() {
  return chrome.runtime.getURL("assets/reachlyst-logo-r-blue.png");
}

function leadCompanyLine(lead) {
  return String(lead.company || lead.title || "").trim() || (lead.context === "messages" ? "Sales Navigator messages" : "Company not found");
}

function leadPayload(lead, extra = {}) {
  const playbook = activeSearchPlaybook || {};
  const campaignContext = [
    `Use case: ${playbook.useCase || "sales_outreach"}`,
    `ICP: ${playbook.icp || "Not configured"}`,
    `Offer: ${playbook.offer || "Not configured"}`,
    `Tone: ${playbook.tone || "Professional, concise, human"}`,
    `Rules: ${playbook.instructions || "Avoid fake personalization. Keep it concise."}`,
    lead.conversationContext ? `Visible conversation:\n${lead.conversationContext}` : "",
    "LinkedIn action policy: suggest copy only; user manually pastes and sends."
  ].filter(Boolean).join("\n");
  return { ...lead, campaignContext, tone: playbook.tone || "Professional, concise, human", useCase: playbook.useCase || "sales_outreach", ...extra };
}

function formatConversationContext(messages) {
  return messages.slice(-12).map((message) => {
    const speaker = message.senderType === "user" ? "You" : message.senderType === "lead" ? "Lead" : "Unknown";
    return `${speaker}: ${String(message.body || "").replace(/\s+/g, " ").trim()}`;
  }).filter((line) => line.length > 8).join("\n").slice(0, 5000);
}

function chatStateForLead(lead) {
  const key = leadKey(lead);
  if (!leadChatState.has(key)) {
    leadChatState.set(key, {
      messages: [{
        role: "assistant",
        content: lead.context === "messages"
          ? `Selected ${firstName(lead.name)}. Tell me what kind of reply or follow-up you want to write.`
          : `Selected ${firstName(lead.name)}. Click Generate invite or tell me how to shape the message.`
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
      copyButton.textContent = "Copy";
      copyButton.title = "Copy this AI message";
      copyButton.setAttribute("aria-label", "Copy this AI message");
      copyButton.addEventListener("click", () => copyAiMessage(lead, message.content, copyButton));
      row.append(copyButton);
    }
    thread.append(row);
  });
  thread.scrollTop = thread.scrollHeight;
}

function ensureChatControls(chat) {
  const header = chat.querySelector(".reachlyst-chat-top");
  if (!header) return;

  let actions = chat.querySelector(".reachlyst-chat-window-actions");
  let closeButton = chat.querySelector('[data-action="close"]');
  let minimizeButton = chat.querySelector('[data-action="minimize"]');

  if (!actions) {
    actions = document.createElement("div");
    actions.className = "reachlyst-chat-window-actions";
    header.append(actions);
  }

  if (!minimizeButton) {
    minimizeButton = document.createElement("button");
    minimizeButton.className = "reachlyst-minimize";
    minimizeButton.dataset.action = "minimize";
    minimizeButton.type = "button";
    minimizeButton.title = "Minimize";
    minimizeButton.setAttribute("aria-label", "Minimize Reachlyst chat");
    actions.prepend(minimizeButton);
  }

  if (closeButton && closeButton.parentElement !== actions) actions.append(closeButton);
}

function ensureFloatingChat() {
  let chat = document.querySelector(".reachlyst-floating-chat");
  if (chat) {
    ensureChatControls(chat);
    bindFloatingChat(chat);
    return chat;
  }

  isMutatingReachlystUi = true;
  chat = document.createElement("aside");
  chat.className = "reachlyst-floating-chat";
  chat.innerHTML = `
    <div class="reachlyst-chat-top">
      <img class="reachlyst-r" alt="Reachlyst" src="${reachlystLogoUrl()}" />
      <div>
        <strong data-role="leadName">Reachlyst AI</strong>
        <small data-role="leadMeta">Select a lead to start.</small>
      </div>
      <div class="reachlyst-chat-window-actions">
        <button class="reachlyst-minimize" data-action="minimize" type="button" aria-label="Minimize Reachlyst chat" title="Minimize"></button>
        <button class="reachlyst-close" data-action="close" type="button" aria-label="Close Reachlyst chat" title="Close"></button>
      </div>
    </div>
    <div class="reachlyst-chat-thread"></div>
    <textarea class="reachlyst-chat-input" rows="3" placeholder="Write in any language. Ask for a shorter, warmer, direct, or more specific invite..."></textarea>
    <div class="reachlyst-chat-actions">
      <button class="reachlyst-button" data-action="generate" type="button">Generate invite</button>
      <button class="reachlyst-button reachlyst-button-secondary" data-action="send" type="button">Send</button>
      <label class="reachlyst-enter-toggle"><span>Send on Enter</span><input data-role="sendOnEnter" type="checkbox" /><span class="reachlyst-switch" aria-hidden="true"></span></label>
    </div>
    <p class="reachlyst-chat-status"></p>
  `;
  document.body.append(chat);
  bindFloatingChat(chat);
  queueMicrotask(() => { isMutatingReachlystUi = false; });
  return chat;
}

function bindFloatingChat(chat) {
  if (chat.dataset.reachlystBound === "true") return;
  chat.dataset.reachlystBound = "true";
  const closeButton = chat.querySelector('[data-action="close"]');
  const minimizeButton = chat.querySelector('[data-action="minimize"]');
  const generateButton = chat.querySelector('[data-action="generate"]');
  const sendButton = chat.querySelector('[data-action="send"]');
  const input = chat.querySelector(".reachlyst-chat-input");
  const sendOnEnter = chat.querySelector('[data-role="sendOnEnter"]');

  closeButton.addEventListener("click", () => {
    chat.hidden = true;
  });
  minimizeButton.addEventListener("click", () => {
    const isMinimized = chat.dataset.minimized === "true";
    chat.dataset.minimized = isMinimized ? "false" : "true";
    minimizeButton.title = isMinimized ? "Minimize" : "Expand";
    minimizeButton.setAttribute("aria-label", isMinimized ? "Minimize Reachlyst chat" : "Expand Reachlyst chat");
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
  chat.dataset.minimized = "false";
  const minimizeButton = chat.querySelector('[data-action="minimize"]');
  if (minimizeButton) {
    minimizeButton.title = "Minimize";
    minimizeButton.setAttribute("aria-label", "Minimize Reachlyst chat");
  }
  chat.querySelector('[data-role="leadName"]').textContent = lead.name;
  chat.querySelector('[data-role="leadMeta"]').textContent = leadCompanyLine(lead);
  const generateButton = chat.querySelector('[data-action="generate"]');
  if (generateButton) generateButton.textContent = lead.context === "messages" ? "Generate reply" : "Generate invite";
  const input = chat.querySelector(".reachlyst-chat-input");
  if (input) input.placeholder = lead.context === "messages"
    ? "Ask for a shorter, warmer, direct, or more specific reply..."
    : "Write in any language. Ask for a shorter, warmer, direct, or more specific invite...";
  chat.querySelector(".reachlyst-chat-status").textContent = lead.context === "messages" ? "Chat is tied to this selected conversation." : "Chat is tied to this selected lead.";
  renderThread(chat, lead);
  if (!document.activeElement?.closest?.(".reachlyst-floating-chat")) chat.querySelector(".reachlyst-chat-input").focus();
}

function visibleActionControl(element, card) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.closest(".reachlyst-lead-button, .reachlyst-floating-chat")) return false;
  const rect = element.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (rect.left < cardRect.left + cardRect.width * 0.52) return false;

  const label = [
    element.textContent || "",
    element.getAttribute("aria-label") || "",
    element.getAttribute("title") || ""
  ].join(" ").replace(/\s+/g, " ").trim().toLowerCase();
  const href = element.getAttribute("href") || "";
  if (/\/sales\/lead\/|\/in\//.test(href)) return false;

  return /more|actions|message|send message|save|saved|connect|overflow|ellipsis|list/.test(label)
    || (element.tagName === "BUTTON" && rect.width <= 180 && rect.height <= 64);
}

function actionControlsIn(container, card) {
  return Array.from(container.querySelectorAll('button, a[role="button"], [role="button"]'))
    .filter((control) => visibleActionControl(control, card));
}

function controlLabel(element) {
  return [
    element.textContent || "",
    element.getAttribute("aria-label") || "",
    element.getAttribute("title") || ""
  ].join(" ").replace(/\s+/g, " ").trim().toLowerCase();
}

function actionClusterFor(control, card) {
  let node = control.parentElement;
  while (node && node !== card) {
    const controls = actionControlsIn(node, card);
    if (controls.length >= 2 && controls.length <= 8) return node;
    node = node.parentElement;
  }
  return control.parentElement;
}

function findLeadActionsContainer(card) {
  const controls = actionControlsIn(card, card);
  const prioritized = controls.sort((a, b) => {
    const aLabel = controlLabel(a);
    const bLabel = controlLabel(b);
    const score = (label) => /more|actions|overflow|ellipsis/.test(label) ? 0 : /message|send message/.test(label) ? 1 : /save|saved/.test(label) ? 2 : 3;
    return score(aLabel) - score(bLabel) || a.getBoundingClientRect().left - b.getBoundingClientRect().left;
  });
  const primary = prioritized[0];
  return primary ? actionClusterFor(primary, card) : null;
}

function placeLeadButton(card, button) {
  const container = findLeadActionsContainer(card);
  if (container) {
    container.append(button);
    button.dataset.floating = "false";
    return;
  }

  if (getComputedStyle(card).position === "static") card.style.position = "relative";
  if (button.parentElement !== card) card.append(button);
  button.dataset.floating = "true";
}

function ensureLeadButton(anchor, lead) {
  const card = leadCardFromAnchor(anchor);
  if (!card) return null;
  const key = safeDomKey(leadKey(lead));
  let button = card.querySelector(`.reachlyst-lead-button[data-reachlyst-key="${key}"]`) || card.querySelector(".reachlyst-lead-button");
  if (!button) {
    isMutatingReachlystUi = true;
    button = document.createElement("button");
    button.className = "reachlyst-lead-button";
    button.type = "button";
    button.innerHTML = `<img alt="Reachlyst" src="${reachlystLogoUrl()}" />`;
    button.setAttribute("aria-label", "Open Reachlyst AI");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openFloatingChat(button.reachlystLead);
    });
    queueMicrotask(() => { isMutatingReachlystUi = false; });
  }
  isMutatingReachlystUi = true;
  placeLeadButton(card, button);
  queueMicrotask(() => { isMutatingReachlystUi = false; });
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
  const isMessages = lead.context === "messages";
  button.textContent = "Generating";
  if (status) status.textContent = isMessages ? "Generating a copyable reply..." : "Generating a copyable invite...";

  const response = await reachlystApi("/api/extension/ai/generate-message", {
    method: "POST",
    body: JSON.stringify(leadPayload(lead, {
      instruction: isMessages ? "Generate a concise LinkedIn reply or follow-up for this accepted connection conversation." : "Generate a concise LinkedIn connection invite for this specific lead.",
      previousMessage: state.latestInvite
    }))
  });
  const result = await response.json();
  state.latestInvite = result.message;
  state.messages.push({ role: "assistant", content: result.message });
  renderThread(chat, lead);
  if (status) status.textContent = isMessages ? "Reply saved as a Reachlyst suggestion." : "Invite saved as a Reachlyst suggestion.";
  button.textContent = isMessages ? "Generate reply" : "Generate invite";
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
  if (status) status.textContent = lead.context === "messages" ? "AI is working on this conversation..." : "AI is working on this lead...";

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
  const status = document.querySelector(".reachlyst-floating-chat .reachlyst-chat-status");
  if (status) status.textContent = "Copied message to clipboard.";
  button.dataset.copied = "true";
  button.textContent = "Copied";
  button.title = "Copied";
  button.setAttribute("aria-label", "Copied");
  showCopiedToast();
  reachlystApi("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "message_copied", message }) }).catch(() => undefined);
  setTimeout(() => {
    button.dataset.copied = "false";
    button.textContent = "Copy";
    button.title = "Copy this AI message";
    button.setAttribute("aria-label", "Copy this AI message");
  }, 1400);
}

function showCopiedToast() {
  let toast = document.querySelector(".reachlyst-copy-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "reachlyst-copy-toast";
    document.body.append(toast);
  }
  toast.textContent = "Copied";
  toast.dataset.visible = "true";
  clearTimeout(showCopiedToast.timer);
  showCopiedToast.timer = setTimeout(() => {
    toast.dataset.visible = "false";
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

  setFetchStatus(0);
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
  setFetchStatus(parsed.leads.length);
}

function isSalesSearchPage() {
  return /linkedin\.com\/sales\/search/.test(location.href);
}

function isSalesMessagesPage() {
  return /linkedin\.com\/sales\/(inbox|messaging|messages)/.test(location.href);
}

function cleanVisibleText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function visibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function messageThreadRoot() {
  return Array.from(document.querySelectorAll('main, [aria-label*="conversation" i], [data-test-conversation-view], [data-test-message-list], section'))
    .filter(visibleElement)
    .sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0] || document;
}

function selectedMessageLead() {
  const root = messageThreadRoot();
  const anchors = Array.from(root.querySelectorAll('a[href*="/sales/lead/"], a[href*="/in/"]')).filter(visibleElement);
  const anchor = anchors.find((item) => cleanVisibleText(item.textContent).length > 1);
  const headings = Array.from(root.querySelectorAll("h1, h2, h3")).filter(visibleElement);
  const heading = headings
    .map((item) => cleanVisibleText(item.textContent))
    .find((text) => text.length > 1 && !/messag|conversation|inbox|sales navigator/i.test(text));
  const name = cleanVisibleText(anchor?.textContent) || heading || "Selected conversation";
  const href = anchor?.href || location.href;
  return {
    id: `message-${safeDomKey(href || name)}`,
    name,
    company: "Accepted connection",
    salesNavigatorUrl: href.includes("/sales/lead/") ? href : undefined,
    linkedinUrl: href.includes("/in/") ? href : undefined,
    context: "messages",
    snippet: "Sales Navigator message thread"
  };
}

async function runSalesMessages() {
  if (!(await reachlystIsEnabled())) {
    removeReachlystUi();
    return;
  }

  if (!isSalesMessagesPage()) {
    removeReachlystUi();
    return;
  }

  if (/login|checkpoint/.test(location.href)) return showLinkedInNotice();

  const lead = selectedMessageLead();
  if (!lead.name || lead.name === "Selected conversation") {
    setStatus("Open a Sales Navigator conversation.", "warn");
    return;
  }

  const parsed = parseVisibleMessages(messageThreadRoot());
  lead.conversationContext = formatConversationContext(parsed.messages);
  await reportParser("sales_messages", parsed.messages.length, parsed.failures);
  if (parsed.messages.length) {
    reachlystApi("/api/extension/messages/sync-thread", {
      method: "POST",
      body: JSON.stringify({ threadUrl: location.href, source: "sales_inbox", messages: parsed.messages.slice(-30) })
    }).catch(() => undefined);
  }

  if (!selectedLead || !sameLeadRecord(selectedLead, lead)) openFloatingChat(lead);
  const status = document.querySelector(".reachlyst-floating-chat .reachlyst-chat-status");
  if (status) status.textContent = parsed.messages.length ? `Conversation ready. Synced ${parsed.messages.length} visible messages.` : "Conversation ready.";
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
    const runner = isSalesSearchPage() ? runSalesNavigator : isSalesMessagesPage() ? runSalesMessages : null;
    if (!runner) {
      removeReachlystUi();
      return;
    }
    runner().catch((error) => setStatus(`Reachlyst: ${error.message}`, "danger"));
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

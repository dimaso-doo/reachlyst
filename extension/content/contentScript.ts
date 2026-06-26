declare const chrome: any;
declare function parseSalesNavigatorLeads(root?: ParentNode): { leads: any[]; failures: string[] };
declare function parseVisibleMessages(root?: ParentNode): { messages: any[]; failures: string[] };

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

async function getSettings() {
  const values = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  return { ...DEFAULT_SETTINGS, ...values };
}

async function api(path: string, init: RequestInit = {}) {
  const settings = await getSettings();
  return fetch(`${settings.reachlystApiBase}${path}`, {
    ...init,
    headers: { "content-type": "application/json", "x-reachlyst-extension-token": settings.reachlystToken, ...(init.headers || {}) }
  });
}

function showLoginNotice() {
  if (document.querySelector(".reachlyst-panel")) return;
  const panel = document.createElement("aside");
  panel.className = "reachlyst-panel";
  panel.textContent = "Please log in to LinkedIn Sales Navigator first.";
  document.body.append(panel);
}

function addBadge(anchor: Element, status = "New") {
  if (anchor.parentElement?.querySelector(".reachlyst-badge")) return;
  const badge = document.createElement("span");
  badge.className = "reachlyst-badge";
  badge.textContent = status;
  anchor.insertAdjacentElement("afterend", badge);
}

function addActionButton(anchor: Element, lead: any) {
  const card = anchor.closest('li, article, [role="listitem"], div') as HTMLElement | null;
  if (!card || card.querySelector(".reachlyst-button")) return;
  const button = document.createElement("button");
  button.className = "reachlyst-button";
  button.textContent = "Reachlyst";
  button.addEventListener("click", () => openLeadPanel(lead));
  card.append(button);
}

function openLeadPanel(lead: any) {
  document.querySelector(".reachlyst-panel")?.remove();
  const panel = document.createElement("aside");
  panel.className = "reachlyst-panel";
  panel.innerHTML = `<h3>${lead.name}</h3><p>${lead.title || ""} ${lead.company || ""}</p><textarea readonly>Click Analyze & Generate to create a copyable invite.</textarea><button class="reachlyst-button" data-action="analyze">Analyze & Generate</button><button class="reachlyst-button" data-action="copy">Copy</button><button class="reachlyst-button" data-action="skip">Skip</button><button class="reachlyst-button" data-action="invited">Mark Invited</button>`;
  panel.querySelector('[data-action="analyze"]')?.addEventListener("click", async () => {
    const response = await api("/api/extension/ai/analyze", { method: "POST", body: JSON.stringify(lead) });
    const result = await response.json();
    (panel.querySelector("textarea") as HTMLTextAreaElement).value = result.suggestedConnectionMessage || result.message;
  });
  panel.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
    const value = (panel.querySelector("textarea") as HTMLTextAreaElement).value;
    await navigator.clipboard.writeText(value);
    await api("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "message_copied" }) });
  });
  panel.querySelector('[data-action="skip"]')?.addEventListener("click", () => api("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "skipped" }) }));
  panel.querySelector('[data-action="invited"]')?.addEventListener("click", () => api("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "invite_likely_sent" }) }));
  document.body.append(panel);
}

async function runSalesNavigator() {
  const settings = await getSettings();
  if (!settings.reachlystEnabled) return;
  if (!/linkedin\.com\/sales/.test(location.href)) return;
  if (/login|checkpoint/.test(location.href)) return showLoginNotice();
  const detected = await api("/api/extension/search/detect", { method: "POST", body: JSON.stringify({ url: location.href, title: document.title }) }).then((r) => r.json());
  const parsed = parseSalesNavigatorLeads();
  await api("/api/extension/search/import-leads", { method: "POST", body: JSON.stringify({ searchId: detected.id, leads: parsed.leads }) });
  await reportParser("sales_search", parsed.leads.length, parsed.failures);
  parsed.leads.forEach((lead) => {
    const anchor = document.querySelector(`a[href="${new URL(lead.salesNavigatorUrl || lead.linkedinUrl).pathname}"], a[href="${lead.salesNavigatorUrl}"], a[href="${lead.linkedinUrl}"]`);
    if (anchor) { addBadge(anchor); addActionButton(anchor, lead); }
  });
}

async function runMessages() {
  const settings = await getSettings();
  if (!settings.reachlystEnabled) return;
  if (!/linkedin\.com\/messaging/.test(location.href)) return;
  const parsed = parseVisibleMessages();
  await api("/api/extension/messages/sync-thread", { method: "POST", body: JSON.stringify({ source: "linkedin_messages", threadUrl: location.href, messages: parsed.messages }) });
  await reportParser("linkedin_messages", parsed.messages.length, parsed.failures);
}

async function reportParser(pageType: string, extractedCount: number, failures: string[]) {
  await api("/api/extension/parser/report", { method: "POST", body: JSON.stringify({ parserVersion: PARSER_VERSION, extensionVersion: EXTENSION_VERSION, pageType, extractedCount, failures, url: location.href }) }).catch(() => undefined);
}

runSalesNavigator().catch(console.warn);
runMessages().catch(console.warn);

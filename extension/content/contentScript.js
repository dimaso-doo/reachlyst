const EXTENSION_VERSION = "0.1.0";
const PARSER_VERSION = "2026.06.25";

async function getSettings() {
  return chrome.storage.sync.get(["reachlystApiBase", "reachlystToken"]);
}

async function reachlystApi(path, init = {}) {
  const settings = await getSettings();
  if (!settings.reachlystToken) throw new Error("Missing Reachlyst extension token");
  return fetch(`${settings.reachlystApiBase || "http://localhost:3000"}${path}`, {
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

function addBadge(anchor, status = "New") {
  if (anchor.parentElement?.querySelector(".reachlyst-badge")) return;
  const badge = document.createElement("span");
  badge.className = "reachlyst-badge";
  badge.textContent = status;
  anchor.insertAdjacentElement("afterend", badge);
}

function addActionButton(anchor, lead) {
  const card = anchor.closest('li, article, [role="listitem"], div');
  if (!card || card.querySelector(".reachlyst-button")) return;
  const button = document.createElement("button");
  button.className = "reachlyst-button";
  button.textContent = "Reachlyst";
  button.addEventListener("click", () => openLeadPanel(lead));
  card.append(button);
}

function openLeadPanel(lead) {
  document.querySelector(".reachlyst-panel")?.remove();
  const panel = document.createElement("aside");
  panel.className = "reachlyst-panel";
  panel.innerHTML = `<h3>${lead.name}</h3><p>${lead.title || ""} ${lead.company || ""}</p><textarea readonly>Click Analyze & Generate to create a copyable invite.</textarea><button class="reachlyst-button" data-action="analyze">Analyze & Generate</button><button class="reachlyst-button" data-action="copy">Copy</button><button class="reachlyst-button" data-action="skip">Skip</button><button class="reachlyst-button" data-action="invited">Mark Invited</button>`;
  panel.querySelector('[data-action="analyze"]')?.addEventListener("click", async () => {
    const response = await reachlystApi("/api/extension/ai/analyze", { method: "POST", body: JSON.stringify(lead) });
    const result = await response.json();
    panel.querySelector("textarea").value = result.suggestedConnectionMessage || result.message;
  });
  panel.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
    const value = panel.querySelector("textarea").value;
    await navigator.clipboard.writeText(value);
    await reachlystApi("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "message_copied" }) });
  });
  panel.querySelector('[data-action="skip"]')?.addEventListener("click", () => reachlystApi("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "skipped" }) }));
  panel.querySelector('[data-action="invited"]')?.addEventListener("click", () => reachlystApi("/api/extension/leads/action", { method: "POST", body: JSON.stringify({ leadId: lead.id || lead.name, action: "invite_likely_sent" }) }));
  document.body.append(panel);
}

async function runSalesNavigator() {
  if (!/linkedin\.com\/sales/.test(location.href)) return;
  if (/login|checkpoint/.test(location.href)) return showLoginNotice();
  const detected = await reachlystApi("/api/extension/search/detect", { method: "POST", body: JSON.stringify({ url: location.href, title: document.title }) }).then((r) => r.json());
  const parsed = parseSalesNavigatorLeads();
  await reachlystApi("/api/extension/search/import-leads", { method: "POST", body: JSON.stringify({ searchId: detected.id, leads: parsed.leads }) });
  await reportParser("sales_search", parsed.leads.length, parsed.failures);
  parsed.leads.forEach((lead) => {
    const parsedUrl = new URL(lead.salesNavigatorUrl || lead.linkedinUrl);
    const anchor = document.querySelector(`a[href="${parsedUrl.pathname}"], a[href="${lead.salesNavigatorUrl}"], a[href="${lead.linkedinUrl}"]`);
    if (anchor) { addBadge(anchor); addActionButton(anchor, lead); }
  });
}

async function runMessages() {
  if (!/linkedin\.com\/messaging/.test(location.href)) return;
  const parsed = parseVisibleMessages();
  await reachlystApi("/api/extension/messages/sync-thread", { method: "POST", body: JSON.stringify({ source: "linkedin_messages", threadUrl: location.href, messages: parsed.messages }) });
  await reportParser("linkedin_messages", parsed.messages.length, parsed.failures);
}

async function reportParser(pageType, extractedCount, failures) {
  await reachlystApi("/api/extension/parser/report", { method: "POST", body: JSON.stringify({ parserVersion: PARSER_VERSION, extensionVersion: EXTENSION_VERSION, pageType, extractedCount, failures, url: location.href }) }).catch(() => undefined);
}

runSalesNavigator().catch(console.warn);
runMessages().catch(console.warn);

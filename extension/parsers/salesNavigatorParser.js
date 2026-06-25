const salesNavigatorParserVersion = "2026.06.25";

function reachlystText(node) {
  return node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function reachlystAbsolutize(href) {
  try { return new URL(href, window.location.origin).toString(); } catch { return href; }
}

function parseSalesNavigatorLeads(root = document) {
  const failures = [];
  const anchors = Array.from(root.querySelectorAll('a[href*="/sales/lead/"], a[href*="/in/"]'));
  const seen = new Set();
  const leads = [];
  for (const anchor of anchors) {
    const url = reachlystAbsolutize(anchor.getAttribute("href") || "");
    if (!url || seen.has(url)) continue;
    const card = anchor.closest('li, article, [role="listitem"], [data-view-name], div') || anchor.parentElement;
    const name = reachlystText(anchor).replace(/^View\s+/i, "");
    if (!name || name.length < 2) {
      failures.push(`Missing name near ${url}`);
      continue;
    }
    seen.add(url);
    const lines = reachlystText(card).split(" ").filter(Boolean);
    leads.push({
      name,
      salesNavigatorUrl: url.includes("/sales/lead/") ? url : undefined,
      linkedinUrl: url.includes("/in/") ? url : undefined,
      title: reachlystText(card?.querySelector('[aria-label*="title" i], [data-anonymize="job-title"]')) || undefined,
      company: reachlystText(card?.querySelector('[aria-label*="company" i], [data-anonymize="company-name"]')) || undefined,
      location: reachlystText(card?.querySelector('[aria-label*="location" i]')) || undefined,
      snippet: lines.slice(0, 40).join(" ")
    });
  }
  return { leads, failures };
}

function healthCheckSalesNavigator(root = document) {
  const result = parseSalesNavigatorLeads(root);
  return { parserVersion: salesNavigatorParserVersion, extractedCount: result.leads.length, failures: result.failures };
}

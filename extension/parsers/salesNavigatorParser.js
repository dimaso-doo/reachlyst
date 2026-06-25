const salesNavigatorParserVersion = "2026.06.25";

function reachlystText(node) {
  return node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function reachlystAbsolutize(href) {
  try { return new URL(href, window.location.origin).toString(); } catch { return href; }
}

function reachlystLines(node) {
  const raw = node?.innerText || node?.textContent || "";
  return raw.split(/\n+/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
}

function inferTitleCompany(lines, name) {
  const line = lines.find((item) => item !== name && item.includes(" · ") && !/saved|years|months|role|company/i.test(item));
  if (!line) return {};
  const parts = line.split(" · ").map((part) => part.trim()).filter(Boolean);
  return { title: parts[0], company: parts.slice(1).join(" · ") || undefined };
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
    const visibleLines = reachlystLines(card);
    const inferred = inferTitleCompany(visibleLines, name);
    const flatWords = reachlystText(card).split(" ").filter(Boolean);
    leads.push({
      name,
      salesNavigatorUrl: url.includes("/sales/lead/") ? url : undefined,
      linkedinUrl: url.includes("/in/") ? url : undefined,
      title: reachlystText(card?.querySelector('[aria-label*="title" i], [data-anonymize="job-title"]')) || inferred.title,
      company: reachlystText(card?.querySelector('[aria-label*="company" i], [data-anonymize="company-name"]')) || inferred.company,
      location: reachlystText(card?.querySelector('[aria-label*="location" i]')) || visibleLines.find((line) => /area|united states|canada|kingdom|germany|france|serbia/i.test(line)),
      snippet: flatWords.slice(0, 40).join(" ")
    });
  }
  return { leads, failures };
}

function healthCheckSalesNavigator(root = document) {
  const result = parseSalesNavigatorLeads(root);
  return { parserVersion: salesNavigatorParserVersion, extractedCount: result.leads.length, failures: result.failures };
}

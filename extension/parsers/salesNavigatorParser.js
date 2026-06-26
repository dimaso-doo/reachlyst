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

function cleanReachlystName(value) {
  return value.replace(/^View\s+/i, "").replace(/\s+is reachable$/i, "").trim();
}

function findReachlystLeadCard(anchor) {
  const candidates = [];
  let current = anchor;
  for (let depth = 0; current && depth < 8; depth += 1) {
    candidates.push(current);
    current = current.parentElement;
  }
  return candidates.find((candidate) => {
    const visible = reachlystLines(candidate);
    const textValue = visible.join(" ");
    return visible.length >= 4 && /About:|Experience:|Saved|recent posts|mutual connections|years|months/i.test(textValue);
  }) || anchor.closest('li, article, [role="listitem"], [data-view-name]') || anchor.parentElement;
}

function inferTitleCompany(lines, name) {
  const nameIndex = lines.findIndex((item) => cleanReachlystName(item) === name);
  const candidates = nameIndex >= 0 ? lines.slice(nameIndex + 1, nameIndex + 5) : lines;
  const line = candidates.find((item) => item !== name && item.includes(" · ") && !/saved|years|months|role|company|connection/i.test(item))
    || candidates.find((item) => item !== name && !/saved|about:|experience:|years|months|role|company|connection|recent posts/i.test(item));
  if (!line) return {};
  const parts = line.split(" · ").map((part) => part.trim()).filter(Boolean);
  return { title: parts[0], company: parts.slice(1).join(" · ") || undefined };
}

function inferReachlystLocation(lines, name) {
  const nameIndex = lines.findIndex((item) => cleanReachlystName(item) === name);
  const candidates = nameIndex >= 0 ? lines.slice(nameIndex + 1, nameIndex + 7) : lines;
  return candidates.find((line) => /area|united states|canada|kingdom|germany|france|serbia|greater|metro|metropolitan|california|new york|texas|florida|illinois|boston|chicago|los angeles|san francisco|miami|austin|denver|seattle/i.test(line));
}

function inferReachlystAbout(lines) {
  const about = lines.find((line) => /^About:/i.test(line));
  if (about) return about.replace(/^About:\s*/i, "").trim();
  const fallback = lines.find((line) => line.length > 90 && !/experience:|saved|recent posts|mutual connections/i.test(line));
  return fallback || "";
}

function parseSalesNavigatorLeads(root = document) {
  const failures = [];
  const anchors = Array.from(root.querySelectorAll('a[href*="/sales/lead/"], a[href*="/in/"]'));
  const seen = new Set();
  const leads = [];
  for (const anchor of anchors) {
    const url = reachlystAbsolutize(anchor.getAttribute("href") || "");
    if (!url || seen.has(url)) continue;
    const card = findReachlystLeadCard(anchor);
    const name = cleanReachlystName(reachlystText(anchor));
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
      location: reachlystText(card?.querySelector('[aria-label*="location" i]')) || inferReachlystLocation(visibleLines, name),
      about: inferReachlystAbout(visibleLines),
      snippet: flatWords.slice(0, 40).join(" ")
    });
  }
  return { leads, failures };
}

function healthCheckSalesNavigator(root = document) {
  const result = parseSalesNavigatorLeads(root);
  return { parserVersion: salesNavigatorParserVersion, extractedCount: result.leads.length, failures: result.failures };
}

import type { ExtensionLead } from "../../types/domain";

export const salesNavigatorParserVersion = "2026.06.25";

function text(node: Element | null | undefined) {
  return node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function absolutize(href: string) {
  try { return new URL(href, window.location.origin).toString(); } catch { return href; }
}

function lines(node: Element | null | undefined) {
  const raw = (node as HTMLElement | null | undefined)?.innerText || node?.textContent || "";
  return raw.split(/\n+/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
}

function cleanName(value: string) {
  return value.replace(/^View\s+/i, "").replace(/\s+is reachable$/i, "").trim();
}

function findLeadCard(anchor: HTMLAnchorElement) {
  const candidates: Element[] = [];
  let current: Element | null = anchor;
  for (let depth = 0; current && depth < 8; depth += 1) {
    candidates.push(current);
    current = current.parentElement;
  }

  return candidates.find((candidate) => {
    const visible = lines(candidate);
    const textValue = visible.join(" ");
    return visible.length >= 4 && /About:|Experience:|Saved|recent posts|mutual connections|years|months/i.test(textValue);
  }) ?? anchor.closest('li, article, [role="listitem"], [data-view-name]') ?? anchor.parentElement;
}

function inferTitleCompany(visibleLines: string[], name: string) {
  const nameIndex = visibleLines.findIndex((item) => cleanName(item) === name);
  const candidates = nameIndex >= 0 ? visibleLines.slice(nameIndex + 1, nameIndex + 5) : visibleLines;
  const line = candidates.find((item) => item !== name && item.includes(" · ") && !/saved|years|months|role|company|connection/i.test(item))
    ?? candidates.find((item) => item !== name && !/saved|about:|experience:|years|months|role|company|connection|recent posts/i.test(item));
  if (!line) return {};
  const parts = line.split(" · ").map((part) => part.trim()).filter(Boolean);
  return { title: parts[0], company: parts.slice(1).join(" · ") || undefined };
}

function inferLocation(visibleLines: string[], name: string) {
  const nameIndex = visibleLines.findIndex((item) => cleanName(item) === name);
  const candidates = nameIndex >= 0 ? visibleLines.slice(nameIndex + 1, nameIndex + 7) : visibleLines;
  return candidates.find((line) => /area|united states|canada|kingdom|germany|france|serbia|greater|metro|metropolitan|california|new york|texas|florida|illinois|boston|chicago|los angeles|san francisco|miami|austin|denver|seattle/i.test(line));
}

export function parseSalesNavigatorLeads(root: ParentNode = document): { leads: ExtensionLead[]; failures: string[] } {
  const failures: string[] = [];
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/sales/lead/"], a[href*="/in/"]'));
  const seen = new Set<string>();
  const leads: ExtensionLead[] = [];

  for (const anchor of anchors) {
    const url = absolutize(anchor.getAttribute("href") ?? "");
    if (!url || seen.has(url)) continue;
    const card = findLeadCard(anchor);
    const name = cleanName(text(anchor));
    if (!name || name.length < 2) {
      failures.push(`Missing name near ${url}`);
      continue;
    }
    seen.add(url);
    const visibleLines = lines(card);
    const inferred = inferTitleCompany(visibleLines, name);
    const flatWords = text(card).split(" ").filter(Boolean);
    leads.push({
      name,
      salesNavigatorUrl: url.includes("/sales/lead/") ? url : undefined,
      linkedinUrl: url.includes("/in/") ? url : undefined,
      title: text(card?.querySelector('[aria-label*="title" i], [data-anonymize="job-title"]')) || inferred.title,
      company: text(card?.querySelector('[aria-label*="company" i], [data-anonymize="company-name"]')) || inferred.company,
      location: text(card?.querySelector('[aria-label*="location" i]')) || inferLocation(visibleLines, name),
      snippet: flatWords.slice(0, 40).join(" ")
    });
  }
  return { leads, failures };
}

export function healthCheckSalesNavigator(root: ParentNode = document) {
  const result = parseSalesNavigatorLeads(root);
  return { parserVersion: salesNavigatorParserVersion, extractedCount: result.leads.length, failures: result.failures };
}

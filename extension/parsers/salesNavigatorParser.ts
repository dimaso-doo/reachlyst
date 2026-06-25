import type { ExtensionLead } from "../../types/domain";

export const salesNavigatorParserVersion = "2026.06.25";

function text(node: Element | null | undefined) {
  return node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function absolutize(href: string) {
  try { return new URL(href, window.location.origin).toString(); } catch { return href; }
}

export function parseSalesNavigatorLeads(root: ParentNode = document): { leads: ExtensionLead[]; failures: string[] } {
  const failures: string[] = [];
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/sales/lead/"], a[href*="/in/"]'));
  const seen = new Set<string>();
  const leads: ExtensionLead[] = [];

  for (const anchor of anchors) {
    const url = absolutize(anchor.getAttribute("href") ?? "");
    if (!url || seen.has(url)) continue;
    const card = anchor.closest('li, article, [role="listitem"], [data-view-name], div') ?? anchor.parentElement;
    const name = text(anchor).replace(/^View\s+/i, "");
    if (!name || name.length < 2) {
      failures.push(`Missing name near ${url}`);
      continue;
    }
    seen.add(url);
    const lines = text(card).split(" ").filter(Boolean);
    leads.push({
      name,
      salesNavigatorUrl: url.includes("/sales/lead/") ? url : undefined,
      linkedinUrl: url.includes("/in/") ? url : undefined,
      title: text(card?.querySelector('[aria-label*="title" i], [data-anonymize="job-title"]')) || undefined,
      company: text(card?.querySelector('[aria-label*="company" i], [data-anonymize="company-name"]')) || undefined,
      location: text(card?.querySelector('[aria-label*="location" i]')) || undefined,
      snippet: lines.slice(0, 40).join(" ")
    });
  }
  return { leads, failures };
}

export function healthCheckSalesNavigator(root: ParentNode = document) {
  const result = parseSalesNavigatorLeads(root);
  return { parserVersion: salesNavigatorParserVersion, extractedCount: result.leads.length, failures: result.failures };
}

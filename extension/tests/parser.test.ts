import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseSalesNavigatorLeads } from "../parsers/salesNavigatorParser.ts";
import { parseVisibleMessages } from "../parsers/messagesParser.ts";

function fixture(name: string) {
  document.body.innerHTML = readFileSync(resolve(__dirname, "fixtures", name), "utf8");
}

describe("Reachlyst parsers", () => {
  it("extracts visible Sales Navigator leads", () => {
    fixture("sales-search-page.html");
    const result = parseSalesNavigatorLeads(document);
    expect(result.leads).toHaveLength(2);
    expect(result.leads[0].name).toContain("Maya Novak");
  });

  it("extracts a lead card", () => {
    fixture("sales-lead-card.html");
    const result = parseSalesNavigatorLeads(document);
    expect(result.leads[0].salesNavigatorUrl).toContain("/sales/lead/");
  });

  it("extracts visible message thread text", () => {
    fixture("linkedin-message-thread.html");
    const result = parseVisibleMessages(document);
    expect(result.messages.length).toBeGreaterThan(1);
  });
});

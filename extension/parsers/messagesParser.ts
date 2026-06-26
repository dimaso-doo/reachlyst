export const messagesParserVersion = "2026.06.25";

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export type ParsedLinkedInMessage = {
  senderType: "user" | "lead" | "unknown";
  body: string;
  sentAt?: string;
};

export function parseVisibleMessages(root: ParentNode = document): { messages: ParsedLinkedInMessage[]; failures: string[] } {
  const failures: string[] = [];
  const nodes = Array.from(root.querySelectorAll('[role="listitem"], article, li, [data-event-urn], [data-test-conversation-list-item], [aria-label*="conversation" i], [aria-label*="message" i]'));
  const seen = new Set<string>();
  const messages: ParsedLinkedInMessage[] = nodes.map((node) => {
    const body = clean(node.textContent);
    const aria = clean((node as Element).getAttribute("aria-label"));
    const senderType: ParsedLinkedInMessage["senderType"] = /you|me|your message/i.test(`${aria} ${body}`) ? "user" : /sent|message|replied|conversation/i.test(aria) ? "lead" : "unknown";
    return { senderType, body: body.slice(0, 5000) };
  }).filter((message) => {
    const key = `${message.senderType}:${message.body}`;
    if (message.body.length <= 3 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (messages.length === 0) failures.push("No visible message nodes found");
  return { messages, failures };
}

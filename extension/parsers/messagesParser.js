const messagesParserVersion = "2026.06.25";

function reachlystClean(value) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function parseVisibleMessages(root = document) {
  const failures = [];
  const nodes = Array.from(root.querySelectorAll('[role="listitem"], article, li, [data-event-urn], [data-test-conversation-list-item], [aria-label*="conversation" i], [aria-label*="message" i]'));
  const seen = new Set();
  const messages = nodes.map((node) => {
    const body = reachlystClean(node.textContent);
    const aria = reachlystClean(node.getAttribute("aria-label"));
    const senderType = /you|me|your message/i.test(`${aria} ${body}`) ? "user" : /sent|message|replied|conversation/i.test(aria) ? "lead" : "unknown";
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

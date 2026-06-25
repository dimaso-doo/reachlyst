const messagesParserVersion = "2026.06.25";

function reachlystClean(value) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function parseVisibleMessages(root = document) {
  const failures = [];
  const nodes = Array.from(root.querySelectorAll('[role="listitem"], article, li, [data-event-urn]'));
  const messages = nodes.map((node) => {
    const body = reachlystClean(node.textContent);
    const aria = reachlystClean(node.getAttribute("aria-label"));
    const senderType = /you|me/i.test(aria) ? "user" : /sent|message/i.test(aria) ? "lead" : "unknown";
    return { senderType, body: body.slice(0, 5000) };
  }).filter((message) => message.body.length > 3);
  if (messages.length === 0) failures.push("No visible message nodes found");
  return { messages, failures };
}

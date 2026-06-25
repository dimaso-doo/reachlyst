chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ reachlystApiBase: "https://reachlyst.vercel.app" });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "reachlyst_api") return false;

  chrome.storage.sync.get(["reachlystApiBase", "reachlystToken"], async (settings) => {
    try {
      if (!settings.reachlystToken) throw new Error("Missing Reachlyst extension token");
      const response = await fetch(`${settings.reachlystApiBase || "http://localhost:3001"}${message.path}`, {
        method: message.method || "GET",
        headers: {
          "content-type": "application/json",
          "x-reachlyst-extension-token": settings.reachlystToken,
          ...(message.headers || {})
        },
        body: message.body
      });
      const text = await response.text();
      sendResponse({ ok: response.ok, status: response.status, text });
    } catch (error) {
      sendResponse({ ok: false, status: 0, error: error.message || "Failed to fetch" });
    }
  });

  return true;
});

const DEFAULT_SETTINGS = {
  reachlystApiBase: "https://reachlyst.com",
  reachlystToken: "",
  reachlystEnabled: false,
  reachlystVerified: false,
  reachlystPlanName: ""
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), (values) => {
    const next = {};
    Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
      if (typeof values[key] === "undefined" || values[key] === "") next[key] = value;
    });
    if (Object.keys(next).length) chrome.storage.sync.set(next);
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "reachlyst_api") return false;

  chrome.storage.sync.get(["reachlystApiBase", "reachlystToken"], async (settings) => {
    try {
      const token = settings.reachlystToken || "";
      const apiBase = settings.reachlystApiBase || DEFAULT_SETTINGS.reachlystApiBase;
      const response = await fetch(`${apiBase}${message.path}`, {
        method: message.method || "GET",
        headers: {
          "content-type": "application/json",
          "x-reachlyst-extension-token": token,
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

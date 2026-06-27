const DEFAULT_SETTINGS = {
  reachlystApiBase: "https://reachlyst.com",
  reachlystToken: "",
  reachlystDeviceId: "",
  reachlystDeviceLabel: "",
  reachlystEnabled: false,
  reachlystVerified: false,
  reachlystPlanName: ""
};

function createDeviceId() {
  if (globalThis.crypto?.randomUUID) return `rlydev_${globalThis.crypto.randomUUID()}`;
  return `rlydev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

async function ensureDeviceIdentity() {
  const values = await chrome.storage.sync.get(["reachlystDeviceId", "reachlystDeviceLabel"]);
  const next = {};
  const deviceId = values.reachlystDeviceId || createDeviceId();
  const deviceLabel = values.reachlystDeviceLabel || `Chrome on ${navigator.platform || "this computer"}`;
  if (!values.reachlystDeviceId) next.reachlystDeviceId = deviceId;
  if (!values.reachlystDeviceLabel) next.reachlystDeviceLabel = deviceLabel;
  if (Object.keys(next).length) await chrome.storage.sync.set(next);
  return { deviceId, deviceLabel };
}

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
      const identity = await ensureDeviceIdentity();
      const response = await fetch(`${apiBase}${message.path}`, {
        method: message.method || "GET",
        headers: {
          "content-type": "application/json",
          "x-reachlyst-extension-token": token,
          "x-reachlyst-extension-device-id": identity.deviceId,
          "x-reachlyst-extension-device-label": identity.deviceLabel,
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

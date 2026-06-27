const DEFAULTS = {
  reachlystApiBase: "https://reachlyst.com",
  reachlystToken: "",
  reachlystDeviceId: "",
  reachlystDeviceLabel: "",
  reachlystEnabled: false,
  reachlystVerified: false,
  reachlystPlanName: ""
};

const stateEl = document.getElementById("state");
const statusEl = document.getElementById("status");
const tokenInput = document.getElementById("token");
const verifyButton = document.getElementById("verify");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

function setStatus(message, running = false, verified = false) {
  stateEl.dataset.running = running ? "true" : "false";
  stateEl.querySelector("strong").textContent = running ? "Running" : verified ? "Ready" : "Locked";
  statusEl.textContent = message;
  startButton.disabled = !verified || running;
  stopButton.disabled = !running;
}

async function ensureDefaults() {
  const values = await chrome.storage.sync.get(Object.keys(DEFAULTS));
  const next = {};

  Object.entries(DEFAULTS).forEach(([key, value]) => {
    if (typeof values[key] === "undefined") next[key] = value;
  });

  if (Object.keys(next).length) await chrome.storage.sync.set(next);
  return { ...DEFAULTS, ...values, ...next };
}

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

async function callReachlyst(path, token) {
  const settings = await chrome.storage.sync.get(["reachlystApiBase"]);
  const identity = await ensureDeviceIdentity();
  const response = await fetch(`${settings.reachlystApiBase || DEFAULTS.reachlystApiBase}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-reachlyst-extension-token": token,
      "x-reachlyst-extension-device-id": identity.deviceId,
      "x-reachlyst-extension-device-label": identity.deviceLabel
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || `Reachlyst rejected this token (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function verifyToken() {
  const token = tokenInput.value.trim();
  if (!token) {
    await chrome.storage.sync.set({ reachlystVerified: false, reachlystEnabled: false });
    setStatus("Paste your token from Reachlyst, then verify it.");
    return false;
  }

  verifyButton.disabled = true;
  verifyButton.textContent = "Verifying";

  try {
    const data = await callReachlyst("/api/extension/auth/verify-token", token);
    await chrome.storage.sync.set({
      reachlystToken: token,
      reachlystVerified: true,
      reachlystPlanName: data.plan?.plan || data.plan?.status || "active"
    });
    setStatus("Token verified. Open Sales Navigator search or messages and click Start.", false, true);
    return true;
  } catch (error) {
    await chrome.storage.sync.set({ reachlystVerified: false, reachlystEnabled: false });
    setStatus(error.status === 402 ? "Billing is not active for this token." : error.message);
    return false;
  } finally {
    verifyButton.disabled = false;
    verifyButton.textContent = "Verify token";
  }
}

async function messageActiveTab(type) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return false;
  await chrome.tabs.sendMessage(tab.id, { type }).catch(() => undefined);
  return true;
}

async function startReachlyst() {
  const verified = await verifyToken();
  if (!verified) return;
  await chrome.storage.sync.set({ reachlystEnabled: true });
  await messageActiveTab("reachlyst_start");
  setStatus("Running on visible Sales Navigator pages.", true, true);
}

async function stopReachlyst() {
  await chrome.storage.sync.set({ reachlystEnabled: false });
  await messageActiveTab("reachlyst_stop");
  const settings = await chrome.storage.sync.get(["reachlystVerified"]);
  setStatus("Paused. Click Start when you want Reachlyst on Sales Navigator.", false, settings.reachlystVerified === true);
}

verifyButton.addEventListener("click", verifyToken);
startButton.addEventListener("click", startReachlyst);
stopButton.addEventListener("click", stopReachlyst);
tokenInput.addEventListener("input", async () => {
  await chrome.storage.sync.set({ reachlystToken: tokenInput.value.trim(), reachlystVerified: false, reachlystEnabled: false });
  setStatus("Token changed. Verify it before starting.");
});

ensureDefaults().then((settings) => {
  tokenInput.value = settings.reachlystToken || "";
  setStatus(
    settings.reachlystVerified
      ? settings.reachlystEnabled
        ? "Running on visible Sales Navigator pages."
        : "Token verified. Open Sales Navigator search or messages and click Start."
      : "Paste your token from Reachlyst, then verify it.",
    settings.reachlystEnabled && settings.reachlystVerified,
    settings.reachlystVerified
  );
});

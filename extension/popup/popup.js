const DEFAULTS = {
  reachlystApiBase: "https://reachlyst.com",
  reachlystToken: "reachlyst-browser-session",
  reachlystUseCase: "sales_outreach",
  reachlystIcp: "Sales Navigator leads that match the active Reachlyst search playbook.",
  reachlystTone: "Professional, concise, human, non-spammy"
};

const stateEl = document.getElementById("state");
const statusEl = document.getElementById("status");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

function setStatus(message, running) {
  stateEl.dataset.running = running ? "true" : "false";
  stateEl.querySelector("strong").textContent = running ? "Running" : "Paused";
  statusEl.textContent = message;
  startButton.disabled = running;
  stopButton.disabled = !running;
}

async function ensureDefaults() {
  const values = await chrome.storage.sync.get(Object.keys(DEFAULTS).concat("reachlystEnabled"));
  const next = {};

  Object.entries(DEFAULTS).forEach(([key, value]) => {
    if (!values[key]) next[key] = value;
  });

  if (typeof values.reachlystEnabled !== "boolean") next.reachlystEnabled = false;
  if (Object.keys(next).length) await chrome.storage.sync.set(next);

  return { ...DEFAULTS, ...values, ...next };
}

async function messageActiveTab(type) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return false;
  await chrome.tabs.sendMessage(tab.id, { type }).catch(() => undefined);
  return true;
}

async function startReachlyst() {
  await chrome.storage.sync.set({ ...DEFAULTS, reachlystEnabled: true });
  await messageActiveTab("reachlyst_start");
  setStatus("Running on visible Sales Navigator and Messaging pages.", true);
}

async function stopReachlyst() {
  await chrome.storage.sync.set({ reachlystEnabled: false });
  await messageActiveTab("reachlyst_stop");
  setStatus("Paused. Click Start when you want Reachlyst to scan the visible page.", false);
}

startButton.addEventListener("click", startReachlyst);
stopButton.addEventListener("click", stopReachlyst);

ensureDefaults().then((settings) => {
  setStatus(
    settings.reachlystEnabled
      ? "Running on visible Sales Navigator and Messaging pages."
      : "Open LinkedIn Sales Navigator, then click Start.",
    settings.reachlystEnabled
  );
});

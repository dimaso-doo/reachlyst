const apiBaseInput = document.getElementById("apiBase");
const tokenInput = document.getElementById("token");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(["reachlystApiBase", "reachlystToken"], (values) => {
  apiBaseInput.value = values.reachlystApiBase || "http://localhost:3000";
  tokenInput.value = values.reachlystToken || "";
});

document.getElementById("save").addEventListener("click", async () => {
  const reachlystApiBase = apiBaseInput.value.trim();
  const reachlystToken = tokenInput.value.trim();
  await chrome.storage.sync.set({ reachlystApiBase, reachlystToken });
  statusEl.textContent = "Saved. Open Sales Navigator manually to use Reachlyst.";
});

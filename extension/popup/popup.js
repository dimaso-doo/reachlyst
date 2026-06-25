const apiBaseInput = document.getElementById("apiBase");
const tokenInput = document.getElementById("token");
const useCaseInput = document.getElementById("useCase");
const icpInput = document.getElementById("icp");
const toneInput = document.getElementById("tone");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(["reachlystApiBase", "reachlystToken", "reachlystUseCase", "reachlystIcp", "reachlystTone"], (values) => {
  apiBaseInput.value = values.reachlystApiBase || "https://reachlyst.vercel.app";
  tokenInput.value = values.reachlystToken || "";
  useCaseInput.value = values.reachlystUseCase || "sales_outreach";
  icpInput.value = values.reachlystIcp || "US marketing agency owners and founders. Prefer small teams where outreach is relevant and practical.";
  toneInput.value = values.reachlystTone || "Professional, concise, human, non-spammy";
});

document.getElementById("save").addEventListener("click", async () => {
  const reachlystApiBase = apiBaseInput.value.trim();
  const reachlystToken = tokenInput.value.trim();
  const reachlystUseCase = useCaseInput.value;
  const reachlystIcp = icpInput.value.trim();
  const reachlystTone = toneInput.value.trim();
  await chrome.storage.sync.set({ reachlystApiBase, reachlystToken, reachlystUseCase, reachlystIcp, reachlystTone });
  statusEl.textContent = "Saved. Open Sales Navigator manually to use Reachlyst.";
});

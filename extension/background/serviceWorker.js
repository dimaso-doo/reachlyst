chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ reachlystApiBase: "http://localhost:3000" });
});

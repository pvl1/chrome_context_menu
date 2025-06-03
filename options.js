const textarea = document.getElementById("settingsArea");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

// Load current settings
chrome.storage.sync.get("settings", (data) => {
  const settings = data.settings || [];
  textarea.value = JSON.stringify(settings, null, 2);
});

saveBtn.addEventListener("click", () => {
  try {
    const parsed = JSON.parse(textarea.value);
    if (!Array.isArray(parsed)) throw new Error("Expected an array");

    chrome.storage.local.set({ settings: parsed }, () => {
      // Send a message to the background to rebuild the context menu
      chrome.runtime.sendMessage({ action: "rebuild_menus" });

      status.textContent = "✔ Saved!";
      setTimeout(() => (status.textContent = ""), 2000);
    });
  } catch (e) {
    status.textContent = "❌ Invalid JSON!";
  }
});

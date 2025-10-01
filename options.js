const textarea = document.getElementById("settingsArea");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

chrome.storage.local.get("settings", function(result) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError.message);
  } else {
    textarea.value = JSON.stringify(result.settings|| [], null, 2);
  }
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


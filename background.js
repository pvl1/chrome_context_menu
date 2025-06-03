function createContextMenus(settings) {
  console.log("Creating menus with settings:", settings); // ← DEBUG
  chrome.contextMenus.removeAll(() => {
    const idMap = { "root": "root" };

    chrome.contextMenus.create({
      id: "root",
      title: "Send to...",
      contexts: ["selection"]
    });

    settings.forEach(([parentLabel, label, url, openInNewTab], i) => {
      const id = `item-${i}`;
      const parentId = idMap[parentLabel] || "root";

      if (!label) {
        chrome.contextMenus.create({
          id: `sep-${i}`,
          parentId,
          type: "separator",
          contexts: ["selection"]
        });
        return;
      }

      chrome.contextMenus.create({
        id,
        parentId,
        title: label,
        contexts: ["selection"]
      });

      idMap[label] = id; // allow children to refer to this label
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("settings", (data) => {
    const settings = data.settings || [];
    createContextMenus(settings);
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    createContextMenus(changes.settings.newValue);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.storage.local.get("settings", (data) => {
    const settings = data.settings || [];
    const match = settings.find((_, i) => `item-${i}` === info.menuItemId);
    if (!match) return;

    const [, label, url, openInNewTab] = match;
    const selected = encodeURIComponent(info.selectionText || "");
    const finalURL = url.replace("TESTSEARCH", selected);

    if (!url) return;

    chrome.tabs.create({ url: finalURL });
  });
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "rebuild_menus") {
    chrome.storage.local.get("settings", (data) => {
      const settings = data.settings || [];
      createContextMenus(settings);
    });
  }
});
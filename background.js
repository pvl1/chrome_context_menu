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

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
  const defaultSettings = [
    ["-1","Google Maps","http://www.google.com/maps/search/TESTSEARCH",true],
    ["root","[FLASK]","",true],
    ["[FLASK]","ABC","http://127.0.0.1:5000/abc?value=TESTSEARCH",true],
    ["[FLASK]","DEF","http://127.0.0.1:5000/def?why=bc&value=TESTSEARCH",true],
    ["-1","","",true],
    ["root","other google","",true],
    ["other google","drive","https://drive.google.com/drive/search?q=TESTSEARCH",true],
    ["other google","","",true],
    ["other google","chat|hangouts","https://mail.google.com/mail/u/0/#search/chat/TESTSEARCH/cmembership=1",true],
    ["-1","","",true],
    ["-1","wiki a","urla&search=TESTSEARCH",true]
  ];
    chrome.storage.local.set({ settings: defaultSettings });
    createContextMenus(defaultSettings);
  //chrome.runtime.sendMessage({ action: "rebuild_menus" });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    createContextMenus(changes.settings.newValue);
  }
});


function cleanText(text) {
  return text
  // Replace non-breaking spaces and other Unicode spaces with regular space
  .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
  // Replace multiple spaces or tabs with a single space
  .replace(/\s+/g, ' ')
  // Trim leading and trailing whitespace
  .trim();
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
 chrome.scripting.executeScript({
 target: { tabId: tab.id },
 func: () => {
 const selected = document.getSelection().toString()
 .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
 // Replace multiple spaces or tabs (but not newlines) with a single space
 .replace(/[ \t]+/g, ' ')
 // Trim spaces at the start/end of each line
 .replace(/^[ \t]+|[ \t]+$/gm, '')
 // Trim the entire string
 .trim();

 chrome.runtime.sendMessage({ selected });
 }
 });

 chrome.runtime.onMessage.addListener(function handleSelection(message) {
  chrome.runtime.onMessage.removeListener(handleSelection); // prevent multiple triggers

  chrome.storage.local.get("settings", (data) => {
  const settings = data.settings || [];
  const match = settings.find((_, i) => `item-${i}` === info.menuItemId);
  if (!match) return;

  const [, label, url, openInNewTab] = match;
  const selected = encodeURIComponent(message.selected || "");
  const finalURL = url.replace("TESTSEARCH", selected);

  if (!url) return;

  chrome.tabs.create({ url: finalURL });
  });
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

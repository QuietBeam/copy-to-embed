let rules = {};

// Load rules from storage
function loadRules() {
  browser.storage.local.get("rules").then((data) => {
    rules = data.rules || {};
  });
}

// Transform a URL based on the loaded rules
function transformURL(url) {
  if (!url) return null;
  for (let key in rules) {
    // Use a regular expression to match the domain more accurately
    const regex = new RegExp(`^(https?://)?(www\.)?${key}`);
    if (regex.test(url)) {
      return url.replace(key, rules[key]);
    }
  }
  return url;
}

// Create context menus when the extension is installed
browser.runtime.onInstalled.addListener(() => {
  // Set default rules on installation
  browser.storage.local.get("rules").then((data) => {
    if (!data.rules) {
      const defaultRules = {
        "instagram.com": "ddinstagram.com",
        "reddit.com": "vxreddit.com",
        "tiktok.com": "vxtiktok.com",
        "vm.tiktok.com" : "vm.tfxktok.com",
        "x.com": "fixupx.com",
      };
      browser.storage.local.set({ rules: defaultRules });
    }
  });

  browser.contextMenus.create({
    id: "transform-link",
    title: "Copy embed-friendly link",
    contexts: ["link"]
  });

  browser.contextMenus.create({
    id: "transform-page",
    title: "Copy embed-friendly page URL",
    contexts: ["page"]
  });

  loadRules();
});


browser.storage.onChanged.addListener(loadRules);

// Handle clicks on the context menu items
browser.contextMenus.onClicked.addListener((info, tab) => {
  let originalUrl = (info.menuItemId === "transform-link") ? info.linkUrl : tab.url;
  const transformed = transformURL(originalUrl);

  if (transformed) {
    // Copy the transformed URL to the clipboard
    navigator.clipboard.writeText(transformed)
      .then(() => {
        browser.notifications.create({
          "type": "basic",
          "iconUrl": browser.runtime.getURL("icon.svg"),
          "title": "Link Copied!",
          "message": `The transformed link has been copied to your clipboard: ${transformed}`
        });
        
      })
      .catch(err => console.error("Clipboard error:", err));
  }
});

let rules = {};

// Load rules from storage
const loadRules = () =>
  browser.storage.local.get("rules").then(d => rules = d.rules || {});

// Transform a URL based on rules
const transformURL = (url) => {
  if (!url) return null;
  for (let key in rules) {
    if (new RegExp(`^(https?://)?(www\.)?${key}`).test(url)) {
      return url.replace(key, rules[key]);
    }
  }
  return url;
};

// Create context menus
const createMenus = () => {
  browser.contextMenus.removeAll().then(() => {
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
  });
};

// Set default rules only on first install
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.storage.local.set({
      rules: {
        "instagram.com": "ddinstagram.com",
        "reddit.com": "vxreddit.com",
        "tiktok.com": "vxtiktok.com",
        "vm.tiktok.com": "vm.tfxktok.com",
        "x.com": "fixupx.com"
      }
    });
  }
});

// Handle menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  const url = info.menuItemId === "transform-link" ? info.linkUrl : tab.url;
  const transformed = transformURL(url);
  if (!transformed) return;

  browser.storage.local.get("notificationsEnabled").then(d => {
    navigator.clipboard.writeText(transformed).then(() => {
      if (d.notificationsEnabled !== false) {
        browser.notifications.create({
          type: "basic",
          iconUrl: browser.runtime.getURL("icon.svg"),
          title: "Link Copied!",
          message: `Copied: ${transformed}`
        });
      }
    }).catch(err => console.error("Clipboard error:", err));
  });
});


// Reload menus when rules change
browser.storage.onChanged.addListener(() => {
  loadRules().then(createMenus);
});

// Load menus on each extension load?
loadRules().then(createMenus);
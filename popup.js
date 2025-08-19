const rulesForm = document.getElementById("rulesForm");
const newSiteInput = document.getElementById("newSite");
const newReplaceInput = document.getElementById("newReplace");
const statusEl = document.getElementById("status");
const restoreStatus = document.getElementById("restore-status");

const defaultRules = {
  "instagram.com": "ddinstagram.com",
  "reddit.com": "vxreddit.com",
  "tiktok.com": "vxtiktok.com",
  "vm.tiktok.com": "vm.tfxktok.com",
  "x.com": "fixupx.com",
};

const createRuleElement = (site, replace) => {
  const el = document.createElement("div");
  el.className = "rule-container";

  const siteInput = document.createElement("input");
  siteInput.type = "text";
  siteInput.className = "site";
  siteInput.value = site;

  const arrow = document.createTextNode(" → ");

  const replaceInput = document.createElement("input");
  replaceInput.type = "text";
  replaceInput.className = "replace";
  replaceInput.value = replace;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteRule";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => el.remove());

  el.appendChild(siteInput);
  el.appendChild(arrow);
  el.appendChild(replaceInput);
  el.appendChild(deleteBtn);

  return el;
};


const renderRules = (rules) => {
  rulesForm.innerHTML = "";
  Object.entries(rules).forEach(([site, replace]) =>
    rulesForm.appendChild(createRuleElement(site, replace))
  );
};

const loadSettings = () => {
  browser.storage.local.get(["rules", "notificationsEnabled"]).then(data => {
    renderRules(data.rules || defaultRules);
    document.getElementById("notificationsEnabled").checked = data.notificationsEnabled !== false;
  });
};

const saveSettings = () => {
  const rules = {};
  rulesForm.querySelectorAll(".rule-container").forEach(c => {
    const site = c.querySelector(".site").value.trim();
    const replace = c.querySelector(".replace").value.trim();
    if (site && replace) rules[site] = replace;
  });
  browser.storage.local.set({
    rules,
    notificationsEnabled: document.getElementById("notificationsEnabled").checked
  }).then(() => {
    restoreStatus.textContent = "";
    statusEl.textContent = "Settings saved!";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  });
};

document.getElementById("selectLinkBtn").addEventListener("click", async () => {
  const showStatus = (msg, timeout = 3000) => {
    statusEl.textContent = msg;
    setTimeout(() => (statusEl.textContent = ""), timeout);
  };

  try {
    const { rules: storedRules } = await browser.storage.local.get("rules");
    const rules = storedRules || defaultRules;

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    let hostname;
    try {
      hostname = new URL(tab.url).hostname.toLowerCase();
    } catch {
      return showStatus("Cannot access the page URL.", 2000);
    }

    const matches = Object.keys(rules).some(ruleHost => {
      const rule = ruleHost.toLowerCase();
      return hostname === rule || hostname.endsWith("." + rule);
    });

    if (!matches) return showStatus("This page's host isn't covered by any rule.", 2500);

    try {
      await browser.tabs.sendMessage(tab.id, { action: "startSelectLink", rules });
    } catch {
      try {
        await browser.tabs.executeScript(tab.id, { file: "selectLink.js" });
        await browser.tabs.sendMessage(tab.id, { action: "startSelectLink", rules });
      } catch (err) {
        console.error("Failed to activate selector:", err);
        showStatus("Cannot activate selector on this page: " + (err.message || err));
      }
    }
  } catch (err) {
    console.error(err);
    showStatus("Unexpected error: " + (err.message || err));
  }
});


document.getElementById("addRule").addEventListener("click", () => {
  const site = newSiteInput.value.trim();
  const replace = newReplaceInput.value.trim();
  if (site && replace) {
    rulesForm.appendChild(createRuleElement(site, replace));
    saveSettings();
    newSiteInput.value = "";
    newReplaceInput.value = "";
  }
});

document.getElementById("clearNewRule").addEventListener("click", () => {
  newSiteInput.value = "";
  newReplaceInput.value = "";
});

document.getElementById("save").addEventListener("click", saveSettings);

document.getElementById("restoreDefaults").addEventListener("click", () => {
  renderRules(defaultRules);
  restoreStatus.textContent = "You need to click Save All to apply the reset to default settings";
});

loadSettings();
const rulesForm = document.getElementById("rulesForm");
const newSiteInput = document.getElementById("newSite");
const newReplaceInput = document.getElementById("newReplace");
const statusEl = document.getElementById("status");

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
    statusEl.textContent = "Settings saved!";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  });
};

document.getElementById("addRule").addEventListener("click", () => {
  const site = newSiteInput.value.trim();
  const replace = newReplaceInput.value.trim();
  if (site && replace) {
    rulesForm.appendChild(createRuleElement(site, replace));
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
});

loadSettings();
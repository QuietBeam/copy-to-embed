// Get DOM elements
const rulesForm = document.getElementById("rulesForm");
const newSiteInput = document.getElementById("newSite");
const newReplaceInput = document.getElementById("newReplace");

const defaultRules = {
        "instagram.com": "ddinstagram.com",
        "reddit.com": "vxreddit.com",
        "tiktok.com": "vxtiktok.com",
        "vm.tiktok.com" : "vm.tfxktok.com",
        "x.com": "fixupx.com",
};

// Create a new rule element in the DOM
function createRuleElement(site, replace) {
    const ruleContainer = document.createElement("div");
    ruleContainer.className = "rule-container";

    const siteInput = document.createElement("input");
    siteInput.type = "text";
    siteInput.value = site;
    siteInput.className = "site";

    const replaceInput = document.createElement("input");
    replaceInput.type = "text";
    replaceInput.value = replace;
    replaceInput.className = "replace";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "deleteRule";
    deleteButton.addEventListener("click", () => {
        ruleContainer.remove();
    });

    ruleContainer.appendChild(siteInput);
    ruleContainer.appendChild(document.createTextNode(" → "));
    ruleContainer.appendChild(replaceInput);
    ruleContainer.appendChild(deleteButton);

    return ruleContainer;
}

// Load rules from storage and display them in the form
function loadRules() {
    browser.storage.local.get("rules").then((data) => {
        const rules = data.rules || {};
        rulesForm.innerHTML = "";
        for (const site in rules) {
            rulesForm.appendChild(createRuleElement(site, rules[site]));
        }
    });
}

// Add a new rule to the form
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

// Save all rules to storage
document.getElementById("save").addEventListener("click", () => {
    const newRules = {};
    const ruleContainers = rulesForm.querySelectorAll(".rule-container");
    ruleContainers.forEach(container => {
        const siteInput = container.querySelector(".site");
        const replaceInput = container.querySelector(".replace");
        newRules[siteInput.value.trim()] = replaceInput.value.trim();
    });

    browser.storage.local.set({ rules: newRules }).then(() => {
        const status = document.getElementById("status");
        status.textContent = "Settings saved!";
        setTimeout(() => {
            status.textContent = "";
        }, 2000);
    });
});

document.getElementById("restoreDefaults").addEventListener("click", () => {
    rulesForm.innerHTML = "";
    for (const site in defaultRules) {
        rulesForm.appendChild(createRuleElement(site, defaultRules[site]));
    }
});

// Load the rules when the popup is opened
loadRules();
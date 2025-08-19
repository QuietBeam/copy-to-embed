// Content script for selecting and transforming a link

const highlightClass = "embed-select-highlight";

function createStyle() {
  const style = document.createElement("style");
  style.textContent = `
    a.${highlightClass} {
      outline: 3px solid #0060df;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}

function clearHighlights() {
  document.querySelectorAll(`a.${highlightClass}`).forEach(a => {
    a.classList.remove(highlightClass);
    a.removeEventListener("click", linkClickHandler);
  });
}

function linkClickHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  const url = this.href;

  // Send URL back to background script for transformation and copy
  browser.runtime.sendMessage({action: "linkSelected", url});
  clearHighlights();
}

function hostMatchesRules(hostname, rules) {
  hostname = hostname.toLowerCase();
  return Object.keys(rules).some(ruleHost => {
    const normalizedRule = ruleHost.toLowerCase();
    return hostname === normalizedRule || hostname.endsWith('.' + normalizedRule);
  });
}

function startSelection(rules) {
  createStyle();
  clearHighlights();

const links = Array.from(document.querySelectorAll("a[href]")).filter(a => {
  try {
    const url = new URL(a.getAttribute("href"), location.origin);
    return hostMatchesRules(url.hostname, rules);
  } catch (e) {
    return false;
  }
});

  links.forEach(a => {
    a.classList.add(highlightClass);
    a.addEventListener("click", linkClickHandler);
  });

  // Optional: Add ESC key to cancel selection
  function escHandler(e) {
    if (e.key === "Escape") {
      clearHighlights();
      window.removeEventListener("keydown", escHandler);
    }
  }
  window.addEventListener("keydown", escHandler);
}

// Listen for messages from popup
// Accept rules via the start message; if not present, load from storage
browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "startSelectLink") {
    if (msg.rules && Object.keys(msg.rules).length) {
      startSelection(msg.rules);
    } else {
      // fallback to stored rules
      browser.storage.local.get('rules').then(d => {
        const rules = d.rules || {};
        startSelection(rules);
      }).catch(() => startSelection({}));
    }
  }
});

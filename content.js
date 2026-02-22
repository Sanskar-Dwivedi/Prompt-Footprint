const PROMPT_SELECTOR = "#prompt-textarea";
const SEND_BUTTON_SELECTOR = [
  'button[data-testid="send-button"]',
  'button[aria-label*="Send"]',
  'button[aria-label*="send"]'
].join(",");
const DEDUPE_WINDOW_MS = 1200;

let lastCountedAt = 0;

function getStorageArea() {
  if (typeof chrome === "undefined") {
    return null;
  }

  if (!chrome.storage || !chrome.storage.local) {
    return null;
  }

  return chrome.storage.local;
}

function incrementCounter() {
  const storageArea = getStorageArea();

  if (!storageArea) {
    console.warn("Prompt Footprint: storage API unavailable in content script. Refresh the ChatGPT tab and try again.");
    return;
  }

  try {
    storageArea.get(["total"], (result) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn("Prompt Footprint: failed to read storage:", chrome.runtime.lastError.message);
        return;
      }

      const newTotal = (result.total || 0) + 1;

      storageArea.set({ total: newTotal }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.warn("Prompt Footprint: failed to write storage:", chrome.runtime.lastError.message);
          return;
        }

        console.log("Prompt counted. Total:", newTotal);
      });
    });
  } catch (error) {
    console.warn("Prompt Footprint: storage access failed in content script.", error);
  }
}

function getPromptText() {
  const promptBox = document.querySelector(PROMPT_SELECTOR);
  if (!promptBox) {
    return "";
  }

  return (promptBox.innerText || promptBox.textContent || "").trim();
}

function tryCountPrompt(source) {
  const promptText = getPromptText();
  if (!promptText) {
    return;
  }

  const now = Date.now();
  if (now - lastCountedAt < DEDUPE_WINDOW_MS) {
    return;
  }

  lastCountedAt = now;
  incrementCounter();
  console.log("Prompt Footprint: counted via", source);
}

function handleKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (event.isComposing || event.repeat) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (!target.closest(PROMPT_SELECTOR)) {
    return;
  }

  tryCountPrompt("enter");
}

function handleClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const sendButton = target.closest(SEND_BUTTON_SELECTOR);
  if (!sendButton) {
    return;
  }

  if (sendButton.matches(":disabled") || sendButton.getAttribute("aria-disabled") === "true") {
    return;
  }

  tryCountPrompt("click");
}

function bindListeners() {
  if (document.documentElement.dataset.promptFootprintBound === "true") {
    return;
  }

  document.documentElement.dataset.promptFootprintBound = "true";
  document.addEventListener("keydown", handleKeydown, true);
  document.addEventListener("click", handleClick, true);
  console.log("Prompt Footprint listeners attached");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindListeners, { once: true });
} else {
  bindListeners();
}

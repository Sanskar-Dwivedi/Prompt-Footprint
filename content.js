function incrementCounter() {
    const storageArea = globalThis.chrome?.storage?.local;

    if (!storageArea) {
        console.warn("Prompt Footprint: storage API unavailable in content script. Reload the tab after reloading the extension.");
        return;
    }

    try {
        storageArea.get(["total"], function(result) {
            if (chrome.runtime?.lastError) {
                console.warn("Prompt Footprint: failed to read storage:", chrome.runtime.lastError.message);
                return;
            }

            let newTotal = (result.total || 0) + 1;

            storageArea.set({ total: newTotal }, function() {
                if (chrome.runtime?.lastError) {
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

function attachListener(inputBox) {
    if (inputBox.dataset.listenerAttached) return;

    inputBox.dataset.listenerAttached = "true";

    inputBox.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            incrementCounter();
        }
    });

    console.log("Listener attached to ChatGPT input");
}

const observer = new MutationObserver(() => {
    const inputBox = document.querySelector("#prompt-textarea");
    if (inputBox) {
        attachListener(inputBox);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("Prompt Footprint observer started");

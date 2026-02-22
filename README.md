# Prompt Footprint

Measuring the invisible cost of AI interaction.

Prompt Footprint is a Chrome Extension (Manifest V3) that tracks how many prompts you send to ChatGPT and estimates a simple "water evaporated" footprint.

## What it does

- Counts prompts sent on `chatgpt.com` / `chat.openai.com`
- Shows total prompts in the popup
- Estimates water usage from a local constant
- Displays a lightweight animated footer + snark line in the popup

## Privacy First

Prompt Footprint is designed to be local-only:

- No prompt text is stored
- No prompt text is sent anywhere
- No analytics or external requests
- Only local counters / derived estimates are stored in `chrome.storage.local`

## Install (Load Unpacked)

This extension is not published on the Chrome Web Store yet. You can run it locally:

1. Open `chrome://extensions`
2. Enable `Developer mode` (top-right)
3. Click `Load unpacked`
4. Select this project folder 

## How to use

1. Open `chatgpt.com` or `chat.openai.com`
2. Send prompts as usual
3. Click the Prompt Footprint extension icon
4. View:
   - Total prompts
   - Estimated water evaporated
   - Footer animation

## Notes

- If you reload the extension while a ChatGPT tab is already open, refresh the tab once.

## Status

Early local prototype. ChatGPT tracking only (for now).

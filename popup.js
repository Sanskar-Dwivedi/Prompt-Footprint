const STORAGE_KEY_TOTAL = "total";
const WATER_PER_PROMPT_ML = 25;

const FRAME_SOURCES = [
  "frames/frame1.png",
  "frames/frame2.png",
  "frames/frame3.png",
  "frames/frame4.png"
];

const LOOP_DURATION_MS_BY_COUNT = {
  3: 1900,
  4: 2200
};

const numberFormatter = new Intl.NumberFormat();

let dom = {};

document.addEventListener("DOMContentLoaded", async () => {
  dom = {
    totalPrompts: document.getElementById("totalPrompts"),
    totalWater: document.getElementById("totalWater"),
    snarkLine: document.getElementById("snarkLine"),
    spriteStage: document.getElementById("spriteStage")
  };

  await initializeSpriteAnimation();
  await refreshPopup();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY_TOTAL]) {
      return;
    }

    const nextTotal = changes[STORAGE_KEY_TOTAL].newValue || 0;
    renderTotals(nextTotal);
  });
});

function getLocalStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result || {});
    });
  });
}

async function refreshPopup() {
  const storage = await getLocalStorage([STORAGE_KEY_TOTAL]);
  const totalPrompts = storage[STORAGE_KEY_TOTAL] || 0;
  renderTotals(totalPrompts);
}

function renderTotals(totalPrompts) {
  const totalWaterML = totalPrompts * WATER_PER_PROMPT_ML;

  dom.totalPrompts.textContent = numberFormatter.format(totalPrompts);
  dom.totalWater.textContent = formatWater(totalWaterML);
  dom.snarkLine.textContent = pickSnarkLine(totalWaterML);
}

function formatWater(totalWaterML) {
  if (totalWaterML >= 1000) {
    const liters = totalWaterML / 1000;
    const decimals = liters >= 10 ? 1 : 2;
    return `${liters.toFixed(decimals)} L`;
  }

  return `${numberFormatter.format(totalWaterML)} mL`;
}

function pickSnarkLine(totalWaterML) {
  const zeroUsage = [
    "Clean slate. The data center is getting a tiny break.",
    "No prompts yet. The evaporated water budget remains unbothered.",
    "Nothing counted so far. Very restrained of you."
  ];

  const smallUsage = [
    "Keep up the good work...",
    "Nice. The data center is staying lightly hydrated.",
    "A modest footprint. Still a footprint, though."
  ];

  const mediumUsage = [
    "Solid pace. Your water footprint has momentum now.",
    "Impressive consistency. The cooling systems noticed.",
    "Congrats. Your evaporation estimate is becoming a regular."
  ];

  const heavyUsage = [
    "Okay wow. Your water footprint is absolutely thriving.",
    "That is a lot of prompts. The servers are not exactly dry.",
    "Strong numbers. The evaporation chart would like a word."
  ];

  if (totalWaterML === 0) {
    return pickRandom(zeroUsage);
  }

  if (totalWaterML < 1500) {
    return pickRandom(smallUsage);
  }

  if (totalWaterML < 10000) {
    return pickRandom(mediumUsage);
  }

  return pickRandom(heavyUsage);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function initializeSpriteAnimation() {
  const availableFrames = await getAvailableFrameSources();

  if (availableFrames.length < 3) {

    dom.spriteStage.className = "sprite-stage is-empty";
    return;
  }

  const frameCount = availableFrames.length >= 4 ? 4 : 3;
  const loopDurationMs = LOOP_DURATION_MS_BY_COUNT[frameCount] || 2000;
  const framesToRender = availableFrames.slice(0, frameCount);

  dom.spriteStage.replaceChildren();
  dom.spriteStage.className = `sprite-stage is-${frameCount}`;
  dom.spriteStage.style.setProperty("--loop-duration", `${loopDurationMs}ms`);

  framesToRender.forEach((src, index) => {
    const img = document.createElement("img");
    img.className = "sprite-frame";
    img.src = src;
    img.alt = "";
    img.decoding = "async";

    const stepMs = loopDurationMs / frameCount;
    img.style.animationDelay = `-${index * stepMs}ms`;

    dom.spriteStage.appendChild(img);
  });
}

async function getAvailableFrameSources() {
  const checks = FRAME_SOURCES.map((path) => testImage(chrome.runtime.getURL(path)));
  const results = await Promise.all(checks);
  return results.filter(Boolean);
}

function testImage(src) {
  return new Promise((resolve) => {
    const probe = new Image();

    probe.onload = () => resolve(src);
    probe.onerror = () => resolve(null);
    probe.src = src;
  });
}

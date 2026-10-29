import { state } from "../core/state.js";
import { assetUrl } from "../config/paths.js";

const GOLDEN_CAT = assetUrl("/skins/cats/secret/goldenCat.png");
const GOLD_COIN = assetUrl("/skins/coins/catCoin.png");
const SPINNING_COIN = assetUrl("/skins/coins/gold_spin.png");

const MIN_SPAWN_DELAY = 60_000;
const MAX_SPAWN_DELAY = 180_000;

const COIN_LIFETIME = 25_000;
const RAIN_DURATION = 60_000;
const RAIN_INTERVAL = 120;

const COIN_FRAME_WIDTH = 25;
const COIN_FRAME_HEIGHT = 25;
const COIN_TOTAL_FRAMES = 7;
const COIN_FRAME_INTERVAL = 100;

const GOLDEN_CAT_COLUMNS = 3;
const GOLDEN_CAT_ROWS = 4;
const GOLDEN_CAT_FRAME_WIDTH = 32;
const GOLDEN_CAT_FRAME_HEIGHT = 32;
const GOLDEN_CAT_FRAME_INTERVAL = 150;

let spawnTimer = null;
let previousSkinBackground = null;
let coinExpirationTimer = null;
let goldenCatAnimationTimer = null;
let rainTimer = null;
let rainInterval = null;
let activeCoin = null;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function scheduleNextCoin() {
  if (spawnTimer !== null) {
    clearTimeout(spawnTimer);
  }

  const delay = randomBetween(MIN_SPAWN_DELAY, MAX_SPAWN_DELAY);

  spawnTimer = setTimeout(() => {
    spawnTimer = null;

    if (!activeCoin) {
      spawnGoldCoin();
    }

    scheduleNextCoin();
  }, delay);
}

function spawnGoldCoin() {
  if (activeCoin) return;

  const coin = document.createElement("button");

  coin.type = "button";
  coin.className = "golden-event-coin";
  coin.setAttribute("aria-label", "Collect the Golden Cat event");

  coin.style.backgroundImage = `url("${GOLD_COIN}")`;

  const size = 80;
  const maxX = Math.max(0, window.innerWidth - size);
  const maxY = Math.max(0, window.innerHeight - size);

  coin.style.width = `${size}px`;
  coin.style.height = `${size}px`;
  coin.style.left = `${Math.random() * maxX}px`;
  coin.style.top = `${Math.random() * maxY}px`;

  document.body.appendChild(coin);
  activeCoin = coin;

  coin.addEventListener("click", () => {
    if (activeCoin !== coin) return;

    removeGoldCoin();
    activateGoldenCat();
  });

  coinExpirationTimer = setTimeout(() => {
    if (activeCoin === coin) {
      removeGoldCoin();
    }
  }, COIN_LIFETIME);
}

function removeGoldCoin() {
  if (coinExpirationTimer !== null) {
    clearTimeout(coinExpirationTimer);
    coinExpirationTimer = null;
  }

  if (activeCoin) {
    activeCoin.remove();
    activeCoin = null;
  }
}

function animateGoldenCat(sprite) {
  if (goldenCatAnimationTimer !== null) {
    clearInterval(goldenCatAnimationTimer);
    goldenCatAnimationTimer = null;
  }

  let frame = 0;

  sprite.style.backgroundSize =
    `${GOLDEN_CAT_COLUMNS * GOLDEN_CAT_FRAME_WIDTH}px ` +
    `${GOLDEN_CAT_ROWS * GOLDEN_CAT_FRAME_HEIGHT}px`;

  sprite.style.backgroundRepeat = "no-repeat";

  function showFrame() {
    if (!sprite.isConnected || sprite.dataset.goldenCatActive !== "true") {
      clearInterval(goldenCatAnimationTimer);
      goldenCatAnimationTimer = null;
      return;
    }

    const column = frame % GOLDEN_CAT_COLUMNS;
    const row = Math.floor(frame / GOLDEN_CAT_COLUMNS);

    sprite.style.backgroundPosition =
      `-${column * GOLDEN_CAT_FRAME_WIDTH}px ` +
      `-${row * GOLDEN_CAT_FRAME_HEIGHT}px`;

    frame = (frame + 1) % (GOLDEN_CAT_COLUMNS * GOLDEN_CAT_ROWS);
  }

  showFrame();

  goldenCatAnimationTimer = setInterval(showFrame, GOLDEN_CAT_FRAME_INTERVAL);
}

function activateGoldenCat() {
  const sprite = document.getElementById("clickBtn");

  if (!sprite) {
    console.warn("Golden Cat event: #clickBtn was not found.");
    return;
  }

  previousSkinBackground = {
    backgroundImage: sprite.style.backgroundImage,
    backgroundSize: sprite.style.backgroundSize,
    backgroundRepeat: sprite.style.backgroundRepeat,
    backgroundPosition: sprite.style.backgroundPosition,
  };

  state.goldenCatActive = true;
  sprite.dataset.goldenCatActive = "true";

  sprite.style.backgroundImage = `url("${GOLDEN_CAT}")`;

  animateGoldenCat(sprite);
  startGoldenCoinRain();

  if (typeof window.debugSaveGame === "function") {
    window.debugSaveGame();
  }
}

function animateGoldenCoin(coin) {
  let frame = 0;

  coin.style.backgroundSize = `${COIN_TOTAL_FRAMES * 100}% 100%`;
  coin.style.backgroundPosition = "0 0";
  coin.style.backgroundRepeat = "no-repeat";

  const animation = setInterval(() => {
    if (!coin.isConnected) {
      clearInterval(animation);
      return;
    }

    coin.style.backgroundPosition = `-${frame * COIN_FRAME_WIDTH}px 0`;

    frame = (frame + 1) % COIN_TOTAL_FRAMES;
  }, COIN_FRAME_INTERVAL);
}

function startGoldenCoinRain() {
  const container = document.querySelector(".cat-container");

  if (!container) {
    console.warn("Golden Cat event: .cat-container was not found.");
    return;
  }

  if (rainInterval !== null) {
    clearInterval(rainInterval);
    rainInterval = null;
  }

  if (rainTimer !== null) {
    clearTimeout(rainTimer);
    rainTimer = null;
  }

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  container.classList.add("golden-cat-active");

  createFallingCoin(container);

  rainInterval = setInterval(() => {
    createFallingCoin(container);
  }, RAIN_INTERVAL);

  rainTimer = setTimeout(() => {
    stopGoldenCoinRain();
  }, RAIN_DURATION);
}

function createFallingCoin(container) {
  const coin = document.createElement("div");

  coin.className = "golden-rain-coin";
  coin.setAttribute("aria-hidden", "true");

  coin.style.backgroundImage = `url("${SPINNING_COIN}")`;
  coin.style.width = `${COIN_FRAME_WIDTH}px`;
  coin.style.height = `${COIN_FRAME_HEIGHT}px`;

  const containerWidth = container.clientWidth;
  const left = Math.random() * Math.max(0, containerWidth - COIN_FRAME_WIDTH);

  const duration = randomBetween(1.5, 3);

  coin.style.left = `${left}px`;
  coin.style.top = `${-COIN_FRAME_HEIGHT}px`;

  coin.style.setProperty("--coin-fall-duration", `${duration}s`);
  coin.style.setProperty("--coin-drift", `${randomBetween(-35, 35)}px`);

  container.appendChild(coin);

  animateGoldenCoin(coin);

  setTimeout(
    () => {
      coin.remove();
    },
    duration * 1000 + 100,
  );
}

function restorePreviousSkin() {
  if (goldenCatAnimationTimer !== null) {
    clearInterval(goldenCatAnimationTimer);
    goldenCatAnimationTimer = null;
  }

  const sprite = document.getElementById("clickBtn");

  if (sprite && previousSkinBackground) {
    sprite.style.backgroundImage = previousSkinBackground.backgroundImage;
    sprite.style.backgroundSize = previousSkinBackground.backgroundSize;
    sprite.style.backgroundRepeat = previousSkinBackground.backgroundRepeat;
    sprite.style.backgroundPosition = previousSkinBackground.backgroundPosition;

    delete sprite.dataset.goldenCatActive;
  }

  previousSkinBackground = null;
  state.goldenCatActive = false;
}

function stopGoldenCoinRain() {
  if (rainInterval !== null) {
    clearInterval(rainInterval);
    rainInterval = null;
  }

  if (rainTimer !== null) {
    clearTimeout(rainTimer);
    rainTimer = null;
  }

  restorePreviousSkin();

  document
    .querySelector(".cat-container")
    ?.classList.remove("golden-cat-active");

  document.querySelectorAll(".golden-rain-coin").forEach((coin) => {
    coin.remove();
  });

  if (typeof window.debugSaveGame === "function") {
    window.debugSaveGame();
  }
}

export function initGoldenCoinEvent() {
  if (spawnTimer !== null) {
    clearTimeout(spawnTimer);
    spawnTimer = null;
  }

  removeGoldCoin();
  stopGoldenCoinRain();
  scheduleNextCoin();
}

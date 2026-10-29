import { state } from "../core/state.js";
import { save } from "../storage/save.js";
import { BACKGROUNDS } from "../config/backgrounds.js";
import { SKINS } from "../config/skins.js";
import { assetUrl } from "../config/paths.js";
import { showSkinReward } from "../ui/skins/skinReward.js";

const FOREST_BACKGROUND_ID = "forest_fireflies_night";
const ALIEN_SKIN_ID = "alienCat";

const UFO_DEATH_IMAGE = assetUrl("/skins/ufoEvent/UFO_death_night.gif");
const UFO_IMAGE = assetUrl("/skins/ufoEvent/UFO_night.gif");
const UFO_BEAM_IMAGE = assetUrl("/skins/ufoEvent/UFO_beam.gif");
const ALIEN_CAT_IMAGE = assetUrl("/skins/cats/secret/alienCat.gif");

const UFO_SIZE = 160;

const FIRST_UFO_DURATION = 5_000;
const SECOND_UFO_DURATION = 10_000;
const BEAM_DELAY = 5_000;
const BEAM_DURATION = 10_000;

let eventRunning = false;
let eventInitialized = false;
let eventTimers = [];
let completionCallback = null;

let ufoElement = null;
let beamElement = null;

function isForestBackgroundEquipped() {
  const background = BACKGROUNDS[state.equippedBackground];

  return (
    state.equippedBackground === FOREST_BACKGROUND_ID ||
    background?.image?.replace(/^\//, "").endsWith("forest_fireflies_night.png")
  );
}

function scheduleEventAction(callback, delay) {
  const timer = setTimeout(callback, delay);
  eventTimers.push(timer);
  return timer;
}

function clearEventTimers() {
  for (const timer of eventTimers) {
    clearTimeout(timer);
  }

  eventTimers = [];
}

function createUfoImage(src, className, alt) {
  const image = document.createElement("img");

  image.src = src;
  image.className = className;
  image.alt = alt;
  image.width = UFO_SIZE;
  image.height = UFO_SIZE;
  image.draggable = false;

  image.addEventListener("error", () => {
    console.error("Could not load UFO event image:", src);
  });

  return image;
}

function showFirstUfo(container) {
  ufoElement = createUfoImage(
    UFO_DEATH_IMAGE,
    "ufo-event-image ufo-event-main",
    "A UFO appears",
  );

  container.appendChild(ufoElement);
}

function showSecondUfo() {
  if (!ufoElement) {
    return;
  }

  ufoElement.src = UFO_IMAGE;
  ufoElement.alt = "A UFO hovering above the cat";
}

function showBeam(container) {
  beamElement = createUfoImage(
    UFO_BEAM_IMAGE,
    "ufo-event-image ufo-event-beam",
    "",
  );

  beamElement.setAttribute("aria-hidden", "true");

  container.appendChild(beamElement);
}

function removeUfoElements() {
  ufoElement?.remove();
  beamElement?.remove();

  ufoElement = null;
  beamElement = null;

  document
    .querySelector(".cat-container")
    ?.classList.remove("ufo-event-active");
}

function unlockAndEquipAlienCat() {
  const sprite = document.getElementById("clickBtn");
  const skin = SKINS[ALIEN_SKIN_ID];

  if (!sprite || !skin) {
    console.error("Could not unlock Alien Cat: sprite or skin is missing.");
    return;
  }

  if (!Array.isArray(state.ownedSkins)) {
    state.ownedSkins = [];
  }

  if (!state.ownedSkins.includes(ALIEN_SKIN_ID)) {
    state.ownedSkins.push(ALIEN_SKIN_ID);
  }

  state.equippedSkin = ALIEN_SKIN_ID;

  delete sprite.dataset.goldenCatActive;

  sprite.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
  sprite.style.backgroundSize = "contain";
  sprite.style.backgroundPosition = "center";
  sprite.style.backgroundRepeat = "no-repeat";

  state.ufoEventCompleted = true;

  save();

  showSkinReward({
    ...skin,
    image: assetUrl(skin.img),
  });
}

function finishUfoEvent() {
  if (!eventRunning) {
    return;
  }

  clearEventTimers();
  removeUfoElements();

  eventRunning = false;

  unlockAndEquipAlienCat();
}

export function triggerUfoEvent() {
  if (eventRunning || state.ufoEventCompleted) {
    return;
  }

  if (!isForestBackgroundEquipped()) {
    return;
  }

  const container = document.querySelector(".cat-container");

  if (!container) {
    console.error("UFO event: .cat-container was not found.");
    return;
  }

  eventRunning = true;

  clearEventTimers();

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  container.classList.add("ufo-event-active");

  showFirstUfo(container);

  scheduleEventAction(() => {
    showSecondUfo();
  }, FIRST_UFO_DURATION);

  scheduleEventAction(() => {
    showBeam(container);
  }, FIRST_UFO_DURATION + BEAM_DELAY);

  scheduleEventAction(() => {
    finishUfoEvent();
  }, FIRST_UFO_DURATION + SECOND_UFO_DURATION);
}

export function initUfoEvent(onComplete) {
  if (eventInitialized) {
    return;
  }

  eventInitialized = true;
  completionCallback = onComplete;

  if (isForestBackgroundEquipped()) {
    triggerUfoEvent();
  }
}

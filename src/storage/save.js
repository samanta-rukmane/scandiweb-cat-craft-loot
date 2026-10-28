import { state } from "../core/state.js";
import { BACKGROUNDS } from "../config/backgrounds.js";
// - ADD -
import { SKINS } from "../config/skins.js";
// - - - -


const NUMBER_FIELDS = ["treats", "dust", "energy", "clickLevel"];
// - ADD -
const DEFAULT_STATS = { totalClicks: 0, boxesOpened: 0, totalTreats: 0 };
const SAVE_VERSION = 1;
const migrations = {};

function migrate(data) {
  let v = data.version ?? 1;
  while (v < SAVE_VERSION && migrations[v]) {
    data = migrations[v](data);
    v = data.version;
  }
  return data;
}
// - - - -


export function save() {
  if (
    NUMBER_FIELDS.some(
      (field) => !Number.isFinite(state[field]) || state[field] < 0,
    )
  ) {
    console.error("Game was not saved because a number is invalid.");
    return;
  }

  try {
    state.lastSeen = Date.now();

    localStorage.setItem("save", JSON.stringify(state));
  } catch (error) {
    console.error("Could not save game:", error);
  }
}

export function load() {
  try {
    const saved = localStorage.getItem("save");

    if (saved) {
      const savedData = JSON.parse(saved);

      if (
        savedData &&
        typeof savedData === "object" &&
        !Array.isArray(savedData)
      ) {
        // - DELETE -
        // Object.assign(state, savedData);
        // - ADD -
           Object.assign(state, migrate(savedData));
        // - - - -
      }
    }
  } catch (error) {
    console.error("Could not load saved game:", error);
  }

  for (const field of NUMBER_FIELDS) {
    const value = Number(state[field]);

    state[field] = Number.isFinite(value) && value >= 0 ? value : 0;
  }

  if (
    !state.generators ||
    typeof state.generators !== "object" ||
    Array.isArray(state.generators)
  ) {
    state.generators = {};
  }

  for (const id of ["toy", "bowl", "bed"]) {
    const level = Number(state.generators[id] ?? 0);

    state.generators[id] = Number.isInteger(level) && level >= 0 ? level : 0;
  }

  if (!Array.isArray(state.ownedBackgrounds)) {
    state.ownedBackgrounds = ["cozy_room"];
  }

  state.ownedBackgrounds = [
    ...new Set(
      state.ownedBackgrounds.filter(
        (id) => typeof id === "string" && Object.hasOwn(BACKGROUNDS, id),
      ),
    ),
  ];

  if (!state.ownedBackgrounds.includes("cozy_room")) {
    state.ownedBackgrounds.unshift("cozy_room");
  }

  if (
    typeof state.equippedBackground !== "string" ||
    !Object.hasOwn(BACKGROUNDS, state.equippedBackground) ||
    !state.ownedBackgrounds.includes(state.equippedBackground)
  ) {
    state.equippedBackground = "cozy_room";
  }

  
  // - ADD -
  state.stats = {
    ...DEFAULT_STATS,
    ...(state.stats && typeof state.stats === "object" ? state.stats : {}),
  };

  state.ownedSkins = (Array.isArray(state.ownedSkins) ? state.ownedSkins : [])
    .filter((id) => typeof id === "string" && Object.hasOwn(SKINS, id));
  if (!state.ownedSkins.includes("default")) state.ownedSkins.unshift("default");
  if (!state.ownedSkins.includes(state.equippedSkin)) state.equippedSkin = "default";

  if (!Array.isArray(state.achievements)) state.achievements = [];
  if (!Array.isArray(state.foundSecretCats)) state.foundSecretCats = [];
  if (typeof state.lastDailyClaim !== "string") state.lastDailyClaim = "";
 // - - - -
}

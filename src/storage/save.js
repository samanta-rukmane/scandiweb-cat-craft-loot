import { state } from "../core/state.js";
import { BACKGROUNDS } from "../config/backgrounds.js";

const NUMBER_FIELDS = ["treats", "dust", "energy", "clickLevel"];

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
        Object.assign(state, savedData);
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
}

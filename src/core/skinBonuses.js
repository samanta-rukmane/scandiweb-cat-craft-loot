import { state } from "./state.js";
import { SKINS } from "../config/skins.js";
import { getSkillMultiplier } from "./skillTree.js";

const MAX_FRACTION = 0.9;

export function getSkinBonuses() {
  const bonuses = (SKINS[state.equippedSkin] ?? SKINS.default)?.bonuses ?? {};
  const k = getSkillMultiplier("skinEffect");
  if (k === 1) return bonuses;

  const scaled = {};
  for (const [key, value] of Object.entries(bonuses)) {
    if (typeof value !== "number") {
      scaled[key] = value;
    } else if (key.endsWith("Multiplier")) {
      scaled[key] = 1 + (value - 1) * k;
    } else {
      scaled[key] = Math.min(MAX_FRACTION, value * k);
    }
  }
  return scaled;
}

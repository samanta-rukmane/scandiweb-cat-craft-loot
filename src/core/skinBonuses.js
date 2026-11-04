import { state } from "./state.js";
import { SKINS } from "../config/skins.js";

export function getSkinBonuses() {
  const equippedSkin = SKINS[state.equippedSkin] ?? SKINS.default;

  return equippedSkin?.bonuses ?? {};
}

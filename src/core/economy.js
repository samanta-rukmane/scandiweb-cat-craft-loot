import { state } from "./state.js";
import { CLICK_UPGRADE } from "../config/upgrades.js";
import { GENERATORS } from "../config/generators.js";

export function clickCat() {
  state.treats += getClickPower();
  state.stats.totalTreats += getClickPower();
  state.stats.totalClicks += 1;
}

export function getClickPower() {
  return 1 + state.clickLevel * CLICK_UPGRADE.powerPerLevel;
}

export function getClickCost() {
  return Math.floor(
    CLICK_UPGRADE.baseCost * CLICK_UPGRADE.growth ** state.clickLevel,
  );
}

export function buyClick() {
  const cost = getClickCost();

  if (state.treats < cost) {
    return false;
  }

  state.treats -= cost;
  state.clickLevel += 1;

  return true;
}

export function getGeneratorCost(id) {
  const generator = GENERATORS[id];

  if (!generator) {
    return Infinity;
  }

  const level = state.generators[id] ?? 0;

  return Math.floor(generator.baseCost * generator.growth ** level);
}

export function buyGenerator(id) {
  const cost = getGeneratorCost(id);

  if (state.treats < cost) {
    return false;
  }

  state.treats -= cost;

  state.generators[id] = (state.generators[id] ?? 0) + 1;

  return true;
}

export function getCps() {
  let totalCps = 0;

  for (const [id, generator] of Object.entries(GENERATORS)) {
    const owned = state.generators[id] ?? 0;

    totalCps += owned * generator.cps;
  }

  return totalCps;
}

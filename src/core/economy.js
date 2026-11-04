import { state } from "./state.js";
import { CLICK_UPGRADE } from "../config/upgrades.js";
import { GENERATORS } from "../config/generators.js";

import { SKINS } from "../config/skins.js";
import { CRAFT_COST } from "../config/balance.js";

import { addRage, isRageActive } from "./rage.js";
import { RAGE } from "../config/balance.js";

import { SECRET_HINTS, HINT_COSTS, CAT_FIND_COST } from "../config/hints.js";
import { PUZZLE } from "../config/puzzle.js";
import { findSecretCat } from "./puzzle.js";
import { getSkinBonuses } from "./skinBonuses.js";

const GOLDEN_CAT_MULTIPLIER = 10;

export function clickCat() {
  const basePower = getClickPower();
  const multiplier = state.goldenCatActive ? GOLDEN_CAT_MULTIPLIER : 1;

  const amount = basePower * multiplier;

  state.treats += amount;
  state.stats.totalTreats += amount;
  state.stats.totalClicks += 1;

  addRage();

  return amount;
}

export function getClickPower() {
  const base = 1 + state.clickLevel * CLICK_UPGRADE.powerPerLevel;

  return isRageActive() ? base * RAGE.clickMultiplier : base;
}

export function getClickCost() {
  const bonuses = getSkinBonuses();
  const discount = bonuses.clickDiscount ?? 0;

  const baseCost =
    CLICK_UPGRADE.baseCost * CLICK_UPGRADE.growth ** state.clickLevel;

  return Math.floor(baseCost * (1 - discount));
}

export function buyClick() {
  const cost = getClickCost();

  if (state.treats < cost) return false;

  state.treats -= cost;
  state.clickLevel += 1;

  return true;
}

export function getGeneratorCost(id) {
  const generator = GENERATORS[id];

  if (!generator) return Infinity;

  const level = state.generators[id] ?? 0;
  const bonuses = getSkinBonuses();
  const discount = bonuses.generatorDiscount ?? 0;

  const baseCost = generator.baseCost * generator.growth ** level;

  return Math.floor(baseCost * (1 - discount));
}

export function buyGenerator(id) {
  const cost = getGeneratorCost(id);

  if (state.treats < cost) return false;

  state.treats -= cost;
  state.generators[id] = (state.generators[id] ?? 0) + 1;

  return true;
}

export function getGeneratorCps(id) {
  const generator = GENERATORS[id];

  if (!generator) return 0;

  const bonuses = getSkinBonuses();

  let multiplier = bonuses.cpsMultiplier ?? 1;

  if (id === "toy") {
    multiplier *= bonuses.toyCpsMultiplier ?? 1;
  }

  if (id === "bowl") {
    multiplier *= bonuses.bowlCpsMultiplier ?? 1;
  }

  return generator.cps * multiplier;
}

export function getCps() {
  let totalCps = 0;

  for (const id of Object.keys(GENERATORS)) {
    const owned = state.generators[id] ?? 0;

    totalCps += owned * getGeneratorCps(id);
  }

  return totalCps;
}


// - ADD -
export function craftSkin(id) {
  const skin = SKINS[id];
  const cost = CRAFT_COST[skin?.rarity];

  if (!skin || cost === undefined) return false;
  if (state.ownedSkins.includes(id)) return false;
  if (state.dust < cost) return false;

  state.dust -= cost;
  state.ownedSkins.push(id);

  return true;
}


export function getHintCost(id) {
  return HINT_COSTS[state.hintLevels[id] ?? 0];
}

export function buyHint(id) {
  const hints = SECRET_HINTS[id];
  if (!hints) return false;
  if (state.ownedSkins.includes(id)) return false;

  const bought = state.hintLevels[id] ?? 0;
  const cost = HINT_COSTS[bought];

  if (bought >= hints.length || cost === undefined) return false;
  if (state.dust < cost) return false;

  state.dust -= cost;
  state.hintLevels[id] = bought + 1;

  return true;
}


export function buyFoundCat() {
  if (state.dust < CAT_FIND_COST) return { ok: false };

  const left = PUZZLE.filter((cat) => !state.foundSecretCats.includes(cat.id));
  if (left.length === 0) return { ok: false };

  const pick = left[Math.floor(Math.random() * left.length)];
  const result = findSecretCat(pick.id);
  if (!result.ok) return { ok: false };

  state.dust -= CAT_FIND_COST;
  return { ...result, id: pick.id };
}
// - - - -

import { state } from "../core/state.js";
import { SKINS } from "../config/skins.js";
import { getSkinBonuses } from "../core/skinBonuses.js";
import {
  LOOT_WEIGHTS,
  DUST_FOR_DUPLICATE,
  LOOTBOX,
} from "../config/balance.js";
import { updateEnergy } from "./energy.js";
import { getSkillBonus } from "../core/skillTree.js";

export function pickRarity() {
  const total = Object.values(LOOT_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [rarity, weight] of Object.entries(LOOT_WEIGHTS)) {
    if (r < weight) return rarity;
    r -= weight;
  }
}

export function rollSkin() {
  const rarity = pickRarity();
  const pool = Object.keys(SKINS).filter(
    (id) => id !== "default" && SKINS[id].rarity === rarity,
  );
  const ids = pool.length
    ? pool
    : Object.keys(SKINS).filter((id) => id !== "default");
  return ids[Math.floor(Math.random() * ids.length)];
}

export function openBox() {
  if (state.pendingReward) {
    return { ok: false };
  }
  updateEnergy();
  if (state.energy < LOOTBOX.energyCost) return { ok: false };

  state.energy -= LOOTBOX.energyCost + getSkillBonus("chestEnergyCost");
  const id = rollSkin();
  state.pendingReward = id;
  return { ok: true, id };
}

export function claimReward() {
  if (!state.pendingReward) return { ok: false };
  const id = state.pendingReward;
  const rarity = SKINS[id].rarity;
  let dust = 0;
  const duplicate = state.ownedSkins.includes(id);
  if (duplicate) {
    const bonuses = getSkinBonuses();

    const baseDust = DUST_FOR_DUPLICATE[rarity] ?? 0;

    const multiplier = bonuses.duplicateDustMultiplier ?? 1;

    dust = Math.ceil(baseDust * multiplier);

    state.dust += dust;
  } else {
    state.ownedSkins.push(id);
  }
  state.pendingReward = null;
  state.stats.boxesOpened += 1;
  return { ok: true, id, duplicate, dust };
}

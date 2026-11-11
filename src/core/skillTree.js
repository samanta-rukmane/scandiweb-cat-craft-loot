import { SKILL_TREE } from "../config/skilltree.js";
import { state } from "./state.js";

export function hasSkill(id) {
  return state.skillTree.includes(id);
}

export function getSkillBonus(type) {
  let total = 0;
  for (const id of state.skillTree) {
    for (const e of SKILL_TREE[id]?.effects ?? []) {
      if (e.type === type && typeof e.value === "number") total += e.value;
    }
  }
  return total;
}

export function getSkillMultiplier(type) {
  let total = 1;
  for (const id of state.skillTree) {
    for (const e of SKILL_TREE[id]?.effects ?? []) {
      if (e.type === type && typeof e.value === "number") total *= e.value;
    }
  }
  return total;
}

export function canBuySkill(id) {
  const skill = SKILL_TREE[id];
  if (!skill || hasSkill(id)) return false;
  if (skill.parent && !hasSkill(skill.parent)) return false;
  return Object.entries(skill.cost).every(
    ([key, price]) => state[key] >= price,
  );
}

export function buySkill(id) {
  if (!canBuySkill(id)) return false;

  for (const [key, price] of Object.entries(SKILL_TREE[id].cost)) {
    state[key] -= price;
  }
  state.skillTree.push(id);
  return true;
}

import { state } from "../core/state.js";
import { RAGE } from "../config/balance.js";
let lastRage = Date.now();

export function isRageActive() {
  return state.ragePhase === "active";
}

export function getRageCooldownLeft() {
  return Math.max(0, Math.ceil((state.rageCooldownUntil - Date.now()) / 1000));
}

export function addRage() {
  if (state.ragePhase !== "idle") return;

  state.rage = Math.min(RAGE.max, state.rage + RAGE.perClick);

  if (state.rage >= RAGE.max) {
    state.ragePhase = "active";
  }
}

export function updateRage() {
  const now = Date.now();
  const dt = Math.max((now - lastRage) / 1000, 0);
  lastRage = now;
  if (state.ragePhase === "cooldown") {
    if (now >= state.rageCooldownUntil) state.ragePhase = "idle";
    return;
  }
  const perSecond =
    state.ragePhase === "active"
      ? RAGE.activeDecayPerSecond
      : RAGE.decayPerSecond;

  state.rage = Math.max(0, state.rage - perSecond * dt);
  if (state.ragePhase === "active" && state.rage === 0) {
    state.ragePhase = "cooldown";
    state.rageCooldownUntil = now + RAGE.cooldownSeconds * 1000;
  }
}

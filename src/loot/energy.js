import { state } from "../core/state.js";
import { ENERGY } from "../config/balance.js";
import { getSkillBonus } from "../core/skillTree.js";

const ENERGY_STATES = [
  { min: 0.8, x: 0, y: 0 }, // 100%
  { min: 0.6, x: 195, y: 0 }, // 75%
  { min: 0.4, x: 381, y: 0 }, // 50%
  { min: 0.2, x: 0, y: 51 }, // 25%
  { min: 0, x: 195, y: 51 }, // 0%
];

export function getMaxEnergy() {
  const baseMax = ENERGY.max ?? 10;
  const bonusMax = getSkillBonus("maxEnergy");
  return baseMax + bonusMax;
}

export function updateEnergy() {
  const now = Date.now();
  const stepMs = ENERGY.regenSeconds * 10;
  const currentMax = getMaxEnergy();

  if (!state.energyUpdatedAt) {
    state.energyUpdatedAt = now;
  }

  if (state.energy >= currentMax) {
    state.energy = currentMax;
    state.energyUpdatedAt = now;
  } else {
    const gained = Math.floor((now - state.energyUpdatedAt) / stepMs);

    if (gained > 0) {
      state.energy = Math.min(currentMax, state.energy + gained);

      state.energyUpdatedAt += gained * stepMs;
    }
  }

  renderEnergyBar();
}

export function renderEnergyHud() {
  const currentMax = getMaxEnergy();
  const text = `${state.energy} / ${currentMax}`;

  const hud = document.getElementById("hudEnergy");
  if (hud) hud.textContent = text;

  const panelText = document.getElementById("panelEnergyText");
  if (panelText) panelText.textContent = text;

  const fill = document.getElementById("panelEnergyFill");
  if (fill) {
    const percent =
      currentMax > 0
        ? Math.max(0, Math.min(100, (state.energy / currentMax) * 100))
        : 0;
    fill.style.width = `${percent}%`;
  }
}

export function renderEnergyBar() {
  const bar = document.querySelector(".energy-bar");
  const counter = document.querySelector(".energy-count");

  renderEnergyHud();

  if (!bar) return;

  const currentMax = getMaxEnergy();
  const currentEnergy = Math.max(0, Math.min(state.energy, currentMax));

  const ratio = currentMax > 0 ? currentEnergy / currentMax : 0;

  const selectedState =
    ENERGY_STATES.find((item) => ratio >= item.min) ?? ENERGY_STATES[4];

  bar.style.backgroundPosition = `-${selectedState.x}px -${selectedState.y}px`;

  bar.setAttribute("aria-valuemax", currentMax);
  bar.setAttribute("aria-valuenow", currentEnergy);

  if (counter) {
    counter.textContent = `${currentEnergy} / ${currentMax}`;
  }
}

export function addEnergy(amount) {
  const currentMax = getMaxEnergy();
  state.energy = Math.min(currentMax, state.energy + amount);
  updateEnergy();
}
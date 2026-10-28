import { state } from "../core/state.js";
import { ENERGY } from "../config/balance.js";

const ENERGY_STATES = [
  { min: 0.8, x: 0, y: 0 }, // 100%
  { min: 0.6, x: 195, y: 0 }, // 75%
  { min: 0.4, x: 381, y: 0 }, // 50%
  { min: 0.2, x: 0, y: 51 }, // 25%
  { min: 0, x: 195, y: 51 }, // 0%
];

export function updateEnergy() {
  const now = Date.now();
  const stepMs = ENERGY.regenSeconds * 10;

  if (!state.energyUpdatedAt) {
    state.energyUpdatedAt = now;
  }

  if (state.energy >= ENERGY.max) {
    state.energy = ENERGY.max;
    state.energyUpdatedAt = now;
  } else {
    const gained = Math.floor((now - state.energyUpdatedAt) / stepMs);

    if (gained > 0) {
      state.energy = Math.min(ENERGY.max, state.energy + gained);

      state.energyUpdatedAt += gained * stepMs;
    }
  }

  renderEnergyBar();
}

function renderEnergyBar() {
  const bar = document.querySelector(".energy-bar");
  const counter = document.querySelector(".energy-count");

  if (!bar) return;

  const maxEnergy = ENERGY.max;
  const currentEnergy = Math.max(0, Math.min(state.energy, maxEnergy));

  const ratio = maxEnergy > 0 ? currentEnergy / maxEnergy : 0;

  const selectedState =
    ENERGY_STATES.find((item) => ratio >= item.min) ?? ENERGY_STATES[4];

  bar.style.backgroundPosition = `-${selectedState.x}px -${selectedState.y}px`;

  bar.setAttribute("aria-valuemax", maxEnergy);
  bar.setAttribute("aria-valuenow", currentEnergy);

  if (counter) {
    counter.textContent = `${currentEnergy} / ${maxEnergy}`;
  }
}

export function addEnergy(amount) {
  state.energy = Math.min(ENERGY.max, state.energy + amount);
  updateEnergy();
}

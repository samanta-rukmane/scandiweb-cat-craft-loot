import { RAGE } from "../config/balance.js";
import { state } from "../core/state.js";
import { getRageCooldownLeft } from "../core/rage.js";
const RAGE_STATES = [
  { min: 0.8, x: 0, y: 291 },
  { min: 0.6, x: 0, y: 221 },
  { min: 0.4, x: 0, y: 154 },
  { min: 0.2, x: 0, y: 89 },
  { min: 0.0, x: 0, y: 25 },
];

export function renderRageBar() {
  const bar = document.querySelector(".rage-bar");
  const counter = document.querySelector(".rage-count");

  if (!bar) return;

  const maxRage = RAGE.max;
  const current = Math.max(0, Math.min(state.rage, RAGE.max));

  const ratio = current / RAGE.max;

  const selectedState =
    RAGE_STATES.find((item) => ratio >= item.min) ?? RAGE_STATES[4];

  bar.style.backgroundPosition = `-${selectedState.x}px -${selectedState.y}px`;

  bar.setAttribute("aria-valuemax", maxRage);
  bar.setAttribute("aria-valuenow", Math.floor(current));
  bar.classList.toggle("is-active", state.ragePhase === "active");
  bar.classList.toggle("is-cooldown", state.ragePhase === "cooldown");
  if (counter) {
    counter.textContent =
      state.ragePhase === "cooldown"
        ? `Rage cooldown ${formatTime(getRageCooldownLeft())}`
        : `${Math.floor(current)} / ${RAGE.max}`;
  }
}

function formatTime(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

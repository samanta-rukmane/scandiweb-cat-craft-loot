import { RAGE } from "../config/balance.js";
import { state } from "../core/state.js";
import { getRageCooldownLeft } from "../core/rage.js";

export function renderRageBar() {
  const fill = document.getElementById("panelRageFill");
  const text = document.getElementById("panelRageText");

  if (!fill) return;

  const current = Math.max(0, Math.min(state.rage, RAGE.max));
  const percent = (current / RAGE.max) * 100;

  fill.style.width = `${percent}%`;
  fill.setAttribute("aria-valuemax", RAGE.max);
  fill.setAttribute("aria-valuenow", Math.floor(current));
  fill.classList.toggle("is-active", state.ragePhase === "active");
  fill.classList.toggle("is-cooldown", state.ragePhase === "cooldown");

  if (text) {
    text.textContent =
      state.ragePhase === "cooldown"
        ? `Cooldown ${formatTime(getRageCooldownLeft())}`
        : `${Math.floor(current)} / ${RAGE.max}`;
  }
}

function formatTime(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}
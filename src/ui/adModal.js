import { state } from "../core/state.js";
import { addEnergy } from "../loot/energy.js";
import { AD_REWARD_ENERGY, AD_COOLDOWN_SECONDS } from "../config/balance.js";

export function initAdModal(onChange) {
  const btn = document.getElementById("watchAddBtn");
  const dialog = document.getElementById("adDialog");
  const video = document.getElementById("adVideo");

  let isWatching = false;

  btn.addEventListener("click", () => {
    if (Date.now() < state.adReadyAt) {
      return;
    }
    isWatching = true;
    dialog.showModal();
    video.currentTime = 0;
    video.play();
  });

  video.addEventListener("ended", () => {
    if (!isWatching) {
      return;
    }
    isWatching = false;
    addEnergy(AD_REWARD_ENERGY);
    state.adReadyAt = Date.now() + AD_COOLDOWN_SECONDS * 1000;
    dialog.close();
    onChange();
  });
  dialog.addEventListener("cancel", (e) => {
    if (isWatching) e.preventDefault();
  });
}

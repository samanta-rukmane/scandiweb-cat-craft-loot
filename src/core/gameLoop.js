import { state } from "./state.js";
import { getCps } from "./economy.js";
import { updateEnergy } from "../loot/energy.js";
import { save } from "../storage/save.js";

export function startGameLoop({ render, notifyAchievements }) {
  let last = Date.now();

  setInterval(notifyAchievements, 2000);

  setInterval(() => {
    const now = Date.now();
    const elapsed = Math.max((now - last) / 1000, 0);
    last = now;

    const gained = getCps() * elapsed;
    state.treats += gained;
    state.stats.totalTreats += gained;

    updateEnergy();
    render();
  }, 200);

  setInterval(save, 5000);
}

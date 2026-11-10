import { renderEnergyHud } from "../loot/energy.js";
import { state } from "../core/state.js";
import { getClickCost, getClickPower, getCps } from "../core/economy.js";
import { renderGenerators } from "../ui/generators.js";
import { LOOTBOX } from "../config/balance.js";
import { renderRageBar } from "./rageBar.js";

export function render() {
  document.getElementById("hudTreats").textContent = Math.floor(
    state.treats,
  ).toLocaleString("en-US");

  document.getElementById("hudDust").textContent =
    state.dust.toLocaleString("en-US");

  renderEnergyHud();

  document.getElementById("lifetimeClicks").textContent = (
    state.stats?.totalClicks ?? 0
  ).toLocaleString("en-US");

  document.querySelector(".clicker-cost").textContent = getClickCost();

  document.querySelector(".click-level").textContent = state.clickLevel;

  document.querySelectorAll(".click-power").forEach((element) => {
    element.textContent = getClickPower();
  });

  document.getElementById("buyClickBtn").disabled =
    state.treats < getClickCost();

  document.querySelector(".energy-count").textContent =
    `${state.energy}/${ENERGY.max}`;

  document.querySelector(".dust-count").textContent = state.dust;

  document.getElementById("openBoxBtn").disabled =
    state.energy < LOOTBOX.energyCost;

  let secondsLeft = Math.ceil((state.adReadyAt - Date.now()) / 1000);

  document.getElementById("watchAddBtn").disabled = secondsLeft > 0;

  const totalCpsElement = document.getElementById("totalCps");

  if (totalCpsElement) {
    totalCpsElement.textContent = getCps().toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }
  renderRageBar();
  renderGenerators();
}
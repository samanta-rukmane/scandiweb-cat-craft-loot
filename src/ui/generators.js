import { state } from "../core/state.js";
import { GENERATORS } from "../config/generators.js";
import {
  getGeneratorCost,
  buyGenerator,
  getGeneratorCps,
} from "../core/economy.js";
import { assetUrl } from "../config/paths.js";

import { initContainerItems } from "./container/containerItems.js";

import { renderBallGenerator } from "./generatorMod/ballGenerator.js";
import { renderBowlGenerator } from "./generatorMod/bowlGenerator.js";
import { renderBedGenerator } from "./generatorMod/bedGenerator.js";

const list = document.getElementById("generatorList");

const generatorSounds = {
  toy: new Audio(assetUrl("/sounds/toy2.mp3")),
  bowl: new Audio(assetUrl("/sounds/bowl2.mp3")),
  bed: new Audio(assetUrl("/sounds/sleep.mp3")),
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initGenerators(onChange) {
  if (!list) {
    console.error("Generator list not found!");
    return;
  }

  list.innerHTML = "";

  for (const [id, generator] of Object.entries(GENERATORS)) {
    const card = el("div", "ui-card gen-card");

    const image = document.createElement("img");
    image.src = assetUrl(generator.image);
    image.alt = generator.name;
    const preview = el("div", "gen-preview");
    preview.appendChild(image);

    const nameRow = el("div", "gen-name-row");
    nameRow.append(
      el("span", "gen-name", generator.name),
      el("span", "gen-level"),
    );

    const info = el("div", "gen-info");
    info.append(nameRow, el("p", "gen-rate"));

    const details = el("div", "gen-card-details");
    details.append(preview, info);

    const coin = document.createElement("img");
    coin.src = assetUrl("/icons/treats.svg");
    coin.alt = "";
    const price = el("div", "price");
    price.append(coin, el("span", "gen-cost"));

    const button = el("button", "btn-primary gen-upgrade", "Upgrade");
    button.type = "button";
    button.dataset.id = id;

    const action = el("div", "gen-action");
    action.append(price, button);

    card.append(details, action);

    button.addEventListener("click", () => {
      const purchased = buyGenerator(id);

      if (!purchased) {
        return;
      }

      const sound = generatorSounds[id];

      if (sound) {
        sound.currentTime = 0;

        sound.play().catch((error) => {
          console.warn("Could not play generator sound:", error);
        });
      }

      initContainerItems();

      if (id === "toy") {
        renderBallGenerator();
      } else if (id === "bowl") {
        renderBowlGenerator();
      } else if (id === "bed") {
        renderBedGenerator();
      }

      if (typeof onChange === "function") {
        onChange();
      }

      renderGenerators();
    });

    list.appendChild(card);
  }

  renderGenerators();
}

export function renderGenerators() {
  if (!list) {
    return;
  }

  for (const card of list.children) {
    const button = card.querySelector(".gen-upgrade");

    if (!button) {
      continue;
    }

    const id = button.dataset.id;

    if (!GENERATORS[id]) {
      continue;
    }

    const level = Number(state.generators?.[id]) || 0;
    const cost = getGeneratorCost(id);

    card.querySelector(".gen-level").textContent = `LV. ${level}`;
    card.querySelector(".gen-cost").textContent = cost.toLocaleString();
    card.querySelector(".gen-rate").textContent =
      `+${getGeneratorCps(id).toLocaleString(undefined, { maximumFractionDigits: 2 })} treats / sec`;

    button.disabled = state.treats < cost;
  }
}
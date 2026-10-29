import { state } from "../core/state.js";
import { GENERATORS } from "../config/generators.js";
import { getGeneratorCost, buyGenerator } from "../core/economy.js";
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

export function initGenerators(onChange) {
  if (!list) {
    console.error("Generator list not found!");
    return;
  }

  list.innerHTML = "";

  for (const [id, generator] of Object.entries(GENERATORS)) {
    const row = document.createElement("div");
    row.classList.add("generator-row");

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = id;
    button.classList.add("generator-button");

    const image = document.createElement("img");
    image.src = assetUrl(generator.image);
    image.alt = generator.name;
    image.classList.add("generator-img");

    const info = document.createElement("div");
    info.classList.add("generator-info");

    const name = document.createElement("span");
    name.classList.add("generator-name");

    const costInfo = document.createElement("div");
    costInfo.classList.add("cost-info");

    const costText = document.createElement("p");
    costText.textContent = "Cost:";

    const costValue = document.createElement("span");
    costValue.classList.add("generator-cost");

    const foodImage = document.createElement("img");
    foodImage.src = assetUrl("/skins/food.png");
    foodImage.alt = "Treats";
    foodImage.classList.add("food-img");

    costInfo.appendChild(costText);
    costInfo.appendChild(costValue);
    costInfo.appendChild(foodImage);

    info.appendChild(name);
    info.appendChild(costInfo);

    const level = document.createElement("span");
    level.classList.add("generator-level");

    button.appendChild(image);
    button.appendChild(info);
    button.appendChild(level);

    const tooltip = document.createElement("div");
    tooltip.classList.add("next-level-info");

    const tooltipText = document.createElement("p");
    tooltip.appendChild(tooltipText);

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

    row.appendChild(button);
    row.appendChild(tooltip);

    list.appendChild(row);
  }

  renderGenerators();
}

export function renderGenerators() {
  if (!list) {
    return;
  }

  for (const row of list.children) {
    const button = row.querySelector(".generator-button");

    if (!button) {
      continue;
    }

    const id = button.dataset.id;
    const generator = GENERATORS[id];

    if (!generator) {
      continue;
    }

    const level = Number(state.generators?.[id]) || 0;
    const cost = getGeneratorCost(id);

    row.querySelector(".generator-name").textContent = generator.name;
    row.querySelector(".generator-cost").textContent = cost.toLocaleString();
    row.querySelector(".generator-level").textContent = `Owned: ${level}`;

    button.disabled = state.treats < cost;

    const tooltipText = row.querySelector(".next-level-info p");

    if (tooltipText) {
      tooltipText.textContent = `Produces ${generator.cps} treats per second.`;
    }
  }
}

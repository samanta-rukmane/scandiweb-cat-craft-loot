import { save } from "../../storage/save.js";
import { showClickEffect } from "./clickEffect.js";
import { clickCat, buyClick, getClickPower } from "../../core/economy.js";
import { notifyAchievements } from "../../core/achievements.js";
import { assetUrl } from "../../config/paths.js";
import { state } from "../../core/state.js";

const catMeow = new Audio(assetUrl("/sounds/cat_meow.mp3"));
catMeow.volume = 0.5;

let lastMeowTime = 0;

export function initClick(render) {
  const clickBtn = document.getElementById("clickBtn");

  if (clickBtn) {
    clickBtn.addEventListener("click", (event) => {
      const multiplier = state.goldenCatActive ? 10 : 1;
      const power = getClickPower();
      const now = Date.now();

      if (now - lastMeowTime >= 300) {
        lastMeowTime = now;
        catMeow.currentTime = 0;

        catMeow.play().catch((error) => {
          console.warn("Could not play cat meow:", error);
        });
      }

      clickCat(multiplier);
      showClickEffect(event, power * multiplier);
      notifyAchievements();
      render();
    });
  }

  const buyClickBtn = document.getElementById("buyClickBtn");

  if (buyClickBtn) {
    buyClickBtn.addEventListener("click", () => {
      if (buyClick()) {
        save();
        render();
      }
    });
  }
}

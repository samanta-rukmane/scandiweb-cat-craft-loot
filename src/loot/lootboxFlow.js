import { save } from "../storage/save.js";
import { openBox, claimReward } from "./lootBox.js";
import {
  renderReel,
  buildReelIds,
  spinReel,
} from "../ui/lootbox/lootboxreel.js";
import { SKINS } from "../config/skins.js";
import { showSkinReward } from "../ui/skins/skinReward.js";
import { showLatestReward } from "../ui/lootbox/boxPage.js";
import { assetUrl } from "../config/paths.js";
import { notifyAchievements } from "../core/achievements.js";

const lootboxSound = new Audio(assetUrl("/sounds/lootbox.mp3"));
lootboxSound.volume = 0.5;

export function initLootboxFlow(render) {
  const openBoxBtn = document.getElementById("openBoxBtn");
  const chest = document.getElementById("boxChest");
  const reel = document.getElementById("boxReel");
  const ribbon = document.querySelector(".lootbox-ribbon");

  if (!openBoxBtn || !reel || !ribbon) {
    console.error("Open Box page elements not found!");
    return;
  }

  let isSpinning = false;
  let spinTimer = null;

  function showReel(visible) {
    reel.hidden = !visible;
    if (chest) chest.hidden = visible;
  }

  openBoxBtn.addEventListener("click", () => {
    if (isSpinning) {
      return;
    }

    const res = openBox();

    if (!res || !res.ok) {
      return;
    }

    save();
    render();

    renderReel(buildReelIds(res.id));
    showReel(true);

    isSpinning = true;

    ribbon.addEventListener("transitionend", finishSpin, { once: true });

    spinReel();

    spinTimer = setTimeout(finishSpin, 5200);
  });

  function finishSpin() {
    if (!isSpinning) {
      return;
    }

    clearTimeout(spinTimer);
    isSpinning = false;
    showReel(false);

    const result = claimReward();

    if (!result || !result.ok) {
      save();
      render();
      return;
    }

    const skin = SKINS[result.id];

    if (skin) {
      showLatestReward(result);

      if (!result.duplicate) {
        lootboxSound.currentTime = 0;
        lootboxSound.play().catch((error) => {
          console.warn("Could not play lootbox sound:", error);
        });

        showSkinReward({
          ...skin,
          image: assetUrl(skin.img),
        });
      }
    }

    save();
    render();
    notifyAchievements();
  }
}
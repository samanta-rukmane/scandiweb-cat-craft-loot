import { save } from "../storage/save.js";
import { openBox, claimReward } from "./lootBox.js";
import {
  renderReel,
  buildReelIds,
  spinReel,
} from "../ui/lootbox/lootboxreel.js";
import { SKINS } from "../config/skins.js";
import { showSkinReward } from "../ui/skins/skinReward.js";
import { assetUrl } from "../config/paths.js";
import { notifyAchievements } from "../core/achievements.js";
import { LOOT_WEIGHTS } from "../config/balance.js";

const lootboxSound = new Audio(assetUrl("/sounds/lootbox.mp3"));
lootboxSound.volume = 0.5;

export function initLootboxFlow(render) {
  window.addEventListener("lootboxOpening", loadReelPreview);

  const dialog = document.getElementById("dialog");
  const openBoxBtn = document.getElementById("openBoxBtn");

  let isSpinning = false;
  let spinTimer = null;
  if (openBoxBtn && dialog) {
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

      isSpinning = true;
      dialog.dataset.spinning = "true";

      const ribbon = document.querySelector(".lootbox-ribbon");

      if (ribbon) {
        ribbon.addEventListener("transitionend", finishSpin, { once: true });
      }

      spinReel();

      spinTimer = setTimeout(finishSpin, 5200);
    });
  }
  function finishSpin() {
    if (!isSpinning) {
      return;
    }

    clearTimeout(spinTimer);
    isSpinning = false;

    if (dialog) {
      dialog.dataset.spinning = "false";
    }

    const result = claimReward();

    if (!result || !result.ok) {
      save();
      render();
      return;
    }

    const skin = SKINS[result.id];
    const lootResult = document.getElementById("lootResult");

    if (skin && lootResult) {
      lootResult.textContent = result.duplicate
        ? `${skin.name} (${skin.rarity}): duplicate, +${result.dust} dust`
        : `New skin: ${skin.name} (${skin.rarity})!`;

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
  function loadReelPreview() {
    const skinIds = Object.keys(SKINS).filter(
      (id) => SKINS[id].rarity in LOOT_WEIGHTS,
    );

    if (skinIds.length === 0) {
      console.error("No skins are configured for the loot box.");
      return;
    }

    const previewIds = Array.from({ length: 45 }, () => {
      return skinIds[Math.floor(Math.random() * skinIds.length)];
    });

    renderReel(previewIds);
  }
}

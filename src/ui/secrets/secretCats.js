import { assetUrl } from "../../config/paths.js";
import { PUZZLE, PUZZLE_IMG, PUZZLE_REWARD_SKIN } from "../../config/puzzle.js";
import { findSecretCat } from "../../core/puzzle.js";
import { state } from "../../core/state.js";
import { save } from "../../storage/save.js";
import { showToast } from "../toast.js";
import { showSkinReward } from "../skins/skinReward.js";
import { SKINS } from "../../config/skins.js";
export function initSecretPuzzle({ notifyAchievements, render }) {
  const secretElements = document.querySelectorAll(".hidden-secret-cat");

  if (secretElements.length === 0) {
    console.warn("No secret cats found in HTML!");
    return;
  }

  for (const element of secretElements) {
    const catId = element.dataset.catId;

    const catData = PUZZLE.find((item) => item.id === catId);
    if (!catData) {
      console.error("Unknown secret cat:", catId);
      continue;
    }

    element.src = assetUrl(PUZZLE_IMG);

    const isFound = state.foundSecretCats.includes(catId);

    if (isFound) {
      element.style.display = "none";
      continue;
    }
    element.addEventListener("click", () => {
      const result = findSecretCat(catId);
      if (!result.ok) return;
      showToast("Secret Cat Found!", `${result.count}/${PUZZLE.length}`);
      if (result.justCompleted) {
        const skin = SKINS[PUZZLE_REWARD_SKIN];

        showSkinReward({ ...skin, image: assetUrl(skin.img) });
      }
      element.classList.add("found");
      notifyAchievements();
      render();
      save();
    });
  }
}

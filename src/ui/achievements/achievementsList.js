import { ACHIEVEMENTS } from "../../config/achievements.js";
import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";
const list = document.getElementById("achievementsList");

export function initAchievementsList() {
  if (!list) {
    console.error("Achievements list not found!");
    return;
  }
  list.innerHTML = "";

  for (const item of ACHIEVEMENTS) {
    const card = document.createElement("div");
    card.dataset.id = item.id;
    card.classList.add("achievement-card");

    if (state.achievements.includes(item.id)) {
      card.classList.add("unlocked");
    }

    if (item.img) {
      const image = document.createElement("img");
      image.src = assetUrl(item.img);
      image.alt = item.name;
      image.classList.add("achievement-img");
      card.appendChild(image);
    }

    const title = document.createElement("span");
    title.textContent = item.name;
    title.classList.add("achievement-info");
    card.appendChild(title);

    const description = document.createElement("span");
    description.textContent = item.desc;
    description.classList.add("achievement-text");
    card.appendChild(description);

    list.appendChild(card);
  }
}

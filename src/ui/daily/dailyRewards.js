import { DAILY_REWARDS, REWARD_ICONS } from "../../config/dailyrewards.js";
import { checkDailyCount } from "../../core/offline.js";
import { assetUrl } from "../../config/paths.js";

const list = document.getElementById("dailyRewardList");

export function initDailyList() {
  if (!list) {
    console.error("Daily list not found!");
    return;
  }
  for (const [id, reward] of Object.entries(DAILY_REWARDS)) {
    const card = document.createElement("div");
    card.dataset.id = id;
    card.classList.add("daily-reward-card");

    const title = document.createElement("span");
    title.classList.add("daily-reward-info");
    title.textContent = `Day ${Number(id) + 1}`;
    card.appendChild(title);

    for (const [key, value] of Object.entries(reward)) {
      const row = document.createElement("div");
      row.classList.add("daily-reward-row");

      const image = document.createElement("div");
      image.classList.add("daily-card-img");
      image.style.backgroundImage = `url("${assetUrl(REWARD_ICONS[key])}")`;

      const amount = document.createElement("span");
      amount.textContent = `+${value}`;
      row.append(image, amount);
      card.appendChild(row);
    }

    list.appendChild(card);
  }

  renderDailyList();
}

export function renderDailyList() {
  if (!list) return;

  const { claimedCount, todayIndex, canClaim } = checkDailyCount();

  for (const card of list.children) {
    const index = Number(card.dataset.id);
    card.classList.toggle("claimed", index < claimedCount);
    card.classList.toggle("today", index === todayIndex);
  }

  document.getElementById("claimDailyButton").disabled = !canClaim;
}

import { assetUrl, skinBackgroundSize } from "../../config/paths.js";

const rewardDialog = document.getElementById("skinRewardDialog");
const closeRewardBtn = document.getElementById("closeSkinRewardBtn");
const claimRewardBtn = document.getElementById("claimSkinRewardBtn");

const rewardSkinImage = document.getElementById("rewardSkinImage");
const rewardSkinName = document.getElementById("rewardSkinName");
const rewardSkinRarity = document.getElementById("rewardSkinRarity");

export function showSkinReward(skin) {
  if (
    !skin ||
    !rewardDialog ||
    !rewardSkinImage ||
    !rewardSkinName ||
    !rewardSkinRarity
  ) {
    console.error("Skin reward popup elements are missing.");
    return;
  }

  rewardSkinImage.style.backgroundImage = `url(${skin.image})`;
  rewardSkinImage.style.backgroundSize = skinBackgroundSize(skin);
  rewardSkinImage.style.backgroundPosition = "0 0";
  rewardSkinImage.style.backgroundRepeat = "no-repeat";

  rewardSkinName.textContent = skin.name;
  rewardSkinRarity.textContent = skin.rarity.toUpperCase();

  rewardSkinRarity.className = `reward-rarity rarity-${skin.rarity.toLowerCase()}`;

  if (!rewardDialog.open) {
    rewardDialog.showModal();
  }
}

function closeReward() {
  if (rewardDialog?.open) {
    rewardDialog.close();
  }
}

closeRewardBtn?.addEventListener("click", closeReward);
claimRewardBtn?.addEventListener("click", closeReward);

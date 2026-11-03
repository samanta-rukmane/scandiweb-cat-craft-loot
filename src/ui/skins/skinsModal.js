import { state } from "../../core/state.js";
import { SKINS } from "../../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../../config/paths.js";
// - ADD -
import { craftSkin } from "../../core/economy.js";
import { CRAFT_COST } from "../../config/balance.js";
import { save } from "../../storage/save.js";

import { showSkinReward } from "./skinReward.js";
import { notifyAchievements } from "../../core/achievements.js";
// - - - -


const rarities = ["common", "rare", "epic", "legendary", "secret"];

let selectedRarity = "common";
// - ADD -
let onChangeCallback = null;
// - - - -


// - DELETE -
// export function initSkinsModal() {
// - ADD -
export function initSkinsModal(onChange) {
  onChangeCallback = onChange;
  // - - -
  const modal = document.getElementById("skinsModal");
  const openButton = document.getElementById("openSkinsBtn");
  const closeButton = document.getElementById("closeSkinsBtn");
  const skinsList = document.getElementById("ownedSkinsList");
  const rarityButtons = document.querySelectorAll(".rarity-button");

  if (!modal || !openButton || !closeButton || !skinsList) {
    console.error("Skins modal elements not found!");
    return;
  }

  openButton.addEventListener("click", () => {
    renderSkins(skinsList);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    closeButton.focus();
  });

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    openButton.focus();
  }

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    // - DELETE -
    // if (event.key === "Escape" && modal.classList.contains("open")) {
    // - ADD -
    const confirmOpen =
      document.getElementById("craftConfirmDialog")?.open ||
      document.getElementById("skinRewardDialog")?.open;

    if (event.key === "Escape" && modal.classList.contains("open") && !confirmOpen) {
    // - - - -
      closeModal();
    }
  });

  rarityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const rarity = button.dataset.rarity;

      if (!rarities.includes(rarity)) {
        return;
      }

      selectedRarity = rarity;

      rarityButtons.forEach((item) => {
        const isActive = item === button;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      renderSkins(skinsList);
    });
  });

  rarityButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.rarity === selectedRarity),
    );
  });
}

function renderSkins(container) {
  container.replaceChildren();

  
  // - ADD -
  const dustCounter = document.getElementById("skinsDustCount");
  if (dustCounter) dustCounter.textContent = Math.floor(state.dust);

  updateCollectionCounters();
  // - - - -

  const entries = Object.entries(SKINS).filter(
    ([, skin]) => skin.rarity === selectedRarity,
  );

  if (entries.length === 0) {
    const message = document.createElement("p");
    message.classList.add("no-owned-skins");
    message.textContent = `No ${selectedRarity} skins found.`;
    container.appendChild(message);
    return;
  }

  const ownedSkins = state.ownedSkins ?? [];
  const equippedSkin = state.equippedSkin ?? "default";

  for (const [skinId, skin] of entries) {
    const imageUrl = assetUrl(skin.img);

    const skinName = skin.name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ");

    const isOwned = ownedSkins.includes(skinId);
    const isEquipped = equippedSkin === skinId;

    const card = document.createElement("button");
    card.type = "button";
    card.classList.add("owned-skin-card");
    card.classList.toggle("equipped", isEquipped);
    card.disabled = !isOwned;
    card.setAttribute(
      "aria-label",
      isOwned ? `Equip ${skinName}` : "Locked skin",
    );
    card.setAttribute("aria-pressed", String(isEquipped));

    const preview = document.createElement("div");
    preview.classList.add("owned-skin-preview");
    preview.style.backgroundImage = `url("${imageUrl}")`;
    preview.style.backgroundPosition = "0 0";
    preview.style.backgroundSize = skinBackgroundSize(skin);
    preview.style.backgroundRepeat = "no-repeat";
    if (!isOwned) preview.classList.add("skin-locked");

    const name = document.createElement("p");
    name.textContent = isOwned ? skinName : "???";

    const rarity = document.createElement("span");
    rarity.classList.add("owned-skin-rarity");
    rarity.textContent =
      selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1);

    card.append(preview, name, rarity);

    if (isOwned) {
      card.addEventListener("click", () => {
        state.equippedSkin = skinId;

        window.dispatchEvent(
          new CustomEvent("skinSelected", { detail: { skinId, imageUrl } }),
        );

        renderSkins(container);
      });
    }


    // - DELETE -
    // container.appendChild(card);
    // - ADD -
    const cost = CRAFT_COST[skin.rarity];

    if (!isOwned && cost !== undefined) {
      const slot = document.createElement("div");
      slot.classList.add("skin-slot");

      const craftBtn = document.createElement("button");
      craftBtn.type = "button";
      craftBtn.classList.add("craft-button");
      // - DELETE -
      // craftBtn.textContent = `Craft · ${cost} dust`;
      // - ADD -
      craftBtn.append(`Craft · ${cost} `);

      const dustIcon = document.createElement("img");
      dustIcon.src = assetUrl("/skins/dust.png");
      dustIcon.alt = "dust";
      dustIcon.classList.add("dust-icon");
      craftBtn.append(dustIcon);
      // - - - -
      craftBtn.disabled = state.dust < cost;

      // - DELETE -
      // craftBtn.addEventListener("click", () => {
      // - ADD -
      craftBtn.addEventListener("click", async () => {
        if (!(await confirmCraft(skin, cost))) return;
      // - - - -
        if (!craftSkin(skinId)) return;
        save();
        renderSkins(container);
        if (typeof onChangeCallback === "function") onChangeCallback();

        // - ADD -
        showSkinReward(
          { ...skin, name: skinName, image: assetUrl(skin.img) },
          "SKIN CRAFTED",
        );
        notifyAchievements();
        // - - - -
      });

      slot.append(card, craftBtn);
      container.appendChild(slot);
    } else {
      container.appendChild(card);
    } 
    // - - - -
  }
}


// - ADD -
function updateCollectionCounters() {
  const owned = state.ownedSkins ?? [];
  let ownedTotal = 0;
  let total = 0;
  let ownedInTab = 0;
  let totalInTab = 0;

  for (const [id, skin] of Object.entries(SKINS)) {
    const isOwned = owned.includes(id);

    total += 1;
    if (isOwned) ownedTotal += 1;

    if (skin.rarity === selectedRarity) {
      totalInTab += 1;
      if (isOwned) ownedInTab += 1;
    }
  }

  const totalElement = document.getElementById("skinsTotalCount");
  if (totalElement) totalElement.textContent = `${ownedTotal}/${total}`;

  const tabName = document.getElementById("skinsTabName");
  if (tabName) {
    tabName.textContent =
      selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1);
  }

  const tabCount = document.getElementById("skinsTabCount");
  if (tabCount) tabCount.textContent = `${ownedInTab}/${totalInTab}`;
}


function confirmCraft(skin, cost) {
  const dialog = document.getElementById("craftConfirmDialog");
  const yes = document.getElementById("craftConfirmYes");
  const no = document.getElementById("craftConfirmNo");
  const preview = document.getElementById("craftConfirmPreview");

  if (!dialog || !yes || !no || !preview) return Promise.resolve(true);

  preview.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
  preview.style.backgroundSize = skinBackgroundSize(skin);
  document.getElementById("craftConfirmRarity").textContent =
    skin.rarity.charAt(0).toUpperCase() + skin.rarity.slice(1);
  document.getElementById("craftConfirmCost").textContent = cost;

  return new Promise((resolve) => {
    const onYes = () => dialog.close("yes");
    const onNo = () => dialog.close("no");

    dialog.addEventListener(
      "close",
      () => {
        yes.removeEventListener("click", onYes);
        no.removeEventListener("click", onNo);
        resolve(dialog.returnValue === "yes");
      },
      { once: true },
    );

    yes.addEventListener("click", onYes);
    no.addEventListener("click", onNo);

    dialog.returnValue = "";
    dialog.showModal();
  });
}
// - - - -

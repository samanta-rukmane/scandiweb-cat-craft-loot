import { state } from "../../core/state.js";
import { SKINS } from "../../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../../config/paths.js";
// - ADD -
import { craftSkin, buyHint, getHintCost, buyFoundCat,} from "../../core/economy.js";

import { SECRET_HINTS, CAT_FIND_COST, ALIEN_BACKGROUND_ID,} from "../../config/hints.js";
import { BACKGROUNDS } from "../../config/backgrounds.js";

import { PUZZLE, PUZZLE_REWARD_SKIN } from "../../config/puzzle.js";

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

  const secretNote = document.getElementById("secretNote");
  if (secretNote) secretNote.hidden = selectedRarity !== "secret";

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
    if (isOwned) {
      container.appendChild(card);
      continue;
    }

    const cost = CRAFT_COST[skin.rarity];
    const hints = SECRET_HINTS[skinId];

    const craftBtn =
      cost !== undefined ? makeDustButton(`Craft · ${cost} `, cost) : null;

    craftBtn?.addEventListener("click", async () => {
      if (!(await confirmCraft(skin, cost))) return;
      if (!craftSkin(skinId)) return;
      save();
      renderSkins(container);
      if (typeof onChangeCallback === "function") onChangeCallback();

      showSkinReward(
        { ...skin, name: skinName, image: assetUrl(skin.img) },
        "SKIN CRAFTED",
      );
      notifyAchievements();
    });

    if (!hints) {
      if (!craftBtn) {
        container.appendChild(card);
        continue;
      }

      const slot = document.createElement("div");
      slot.classList.add("skin-slot");
      slot.append(card, craftBtn);
      container.appendChild(slot);
      continue;
    }

    const bought = state.hintLevels?.[skinId] ?? 0;

    const slot = document.createElement("div");
    slot.classList.add("skin-slot", "secret-slot");

    const box = document.createElement("div");
    box.classList.add("skin-hint-box");

    if (bought === 0) {
      const empty = document.createElement("p");
      empty.classList.add("skin-hint", "skin-hint-empty");
      empty.textContent = "No hints yet.";
      box.append(empty);
    }

    for (const hint of hints.slice(0, bought)) {
      const text = document.createElement("p");
      text.classList.add("skin-hint");
      text.textContent = hint;
      box.append(text);
    }


    if (skinId === "secretCat" && bought >= hints.length) {
      const progress = document.createElement("p");
      progress.classList.add("skin-hint", "skin-hint-progress");
      progress.textContent = `Hidden cats found: ${state.foundSecretCats.length}/${PUZZLE.length}`;
      box.append(progress);
    }


    const bgOwned = state.ownedBackgrounds.includes(ALIEN_BACKGROUND_ID);
    const bgEquipped = state.equippedBackground === ALIEN_BACKGROUND_ID;

    if (skinId === "alienCat" && bought >= hints.length) {
      const bg = BACKGROUNDS[ALIEN_BACKGROUND_ID];
      const status = bgEquipped
        ? "equipped, wait for it..."
        : bgOwned
          ? "bought, but not equipped"
          : `not bought (${bg.price} dust)`;

      const progress = document.createElement("p");
      progress.classList.add("skin-hint", "skin-hint-progress");
      progress.textContent = `${bg.name} background: ${status}`;
      box.append(progress);
    }

    const actions = document.createElement("div");
    actions.classList.add("skin-hint-actions");

    const hintCost = getHintCost(skinId);

    if (bought < hints.length && hintCost !== undefined) {
      const hintBtn = makeDustButton(`Hint ${bought + 1} · ${hintCost} `, hintCost);

      hintBtn.addEventListener("click", async () => {
        if (!(await confirmCraft(skin, hintCost, "Buy a hint?", "Buy"))) return;
        if (!buyHint(skinId)) return;
        save();
        renderSkins(container);
        if (typeof onChangeCallback === "function") onChangeCallback();
      });

      actions.append(hintBtn);
    }

    if (skinId === "secretCat" && state.foundSecretCats.length < PUZZLE.length) {
      const findBtn = makeDustButton(
        `Find a cat · ${CAT_FIND_COST} `,
        CAT_FIND_COST,
      );

      findBtn.addEventListener("click", async () => {
        if (!(await confirmCraft(skin, CAT_FIND_COST, "Find a hidden cat?", "Find"))) return;

        const result = buyFoundCat();
        if (!result.ok) return;

        document
          .querySelector(`.hidden-secret-cat[data-cat-id="${result.id}"]`)
          ?.style.setProperty("display", "none");

        save();
        renderSkins(container);
        if (typeof onChangeCallback === "function") onChangeCallback();

        if (result.justCompleted) {
          const reward = SKINS[PUZZLE_REWARD_SKIN];
          showSkinReward({ ...reward, image: assetUrl(reward.img) });
        }
        notifyAchievements();
      });

      actions.append(findBtn);
    }

    
    if (skinId === "alienCat" && bought >= hints.length && !bgEquipped) {
      const shopBtn = document.createElement("button");
      shopBtn.type = "button";
      shopBtn.classList.add("craft-button");
      shopBtn.textContent = bgOwned ? "Go to shop to equip" : "Go to shop";

      shopBtn.addEventListener("click", () => {
        document.getElementById("closeSkinsBtn")?.click();
        document.getElementById("openShopBtn")?.click();
      });

      actions.append(shopBtn);
    }

    if (craftBtn) actions.append(craftBtn);


    box.append(actions);
    slot.append(card, box);
    container.appendChild(slot);
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


// - DELETE -
// function confirmCraft(skin, cost) {
// - ADD -
function confirmCraft( skin, cost, title = "Craft this skin?", yesLabel = "Craft",) {
// - - - -
  const dialog = document.getElementById("craftConfirmDialog");
  const yes = document.getElementById("craftConfirmYes");
  const no = document.getElementById("craftConfirmNo");
  const preview = document.getElementById("craftConfirmPreview");

  if (!dialog || !yes || !no || !preview) return Promise.resolve(true);

  const titleElement = document.getElementById("craftConfirmTitle");
  if (titleElement) titleElement.textContent = title;
  yes.textContent = yesLabel;

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


function makeDustButton(label, cost) {
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("craft-button");
  button.append(label);

  const icon = document.createElement("img");
  icon.src = assetUrl("/skins/dust.png");
  icon.alt = "dust";
  icon.classList.add("dust-icon");
  button.append(icon);

  button.disabled = state.dust < cost;
  return button;
}
// - - - -

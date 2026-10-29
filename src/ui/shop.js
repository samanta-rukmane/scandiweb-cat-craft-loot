import { state } from "../core/state.js";
import { save } from "../storage/save.js";
import { BACKGROUNDS } from "../config/backgrounds.js";
import { assetUrl } from "../config/paths.js";
import { triggerUfoEvent } from "../events/ufoEvent.js";

export function initShop(onChange) {
  const shopDialog = document.getElementById("shopDialog");
  const openShopBtn = document.getElementById("openShopBtn");
  const closeShopBtn = document.getElementById("closeShopBtn");
  const backgroundList = document.getElementById("backgroundList");
  const shopDustCount = document.getElementById("shopDustCount");
  const catContainer = document.querySelector(".cat-container");

  if (
    !shopDialog ||
    !openShopBtn ||
    !closeShopBtn ||
    !backgroundList ||
    !shopDustCount ||
    !catContainer
  ) {
    console.error("Shop elements are missing from index.html.");
    return;
  }

  if (!Array.isArray(state.ownedBackgrounds)) {
    state.ownedBackgrounds = ["cozy_room"];
  }

  state.ownedBackgrounds = [
    ...new Set(
      state.ownedBackgrounds.filter((id) => Object.hasOwn(BACKGROUNDS, id)),
    ),
  ];

  if (!state.ownedBackgrounds.includes("cozy_room")) {
    state.ownedBackgrounds.unshift("cozy_room");
  }

  if (
    !Object.hasOwn(BACKGROUNDS, state.equippedBackground) ||
    !state.ownedBackgrounds.includes(state.equippedBackground)
  ) {
    state.equippedBackground = "cozy_room";
  }

  function applyBackground() {
    const background = BACKGROUNDS[state.equippedBackground];

    if (!background) {
      console.error("Background not found:", state.equippedBackground);
      return;
    }

    catContainer.style.backgroundImage = `url("${assetUrl(background.image)}")`;

    catContainer.style.backgroundSize = "cover";
    catContainer.style.backgroundPosition = "center";
    catContainer.style.backgroundRepeat = "no-repeat";
  }

  function renderShop() {
    shopDustCount.textContent = Math.floor(state.dust);
    backgroundList.innerHTML = "";

    for (const [id, background] of Object.entries(BACKGROUNDS)) {
      const owned = state.ownedBackgrounds.includes(id);
      const equipped = state.equippedBackground === id;

      const card = document.createElement("article");
      card.classList.add("background-card");

      const image = document.createElement("img");
      image.src = assetUrl(background.image);
      image.alt = background.name;
      image.classList.add("background-preview");
      image.loading = "lazy";

      image.addEventListener("error", () => {
        console.error(`Could not load background image: ${background.image}`);
      });

      const name = document.createElement("h3");
      name.classList.add("background-name");
      name.textContent = background.name;

      const price = document.createElement("p");
      price.classList.add("background-price");

      if (background.price === 0) {
        price.textContent = "Free";
      } else {
        price.textContent = `${background.price} dust`;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("background-action");

      if (equipped) {
        button.textContent = "Equipped";
        button.disabled = true;
      } else if (owned) {
        button.textContent = "Equip";
      } else {
        button.textContent = "Buy";
        button.disabled = state.dust < background.price;
      }

      button.addEventListener("click", () => {
        const alreadyOwned = state.ownedBackgrounds.includes(id);

        if (!alreadyOwned) {
          if (state.dust < background.price) {
            return;
          }

          state.dust -= background.price;

          state.ownedBackgrounds.push(id);
        }

        state.equippedBackground = id;

        applyBackground();

        triggerUfoEvent();

        save();

        renderShop();

        if (typeof onChange === "function") {
          onChange();
        }
      });

      card.appendChild(image);
      card.appendChild(name);
      card.appendChild(price);
      card.appendChild(button);

      backgroundList.appendChild(card);
    }
  }

  openShopBtn.addEventListener("click", () => {
    renderShop();

    if (!shopDialog.open) {
      shopDialog.showModal();
    }
  });

  closeShopBtn.addEventListener("click", () => {
    if (shopDialog.open) {
      shopDialog.close();
    }
  });

  applyBackground();

  renderShop();
}

import { state } from "../core/state.js";
import { save } from "../storage/save.js";
import { BACKGROUNDS } from "../config/backgrounds.js";
import { assetUrl } from "../config/paths.js";
import { triggerUfoEvent } from "../events/ufoEvent.js";

let onChangeCallback = null;
let lastSignature = "";

export function initShop(onChange) {
  onChangeCallback = onChange;

  const grid = document.getElementById("shopGrid");
  const openShopBtn = document.getElementById("openShopBtn");

  if (!grid || !openShopBtn) {
    console.error("Shop elements are missing from index.html.");
    return;
  }

  normalizeBackgrounds();

  openShopBtn.addEventListener("click", () => renderShop());

  applyBackground();
  renderShop();
}

// Called from render(): rebuilds the page only when something it shows changed.
export function refreshShop() {
  const view = document.querySelector('[data-view="shop"]');

  if (!view || view.hidden) return;
  if (getSignature() === lastSignature) return;

  renderShop();
}

function getSignature() {
  return [
    Math.floor(state.dust),
    state.ownedBackgrounds.join(","),
    state.equippedBackground,
  ].join("|");
}

function normalizeBackgrounds() {
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
}

function applyBackground() {
  const catContainer = document.querySelector(".cat-container");
  const background = BACKGROUNDS[state.equippedBackground];

  if (!catContainer) {
    console.error("Scene element .cat-container was not found.");
    return;
  }

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
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  grid.replaceChildren();

  for (const [id, background] of Object.entries(BACKGROUNDS)) {
    grid.appendChild(buildCard(id, background));
  }

  lastSignature = getSignature();
}

function buildCard(id, background) {
  const owned = state.ownedBackgrounds.includes(id);
  const equipped = state.equippedBackground === id;

  const card = document.createElement("article");
  card.classList.add("shop-card");

  const image = document.createElement("img");
  image.classList.add("shop-card-image");
  image.src = assetUrl(background.image);
  image.alt = background.name;
  image.loading = "lazy";

  image.addEventListener("error", () => {
    console.error(`Could not load background image: ${background.image}`);
  });

  const body = document.createElement("div");
  body.classList.add("shop-card-body");

  const name = document.createElement("h3");
  name.classList.add("shop-card-name");
  name.textContent = background.name;

  const footer = document.createElement("div");
  footer.classList.add("shop-card-footer");

  footer.append(owned ? buildOwnedBadge() : buildPrice(background.price));
  footer.append(buildButton(id, background, { owned, equipped }));

  body.append(name, footer);
  card.append(image, body);
  return card;
}

function buildOwnedBadge() {
  const badge = document.createElement("span");
  badge.classList.add("owned-badge");
  badge.textContent = "Owned";
  return badge;
}

function buildPrice(price) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("price");

  if (price === 0) {
    wrapper.textContent = "Free";
    return wrapper;
  }

  const icon = document.createElement("img");
  icon.src = assetUrl("/icons/dust.svg");
  icon.alt = "dust";

  const amount = document.createElement("span");
  amount.textContent = String(price);

  wrapper.append(icon, amount);
  return wrapper;
}

function buildButton(id, background, { owned, equipped }) {
  const button = document.createElement("button");
  button.type = "button";

  if (equipped) {
    button.className = "btn-equipped";
    button.textContent = "✓ Equipped";
    button.setAttribute("aria-pressed", "true");
    return button;
  }

  button.className = "btn-secondary";

  if (owned) {
    button.textContent = "Equip";
  } else {
    button.textContent = "Buy background";
    button.disabled = state.dust < background.price;
  }

  button.addEventListener("click", () => chooseBackground(id, background));
  return button;
}

function chooseBackground(id, background) {
  if (!state.ownedBackgrounds.includes(id)) {
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

  if (typeof onChangeCallback === "function") {
    onChangeCallback();
  }
}
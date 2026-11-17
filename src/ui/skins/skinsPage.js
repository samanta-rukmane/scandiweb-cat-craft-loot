import { state } from "../../core/state.js";
import { SKINS } from "../../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../../config/paths.js";
import {
  craftSkin,
  buyHint,
  getHintCost,
  buyFoundCat,
} from "../../core/economy.js";
import {
  SECRET_HINTS,
  CAT_FIND_COST,
  ALIEN_BACKGROUND_ID,
} from "../../config/hints.js";
import { BACKGROUNDS } from "../../config/backgrounds.js";
import { PUZZLE, PUZZLE_REWARD_SKIN } from "../../config/puzzle.js";
import { CRAFT_COST } from "../../config/balance.js";
import { save } from "../../storage/save.js";
import { showSkinReward } from "./skinReward.js";
import { notifyAchievements } from "../../core/achievements.js";

const TABS = ["all", "common", "rare", "epic", "legendary", "secret"];

let selectedTab = "all";
let lastSignature = "";
let onChangeCallback = null;

export function initSkinsPage(onChange) {
  onChangeCallback = onChange;

  const grid = document.getElementById("skinsGrid");
  const tabs = document.querySelectorAll(".skin-tab");
  const openButton = document.getElementById("openSkinsBtn");
  const exploreSecretBtn = document.getElementById("exploreSecretBtn");

  if (!grid || tabs.length === 0 || !openButton) {
    console.error("Skins page elements not found!");
    return;
  }

  openButton.addEventListener("click", () => renderSkins());

  for (const tab of tabs) {
    tab.addEventListener("click", () => selectTab(tab.dataset.rarity));
  }

  exploreSecretBtn?.addEventListener("click", () => {
    selectTab("secret");
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderSkins();
}

// Called from render(): rebuilds the page only when something it shows changed.
export function refreshSkinsPage() {
  const view = document.querySelector('[data-view="skins"]');

  if (!view || view.hidden) return;
  if (getSignature() === lastSignature) return;

  renderSkins();
}

function getSignature() {
  return [
    selectedTab,
    (state.ownedSkins ?? []).join(","),
    state.equippedSkin,
    Math.floor(state.dust),
    JSON.stringify(state.hintLevels ?? {}),
    state.foundSecretCats?.length ?? 0,
    state.equippedBackground,
    state.ownedBackgrounds?.length ?? 0,
  ].join("|");
}

function selectTab(rarity) {
  if (!TABS.includes(rarity)) return;

  selectedTab = rarity;

  for (const tab of document.querySelectorAll(".skin-tab")) {
    const active = tab.dataset.rarity === rarity;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  }

  renderSkins();
}

function formatName(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function afterChange() {
  save();
  renderSkins();
  if (typeof onChangeCallback === "function") onChangeCallback();
}

function renderSkins() {
  const grid = document.getElementById("skinsGrid");
  if (!grid) return;

  grid.replaceChildren();
  updateCounters();

  const secretNote = document.getElementById("secretNote");
  if (secretNote) secretNote.hidden = selectedTab !== "secret";

  const entries = Object.entries(SKINS).filter(([, skin]) =>
    selectedTab === "all"
      ? skin.rarity !== "secret"
      : skin.rarity === selectedTab,
  );

  if (entries.length === 0) {
    const message = document.createElement("p");
    message.classList.add("no-owned-skins");
    message.textContent = `No ${selectedTab} skins found.`;
    grid.appendChild(message);
  }

  for (const [skinId, skin] of entries) {
    grid.appendChild(createSkinItem(skinId, skin));
  }

  lastSignature = getSignature();
}

function updateCounters() {
  const owned = state.ownedSkins ?? [];
  const totals = { all: 0 };
  let ownedMain = 0;
  let secretOwned = 0;
  let secretTotal = 0;

  for (const [id, skin] of Object.entries(SKINS)) {
    totals[skin.rarity] = (totals[skin.rarity] ?? 0) + 1;

    if (skin.rarity === "secret") {
      secretTotal += 1;
      if (owned.includes(id)) secretOwned += 1;
    } else {
      totals.all += 1;
      if (owned.includes(id)) ownedMain += 1;
    }
  }

  for (const element of document.querySelectorAll("[data-count]")) {
    element.textContent = totals[element.dataset.count] ?? 0;
  }

  setText("skinsBadge", `${ownedMain} / ${totals.all} COLLECTED`);
  setText("secretFound", String(secretOwned));
  setText("secretTotal", String(secretTotal));
}

function createSkinItem(skinId, skin) {
  const owned = (state.ownedSkins ?? []).includes(skinId);
  const equipped = (state.equippedSkin ?? "default") === skinId;
  const mystery = !owned && skin.rarity === "secret";

  const card = buildCard(skinId, skin, { owned, equipped, mystery });

  if (owned || !SECRET_HINTS[skinId]) return card;

  return buildSecretSlot(skinId, skin, card);
}

function buildCard(skinId, skin, { owned, equipped, mystery }) {
  const card = document.createElement("article");
  card.classList.add("skin-card");
  card.classList.toggle("equipped", equipped);
  card.classList.toggle("locked", !owned);
  card.dataset.rarity = skin.rarity;

  const art = document.createElement("div");
  art.classList.add("skin-card-art");

  const tag = document.createElement("span");
  tag.classList.add("rarity-tag");
  tag.dataset.rarity = skin.rarity;
  tag.textContent = skin.rarity;

  const preview = document.createElement("div");
  preview.classList.add("skin-preview");
  preview.classList.toggle("skin-silhouette", mystery);
  preview.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
  preview.style.backgroundSize = skinBackgroundSize(skin);

  art.append(tag, preview);

  const body = document.createElement("div");
  body.classList.add("skin-card-body");

  const title = document.createElement("div");
  title.classList.add("skin-card-title");

  const name = document.createElement("h3");
  name.classList.add("skin-name");
  name.textContent = mystery ? "???" : formatName(skin.name);

  const status = document.createElement("span");
  status.classList.add("skin-status");
  status.textContent = owned ? "Owned" : "Not collected";

  title.append(name, status);
  body.append(title);

  const action = buildAction(skinId, skin, owned, equipped);
  if (action) body.append(action);

  card.append(art, body);
  return card;
}

function buildAction(skinId, skin, owned, equipped) {
  if (owned) {
    const button = document.createElement("button");
    button.type = "button";

    if (equipped) {
      button.className = "btn-primary skin-action";
      button.textContent = "✓ Equipped";
      button.setAttribute("aria-pressed", "true");
      return button;
    }

    button.className = "btn-secondary skin-action";
    button.textContent = "Equip skin";
    button.addEventListener("click", () => equipSkin(skinId, skin));
    return button;
  }

  if (SECRET_HINTS[skinId]) return null;

  const cost = CRAFT_COST[skin.rarity];
  if (cost === undefined) return null;

  const button = makeDustButton(`Craft · ${cost}`, cost, "btn-primary");
  button.addEventListener("click", () => craft(skinId, skin, cost));
  return button;
}

function equipSkin(skinId, skin) {
  state.equippedSkin = skinId;

  window.dispatchEvent(
    new CustomEvent("skinSelected", {
      detail: { skinId, imageUrl: assetUrl(skin.img) },
    }),
  );

  renderSkins();
}

async function craft(skinId, skin, cost) {
  if (!(await confirmCraft(skin, cost))) return;
  if (!craftSkin(skinId)) return;

  afterChange();

  showSkinReward(
    { ...skin, name: formatName(skin.name), image: assetUrl(skin.img) },
    "SKIN CRAFTED",
  );
  notifyAchievements();
}

function buildSecretSlot(skinId, skin, card) {
  const hints = SECRET_HINTS[skinId];
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
    const hintBtn = makeDustButton(
      `Hint ${bought + 1} · ${hintCost}`,
      hintCost,
    );

    hintBtn.addEventListener("click", async () => {
      if (!(await confirmCraft(skin, hintCost, "Buy a hint?", "Buy"))) return;
      if (!buyHint(skinId)) return;
      afterChange();
    });

    actions.append(hintBtn);
  }

  if (skinId === "secretCat" && state.foundSecretCats.length < PUZZLE.length) {
    const findBtn = makeDustButton(
      `Find a cat · ${CAT_FIND_COST}`,
      CAT_FIND_COST,
    );

    findBtn.addEventListener("click", async () => {
      const ok = await confirmCraft(
        skin,
        CAT_FIND_COST,
        "Find a hidden cat?",
        "Find",
      );
      if (!ok) return;

      const result = buyFoundCat();
      if (!result.ok) return;

      document
        .querySelector(`.hidden-secret-cat[data-cat-id="${result.id}"]`)
        ?.style.setProperty("display", "none");

      afterChange();

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
    shopBtn.className = "btn-secondary skin-action";
    shopBtn.textContent = bgOwned ? "Go to shop to equip" : "Go to shop";

    shopBtn.addEventListener("click", () => {
      document.getElementById("openShopBtn")?.click();
    });

    actions.append(shopBtn);
  }

  box.append(actions);
  slot.append(card, box);
  return slot;
}

function confirmCraft(
  skin,
  cost,
  title = "Craft this skin?",
  yesLabel = "Craft",
) {
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

function makeDustButton(label, cost, variant = "btn-secondary") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${variant} skin-action`;
  button.append(label);

  const icon = document.createElement("img");
  icon.src = assetUrl("/icons/dust.svg");
  icon.alt = "dust";
  icon.classList.add("btn-icon");
  button.append(icon);

  button.disabled = state.dust < cost;
  return button;
}
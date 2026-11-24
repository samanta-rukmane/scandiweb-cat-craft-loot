import { state } from "../../core/state.js";
import { SKINS } from "../../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../../config/paths.js";
import { getLootboxCost } from "../../loot/lootBox.js";

const PEEK_RARITIES = ["common", "rare", "epic"];

let latest = null;

const byId = (id) => document.getElementById(id);

function formatName(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");
}

function setText(element, text) {
  if (element && element.textContent !== text) element.textContent = text;
}

export function initBoxPage() {
  byId("boxBtn")?.addEventListener("click", renderPeek);

  byId("latestCollectionBtn")?.addEventListener("click", () => {
    document.getElementById("openSkinsBtn")?.click();
  });

  byId("latestEquipBtn")?.addEventListener("click", () => {
    if (!latest || state.equippedSkin === latest.id) return;

    state.equippedSkin = latest.id;

    window.dispatchEvent(
      new CustomEvent("skinSelected", {
        detail: {
          skinId: latest.id,
          imageUrl: assetUrl(SKINS[latest.id].img),
        },
      }),
    );
  });

  renderPeek();
  renderLatest();
}

// Called from render(): cheap, only touches the DOM when something changed.
export function renderBoxPage() {
  const cost = getLootboxCost();

  setText(byId("boxCost"), String(cost));

  const openButton = byId("openBoxBtn");
  if (openButton) openButton.disabled = state.energy < cost;

  renderEquipButton();
}

export function showLatestReward(result) {
  latest = { id: result.id, duplicate: result.duplicate, dust: result.dust };
  renderLatest();
}

function renderLatest() {
  const empty = byId("latestEmpty");
  const content = byId("latestContent");
  const badge = byId("latestBadge");

  if (!empty || !content || !badge) return;

  const skin = latest ? SKINS[latest.id] : null;

  empty.hidden = Boolean(skin);
  content.hidden = !skin;
  badge.hidden = !skin;

  if (!skin) return;

  badge.textContent = latest.duplicate ? `+${latest.dust} dust` : "New skin!";

  const preview = byId("latestPreview");
  if (preview) {
    preview.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
    preview.style.backgroundSize = skinBackgroundSize(skin);
  }

  const rarity = byId("latestRarity");
  if (rarity) {
    rarity.textContent = skin.rarity;
    rarity.dataset.rarity = skin.rarity;
  }

  setText(byId("latestName"), formatName(skin.name));

  renderEquipButton();
}

function renderEquipButton() {
  const button = byId("latestEquipBtn");

  if (!button || !latest || !SKINS[latest.id]) return;

  const equipped = state.equippedSkin === latest.id;

  setText(
    button,
    equipped ? "✓ Equipped" : `Equip ${formatName(SKINS[latest.id].name)}`,
  );
  button.setAttribute("aria-pressed", String(equipped));
}

function renderPeek() {
  const row = byId("boxPeek");
  if (!row) return;

  row.replaceChildren();

  for (const rarity of PEEK_RARITIES) {
    const ids = Object.keys(SKINS).filter(
      (id) => id !== "default" && SKINS[id].rarity === rarity,
    );

    if (ids.length === 0) continue;

    const id = ids[Math.floor(Math.random() * ids.length)];
    row.appendChild(buildPeekCard(SKINS[id]));
  }
}

function buildPeekCard(skin) {
  const card = document.createElement("article");
  card.classList.add("peek-card");

  const art = document.createElement("div");
  art.classList.add("peek-art");
  art.dataset.rarity = skin.rarity;

  const preview = document.createElement("div");
  preview.classList.add("skin-preview");
  preview.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
  preview.style.backgroundSize = skinBackgroundSize(skin);
  art.append(preview);

  const info = document.createElement("div");
  info.classList.add("peek-info");

  const name = document.createElement("h3");
  name.classList.add("skin-name");
  name.textContent = formatName(skin.name);

  const tag = document.createElement("span");
  tag.classList.add("rarity-tag");
  tag.dataset.rarity = skin.rarity;
  tag.textContent = skin.rarity;

  info.append(name, tag);
  card.append(art, info);
  return card;
}
import { state } from "../core/state.js";
import { SKINS } from "../config/skins.js";
import { checkDailyCount } from "../core/offline.js";

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function formatName(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");
}

export function renderMainStatus() {
  const total = Object.keys(SKINS).length;
  const owned = (state.ownedSkins ?? []).filter((id) => id in SKINS).length;

  setText("skinsCollected", `${owned} / ${total}`);
  setText("collectorCount", `${owned} / ${total}`);

  const fill = document.getElementById("collectorFill");
  if (fill) fill.style.width = `${total ? (owned / total) * 100 : 0}%`;

  const skin = SKINS[state.equippedSkin] ?? SKINS.default;
  setText("equippedSkinLabel", `${formatName(skin.name)} · EQUIPPED`);
  
  const badge = document.getElementById("equippedBadge");
  if (badge) badge.dataset.rarity = skin.rarity;

  const { canClaim, todayIndex } = checkDailyCount();

  const banner = document.getElementById("dailyBanner");
  if (banner) banner.hidden = !canClaim;

  const dot = document.getElementById("dailyDot");
  if (dot) dot.hidden = !canClaim;

  setText("dailyBannerDay", String(todayIndex + 1));
}
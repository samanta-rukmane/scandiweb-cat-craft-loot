import { SKINS } from "../../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../../config/paths.js";
import { state } from "../../core/state.js";
import { save } from "../../storage/save.js";

export function applyEquippedSkin() {
  const sprite = document.getElementById("clickBtn");

  if (!sprite) {
    console.error("Cat sprite element #clickBtn was not found.");
    return;
  }

  const skin = SKINS[state.equippedSkin] ?? SKINS.default;

  if (!skin || !skin.img) {
    console.error("The equipped skin has no valid image:", state.equippedSkin);
    return;
  }

  sprite.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
  sprite.style.backgroundSize = skinBackgroundSize(skin);
  sprite.style.backgroundPosition = "0 0";
  sprite.style.backgroundRepeat = "no-repeat";
}

export function initEquipSkin(render) {
  window.addEventListener("skinSelected", (event) => {
    const skinId = event.detail?.skinId;

    if (!skinId || !SKINS[skinId]) {
      console.error("Cannot equip unknown skin:", skinId);
      return;
    }

    if (!state.ownedSkins.includes(skinId)) {
      console.error("Cannot equip unowned skin:", skinId);
      return;
    }

    state.equippedSkin = skinId;

    applyEquippedSkin();
    save();
    render();
  });
}

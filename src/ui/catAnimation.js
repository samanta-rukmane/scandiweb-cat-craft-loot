import { SKINS } from "../config/skins.js";
import { state } from "../core/state.js";

const frameWidth = 32;
const frameHeight = 32;

const columns = 3;
const rows = 4;

const totalFrames = columns * rows;

let frame = 0;
let animationStarted = false;

export function initCatAnimation() {
  if (animationStarted) {
    return;
  }

  const sprite = document.querySelector(".sprite");

  if (!sprite) {
    console.error("Cat sprite not found!");
    return;
  }

  animationStarted = true;

  setInterval(() => {
    if (
      sprite.dataset.goldenCatActive === "true" ||
      document.querySelector(".cat-container.ufo-event-active")
    ) {
      return;
    }

    const currentSkin = SKINS[state.equippedSkin];

    if (!currentSkin || currentSkin.frames) {
      sprite.style.backgroundPosition = "center";
      sprite.style.backgroundSize = "contain";
      sprite.style.backgroundRepeat = "no-repeat";
      return;
    }

    const column = frame % columns;
    const row = Math.floor(frame / columns);

    sprite.style.backgroundPosition = `-${column * frameWidth}px -${row * frameHeight}px`;

    frame = (frame + 1) % totalFrames;
  }, 100);
}

import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";

const BOWL_FRAMES = [
  assetUrl("/skins/containerBowl/frame1.png"),
  assetUrl("/skins/containerBowl/frame2.png"),
  assetUrl("/skins/containerBowl/frame3.png"),
];

const FRAME_DURATION = 500;

const BOWL_SIZE = 60;

const BOWL_RIGHT = 20;
const BOWL_BOTTOM = 40;

export function initContainerBowl() {
  if ((Number(state.generators?.bowl) || 0) < 1) {
    return;
  }

  const container = document.querySelector(".cat-container");

  if (!container) {
    console.warn("Container bowl: .cat-container not found.");
    return;
  }

  if (container.querySelector(".container-bowl")) {
    return;
  }

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  const bowl = document.createElement("img");

  bowl.className = "container-bowl";
  bowl.src = BOWL_FRAMES[0];
  bowl.alt = "";
  bowl.draggable = false;
  bowl.setAttribute("aria-hidden", "true");

  container.appendChild(bowl);

  let frameIndex = 0;
  let frameElapsed = 0;
  let previousTime = 0;
  let animationFrameId;

  BOWL_FRAMES.slice(1).forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  function animateBowl(time) {
    if (!bowl.isConnected) {
      cancelAnimationFrame(animationFrameId);
      return;
    }

    if (previousTime === 0) {
      previousTime = time;
    }

    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;

    frameElapsed += delta * 1000;

    if (frameElapsed >= FRAME_DURATION) {
      frameElapsed %= FRAME_DURATION;
      frameIndex = (frameIndex + 1) % BOWL_FRAMES.length;
      bowl.src = BOWL_FRAMES[frameIndex];
    }

    animationFrameId = requestAnimationFrame(animateBowl);
  }

  bowl.addEventListener(
    "load",
    () => {
      animationFrameId = requestAnimationFrame(animateBowl);
    },
    { once: true },
  );

  bowl.addEventListener("error", () => {
    console.error("Container bowl image failed to load:", bowl.src);
    cancelAnimationFrame(animationFrameId);
    bowl.remove();
  });
}

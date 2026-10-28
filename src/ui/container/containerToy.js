import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";

const TOY_FRAMES = [
  assetUrl("/skins/containerToy/frame1.png"),
  assetUrl("/skins/containerToy/frame2.png"),
  assetUrl("/skins/containerToy/frame3.png"),
  assetUrl("/skins/containerToy/frame4.png"),
  assetUrl("/skins/containerToy/frame5.png"),
];

const FRAME_DURATION = 100;
const TOY_SPEED = 70;
const TOY_SIZE = 40;

export function initContainerToy() {
  if ((Number(state.generators?.toy) || 0) < 1) {
    return;
  }

  const container = document.querySelector(".cat-container");

  if (!container) {
    console.warn("Container toy: .cat-container not found.");
    return;
  }

  if (container.querySelector(".container-toy")) {
    return;
  }

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  const toy = document.createElement("img");
  toy.className = "container-toy";
  toy.src = TOY_FRAMES[0];
  toy.alt = "";
  toy.draggable = false;
  toy.setAttribute("aria-hidden", "true");

  toy.style.width = `${TOY_SIZE}px`;
  toy.style.height = `${TOY_SIZE}px`;

  container.appendChild(toy);

  let x = 0;
  let vx = TOY_SPEED;
  let previousTime = 0;
  let frameElapsed = 0;
  let frameIndex = 0;
  let animationFrameId;

  function updateToy(time) {
    if (!toy.isConnected) {
      cancelAnimationFrame(animationFrameId);
      return;
    }

    if (previousTime === 0) {
      previousTime = time;
    }

    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;

    const maxX = Math.max(0, container.clientWidth - toy.offsetWidth);

    toy.style.top = `${container.clientHeight - toy.offsetHeight}px`;

    x += vx * delta;

    if (x >= maxX) {
      x = maxX;
      vx = -TOY_SPEED;
    } else if (x <= 0) {
      x = 0;
      vx = TOY_SPEED;
    }

    toy.style.left = `${x}px`;

    frameElapsed += delta * 1000;

    if (frameElapsed >= FRAME_DURATION) {
      frameElapsed %= FRAME_DURATION;
      frameIndex = (frameIndex + 1) % TOY_FRAMES.length;
      toy.src = TOY_FRAMES[frameIndex];
    }

    animationFrameId = requestAnimationFrame(updateToy);
  }

  TOY_FRAMES.slice(1).forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  toy.addEventListener(
    "load",
    () => {
      animationFrameId = requestAnimationFrame(updateToy);
    },
    { once: true },
  );

  toy.addEventListener("error", () => {
    console.error("Container toy image failed to load:", toy.src);
    cancelAnimationFrame(animationFrameId);
    toy.remove();
  });
}

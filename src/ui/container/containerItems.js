import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";

const ITEMS = {
  bed: {
    className: "container-bed",
    image: assetUrl("/skins/containerBed/bed.png"),
    alt: "",
    width: 70,
    height: 50,
    left: 10,
    bottom: 0,
  },

  bowl: {
    className: "container-bowl",
    frames: [
      assetUrl("/skins/containerBowl/frame1.png"),
      assetUrl("/skins/containerBowl/frame2.png"),
      assetUrl("/skins/containerBowl/frame3.png"),
    ],
    frameDuration: 500,
    width: 60,
    height: 60,
    right: 20,
    bottom: 40,
  },

  toy: {
    className: "container-toy",
    frames: [
      assetUrl("/skins/containerToy/frame1.png"),
      assetUrl("/skins/containerToy/frame2.png"),
      assetUrl("/skins/containerToy/frame3.png"),
      assetUrl("/skins/containerToy/frame4.png"),
      assetUrl("/skins/containerToy/frame5.png"),
    ],
    frameDuration: 100,
    width: 40,
    height: 40,
    speed: 70,
  },
};

function getContainer() {
  const container = document.querySelector(".cat-container");

  if (!container) {
    console.warn("Container items: .cat-container not found.");
    return null;
  }

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  return container;
}

function createImage(container, config) {
  if (container.querySelector(`.${config.className}`)) {
    return null;
  }

  const image = document.createElement("img");

  image.className = config.className;
  image.alt = config.alt ?? "";
  image.draggable = false;
  image.setAttribute("aria-hidden", "true");

  image.style.width = `${config.width}px`;
  image.style.height = `${config.height}px`;
  image.style.objectFit = "contain";
  image.style.position = "absolute";

  if (config.left !== undefined) {
    image.style.left = `${config.left}px`;
  }

  if (config.right !== undefined) {
    image.style.right = `${config.right}px`;
  }

  if (config.bottom !== undefined) {
    image.style.bottom = `${config.bottom}px`;
  }

  container.appendChild(image);

  return image;
}

function preloadFrames(frames) {
  frames.slice(1).forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

function initBed(container) {
  if ((Number(state.generators?.bed) || 0) < 1) {
    return;
  }

  const config = ITEMS.bed;
  const bed = createImage(container, config);

  if (!bed) {
    return;
  }

  bed.src = config.image;

  bed.addEventListener("error", () => {
    console.error("Container bed image failed to load:", bed.src);
    bed.remove();
  });
}

function animateFrames(image, frames, frameDuration, onUpdate) {
  let frameIndex = 0;
  let frameElapsed = 0;
  let previousTime = 0;
  let animationFrameId = null;

  function stopAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function animate(time) {
    if (!image.isConnected) {
      stopAnimation();
      return;
    }

    if (previousTime === 0) {
      previousTime = time;
    }

    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;

    frameElapsed += delta * 1000;

    if (frameElapsed >= frameDuration) {
      frameElapsed %= frameDuration;
      frameIndex = (frameIndex + 1) % frames.length;
      image.src = frames[frameIndex];
    }

    if (typeof onUpdate === "function") {
      onUpdate(delta);
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  image.addEventListener(
    "load",
    () => {
      if (animationFrameId === null && image.isConnected) {
        animationFrameId = requestAnimationFrame(animate);
      }
    },
    { once: true },
  );

  image.addEventListener("error", () => {
    console.error("Container item image failed to load:", image.src);
    stopAnimation();
    image.remove();
  });
}

function initBowl(container) {
  if ((Number(state.generators?.bowl) || 0) < 1) {
    return;
  }

  const config = ITEMS.bowl;
  const bowl = createImage(container, config);

  if (!bowl) {
    return;
  }

  bowl.src = config.frames[0];

  preloadFrames(config.frames);

  animateFrames(bowl, config.frames, config.frameDuration);
}

function initToy(container) {
  if ((Number(state.generators?.toy) || 0) < 1) {
    return;
  }

  const config = ITEMS.toy;
  const toy = createImage(container, config);

  if (!toy) {
    return;
  }

  toy.src = config.frames[0];

  let x = 0;
  let velocity = config.speed;

  preloadFrames(config.frames);

  animateFrames(toy, config.frames, config.frameDuration, (delta) => {
    const maxX = Math.max(0, container.clientWidth - toy.offsetWidth);

    x = Math.min(x, maxX);

    x += velocity * delta;

    if (x >= maxX) {
      x = maxX;
      velocity = -config.speed;
    } else if (x <= 0) {
      x = 0;
      velocity = config.speed;
    }

    toy.style.left = `${x}px`;
    toy.style.top = `${Math.max(
      0,
      container.clientHeight - toy.offsetHeight,
    )}px`;
  });
}

export function initContainerItems() {
  const container = getContainer();

  if (!container) {
    return;
  }

  initBed(container);
  initBowl(container);
  initToy(container);
}

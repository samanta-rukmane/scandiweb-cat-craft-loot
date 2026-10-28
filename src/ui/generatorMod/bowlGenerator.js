import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";

const BOWL_IMAGES = [
  assetUrl("/skins/bowls/bowl1.png"),
  assetUrl("/skins/bowls/bowl2.png"),
  assetUrl("/skins/bowls/bowl3.png"),
  assetUrl("/skins/bowls/bowl4.png"),
  assetUrl("/skins/bowls/bowl5.png"),
  assetUrl("/skins/bowls/bowl6.png"),
  assetUrl("/skins/bowls/bowl7.png"),
  assetUrl("/skins/bowls/bowl8.png"),
];

const MAX_BOWLS = 12;
const BOWL_SIZE = 40;
const MIN_SPEED = 50;
const MAX_SPEED = 110;

let bowls = [];
let animationId = null;
let lastFrameTime = 0;
let currentContainer = null;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createBowl(container) {
  const image = document.createElement("img");

  image.className = "generator-bowl";
  image.src = BOWL_IMAGES[Math.floor(Math.random() * BOWL_IMAGES.length)];
  image.alt = "Bowl";
  image.draggable = false;

  container.appendChild(image);

  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(MIN_SPEED, MAX_SPEED);

  return {
    image,
    x: 0,
    y: 0,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function initializeBowlPositions(container) {
  const maxX = Math.max(0, container.clientWidth - BOWL_SIZE);
  const maxY = Math.max(0, container.clientHeight - BOWL_SIZE);

  for (const bowl of bowls) {
    bowl.x = randomBetween(0, maxX);
    bowl.y = randomBetween(0, maxY);

    bowl.image.style.left = `${bowl.x}px`;
    bowl.image.style.top = `${bowl.y}px`;
  }
}

function animateBowls(timestamp) {
  if (!currentContainer || !currentContainer.isConnected) {
    animationId = null;
    return;
  }

  const container = currentContainer;

  const deltaTime = lastFrameTime
    ? Math.min((timestamp - lastFrameTime) / 1000, 0.05)
    : 0;

  lastFrameTime = timestamp;

  const maxX = Math.max(0, container.clientWidth - BOWL_SIZE);
  const maxY = Math.max(0, container.clientHeight - BOWL_SIZE);

  for (const bowl of bowls) {
    bowl.x += bowl.vx * deltaTime;
    bowl.y += bowl.vy * deltaTime;

    // Bounce off the left and right edges.
    if (bowl.x <= 0) {
      bowl.x = 0;
      bowl.vx = Math.abs(bowl.vx);
    } else if (bowl.x >= maxX) {
      bowl.x = maxX;
      bowl.vx = -Math.abs(bowl.vx);
    }

    // Bounce off the top and bottom edges.
    if (bowl.y <= 0) {
      bowl.y = 0;
      bowl.vy = Math.abs(bowl.vy);
    } else if (bowl.y >= maxY) {
      bowl.y = maxY;
      bowl.vy = -Math.abs(bowl.vy);
    }

    bowl.image.style.left = `${bowl.x}px`;
    bowl.image.style.top = `${bowl.y}px`;
  }

  animationId = requestAnimationFrame(animateBowls);
}

export function renderBowlGenerator() {
  const container = document.getElementById("generatorBowls");

  if (!container) {
    console.warn("Bowl generator: #generatorBowls was not found.");
    return;
  }

  // The first purchase is represented by the static container bowl.
  // Only purchases after the first one create flying bowls.
  const purchasedAmount = Math.max(
    0,
    Math.floor(Number(state.generators?.bowl) || 0),
  );

  const visibleAmount = Math.min(Math.max(0, purchasedAmount - 1), MAX_BOWLS);

  // Avoid rebuilding the animation if the number of bowls has not changed.
  if (currentContainer === container && bowls.length === visibleAmount) {
    return;
  }

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  currentContainer = container;
  lastFrameTime = 0;

  container.replaceChildren();
  container.dataset.amount = String(visibleAmount);
  container.style.position = "relative";
  container.style.overflow = "hidden";

  bowls = [];

  for (let i = 0; i < visibleAmount; i++) {
    bowls.push(createBowl(container));
  }

  if (visibleAmount === 0) {
    return;
  }

  requestAnimationFrame(() => {
    if (currentContainer !== container || !container.isConnected) {
      return;
    }

    initializeBowlPositions(container);
    lastFrameTime = 0;
    animationId = requestAnimationFrame(animateBowls);
  });
}

import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";

const BED_IMAGES = [
  assetUrl("/skins/beds/bed1.png"),
  assetUrl("/skins/beds/bed2.png"),
  assetUrl("/skins/beds/bed3.png"),
  assetUrl("/skins/beds/bed4.png"),
  assetUrl("/skins/beds/bed5.png"),
  assetUrl("/skins/beds/bed6.png"),
  assetUrl("/skins/beds/bed7.png"),
  assetUrl("/skins/beds/bed8.png"),
];

const MAX_BEDS = 12;
const BED_SIZE = 40;
const MIN_SPEED = 50;
const MAX_SPEED = 110;

let beds = [];
let animationId = null;
let lastFrameTime = 0;
let currentContainer = null;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createBed(container) {
  const image = document.createElement("img");

  image.className = "generator-bed";
  image.src = BED_IMAGES[Math.floor(Math.random() * BED_IMAGES.length)];
  image.alt = "Bed";
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

function initializeBedPositions(container) {
  const maxX = Math.max(0, container.clientWidth - BED_SIZE);
  const maxY = Math.max(0, container.clientHeight - BED_SIZE);

  for (const bed of beds) {
    bed.x = randomBetween(0, maxX);
    bed.y = randomBetween(0, maxY);

    bed.image.style.left = `${bed.x}px`;
    bed.image.style.top = `${bed.y}px`;
  }
}

function animateBeds(timestamp) {
  if (!currentContainer || !currentContainer.isConnected) {
    animationId = null;
    return;
  }

  const container = currentContainer;

  const deltaTime = lastFrameTime
    ? Math.min((timestamp - lastFrameTime) / 1000, 0.05)
    : 0;

  lastFrameTime = timestamp;

  const maxX = Math.max(0, container.clientWidth - BED_SIZE);
  const maxY = Math.max(0, container.clientHeight - BED_SIZE);

  for (const bed of beds) {
    bed.x += bed.vx * deltaTime;
    bed.y += bed.vy * deltaTime;

    if (bed.x <= 0) {
      bed.x = 0;
      bed.vx = Math.abs(bed.vx);
    } else if (bed.x >= maxX) {
      bed.x = maxX;
      bed.vx = -Math.abs(bed.vx);
    }

    if (bed.y <= 0) {
      bed.y = 0;
      bed.vy = Math.abs(bed.vy);
    } else if (bed.y >= maxY) {
      bed.y = maxY;
      bed.vy = -Math.abs(bed.vy);
    }

    bed.image.style.left = `${bed.x}px`;
    bed.image.style.top = `${bed.y}px`;
  }

  animationId = requestAnimationFrame(animateBeds);
}

export function renderBedGenerator() {
  const container = document.getElementById("generatorBeds");

  if (!container) {
    console.warn("Bed generator: #generatorBeds was not found.");
    return;
  }

  const purchasedAmount = Math.max(
    0,
    Math.floor(Number(state.generators?.bed) || 0),
  );

  const visibleAmount = Math.min(Math.max(0, purchasedAmount - 1), MAX_BEDS);

  if (currentContainer === container && beds.length === visibleAmount) {
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

  beds = [];

  for (let i = 0; i < visibleAmount; i++) {
    beds.push(createBed(container));
  }

  if (visibleAmount === 0) {
    return;
  }

  requestAnimationFrame(() => {
    if (currentContainer !== container || !container.isConnected) {
      return;
    }

    initializeBedPositions(container);
    lastFrameTime = 0;
    animationId = requestAnimationFrame(animateBeds);
  });
}

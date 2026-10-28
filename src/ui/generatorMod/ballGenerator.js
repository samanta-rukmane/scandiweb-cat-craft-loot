import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";

const BALL_ANIMATIONS = [
  {
    name: "Yellow ball",
    frames: [
      assetUrl("/skins/balls/frame1.png"),
      assetUrl("/skins/balls/frame2.png"),
      assetUrl("/skins/balls/frame3.png"),
      assetUrl("/skins/balls/frame4.png"),
      assetUrl("/skins/balls/frame5.png"),
    ],
  },
  {
    name: "Red ball",
    frames: [
      assetUrl("/skins/balls/frame6.png"),
      assetUrl("/skins/balls/frame7.png"),
      assetUrl("/skins/balls/frame8.png"),
      assetUrl("/skins/balls/frame9.png"),
      assetUrl("/skins/balls/frame10.png"),
    ],
  },
  {
    name: "White ball",
    frames: [
      assetUrl("/skins/balls/frame11.png"),
      assetUrl("/skins/balls/frame12.png"),
      assetUrl("/skins/balls/frame13.png"),
      assetUrl("/skins/balls/frame14.png"),
      assetUrl("/skins/balls/frame15.png"),
    ],
  },
  {
    name: "Green ball",
    frames: [
      assetUrl("/skins/balls/frame16.png"),
      assetUrl("/skins/balls/frame17.png"),
      assetUrl("/skins/balls/frame18.png"),
      assetUrl("/skins/balls/frame19.png"),
      assetUrl("/skins/balls/frame20.png"),
    ],
  },
];

const MAX_BALLS = 12;
const BALL_SIZE = 40;
const FRAME_DURATION = 100;

const MIN_SPEED = 50;
const MAX_SPEED = 110;

let balls = [];
let animationId = null;
let lastFrameTime = 0;
let currentContainer = null;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createBall(container) {
  const animation =
    BALL_ANIMATIONS[Math.floor(Math.random() * BALL_ANIMATIONS.length)];

  const image = document.createElement("img");

  image.className = "generator-ball";
  image.alt = animation.name;
  image.draggable = false;
  image.src = animation.frames[0];

  Object.assign(image.style, {
    position: "absolute",
    width: `${BALL_SIZE}px`,
    height: `${BALL_SIZE}px`,
    objectFit: "contain",
    imageRendering: "pixelated",
    display: "block",
    pointerEvents: "none",
    userSelect: "none",
  });

  container.appendChild(image);

  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(MIN_SPEED, MAX_SPEED);

  return {
    image,
    frames: animation.frames,

    frameIndex: 0,
    frameTimer: 0,

    x: 0,
    y: 0,

    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function initializeBallPositions(container) {
  const maxX = Math.max(0, container.clientWidth - BALL_SIZE);
  const maxY = Math.max(0, container.clientHeight - BALL_SIZE);

  balls.forEach((ball) => {
    ball.x = randomBetween(0, maxX);
    ball.y = randomBetween(0, maxY);

    ball.image.style.left = `${ball.x}px`;
    ball.image.style.top = `${ball.y}px`;
  });
}

function animateBalls(timestamp) {
  if (!currentContainer || !currentContainer.isConnected) {
    animationId = null;
    return;
  }

  const container = currentContainer;

  const deltaTime = lastFrameTime
    ? Math.min((timestamp - lastFrameTime) / 1000, 0.05)
    : 0;

  lastFrameTime = timestamp;

  const maxX = Math.max(0, container.clientWidth - BALL_SIZE);
  const maxY = Math.max(0, container.clientHeight - BALL_SIZE);

  for (const ball of balls) {
    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;

    if (ball.x <= 0) {
      ball.x = 0;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x >= maxX) {
      ball.x = maxX;
      ball.vx = -Math.abs(ball.vx);
    }

    if (ball.y <= 0) {
      ball.y = 0;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y >= maxY) {
      ball.y = maxY;
      ball.vy = -Math.abs(ball.vy);
    }

    ball.image.style.left = `${ball.x}px`;
    ball.image.style.top = `${ball.y}px`;

    ball.frameTimer += deltaTime * 1000;

    if (ball.frameTimer >= FRAME_DURATION) {
      ball.frameTimer %= FRAME_DURATION;

      ball.frameIndex = (ball.frameIndex + 1) % ball.frames.length;

      ball.image.src = ball.frames[ball.frameIndex];
    }
  }

  animationId = requestAnimationFrame(animateBalls);
}

export function renderBallGenerator() {
  const container = document.getElementById("generatorBalls");

  if (!container) {
    console.warn("Ball generator: #generatorBalls was not found.");
    return;
  }

  const amount = Math.max(0, Math.floor(Number(state.generators?.toy) || 0));

  const visibleAmount = Math.min(Math.max(0, amount - 1), MAX_BALLS);

  if (currentContainer === container && balls.length === visibleAmount) {
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

  balls = [];

  for (let i = 0; i < visibleAmount; i++) {
    balls.push(createBall(container));
  }

  requestAnimationFrame(() => {
    if (currentContainer !== container || !container.isConnected) {
      return;
    }

    initializeBallPositions(container);

    lastFrameTime = 0;
    animationId = requestAnimationFrame(animateBalls);
  });
}

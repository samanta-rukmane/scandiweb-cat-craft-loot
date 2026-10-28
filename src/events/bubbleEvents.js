import { state } from "../core/state.js";
import { addEnergy } from "../loot/energy.js";
import { GENERATORS } from "../config/generators.js";

const BUBBLE_DURATION = 25_000;

const MIN_SPAWN_DELAY = 10 * 60 * 1000;
const MAX_SPAWN_DELAY = 20 * 60 * 1000;

const DAY = 24 * 60 * 60 * 1000;

const EVENTS = [
  {
    id: "treatEvent",
    image: "treatEvent.png",
    cooldown: DAY,
    getReward: () => ({
      type: "treats",
      amount: Math.floor(state.stats.totalTreats * 0.01),
      description: "+1% lifetime treats",
    }),
  },
  {
    id: "treatsEvent",
    image: "treatsEvent.png",
    cooldown: 7 * DAY,
    getReward: () => ({
      type: "treats",
      amount: Math.floor(state.stats.totalTreats * 0.05),
      description: "+5% lifetime treats",
    }),
  },
  {
    id: "dustEvent",
    image: "dustEvent.png",
    cooldown: 2 * DAY,
    getReward: () => ({
      type: "dust",
      amount: 50,
      description: "+50 dust",
    }),
  },
  {
    id: "dustsEvent",
    image: "dustsEvent.png",
    cooldown: 14 * DAY,
    getReward: () => ({
      type: "dust",
      amount: 100,
      description: "+100 dust",
    }),
  },
  {
    id: "energyEvent",
    image: "energyEvent.png",
    cooldown: 14 * DAY,
    getReward: () => ({
      type: "energy",
      amount: 5,
      description: "+5 energy",
    }),
  },
  {
    id: "energiesEvent",
    image: "energiesEvent.png",
    cooldown: 30 * DAY,
    getReward: () => ({
      type: "energy",
      amount: 10,
      description: "+10 energy",
    }),
  },
];

const GENERATOR_EVENTS = [
  {
    id: "bedEvent",
    image: "bedEvent.png",
    chance: 0.05,
    generator: "bed",
  },
  {
    id: "bowlEvent",
    image: "bowlEvent.png",
    chance: 0.2,
    generator: "bowl",
  },
  {
    id: "toyEvent",
    image: "toyEvent.png",
    chance: 0.4,
    generator: "toy",
  },
];

let spawnTimer = null;
let expirationTimer = null;
let activeBubble = null;
let onChangeCallback = () => {};

function getBubbleContainer() {
  return (
    document.querySelector(".cat-container") ||
    document.getElementById("clickBtn")?.parentElement
  );
}

function getEventHistory() {
  if (!state.bubbleEvents) {
    state.bubbleEvents = {
      lastClaimed: {},
    };
  }

  if (!state.bubbleEvents.lastClaimed) {
    state.bubbleEvents.lastClaimed = {};
  }

  return state.bubbleEvents.lastClaimed;
}

function isEventAvailable(event) {
  const lastClaimed = getEventHistory()[event.id] ?? 0;

  return Date.now() - lastClaimed >= event.cooldown;
}

function chooseEvent() {
  const availableEvents = EVENTS.filter(isEventAvailable);
  const roll = Math.random();

  if (roll < 0.05) {
    return GENERATOR_EVENTS.find((event) => event.generator === "bed");
  }

  if (roll < 0.25) {
    return GENERATOR_EVENTS.find((event) => event.generator === "bowl");
  }

  if (roll < 0.65) {
    return GENERATOR_EVENTS.find((event) => event.generator === "toy");
  }

  if (availableEvents.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * availableEvents.length);
  return availableEvents[index];
}

function removeBubble() {
  if (expirationTimer !== null) {
    clearTimeout(expirationTimer);
    expirationTimer = null;
  }

  if (activeBubble) {
    activeBubble.remove();
    activeBubble = null;
  }
}

function scheduleNextSpawn() {
  if (spawnTimer !== null) {
    clearTimeout(spawnTimer);
  }

  const delay =
    MIN_SPAWN_DELAY + Math.random() * (MAX_SPAWN_DELAY - MIN_SPAWN_DELAY);

  spawnTimer = setTimeout(() => {
    spawnTimer = null;

    if (!activeBubble) {
      const event = chooseEvent();

      if (event) {
        spawnBubble(event);
      }
    }

    scheduleNextSpawn();
  }, delay);
}

function spawnBubble(event) {
  const container = document.querySelector(".cat-container");

  if (!container || activeBubble) {
    console.warn(
      "Bubble not spawned: .cat-container not found or bubble already active.",
    );
    return;
  }

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  const bubble = document.createElement("button");

  bubble.type = "button";
  bubble.className = "event-bubble";
  bubble.setAttribute("aria-label", "Collect event reward");

  bubble.style.backgroundImage = `url("/skins/emotes/${event.image}")`;

  container.appendChild(bubble);
  activeBubble = bubble;

  bubble.addEventListener("click", () => {
    if (activeBubble !== bubble) {
      return;
    }

    collectReward(event);
    removeBubble();
  });

  expirationTimer = setTimeout(() => {
    if (activeBubble === bubble) {
      removeBubble();
    }
  }, BUBBLE_DURATION);
}

function collectReward(event) {
  const now = Date.now();

  if (event.generator) {
    if (!GENERATORS[event.generator]) {
      console.error(`Unknown generator: ${event.generator}`);
      return;
    }

    state.generators[event.generator] =
      (state.generators[event.generator] ?? 0) + 1;
  } else {
    const reward = event.getReward();

    switch (reward.type) {
      case "treats":
        state.treats += reward.amount;
        state.stats.totalTreats += reward.amount;
        break;

      case "dust":
        state.dust += reward.amount;
        break;

      case "energy":
        addEnergy(reward.amount);
        break;

      default:
        console.error(`Unknown bubble reward type: ${reward.type}`);
        return;
    }

    getEventHistory()[event.id] = now;
  }

  onChangeCallback();

  if (typeof window.debugSaveGame === "function") {
    window.debugSaveGame();
  }
}

/**
 *
 * @param {Function} onChange Called after a reward is collected.
 */
export function initBubbleEvents(onChange = () => {}) {
  onChangeCallback = onChange;

  if (spawnTimer !== null) {
    clearTimeout(spawnTimer);
    spawnTimer = null;
  }

  removeBubble();
  scheduleNextSpawn();
}

import { state } from "../core/state.js";
import { addEnergy } from "../loot/energy.js";
import { GENERATORS } from "../config/generators.js";
import { assetUrl } from "../config/paths.js";
import { showClickEffect } from "../ui/click/clickEffect.js";
import { getSkinBonuses } from "../core/skinBonuses.js";
import { getSkillMultiplier } from "../core/skillTree.js";

const BUBBLE_DURATION = 25_000;

const MIN_SPAWN_DELAY = 60_000;
const MAX_SPAWN_DELAY = 180_000;

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

const NEGATIVE_EVENTS = [
  {
    id: "takeTreatsEvent",
    image: "takeTreatsEvent.png",
    chance: 0.2,
    type: "takeTreats",
  },
  {
    id: "takeDustEvent",
    image: "takeDustEvent.png",
    chance: 0.15,
    type: "takeDust",
  },
  {
    id: "generatorEvent",
    image: "generatorEvent.png",
    chance: 0.05,
    type: "takeGenerator",
  },
  {
    id: "skinEvent",
    image: "skinEvent.png",
    chance: 0.01,
    type: "takeSkin",
  },
];

let spawnTimer = null;
let expirationTimer = null;
let activeBubble = null;
let onChangeCallback = () => {};

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
  const bonuses = getSkinBonuses();

  const baseNegativeChance = NEGATIVE_EVENTS.reduce(
    (total, event) => total + event.chance,
    0,
  );

  const positiveBonus = bonuses.positiveBubbleChanceBonus ?? 0;

  const negativeChance = Math.max(0, baseNegativeChance - positiveBonus);

  const scale =
    baseNegativeChance > 0 ? negativeChance / baseNegativeChance : 0;

  const roll = Math.random();
  let threshold = 0;

  for (const event of NEGATIVE_EVENTS) {
    threshold += event.chance * scale;

    if (roll < threshold) {
      return event;
    }
  }

  return chooseExistingEvent();
}

function chooseExistingEvent() {
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
  bubble.style.backgroundImage = `url("${assetUrl(`/skins/emotes/${event.image}`)}")`;

  container.appendChild(bubble);
  activeBubble = bubble;

  bubble.addEventListener("click", (clickEvent) => {
    if (activeBubble !== bubble) {
      return;
    }

    const message = collectReward(event);

    if (message) {
      showClickEffect(clickEvent, message);
    }

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
  let message = "";

  if (event.generator) {
    if (!GENERATORS[event.generator]) {
      console.error(`Unknown generator: ${event.generator}`);
      return "";
    }

    state.generators[event.generator] =
      (state.generators[event.generator] ?? 0) +
      1 * getSkillMultiplier("bubbleEffect");

    const amount = Math.floor(1 * getSkillMultiplier("bubbleEffect"));
    const generatorName = GENERATORS[event.generator].name ?? event.generator;

    message = `+${amount} ${generatorName}`;
    getEventHistory()[event.id] = now;
  } else if (event.type) {
    switch (event.type) {
      case "takeTreats": {
        const bonuses = getSkinBonuses();
        const reduction = bonuses.negativeBubbleReduction ?? 0;

        const originalLoss = Math.floor(state.treats * 0.01);
        const amount = Math.floor(originalLoss * (1 - reduction));

        state.treats = Math.max(0, state.treats - amount);

        if (reduction > 0 && amount < originalLoss) {
          message = `Med Cat reduced the loss to ${amount} treats!`;
        } else if (amount > 0) {
          message = `Lost ${amount} treats!`;
        } else {
          message = "No treats lost!";
        }

        break;
      }

      case "takeDust": {
        const bonuses = getSkinBonuses();
        const reduction = bonuses.negativeBubbleReduction ?? 0;

        const originalLoss = Math.floor(state.dust * 0.01);
        const amount = Math.floor(originalLoss * (1 - reduction));

        state.dust = Math.max(0, state.dust - amount);

        if (reduction > 0 && amount < originalLoss) {
          message = `Med Cat reduced the loss to ${amount} dust!`;
        } else if (amount > 0) {
          message = `Lost ${amount} dust!`;
        } else {
          message = "No dust lost!";
        }

        break;
      }

      case "takeGenerator": {
        const bonuses = getSkinBonuses();

        if (
          bonuses.negativeBubbleReduction &&
          Math.random() < bonuses.negativeBubbleReduction
        ) {
          message = "Med Cat protected your generators!";
          break;
        }

        const ownedGenerators = Object.keys(GENERATORS).filter(
          (id) => (state.generators[id] ?? 0) > 0,
        );

        if (ownedGenerators.length === 0) {
          message = "No generators lost!";
          break;
        }

        const randomId =
          ownedGenerators[Math.floor(Math.random() * ownedGenerators.length)];

        state.generators[randomId] -= 1;

        message = `Lost one ${GENERATORS[randomId].name}!`;

        break;
      }

      case "takeSkin": {
        const ownedSkins = state.ownedSkins;

        if (!Array.isArray(ownedSkins) || ownedSkins.length <= 1) {
          message = "No skin lost!";
          break;
        }

        const equippedSkin = state.equippedSkin ?? state.currentSkin;

        let removableSkins = ownedSkins.filter((skin) => skin !== equippedSkin);

        if (removableSkins.length === 0) {
          removableSkins = [...ownedSkins];
        }

        const index = Math.floor(Math.random() * removableSkins.length);

        const skinToRemove = removableSkins[index];
        const ownedIndex = ownedSkins.indexOf(skinToRemove);

        if (ownedIndex !== -1) {
          ownedSkins.splice(ownedIndex, 1);
        }

        if (skinToRemove === equippedSkin && ownedSkins.length > 0) {
          if ("equippedSkin" in state) {
            state.equippedSkin = ownedSkins[0];
          }

          if ("currentSkin" in state) {
            state.currentSkin = ownedSkins[0];
          }
        }

        message = "-1 skin";
        break;
      }

      default:
        console.error(`Unknown negative event type: ${event.type}`);
        return "";
    }

    getEventHistory()[event.id] = now;
  } else {
    const reward = event.getReward();
    reward.amount *= getSkillMultiplier("bubbleEffect");
    switch (reward.type) {
      case "treats":
        state.treats += reward.amount;
        state.stats.totalTreats += reward.amount;
        message = `+${reward.amount} treats`;
        break;

      case "dust":
        state.dust += reward.amount;
        message = `+${reward.amount} dust`;
        break;

      case "energy":
        addEnergy(reward.amount);
        message = `+${reward.amount} energy`;
        break;

      default:
        console.error(`Unknown bubble reward type: ${reward.type}`);
        return "";
    }

    getEventHistory()[event.id] = now;
  }

  onChangeCallback();

  if (typeof window.debugSaveGame === "function") {
    window.debugSaveGame();
  }

  return message;
}

/**
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

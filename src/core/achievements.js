import { state } from "./state.js";
import { ACHIEVEMENTS } from "../config/achievements.js";
import { SKINS } from "../config/skins.js";
import { showToast } from "../ui/toast.js";
import { save } from "../storage/save.js";
import { assetUrl } from "../config/paths.js";

const STATS = {
  totalClicks: () => state.stats.totalClicks,
  boxesOpened: () => state.stats.boxesOpened,
  totalTreats: () => state.stats.totalTreats,
  skinsOwned: () => state.ownedSkins.length,
  legendaryOwned: () =>
    state.ownedSkins.filter((id) => SKINS[id]?.rarity === "legendary").length,
  dailyStreak: () => state.dailyStreak,
};

export function getStat(name) {
  return STATS[name]?.() ?? 0;
}

function checkAchievements() {
  const unlocked = [];

  for (const a of ACHIEVEMENTS) {
    if (state.achievements.includes(a.id)) {
      continue;
    }
    if (getStat(a.stat) < a.target) {
      continue;
    }
    state.achievements.push(a.id);
    if (a.reward) {
      for (const [key, amount] of Object.entries(a.reward)) {
        state[key] += amount;
      }
    }
    unlocked.push(a);
  }

  return unlocked;
}

const achievementSound = new Audio(assetUrl("/sounds/achievement.mp3"));
achievementSound.volume = 1;

export function notifyAchievements() {
  const unlocked = checkAchievements();

  for (const a of unlocked) {
    showToast("Achievement unlocked!", a.name);
    achievementSound.currentTime = 0;
    achievementSound.play().catch((error) => {
      console.warn("Could not play achievement sound:", error);
    });
  }

  if (unlocked.length > 0) {
    save();
  }
}

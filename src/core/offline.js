import { state } from "../core/state.js";
import { MAXOFFLINETIME } from "../config/balance.js";
import { getCps } from "./economy.js";
import { DAILY_REWARDS } from "../config/dailyrewards.js";

export function applyOfflineGains() {
  const now = Date.now();

  if (!state.lastSeen) {
    state.lastSeen = now;
  }

  let gained;
  let rawSeconds = (now - state.lastSeen) / 1000;
  const elapsed = Math.min(Math.max(0, rawSeconds), MAXOFFLINETIME);

  gained = elapsed * getCps();
  state.treats += gained;
  state.stats.totalTreats += gained;

  state.lastSeen = now;

  return { gained, elapsed };
}

export function canClaimDaily() {
  return state.lastDailyClaim !== dateString();
}

export function claimDaily() {
  if (!canClaimDaily()) {
    return { ok: false };
  }
  const yesterday = dateString(-1);
  const now = dateString();

  if (state.lastDailyClaim === yesterday) {
    state.dailyStreak += 1;
  } else {
    state.dailyStreak = 1;
  }
  const reward = DAILY_REWARDS[(state.dailyStreak - 1) % DAILY_REWARDS.length];

  for (const [key, value] of Object.entries(reward)) {
    state[key] += value;
  }
  state.lastDailyClaim = now;
  return { ok: true, reward, streak: state.dailyStreak };
}
const DEBUG_OFFSET = 1;
function dateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays + DEBUG_OFFSET);
  return d.toISOString().slice(0, 10);
}

export function checkDailyCount() {
  const today = dateString();
  const yesterday = dateString(-1);
  const len = DAILY_REWARDS.length;

  const streakAlive =
    state.lastDailyClaim === today || state.lastDailyClaim === yesterday;
  const canClaim = canClaimDaily();

  const currentStreak = streakAlive ? state.dailyStreak : 0;

  let claimedCount = 0;
  let todayIndex = -1;

  if (canClaim) {
    claimedCount = currentStreak % len;
    todayIndex = claimedCount;
  } else {
    claimedCount = ((currentStreak - 1) % len) + 1;
    todayIndex = -1;
  }

  return { claimedCount, todayIndex, canClaim };
}

import { PUZZLE, PUZZLE_REWARD_SKIN } from "../config/puzzle.js";
import { state } from "./state.js";

export function findSecretCat(id) {
  const known = PUZZLE.some((cat) => cat.id === id);
  if (!known || state.foundSecretCats.includes(id)) {
    return { ok: false };
  }
  state.foundSecretCats.push(id);

  const count = state.foundSecretCats.length;
  const complete = count >= PUZZLE.length;
  const justCompleted = complete && !state.secretPuzzleCompleted;

  if (justCompleted) {
    state.secretPuzzleCompleted = true;
    if (!state.ownedSkins.includes(PUZZLE_REWARD_SKIN)) {
      state.ownedSkins.push(PUZZLE_REWARD_SKIN);
    }
  }

  return { ok: true, count, complete, justCompleted };
}

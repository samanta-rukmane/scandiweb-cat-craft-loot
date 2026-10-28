import { save } from "../../storage/save.js";
import { canClaimDaily, claimDaily } from "../../core/offline.js";
import { renderDailyList } from "./dailyRewards.js";

export function initDailyModal(onChange) {
  const dialog = document.getElementById("dailyRewardDialog");
  const openBtn = document.getElementById("openDailyBtn");
  const closeBtn = document.getElementById("dailyRewardCloseBtn");
  const claimBtn = document.getElementById("claimDailyButton");
  const offlineDialog = document.getElementById("offlineDialog");

  if (!dialog || !openBtn || !closeBtn || !claimBtn) {
    console.error("Daily reward dialog elements not found!");
    return;
  }

  function openDaily() {
    if (dialog.open) return;
    renderDailyList();
    dialog.showModal();
  }

  openBtn.addEventListener("click", openDaily);

  claimBtn.addEventListener("click", () => {
    const result = claimDaily();
    if (!result.ok) return;
    save();
    renderDailyList();
    onChange();
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  if (canClaimDaily()) {
    if (offlineDialog?.open) {
      offlineDialog.addEventListener("close", openDaily, { once: true });
    } else {
      openDaily();
    }
  }
}

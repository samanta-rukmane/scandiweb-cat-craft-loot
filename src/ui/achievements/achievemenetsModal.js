import { initAchievementsList } from "./achievementsList.js";

export function initAchievementsModal() {
  const dialog = document.getElementById("achievementsDialog");
  const openBtn = document.getElementById("openAchievementsBtn");
  const closeBtn = document.getElementById("achievementsCloseBtn");

  if (!dialog || !openBtn || !closeBtn) {
    console.error("Achievements dialog elements not found!");
    return;
  }

  openBtn.addEventListener("click", () => {
    if (dialog.open) return;
    initAchievementsList();
    dialog.showModal();
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

import { initSkillTree, renderSkillTree } from "./skillTreeList.js";

export function initSkillTreeModal(onChange) {
  const dialog = document.getElementById("skillTreeDialog");
  const openBtn = document.getElementById("openSkillTreeBtn");
  const closeBtn = document.getElementById("closeSkillTreeBtn");

  if (!dialog || !openBtn || !closeBtn) {
    console.error("Skill tree dialog elements not found!");
    return;
  }

  initSkillTree(onChange);

  openBtn.addEventListener("click", () => {
    if (dialog.open) return;
    renderSkillTree();
    dialog.showModal();
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

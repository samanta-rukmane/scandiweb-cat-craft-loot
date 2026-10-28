export function initLootboxModal() {
  const dialog = document.getElementById("dialog");
  const boxBtn = document.getElementById("boxBtn");
  const closeBtn = document.getElementById("closeBtn");

  if (!dialog || !boxBtn || !closeBtn) {
    console.error("Loot box dialog elements not found!");
    return;
  }

  boxBtn.addEventListener("click", () => {
    if (!dialog.open) {
      window.dispatchEvent(new Event("lootboxOpening"));
      dialog.showModal();
    }
  });

  dialog.addEventListener("cancel", (event) => {
    if (dialog.dataset.spinning === "true") {
      event.preventDefault();
    }
  });

  closeBtn.addEventListener("click", () => {
    if (dialog.dataset.spinning === "true") {
      return;
    }

    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      if (dialog.dataset.spinning === "true") {
        return;
      }

      dialog.close();
    }
  });
}

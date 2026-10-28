const openButton = document.getElementById("openInstructionsBtn");
const closeButton = document.getElementById("closeInstructionsBtn");
const startButton = document.getElementById("startPlayingBtn");
const instructionsDialog = document.getElementById("instructionsDialog");

const FIRST_VISIT_KEY = "catClickerInstructionsShown";

export function initInstructions() {
  if (!openButton || !closeButton || !startButton || !instructionsDialog) {
    console.error("Instructions elements not found!");
    return;
  }

  openButton.addEventListener("click", () => {
    instructionsDialog.showModal();
  });

  closeButton.addEventListener("click", () => {
    instructionsDialog.close();
  });

  startButton.addEventListener("click", () => {
    instructionsDialog.close();
  });

  instructionsDialog.addEventListener("click", (event) => {
    if (event.target === instructionsDialog) {
      instructionsDialog.close();
    }
  });

  if (!localStorage.getItem(FIRST_VISIT_KEY)) {
    instructionsDialog.showModal();

    localStorage.setItem(FIRST_VISIT_KEY, "true");
  }
}

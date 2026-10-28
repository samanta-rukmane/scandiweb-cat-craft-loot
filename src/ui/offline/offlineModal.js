export function initOfflineModal(offlineGained) {
  const offlineAmount = document.getElementById("offline-amount");
  const offlineCloseBtn = document.getElementById("offlineCloseBtn");
  const offlineDialog = document.getElementById("offlineDialog");
  if (
    offlineGained.gained > 0 &&
    offlineGained.elapsed > 60 &&
    offlineDialog &&
    offlineAmount
  ) {
    offlineAmount.textContent = Math.floor(offlineGained.gained);
    offlineDialog.showModal();
  }

  if (offlineCloseBtn && offlineDialog) {
    offlineCloseBtn.addEventListener("click", () => offlineDialog.close());
  }
}

export function showToast(titleText, message) {
  const container = document.getElementById("toastContainer");
  if (!container) {
    return;
  }
  if (container.matches(":popover-open")) container.hidePopover();
  container.showPopover();
  const toast = document.createElement("div");
  toast.classList.add("toast");

  const titleEl = document.createElement("span");
  titleEl.classList.add("toast-title");

  const messageEl = document.createElement("span");
  messageEl.classList.add("toast-text");

  container.appendChild(toast);
  toast.appendChild(titleEl);
  toast.appendChild(messageEl);

  titleEl.textContent = titleText;
  messageEl.textContent = message;

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

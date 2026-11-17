export function showView(name) {
  const views = document.querySelectorAll("[data-view]");

  if (![...views].some((view) => view.dataset.view === name)) {
    console.error("Unknown view:", name);
    return;
  }

  for (const view of views) {
    view.hidden = view.dataset.view !== name;
  }

  for (const item of document.querySelectorAll("[data-nav]")) {
    const active = item.dataset.nav === name;
    item.classList.toggle("active", active);

    if (active) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  }
}

export function initViews() {
  for (const item of document.querySelectorAll("[data-nav]")) {
    item.addEventListener("click", () => showView(item.dataset.nav));
  }

  showView("home");
}
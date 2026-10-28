export function initMobileMenu() {
  const bar = document.getElementById("topMenu");
  const toggle = document.getElementById("menuToggleBtn");
  if (!bar || !toggle) return;

  function setOpen(open) {
    bar.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () =>
    setOpen(!bar.classList.contains("open")),
  );

  bar.addEventListener("click", (e) => {
    if (e.target.closest("button") && e.target !== toggle) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

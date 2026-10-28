export function showClickEffect(event, amount) {
  const container = document.querySelector(".cat-container");

  if (!container) {
    return;
  }

  const rect = container.getBoundingClientRect();

  const effect = document.createElement("span");

  effect.classList.add("floating-treat");
  effect.textContent = `+${amount}`;

  effect.style.left = `${event.clientX - rect.left}px`;
  effect.style.top = `${event.clientY - rect.top}px`;

  container.appendChild(effect);

  effect.addEventListener(
    "animationend",
    () => {
      effect.remove();
    },
    { once: true },
  );
}

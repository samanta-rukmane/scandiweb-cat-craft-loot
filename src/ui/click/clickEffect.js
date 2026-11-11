export function showClickEffect(event, amount, isCrit) {
  const container = document.querySelector(".cat-container");

  if (!container) {
    return;
  }

  const rect = container.getBoundingClientRect();
  const effect = document.createElement("span");

  effect.classList.add("floating-treat");

  const formattedAmount =
    typeof amount === "number"
      ? `${amount >= 0 ? "+" : ""}${amount.toFixed(2)}`
      : amount;

  effect.textContent = isCrit ? `CRIT! ${formattedAmount}` : formattedAmount;
  effect.classList.toggle("crit", isCrit);

  effect.style.left = `${event.clientX - rect.left}px`;
  effect.style.top = `${event.clientY - rect.top}px`;

  container.appendChild(effect);

  effect.addEventListener("animationend", () => effect.remove(), {
    once: true,
  });
}

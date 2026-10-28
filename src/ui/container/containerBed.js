import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";

const BED_IMAGE = assetUrl("/skins/containerBed/bed.png");

const BED_WIDTH = 70;
const BED_HEIGHT = 50;

const BED_LEFT = 10;
const BED_BOTTOM = 0;

export function initContainerBed() {
  if ((Number(state.generators?.bed) || 0) < 1) {
    return;
  }

  const container = document.querySelector(".cat-container");

  if (!container) {
    console.warn("Container bed: .cat-container not found.");
    return;
  }

  if (container.querySelector(".container-bed")) {
    return;
  }

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  const bed = document.createElement("img");

  bed.className = "container-bed";
  bed.src = BED_IMAGE;
  bed.alt = "";
  bed.draggable = false;
  bed.setAttribute("aria-hidden", "true");

  container.appendChild(bed);

  bed.addEventListener("error", () => {
    console.error("Container bed image failed to load:", bed.src);
    bed.remove();
  });
}

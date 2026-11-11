import { assetUrl } from "../config/paths.js";

export function initCustomCursor() {
  document.getElementById("customCursor")?.remove();

  const cursor = document.createElement("div");
  cursor.id = "customCursor";

  document.body.classList.add("custom-cursor");

  const cursors = {
    normal: assetUrl("/skins/cursor/cursor1.gif"),
    pointer: assetUrl("/skins/cursor/cursor2.gif"),
    close: assetUrl("/skins/cursor/cursor3.png"),
    loading: assetUrl("/skins/cursor/cursor4.gif"),
  };

  let currentCursor = "normal";
  let isLoading = false;

  cursor.style.backgroundImage = `url("${cursors.normal}")`;

  document.body.appendChild(cursor);

  function setCursor(type) {
    if (!cursors[type]) return;

    isLoading = type === "loading";

    if (currentCursor === type) return;

    currentCursor = type;
    cursor.style.backgroundImage = `url("${cursors[type]}")`;
  }

  function updatePosition(event) {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }

  function updateCursorParent() {
    const openDialogs = document.querySelectorAll("dialog[open]");
    const topDialog = openDialogs[openDialogs.length - 1];

    if (topDialog && !topDialog.contains(cursor)) {
      topDialog.appendChild(cursor);
    } else if (!topDialog && cursor.parentElement !== document.body) {
      document.body.appendChild(cursor);
    }
  }

  const observer = new MutationObserver(updateCursorParent);

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open"],
  });

  document.addEventListener("mousemove", updatePosition);

  document.addEventListener("mouseover", (event) => {
    if (isLoading) return;

    const target = event.target;

    if (!(target instanceof Element)) return;

    if (
      target.closest(
        ".close-btn, .close-button, [aria-label='Close'], [data-close], #closeSkinsBtn",
      )
    ) {
      setCursor("close");
    } else if (
      target.closest(
        "button:not(:disabled), a, [role='button'], input[type='submit']",
      )
    ) {
      setCursor("pointer");
    } else {
      setCursor("normal");
    }
  });

  window.setGameCursor = setCursor;

  return { setCursor };
}

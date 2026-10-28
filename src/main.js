import { state } from "./core/state.js";
import { load, save } from "./storage/save.js";
import { render } from "./ui/render.js";
import { initGenerators } from "./ui/generators.js";
import { updateEnergy } from "./loot/energy.js";
import { claimReward } from "./loot/lootBox.js";
import { initCatAnimation } from "./ui/catAnimation.js";
import { initSkinsModal } from "./ui/skins/skinsModal.js";
import { applyOfflineGains } from "./core/offline.js";
import { initAdModal } from "./ui/adModal.js";
import { initLootboxModal } from "./ui/lootbox/lootboxModal.js";
import { initShop } from "./ui/shop.js";
import { initDailyList } from "./ui/daily/dailyRewards.js";
import { initDailyModal } from "./ui/daily/dailyModal.js";
import { notifyAchievements } from "./core/achievements.js";
import { initAchievementsList } from "./ui/achievements/achievementsList.js";
import { initAchievementsModal } from "./ui/achievements/achievemenetsModal.js";
import { initInstructions } from "./ui/instructions.js";
import { initLootboxFlow } from "./loot/lootboxFlow.js";
import { initEquipSkin, applyEquippedSkin } from "./ui/skins/equipSkin.js";
import { initClick } from "./ui/click/clickCat.js";
import { initOfflineModal } from "./ui/offline/offlineModal.js";
import { startGameLoop } from "./core/gameLoop.js";
import { initSecretPuzzle } from "./ui/secrets/secretCats.js";
import { renderBallGenerator } from "./ui/generatorMod/ballGenerator.js";
import { renderBowlGenerator } from "./ui/generatorMod/bowlGenerator.js";
import { renderBedGenerator } from "./ui/generatorMod/bedGenerator.js";
import { initMobileMenu } from "./ui/mobileMenu.js";
import { initBubbleEvents } from "./events/bubbleEvents.js";
import { initContainerToy } from "./ui/container/containerToy.js";
import { initContainerBowl } from "./ui/container/containerBowl.js";
import { initContainerBed } from "./ui/container/containerBed.js";
import "./styles/index.css";
load();

if (import.meta.env.DEV) {
  window.debugGameState = state;
  window.debugSaveGame = save;
}

if (state.pendingReward) {
  claimReward();
}
const offlineGained = applyOfflineGains();
updateEnergy();

// #############################INTERFACE INTIALIZATION######################
initInstructions();
initClick(render);
initGenerators(() => {
  render();
  renderBallGenerator();
  renderBowlGenerator();
  renderBedGenerator();
});
initShop(render);
initSkinsModal();
initAchievementsList();
initAchievementsModal();
initCatAnimation();
initContainerToy();
initContainerBowl();
initContainerBed();
initAdModal(render);
initLootboxModal();
initLootboxFlow(render);
initEquipSkin(render);
applyEquippedSkin(render);
initOfflineModal(offlineGained);
initSecretPuzzle({ render, notifyAchievements });
render();
renderBallGenerator();
renderBowlGenerator();
renderBedGenerator();
initBubbleEvents(() => {
  render();
  renderBallGenerator();
  renderBowlGenerator();
  renderBedGenerator();
  notifyAchievements(render);
});
notifyAchievements();
initMobileMenu();
initDailyList();
initDailyModal(() => {
  render();
  notifyAchievements();
});
startGameLoop({ render, notifyAchievements });

// ############################Save Changes##################################
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    save();
  }
});

window.addEventListener("pagehide", save);
window.addEventListener("beforeunload", save);

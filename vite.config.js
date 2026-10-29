import { defineConfig } from "vite";

export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/scandiweb-cat-craft-loot/" : "/",
}));
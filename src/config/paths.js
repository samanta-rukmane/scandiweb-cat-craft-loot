export function assetUrl(path) {
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}

export function skinBackgroundSize(skin) {
  const { cols = 3, rows = 4 } = skin.frames ?? {};
  return `${cols * 100}% ${rows * 100}%`;
}

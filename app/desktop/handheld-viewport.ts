// Navigation, padding and a 44px composer need roughly 148px before output.
export const MIN_TYPING_VIEWPORT_HEIGHT = 160;

export function shouldRecoverHandheldKeyboard(viewport: { height: number; keyboard: boolean }, editing: boolean, landscape: boolean) {
  return viewport.keyboard && editing && landscape && viewport.height < MIN_TYPING_VIEWPORT_HEIGHT;
}

export function getHandheldViewport(metrics: {
  height: number;
  offsetTop: number;
  scale: number;
  layoutHeight: number;
  unfocusedHeight: number;
  editing: boolean;
  keyboardOpen: boolean;
}) {
  if (metrics.scale !== 1) return null;
  return {
    height: Math.max(1, metrics.height),
    top: Math.max(0, metrics.offsetTop),
    keyboard: (metrics.editing || metrics.keyboardOpen) && Math.max(metrics.layoutHeight, metrics.unfocusedHeight) - metrics.height > 120,
  };
}

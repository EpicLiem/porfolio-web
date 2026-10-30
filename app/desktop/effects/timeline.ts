import type { DesktopEffect } from "@/lib/terminal/shell";

export const durations: Record<DesktopEffect, number> = { relic: 12000, sandevistan: 4200, blackwall: 3600, nightcity: 3000, matrix: 3200 };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };

export function sampleEffect(name: DesktopEffect, elapsed: number) {
  const t = clamp(elapsed / durations[name]);
  const envelope = smooth(t / .08) * (1 - smooth((t - .7) / .3));
  const surge = Math.exp(-Math.pow((t - .16) / .09, 2));
  const echo = Math.exp(-Math.pow((t - .47) / .07, 2));
  const interference = (.35 + surge * .65 + echo * .45) * envelope;
  return { t, envelope, interference,
    split: name === "relic" ? interference * 3 : name === "sandevistan" ? envelope * (.5 + surge * 2) : name === "blackwall" ? interference * 2 : 0,
    displacement: name === "relic" ? interference * 12 : name === "blackwall" ? interference * 4 : 0,
    blur: name === "sandevistan" ? surge * envelope * .6 : name === "relic" ? interference * .2 : 0,
  };
}

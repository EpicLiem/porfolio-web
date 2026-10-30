"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import type { DesktopEffect as EffectName } from "@/lib/terminal/shell";
import { durations, sampleEffect } from "./timeline";
import { playEffectSound } from "./effect-sound";
import "./effects.css";

const labels: Record<EffectName, string> = { relic: "RELIC MALFUNCTION DETECTED", sandevistan: "SANDEVISTAN", blackwall: "BLACKWALL GATEWAY", nightcity: "NIGHT CITY", matrix: "SYSTEM FAILURE" };

export function DesktopEffect({ name, scene, onEnd }: { name: EffectName; scene: RefObject<HTMLDivElement | null>; onEnd: () => void }) {
  const id = useId().replaceAll(":", "");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<SVGFEOffsetElement>(null);
  const blueRef = useRef<SVGFEOffsetElement>(null);
  const warpRef = useRef<SVGFEDisplacementMapElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const lensRef = useRef<SVGFEDisplacementMapElement>(null);
  const lensMapRef = useRef<SVGFEImageElement>(null);
  const onEndRef = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    const target = scene.current, canvas = canvasRef.current, layer = layerRef.current;
    if (!target || !canvas || !layer) return;
    const ctx = canvas.getContext("2d");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = motion.matches;
    const duration = reduced ? 650 : durations[name];
    // The sound cues follow the full timelines; the 650 ms reduced-motion treatment stays silent.
    const stopSound = reduced ? () => {} : playEffectSound(name, duration);
    let raf = 0, width = 0, height = 0;
    const originalFilter = target.style.filter;
    const ghosts: HTMLElement[] = [];
    const animations: Animation[] = [];
    const resize = () => {
      width = target.clientWidth; height = target.clientHeight;
      // Keep the noise pass at CSS resolution; doubling it costs four times the fill rate.
      canvas.width = width; canvas.height = height;
    };
    resize();
    if (name === "relic" && !reduced) {
      for (let index = 0; index < 2; index++) {
        const ghost = target.cloneNode(true) as HTMLDivElement;
        ghost.className = `fx-relic-ghost ghost-${index}`;
        ghost.inert = true; ghost.setAttribute("aria-hidden", "true");
        ghost.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
        ghost.querySelectorAll("[hidden],script,iframe,video,audio").forEach(node => node.remove());
        layer.insertBefore(ghost, canvas); ghosts.push(ghost);
        const direction = index ? -1 : 1;
        animations.push(ghost.animate([
          { transform: "translate(0,0)", opacity: 0, offset: 0 },
          { transform: `translate(${direction * 10}px,3px)`, opacity: .22, offset: .16 },
          { transform: `translate(${direction * 4}px,1px)`, opacity: .1, offset: .38 },
          { transform: `translate(${direction * 7}px,2px)`, opacity: .16, offset: .5 },
          { transform: "translate(0,0)", opacity: 0, offset: 1 },
        ], { duration, easing: "ease-in-out", fill: "both" }));
      }
    }
    const meter = layer.querySelector<HTMLElement>(".fx-meter i");
    if (meter) animations.push(meter.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration, easing: "linear", fill: "both" }));
    if (name === "sandevistan" && !reduced) {
      const map = document.createElement("canvas"); map.width = map.height = 256;
      const painter = map.getContext("2d")!;
      const pixels = painter.createImageData(256, 256);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const nx = x / 255 * 2 - 1, ny = y / 255 * 2 - 1;
        const radius = Math.min(1, (nx * nx + ny * ny) / 2);
        const i = (y * 256 + x) * 4;
        pixels.data[i] = Math.round((.5 - nx * radius * .5) * 255);
        pixels.data[i + 1] = Math.round((.5 - ny * radius * .5) * 255);
        pixels.data[i + 2] = 128; pixels.data[i + 3] = 255;
      }
      painter.putImageData(pixels, 0, 0);
      lensMapRef.current?.setAttribute("href", map.toDataURL());
      lensRef.current?.setAttribute("scale", String(Math.min(width, height) * .18));
      const ghost = target.cloneNode(true) as HTMLDivElement;
      ghost.className = "fx-sandy-lens";
      ghost.inert = true; ghost.setAttribute("aria-hidden", "true");
      ghost.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
      ghost.querySelectorAll("[hidden],script,iframe,video,audio").forEach(node => node.remove());
      ghost.style.filter = `url("#${id}") saturate(.3)`;
      layer.insertBefore(ghost, canvas); ghosts.push(ghost);
      animations.push(ghost.animate([
        { opacity: 0, transform: "scale(1)", offset: 0 },
        { opacity: 1, transform: "scale(1.035)", offset: .16 },
        { opacity: .5, transform: "scale(1.012)", offset: .4 },
        { opacity: .4, transform: "scale(1.008)", offset: .7 },
        { opacity: 0, transform: "scale(1)", offset: 1 },
      ], { duration, easing: "ease-in-out", fill: "both" }));
      layer.style.setProperty("--intensity", "1");
      animations.push(layer.animate([
        { opacity: 0, offset: 0 }, { opacity: 1, offset: .08 },
        { opacity: 1, offset: .7 }, { opacity: 0, offset: 1 },
      ], { duration, easing: "ease-in-out", fill: "both" }));
      if (ctx) draw(ctx, name, width, height, 0, 1, .16);
    }
    if (name === "relic" && !reduced) {
      // Sample the jitter once and hand it to the compositor; per-frame style writes repainted the whole desktop.
      const frames: Keyframe[] = [];
      for (let step = 0; step <= 120; step++) {
        const elapsed = duration * step / 120, { interference } = sampleEffect(name, elapsed);
        frames.push({ transform: `translate(${Math.sin(elapsed / 190) * interference * 3}px,${Math.sin(elapsed / 270) * interference}px) scale(${1 + interference * .004})` });
      }
      animations.push(target.animate(frames, { duration, easing: "linear" }));
    }
    const observer = new ResizeObserver(resize); observer.observe(target);
    // Night City and Matrix leave every filter value at zero, so only Blackwall pays for the scene filter.
    if (!reduced && name === "blackwall") target.style.setProperty("filter", `url("#${id}")`);
    layer.dataset.reduced = String(motion.matches);
    const started = performance.now();
    const finish = () => onEndRef.current();
    motion.addEventListener("change", finish);
    const deadline = setTimeout(finish, duration + 100);

    function frame(now: number) {
      const elapsed = now - started;
      if (elapsed >= duration || motion.matches !== reduced) { finish(); return; }
      if (name === "sandevistan" && !reduced) { raf = requestAnimationFrame(frame); return; }
      const state = sampleEffect(name, elapsed);
      const envelope = motion.matches ? Math.sin(Math.PI * elapsed / duration) * .3 : state.envelope;
      layer!.style.setProperty("--intensity", String(envelope));
      if (!motion.matches) {
        if (name === "blackwall") {
          redRef.current?.setAttribute("dx", String(state.split));
          blueRef.current?.setAttribute("dx", String(-state.split));
          warpRef.current?.setAttribute("scale", String(state.displacement));
          blurRef.current?.setAttribute("stdDeviation", String(state.blur));
        }
        if (ctx) draw(ctx, name, width, height, elapsed, envelope, state.t);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(deadline); observer.disconnect(); stopSound();
      animations.forEach(animation => animation.cancel()); ghosts.forEach(ghost => ghost.remove());
      motion.removeEventListener("change", finish);
      target.style.setProperty("filter", originalFilter);
    };
  }, [name, scene, id]);

  return <div ref={layerRef} className={`desktop-fx fx-${name}`} data-effect-layer={name}>
    <svg className="fx-filters" aria-hidden="true"><defs>
      <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        {name === "sandevistan" ? <>
          <feImage ref={lensMapRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="lensMap" />
          <feDisplacementMap ref={lensRef} in="SourceGraphic" in2="lensMap" scale="0" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation=".4" />
        </> : <>
        <feTurbulence type="fractalNoise" baseFrequency=".0001 .035" numOctaves="1" seed="7" result="noise" />
        <feColorMatrix in="noise" values="1 0 0 0 0  0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 1" result="horizontalNoise" />
        <feDisplacementMap ref={warpRef} in="SourceGraphic" in2="horizontalNoise" scale="0" xChannelSelector="R" yChannelSelector="G" result="warped" />
        <feGaussianBlur ref={blurRef} in="warped" stdDeviation="0" result="soft" />
        <feColorMatrix in="soft" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feOffset ref={redRef} in="red" dx="0" result="redShift" />
        <feColorMatrix in="soft" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
        <feColorMatrix in="soft" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
        <feOffset ref={blueRef} in="blue" dx="0" result="blueShift" />
        <feBlend in="redShift" in2="green" mode="screen" result="rg" />
        <feBlend in="rg" in2="blueShift" mode="screen" />
        </>}
      </filter>
    </defs></svg>
    <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />
    <div className="fx-vignette" aria-hidden="true" />
    <div className="fx-hud" role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2Z" /><path d="M12 9v5m0 3v1" /></svg>
      <div><strong>{labels[name]}</strong>{name !== "relic" && <span className="fx-meter" aria-hidden="true"><i /></span>}</div>
    </div>
  </div>;
}

function noise(n: number) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function draw(ctx: CanvasRenderingContext2D, name: EffectName, w: number, h: number, ms: number, strength: number, progress: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = strength;
  if (name === "relic") {
    for (let i = 0; i < 46; i++) {
      const y = noise(i * 17) * h + Math.sin(ms / 480 + i) * 3;
      const x = noise(i * 7) * w + Math.sin(ms / 360 + i * 2) * 12;
      ctx.fillStyle = `rgba(115,180,190,${(.035 + Math.pow(Math.sin(ms / 400 + i), 2) * .055)})`;
      ctx.fillRect(x, y, 25 + noise(i + 4) * w * .35, i % 4 ? 1 : 3);
    }
    ctx.fillStyle = "#72b5be0b";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
  } else if (name === "blackwall") {
    const ignition = Math.exp(-Math.pow((progress - .2) / .1, 2));
    const decay = 1 - progress;
    ctx.font = "11px monospace";
    for (let column = 0; column < 26; column++) {
      const side = column % 2;
      const depth = Math.pow(noise(column + 12), 2) * w * .26;
      const x = side ? w - depth : depth;
      const drift = Math.sin(ms / 700 + column) * 2;
      const start = noise(column + 42) * h;
      const length = h * (.12 + noise(column + 2) * .58);
      const pulse = .35 + .65 * Math.pow(Math.sin(ms / 380 + column * 2), 2);
      const gradient = ctx.createLinearGradient(x, start - length / 2, x, start + length / 2);
      gradient.addColorStop(0, "#ff205500");
      gradient.addColorStop(.45, `rgba(250,35,76,${(.18 + ignition * .65) * pulse})`);
      gradient.addColorStop(.5, `rgba(255,160,170,${ignition * .85})`);
      gradient.addColorStop(1, "#ff205500");
      ctx.fillStyle = gradient;
      ctx.fillRect(x + drift, start - length / 2, 1 + noise(column) * 3, length);
      for (let segment = 0; segment < 18; segment++) {
        if (noise(column * 31 + segment) < .38) continue;
        const y = start - length / 2 + segment * length / 18;
        const blockWidth = 3 + noise(segment + column * 9) * 24;
        ctx.fillStyle = `rgba(197,20,54,${pulse * decay * .33})`;
        ctx.fillRect(x - blockWidth / 2, y, blockWidth, 2 + noise(segment + 5) * 15);
        if (segment % 5 === 0) {
          ctx.fillStyle = `rgba(245,70,91,${pulse * .48})`;
          ctx.fillText(Math.floor(noise(column * 19 + segment) * 0xffffff).toString(16).padStart(6, "0"), x + 7, y);
        }
      }
    }
    // Short horizontal dropouts cut across the columns; the center stays mostly clear.
    for (let i = 0; i < 9; i++) {
      const y = noise(i + 81) * h + Math.sin(ms / 430 + i) * 4;
      const left = i % 2 === 0, length = w * (.06 + noise(i + 4) * .2);
      ctx.fillStyle = `rgba(238,33,63,${(.1 + ignition * .25) * strength})`;
      ctx.fillRect(left ? 0 : w - length, y, length, 1);
      ctx.fillStyle = "#06070c55";
      ctx.fillRect(left ? 0 : w - length * .8, y + 2, length * .8, 5);
    }
  } else if (name === "sandevistan") {
    const radius = Math.hypot(w, h) * .5;
    for (let i = 0; i < 56; i++) {
      const a = i / 56 * Math.PI * 2;
      const inner = radius * (.67 + noise(i) * .15);
      ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * inner, h / 2 + Math.sin(a) * inner);
      ctx.lineTo(w / 2 + Math.cos(a) * radius, h / 2 + Math.sin(a) * radius);
      ctx.strokeStyle = i % 2 ? "#abd6ba35" : "#cdbde52b"; ctx.lineWidth = 1; ctx.stroke();
    }
  } else if (name === "matrix") {
    ctx.font = "16px monospace";
    const symbols = "0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘ";
    for (let column = 0; column < Math.ceil(w / 24); column++) {
      const head = (noise(column) * h + ms * (.13 + noise(column + 2) * .15)) % (h + 250);
      for (let row = 0; row < 14; row++) {
        ctx.fillStyle = row === 0 ? "#c9ffd9" : `rgba(48,210,91,${(1 - row / 14) * .65})`;
        ctx.fillText(symbols[Math.floor(noise(column * 23 + row + Math.floor(ms / 130)) * symbols.length)], column * 24, head - row * 20);
      }
    }
  } else {
    for (let i = 0; i < 150; i++) {
      const x = (noise(i) * w + ms * .04) % w, y = (noise(i + 200) * h + ms * (.55 + noise(i) * .3)) % h;
      ctx.strokeStyle = "#97c8d342"; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y - 24); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

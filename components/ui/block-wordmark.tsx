// Block Wordmark · snapcn — https://snapcn.dev/docs/logos/block-wordmark
"use client";

import { loadFont as loadUltra } from "@remotion/google-fonts/Ultra";
import { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  getRemotionEnvironment,
  interpolate,
  spring,
  useCurrentFrame,
  useCurrentScale,
  useVideoConfig,
} from "remotion";
import {
  mixOklch,
  resolveFont,
  type SnapCnTheme,
  useSnapCnTheme,
} from "@/components/ui/block-wordmark-utils/index";

// Ultra ships a single weight (400). It stays the fallback face; glass.com.ng passes its own
// display face through `fontFamily`.
const { fontFamily: ULTRA, waitUntilDone: ultraReady } = loadUltra("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The deck's full turn: an aggressive S-curve, fitted frame by frame to the reference. */
const SPIN_EASE = Easing.bezier(0.76, 0, 0.24, 1);
/** The scale-in, and every settle that follows it. */
const OUT_EASE = Easing.out(Easing.cubic);
/** The deck dropping back onto the baseline. */
const IN_EASE = Easing.in(Easing.cubic);

/** An ascender's tab, measured off the glyph. All values in probe px. */
interface Tab {
  height: number;
  x: number;
  width: number;
}

interface Glyph {
  ch: string;
  blank: boolean;
  advance: number;
  tab: Tab | null;
}

interface Metrics {
  glyphs: Glyph[];
  /** The x-height, which is the block's side. */
  xHeight: number;
  baselineOffset: number;
}

/** Ink metrics off a canvas: the only way to tell an ascender from an x-height glyph. */
function measureInk(
  glyphs: string[],
  fontFamily: string,
  fontWeight: number | string,
  fontSize: number,
): { xHeight: number; tabs: Map<string, Tab> } | null {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(fontSize * 3);
  canvas.height = Math.ceil(fontSize * 3);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "alphabetic";

  const xHeight = ctx.measureText("x").actualBoundingBoxAscent;
  const capHeight = ctx.measureText("H").actualBoundingBoxAscent;
  if (!(xHeight > 0) || !(capHeight > xHeight)) return null;

  const cut = (capHeight - xHeight) * 0.15;
  const origin = fontSize * 0.5;
  const baseline = Math.round(fontSize * 2);
  const tabs = new Map<string, Tab>();

  for (const ch of glyphs) {
    const m = ctx.measureText(ch);
    const height = m.actualBoundingBoxAscent - xHeight;
    if (!(height > cut)) continue;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillText(ch, origin, baseline);
    const top = Math.max(0, Math.floor(baseline - m.actualBoundingBoxAscent));
    const bottom = Math.min(canvas.height, top + Math.max(1, height * 0.6));
    const data = ctx.getImageData(0, top, canvas.width, Math.ceil(bottom - top)).data;
    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] <= 8) continue;
      const x = (i >> 2) % canvas.width;
      if (x < lo) lo = x;
      if (x > hi) hi = x;
    }
    if (lo === Number.POSITIVE_INFINITY) continue;
    const inkLeft = origin - m.actualBoundingBoxLeft;
    const inkWidth = m.actualBoundingBoxRight + m.actualBoundingBoxLeft;
    if (!(inkWidth > 0)) continue;
    tabs.set(ch, {
      height,
      x: Math.max(0, (lo - inkLeft) / inkWidth),
      width: Math.min(1, (hi - lo + 1) / inkWidth),
    });
  }

  return { xHeight, tabs };
}

export interface BlockWordmarkProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  colors?: string[] | string;
  background?: string;
  blockGap?: number;
  cornerRadius?: number;
  ascenderRatio?: number;
  ascenderStemRatio?: number;
  blockSizing?: "square" | "glyph";
  maxWidth?: number;
  cards?: number;
  cardStagger?: number;
  spinTurns?: number;
  liftRatio?: number;
  growDuration?: number;
  spinDuration?: number;
  splitDuration?: number;
  splitStagger?: number;
  ascenderDuration?: number;
  holdDuration?: number;
  flashStagger?: number;
  flashDuration?: number;
  flashToSwap?: number;
  speed?: number;
  className?: string;
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
}

/** One hue, five shades: `primary` walked toward pure white or black in OKLCH. */
function defaultColors(t: SnapCnTheme): string[] {
  return [
    t.primary,
    mixOklch(t.primary, "#000000", 0.3),
    mixOklch(t.primary, "#ffffff", 0.28),
    mixOklch(t.primary, "#000000", 0.55),
    mixOklch(t.primary, "#ffffff", 0.52),
  ];
}

/**
 * A wordmark that builds itself out of blocks: a square scales up, a deck of coloured squares
 * fans out and winds back, the square splits into one block per letter, and each block flashes
 * and is hard-cut to its real letterform.
 */
export function BlockWordmark({
  text = "base",
  fontSize = 160,
  fontFamily,
  fontWeight = 400,
  color,
  colors,
  background,
  blockGap = 0.093,
  cornerRadius = 0.18,
  ascenderRatio,
  ascenderStemRatio,
  blockSizing = "square",
  maxWidth = 0.92,
  cards = 6,
  cardStagger = 2,
  spinTurns = 1,
  liftRatio = 0.665,
  growDuration = 9,
  spinDuration = 33,
  splitDuration = 5,
  splitStagger = 1,
  ascenderDuration = 12,
  holdDuration = 54,
  flashStagger = 4,
  flashDuration = 3,
  flashToSwap = 5,
  speed = 1,
  className,
  theme,
  mode,
}: BlockWordmarkProps) {
  const frame = useCurrentFrame() * speed;
  const { width, height, fps } = useVideoConfig();
  const t = useSnapCnTheme(theme, mode);
  const face = resolveFont(fontFamily ?? t.fontFamily) ?? ULTRA;
  const ink = color ?? t.foreground;
  const stage = background ?? t.background;
  const palette =
    (typeof colors === "string"
      ? colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : colors) ?? defaultColors(t);
  const deck = palette.length > 0 ? palette : defaultColors(t);

  const chars = Array.from(text);

  const probeRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rulerRef = useRef<HTMLSpanElement>(null);
  const [handle] = useState(() => delayRender("block-wordmark: measure glyphs"));
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  // A <Player> scales the whole composition, so rects come back in device px; divide them back.
  const scale = useCurrentScale({ dontThrowIfOutsideOfRemotion: true });

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const box = probeRef.current;
      const ruler = rulerRef.current;
      if (!box || !ruler) {
        continueRender(handle);
        return;
      }
      const glyphChars = Array.from(text);
      const s = scale || 1;
      const boxTop = box.getBoundingClientRect().top / s;
      const advances = glyphChars.map((_, i) => (charRefs.current[i]?.getBoundingClientRect().width ?? 0) / s);
      const baselineOffset = ruler.getBoundingClientRect().top / s - boxTop;
      const unique = Array.from(new Set(glyphChars.filter((c) => c.trim() !== "")));
      const measured = measureInk(unique, face, fontWeight, fontSize);
      setMetrics({
        xHeight: measured?.xHeight ?? fontSize * 0.52,
        baselineOffset: baselineOffset || fontSize * 0.86,
        glyphs: glyphChars.map((ch, i) => ({
          ch,
          blank: ch.trim() === "",
          advance: advances[i],
          tab: measured?.tabs.get(ch) ?? null,
        })),
      });
    };
    // Measure only once the real face is resident, never off a fallback.
    Promise.all([
      face === ULTRA ? ultraReady() : null,
      typeof document !== "undefined" && document.fonts
        ? document.fonts.load(`${fontWeight} ${fontSize}px ${face}`).then(() => document.fonts.ready)
        : null,
    ]).then(run, run);
    return () => {
      cancelled = true;
    };
  }, [handle, text, face, fontWeight, fontSize, scale]);

  useEffect(() => {
    if (metrics) continueRender(handle);
  }, [metrics, handle]);

  // ─── Layout ───
  const glyphs =
    metrics?.glyphs ??
    chars.map((ch) => ({
      ch,
      blank: ch.trim() === "",
      advance: fontSize * 0.55,
      tab: null as Tab | null,
    }));
  const xHeight = metrics?.xHeight ?? fontSize * 0.52;
  const baselineOffset = metrics?.baselineOffset ?? fontSize * 0.86;

  const letterEnds: number[] = [];
  let letterRun = 0;
  for (const g of glyphs) {
    letterEnds.push(letterRun);
    letterRun += g.advance;
  }
  const letterTotal = letterRun;

  const gapPx = blockGap * xHeight;
  const blockGlyph: number[] = [];
  const blockStarts: number[] = [];
  const blockWidths: number[] = [];
  const blockOf: number[] = [];
  let blockRun = 0;
  let prevWasBlock = false;
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    if (g.blank) {
      blockRun += g.advance;
      prevWasBlock = false;
      blockOf.push(-1);
      continue;
    }
    if (prevWasBlock) blockRun += gapPx;
    blockOf.push(blockGlyph.length);
    blockGlyph.push(i);
    blockStarts.push(blockRun);
    blockWidths.push(blockSizing === "glyph" ? g.advance : xHeight);
    blockRun += blockWidths[blockWidths.length - 1];
    prevWasBlock = true;
  }
  const blockTotal = blockRun;

  const fit = Math.min(1, (width * maxWidth) / Math.max(1, letterTotal, blockTotal));
  const side = xHeight * fit;
  const radius = cornerRadius * side;
  const cx = width / 2;
  const tabHeightOf = (g: Glyph) =>
    g.tab === null ? 0 : ascenderRatio === undefined ? g.tab.height * fit : ascenderRatio * side;
  const rowTop = side + Math.max(0, ...blockGlyph.map((i) => tabHeightOf(glyphs[i])));
  const baselineY = height / 2 + rowTop / 2;
  const letterLeft = (width - letterTotal * fit) / 2;
  const blockLeft = (width - blockTotal * fit) / 2;

  // ─── Beats ───
  const nCards = Math.max(1, Math.round(cards));
  const collapseAt = Math.round(spinDuration + (cardStagger * (nCards - 1)) / 2);
  const splitStart = collapseAt + 2;
  const ascenderStart = splitStart + 2;
  const resolveStart = splitStart + holdDuration;

  const grow = interpolate(frame, [0, Math.max(1, growDuration)], [0, 1], {
    ...CLAMP,
    easing: OUT_EASE,
  });

  const turn = (card: number) => {
    const start = card * cardStagger;
    const span = Math.max(1, Math.min(spinDuration, collapseAt - start));
    return interpolate(frame - start, [0, span], [0, 360 * spinTurns], {
      ...CLAMP,
      easing: SPIN_EASE,
    });
  };

  const lift =
    liftRatio *
    side *
    (spring({
      frame: Math.max(0, frame - 2),
      fps,
      config: { damping: 60, stiffness: 330, mass: 1 },
    }) -
      interpolate(frame, [collapseAt - 9, collapseAt], [0, 1], {
        ...CLAMP,
        easing: IN_EASE,
      }));

  const dip = interpolate(frame, [collapseAt, collapseAt + 1, collapseAt + 3], [0, 1, 0], CLAMP);

  const splitRank = (b: number) => {
    const mid = (blockWidths.length - 1) / 2;
    return Math.round(mid - Math.abs(b - mid));
  };
  const splitProgress = (b: number) =>
    interpolate(frame - splitStart - splitRank(b) * splitStagger, [0, Math.max(1, splitDuration)], [0, 1], {
      ...CLAMP,
      easing: OUT_EASE,
    });

  const tabGrow = interpolate(frame, [ascenderStart, ascenderStart + Math.max(1, ascenderDuration)], [0, 1], {
    ...CLAMP,
    easing: OUT_EASE,
  });

  // Letters resolve left to right from the second one, wrapping to the first letter last.
  const order: number[] = [];
  for (let b = 1; b < blockWidths.length; b++) order.push(b);
  if (blockWidths.length > 0) order.push(0);
  const cue = new Map<number, number>();
  order.forEach((b, k) => {
    cue.set(b, k === 0 ? 0 : flashStagger * k - flashStagger / 2);
  });
  const flashOf = new Map<number, string>();
  order.forEach((b, k) => {
    flashOf.set(b, deck[k % deck.length]);
  });

  const ready = metrics !== null;
  const isRendering = getRemotionEnvironment().isRendering;
  const accel = isRendering ? null : { willChange: "transform" as const };
  const squareLeft = cx - side / 2;

  return (
    <AbsoluteFill
      className={className}
      style={{
        backgroundColor: stage,
        overflow: "hidden",
        fontFamily: face,
        fontWeight,
        textRendering: "geometricPrecision",
      }}
    >
      <div
        ref={probeRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
          whiteSpace: "pre",
          lineHeight: 1,
          fontSize,
        }}
      >
        {chars.map((ch, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: glyphs are positional and never reorder
            key={i}
            ref={(el) => {
              charRefs.current[i] = el;
            }}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {ch}
          </span>
        ))}
        <span ref={rulerRef} style={{ display: "inline-block", width: 0, height: 0 }} />
      </div>

      <AbsoluteFill
        style={{
          opacity: ready ? 1 : 0,
          transformOrigin: `50% ${baselineY}px`,
          transform: `translateY(${-lift - dip * side * 0.03}px) scaleY(${1 - dip * 0.013})`,
        }}
      >
        {frame < collapseAt + 1 &&
          Array.from({ length: nCards - 1 }, (_, i) => nCards - 1 - i).map((k) => (
            <div
              key={`card-${k}`}
              style={{
                position: "absolute",
                left: squareLeft,
                top: baselineY - side,
                width: side,
                height: side,
                borderRadius: radius,
                backgroundColor: deck[(k - 1) % deck.length],
                transformOrigin: "50% 100%",
                transform: `rotate(${turn(k)}deg) scale(${grow})`,
                ...accel,
              }}
            />
          ))}

        {blockWidths.map((w, b) => {
          const p = splitProgress(b);
          const g = glyphs[blockGlyph[b]];
          const swapAt = resolveStart + (cue.get(b) ?? 0) + flashToSwap;
          if (frame >= swapAt) return null;
          const flashOn = resolveStart + (cue.get(b) ?? 0);
          const lit = frame >= flashOn && frame < flashOn + flashDuration;
          const fill = lit ? (flashOf.get(b) ?? ink) : ink;
          const left = squareLeft + (blockLeft + blockStarts[b] * fit - squareLeft) * p;
          const bw = side + (w * fit - side) * p;
          const tab = g?.tab ?? null;
          const tabH = tab ? tabGrow * tabHeightOf(g) : 0;
          const tabW = tab ? bw * (ascenderStemRatio ?? tab.width) : 0;
          const tabX = tab ? Math.min(Math.max(0, tab.x * bw), Math.max(0, bw - tabW)) : 0;
          const notched = tabH > radius;
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a fixed positional row
              key={`block-${b}`}
              style={{
                position: "absolute",
                left,
                top: baselineY - side,
                width: bw,
                height: side,
                borderRadius: radius,
                borderTopLeftRadius: notched && tabX < 1 ? 0 : radius,
                borderTopRightRadius: notched && tabX + tabW > bw - 1 ? 0 : radius,
                backgroundColor: fill,
                transformOrigin: "50% 100%",
                transform: `rotate(${turn(0)}deg) scale(${grow})`,
                ...accel,
              }}
            >
              {tabH > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: tabX,
                    width: tabW,
                    height: tabH,
                    backgroundColor: fill,
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: radius,
                  }}
                />
              )}
            </div>
          );
        })}

        {glyphs.map((g, i) => {
          const b = blockOf[i];
          if (b < 0) return null;
          const swapAt = resolveStart + (cue.get(b) ?? 0) + flashToSwap;
          if (frame < swapAt) return null;
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: glyphs are positional and never reorder
              key={`letter-${i}`}
              style={{
                position: "absolute",
                left: letterLeft + letterEnds[i] * fit,
                top: baselineY - baselineOffset * fit,
                fontSize: fontSize * fit,
                lineHeight: 1,
                whiteSpace: "pre",
                color: ink,
              }}
            >
              {g.ch}
            </span>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export default BlockWordmark;

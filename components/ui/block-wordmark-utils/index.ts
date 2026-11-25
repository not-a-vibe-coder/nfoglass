"use client";

// Small support module for block-wordmark.tsx. The snapcn original ships a theme hook and an
// OKLCH mixer; this is the same contract, sized to what the wordmark actually calls.

export interface SnapCnTheme {
  primary: string;
  foreground: string;
  background: string;
  fontFamily?: string;
}

/** glass.com.ng: teal ink deck on paper. */
const LIGHT: SnapCnTheme = { primary: "#087263", foreground: "#0e1716", background: "#f6f5f0" };
const DARK: SnapCnTheme = { primary: "#20ccaa", foreground: "#eef5f2", background: "#0a1412" };

export function useSnapCnTheme(theme?: Partial<SnapCnTheme>, mode?: "light" | "dark"): SnapCnTheme {
  return { ...(mode === "dark" ? DARK : LIGHT), ...theme };
}

/** Mix two colours in OKLCH; `t` is the share of `b`. The browser does the maths. */
export function mixOklch(a: string, b: string, t: number): string {
  const pct = Math.round(Math.min(1, Math.max(0, t)) * 1000) / 10;
  return `color-mix(in oklch, ${a}, ${b} ${pct}%)`;
}

/**
 * Turns a font setting into a family string the canvas can use. A `var(--x)` is resolved against
 * the document root, so a next/font variable works; anything else passes through.
 */
export function resolveFont(font?: string): string | undefined {
  if (!font) return undefined;
  const m = font.trim().match(/^var\((--[\w-]+)\)$/);
  if (!m) return font;
  if (typeof document === "undefined") return undefined;
  const v = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
  return v || undefined;
}

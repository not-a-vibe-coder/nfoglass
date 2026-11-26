"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { resolveFont } from "@/components/ui/block-wordmark-utils";

// The block wordmark spells "glass" over the page on every load and every page change, then lifts
// away. It is 130 frames at 30fps, and the last letter (the "g") resolves at frame 113.

type PlayerProps = { onStart: () => void; onEnd: () => void };

// Start fetching the animation chunk as soon as this module runs in the browser, in parallel with
// hydration, rather than after the overlay mounts.
let chunk: Promise<ComponentType<PlayerProps>> | null = null;
function loadPlayer() {
  chunk ??= import("./loader-player").then((m) => m.default);
  return chunk;
}
if (typeof window !== "undefined") void loadPlayer();

/** How long the finished wordmark sits on screen before the overlay lifts. */
const HOLD_MS = 450;
/** Playback length plus slack, counted from when playback actually starts. */
const PLAY_MS = (130 / 30) * 1000 + 1500;
/** If the animation can't start at all (no network, a blocked script), uncover the page. */
const GIVE_UP_MS = 12000;

// Keyed by the path, so each navigation mounts a fresh overlay and plays it again.
export function Loader() {
  const path = usePathname();
  return <LoaderScreen key={path} />;
}

function LoaderScreen() {
  const [state, setState] = useState<"pending" | "show" | "leaving" | "done">("pending");
  const [Stage, setStage] = useState<ComponentType<PlayerProps> | null>(null);
  const timers = useRef<number[]>([]);
  const finishing = useRef(false);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  function finish() {
    if (finishing.current) return;
    finishing.current = true;
    later(() => setState("leaving"), HOLD_MS);
    later(() => {
      setState("done");
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new Event("glass:loaded"));
    }, HOLD_MS + 700);
  }

  // Wait for the display face and the animation chunk, then mount the player. The wordmark is
  // invisible until it can measure its letters, so mounting earlier would waste the opening.
  useEffect(() => {
    let cancelled = false;
    const list = timers.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      list.push(
        window.setTimeout(() => {
          setState("done");
          window.dispatchEvent(new Event("glass:loaded"));
        }, 0),
      );
      return () => list.forEach((t) => window.clearTimeout(t));
    }
    document.documentElement.style.overflow = "hidden";
    const face = resolveFont("var(--font-display-face)");
    const fonts = face
      ? document.fonts.load(`700 220px ${face}`).then(() => document.fonts.ready).catch(() => undefined)
      : Promise.resolve();
    Promise.all([loadPlayer(), fonts]).then(
      ([C]) => {
        if (cancelled) return;
        setStage(() => C);
        setState("show");
      },
      () => !cancelled && finish(),
    );
    list.push(window.setTimeout(() => !cancelled && finish(), GIVE_UP_MS));
    return () => {
      cancelled = true;
      list.forEach((t) => window.clearTimeout(t));
      document.documentElement.style.overflow = "";
    };
    // finish only touches refs and setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onStart() {
    // The real clock: from the first played frame, not from mount, so a slow load never cuts the
    // animation short. The give-up timer is replaced by one sized to the playback.
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    later(finish, PLAY_MS);
  }

  if (state === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] bg-paper transition-[opacity,clip-path] duration-700 ease-[cubic-bezier(.7,0,.3,1)] ${
        state === "leaving" ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(0_0_0_0)]"
      }`}
    >
      {state !== "pending" && Stage && <Stage onStart={onStart} onEnd={finish} />}
      <div className="pointer-events-none absolute inset-x-0 top-[14%] flex justify-center">
        <Image src="/logo-512.png" alt="" width={120} height={120} priority className="animate-[logo-in_900ms_cubic-bezier(.2,.9,.25,1)_both]" />
      </div>
      <style>{`@keyframes logo-in{from{opacity:0;transform:translateY(-18px) rotate(-8deg) scale(.85)}to{opacity:1;transform:none}}`}</style>
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <span className="label-bar px-3 py-1 text-xs">Nigeria’s first online glass company</span>
      </div>
    </div>
  );
}

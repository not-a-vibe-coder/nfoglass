"use client";

import { Player } from "@remotion/player";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BlockWordmark from "@/components/ui/block-wordmark";
import { resolveFont } from "@/components/ui/block-wordmark-utils";

// The block wordmark spells "glass" over the page on every load and every page change, then lifts
// away. The build resolves around frame 115 at 30fps, so the overlay holds about 4.3s.
const DURATION = 130;

// Keyed by the path, so each navigation mounts a fresh overlay and plays it again.
export function Loader() {
  const path = usePathname();
  return <LoaderScreen key={path} />;
}

function LoaderScreen() {
  const [state, setState] = useState<"pending" | "show" | "leaving" | "done">("pending");

  useEffect(() => {
    // Deferred a tick: session storage only exists in the browser, and the first paint has to
    // match the server's, which always renders the overlay.
    // Start only once the display face is resident, capped so a slow font can't hold the page.
    let cancelled = false;
    const face = resolveFont("var(--font-display-face)");
    const fonts = face ? document.fonts.load(`700 220px ${face}`).then(() => document.fonts.ready) : Promise.resolve();
    const cap = new Promise((r) => window.setTimeout(r, 2500));
    let begin = 0;
    Promise.race([fonts, cap]).finally(() => {
      if (!cancelled) begin = window.setTimeout(start, 0);
    });
    let leave = 0;
    let done = 0;
    function start() {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setState("done");
        window.dispatchEvent(new Event("glass:loaded"));
        return;
      }
      setState("show");
      document.documentElement.style.overflow = "hidden";
      leave = window.setTimeout(() => setState("leaving"), (DURATION / 30) * 1000);
      done = window.setTimeout(() => {
        setState("done");
        document.documentElement.style.overflow = "";
        window.dispatchEvent(new Event("glass:loaded"));
      }, (DURATION / 30) * 1000 + 700);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(begin);
      window.clearTimeout(leave);
      window.clearTimeout(done);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (state === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] bg-paper transition-[opacity,clip-path] duration-700 ease-[cubic-bezier(.7,0,.3,1)] ${
        state === "leaving" ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(0_0_0_0)]"
      }`}
    >
      {state !== "pending" && (
        <Player
          component={BlockWordmark}
          durationInFrames={DURATION}
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          style={{ width: "100%", height: "100%" }}
          inputProps={{
            text: "glass",
            fontFamily: "var(--font-display-face)",
            fontWeight: 700,
            fontSize: 220,
          }}
          autoPlay
          controls={false}
        />
      )}
      {state !== "pending" && (
        <div className="pointer-events-none absolute inset-x-0 top-[14%] flex justify-center">
          <Image src="/logo-512.png" alt="" width={120} height={120} priority className="animate-[logo-in_900ms_cubic-bezier(.2,.9,.25,1)_both]" />
        </div>
      )}
      <style>{`@keyframes logo-in{from{opacity:0;transform:translateY(-18px) rotate(-8deg) scale(.85)}to{opacity:1;transform:none}}`}</style>
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <span className="label-bar px-3 py-1 text-xs">Nigeria’s first online glass company</span>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BlockWordmark from "@/components/ui/block-wordmark";

// The heavy half of the loader: the wordmark and its clock. It lives in its own chunk so the page
// hydrates without waiting on it, and the loader fetches it the moment its own module loads.
//
// No Remotion <Player>: a plain requestAnimationFrame clock drives the frames, and it only starts
// once the wordmark has measured its letters, so the spinning boxes always play from frame 0 in
// view. The 1280×720 stage is scaled to fit the screen, as the player used to.

const W = 1280;
const H = 720;
const FPS = 30;
export const DURATION = 130;

export default function LoaderPlayer({ onStart, onEnd }: { onStart: () => void; onEnd: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [frame, setFrame] = useState(0);
  const started = useRef(false);
  const cb = useRef({ onStart, onEnd });
  useEffect(() => {
    cb.current = { onStart, onEnd };
  }, [onStart, onEnd]);

  // Fit the stage to the overlay, letterboxed like the player did.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onReady = useCallback(() => {
    if (started.current) return;
    started.current = true;
    cb.current.onStart();
    const t0 = performance.now();
    const tick = (now: number) => {
      const f = ((now - t0) / 1000) * FPS;
      if (f >= DURATION - 1) {
        setFrame(DURATION - 1);
        cb.current.onEnd();
        return;
      }
      setFrame(f);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      {scale > 0 && (
        <div
          className="absolute top-1/2 left-1/2"
          style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <BlockWordmark
            text="glass"
            fontFamily="var(--font-display-face)"
            fontWeight={700}
            fontSize={220}
            frame={frame}
            width={W}
            height={H}
            fps={FPS}
            scale={scale}
            onReady={onReady}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { GlassPrismHero, type GlassPrismHeroHandle } from "@/components/ui/glass-prism-hero";
import { GlassButton } from "@/components/ui/glass-button";
import { ActionButton } from "@/components/ui/button-4";
import { CONTACT } from "@/lib/site";

// The main hero: the prism splits the light over the headline. The corner labels and the black
// bar come from the A24 die-cut poster: small grotesque type on ink tabs.
export function HomeHero({ fontFamily }: { fontFamily: string }) {
  const hero = useRef<GlassPrismHeroHandle>(null);

  // Replay the light once the loader has lifted, so the intro is not spent behind it
  useEffect(() => {
    const replay = () => hero.current?.replay();
    window.addEventListener("glass:loaded", replay);
    return () => window.removeEventListener("glass:loaded", replay);
  }, []);

  return (
    <div className="theme-ink">
      <GlassPrismHero
        ref={hero}
        headline="Clear glass. Cut to measure."
        fontFamily={fontFamily}
        fontWeight={700}
        accent="#20ccaa"
        eyebrow="Nigeria’s first online glass company"
        description="Toughened, laminated, mirrored and made to your exact size. Order online, and we cut, polish and deliver it from Lagos Island."
        scrollHint={{ rotate: "Scroll to turn the glass", back: "Scroll up" }}
        actions={
          <>
            <ActionButton href="/order-online" tone="solid">
              Get an instant quote <ArrowRight />
            </ActionButton>
            <GlassButton href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp us
            </GlassButton>
          </>
        }
        overlay={
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden text-[11px] font-semibold tracking-[0.04em] md:block">
            <div className="absolute top-28 left-8 leading-tight text-white/55">
              A glass company by
              <br />
              <span className="text-white/85">NFO Glass, Lagos Island</span>
            </div>
            <div className="absolute top-28 right-8 text-right leading-tight text-white/55">
              Since 2016
              <br />
              <span className="text-white/85">Delivered across Nigeria</span>
            </div>
            <div className="label-bar absolute bottom-8 left-8 bg-white px-2.5 py-1 text-[12px] text-ink">
              Toughened · Laminated · Mirror · Fire · Security
            </div>
          </div>
        }
      />
    </div>
  );
}

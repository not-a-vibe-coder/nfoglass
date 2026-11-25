import type { Metadata } from "next";
import { CircleDot, FileCode2, Palette, Scissors, Shapes, Sparkles } from "lucide-react";
import { CtaBand, PageHeader, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { GlassButton } from "@/components/ui/glass-button";
import { img } from "@/lib/site";

export const metadata: Metadata = { title: "Custom orders", description: "Custom shapes, tints, edge polishing, bevelling, hole drilling and CNC cutting from your CAD files." };

// The old Custom Orders and Custom Shapes pages were empty; this is written from the home page's
// "Custom glass" promise and the capabilities the FAQ describes.
const CAPS = [
  { icon: Shapes, title: "Custom shapes", text: "Circles, ovals, arches, radius corners and freeform templates. If it isn’t a square or rectangle, send a pattern or a drawing." },
  { icon: FileCode2, title: "From your CAD file", text: "Email a .dxf or .dwg and our CNC machines cut the shape exactly as drawn." },
  { icon: Sparkles, title: "Edge polishing & bevelling", text: "Flat polish, pencil, ogee and bevels from 3 to 45 degrees, on one or both sides." },
  { icon: CircleDot, title: "Hole drilling & notches", text: "Holes for fittings and handles, notches and cut-outs for sockets and pipes." },
  { icon: Palette, title: "Tints & colours", text: "Grey, bronze, green, blue and reflective tints, or back-painted in any colour for splashbacks." },
  { icon: Scissors, title: "Sandblasting", text: "Frosted privacy finishes and stencilled designs, cut from your artwork." },
];

export default function CustomPage() {
  return (
    <>
      <PageHeader label="Custom glass" title="If you can draw it, we can cut it." image={img("spiral")}>
        <ActionButton href="/order-online" tone="solid">
          Start a custom quote
        </ActionButton>
        <GlassButton href="/contact-us">Send a drawing</GlassButton>
      </PageHeader>
      <Section className="mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPS.map((c) => (
            <div key={c.title} className="rounded-[24px] border border-ink/10 bg-white p-7">
              <c.icon className="size-7 text-teal-700" />
              <h2 className="mt-5 font-display text-[26px] leading-none font-bold tracking-[-0.03em]">{c.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand>
        <p className="font-display text-[clamp(32px,4vw,56px)] leading-none font-bold tracking-[-0.04em]">Minimum piece: 35 × 35 mm.</p>
        <p className="mt-3 max-w-xl text-white/70">Maximum depends on the glass. Ask us about oversized panes for shopfronts and facades.</p>
        <ActionButton href="/order-online" className="mt-8">
          Get a price
        </ActionButton>
      </CtaBand>
    </>
  );
}

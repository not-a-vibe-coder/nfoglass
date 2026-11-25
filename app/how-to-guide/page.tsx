import type { Metadata } from "next";
import { CtaBand, PageHeader, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { faq } from "@/lib/site";

export const metadata: Metadata = { title: "How-to guide", description: "How to measure for glass, choose a thickness and pick an edge finish." };

const STEPS = [
  { t: "Measure the opening twice", x: "Measure width and height in millimetres at three points each and use the smallest. For framed glass, measure inside the frame and take off 3 mm on each side for clearance." },
  { t: "Choose the glass", x: "Toughened for doors, showers, tables and anything people can walk into. Laminated where the glass must stay in place if it breaks: overhead, balustrades and security. Mirror for mirrors." },
  { t: "Pick a thickness", x: "As a rule of thumb: 4–6 mm for pictures, cabinets and small shelves, 8–10 mm for shower screens and table tops, 12–15 mm for balustrades, floors and large frameless doors." },
  { t: "Decide the edges", x: "Cut edges are sharp and only suit glass hidden in a frame. Exposed edges should be polished, pencil-rounded or bevelled." },
  { t: "Mark holes and cut-outs", x: "Measure each hole from two edges to its centre, and note the diameter. Toughened glass cannot be cut or drilled after toughening, so everything must be on the order." },
];

const KEYS = ["radius", "thickness should i use", "mirrors, how do i determine", "edge finishes", "diameter hole", "measuring service"];

export default function HowToPage() {
  const extra = KEYS.map((k) => faq.find((f) => f.q.toLowerCase().includes(k))).filter(Boolean) as typeof faq;
  return (
    <>
      <PageHeader label="How-to guide" title="Measure once, order right." intro="Glass can’t be trimmed after it’s toughened, so the order has to be right. Here is how to get it right." />
      <Section className="mt-12">
        <ol className="space-y-4">
          {STEPS.map((s, i) => (
            <li key={s.t} className="grid gap-4 rounded-[24px] border border-ink/10 bg-white p-7 sm:grid-cols-[80px_1fr]">
              <span className="font-display text-[48px] leading-none font-bold text-teal-600">0{i + 1}</span>
              <div>
                <h2 className="font-display text-[26px] font-bold tracking-[-0.03em]">{s.t}</h2>
                <p className="mt-2 max-w-3xl text-[16px] leading-relaxed text-muted-foreground">{s.x}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      {extra.length > 0 && (
        <Section className="mt-16">
          <h2 className="font-display text-[36px] font-bold tracking-[-0.04em]">From our FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {extra.map((f) => (
              <div key={f.q} className="rounded-[22px] border border-ink/10 bg-white p-6">
                <h3 className="font-display text-[20px] font-bold tracking-[-0.02em]">{f.q}</h3>
                <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      <CtaBand>
        <p className="font-display text-[clamp(32px,4vw,56px)] leading-none font-bold tracking-[-0.04em]">Rather we measured?</p>
        <p className="mt-3 max-w-xl text-white/70">We offer a measuring and templating service across Lagos.</p>
        <ActionButton href="/contact-us" className="mt-8">
          Book a site visit
        </ActionButton>
      </CtaBand>
    </>
  );
}

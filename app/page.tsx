import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, PackageCheck, Ruler, Scissors, ShieldCheck, Truck } from "lucide-react";
import { display } from "@/lib/fonts";
import { HomeHero } from "@/components/site/home-hero";
import { CubeNet } from "@/components/site/cube-net";
import { Location } from "@/components/site/location";
import { Card, CtaBand, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { GlassButton } from "@/components/ui/glass-button";
import { CONTACT, img, lead, products, testimonials } from "@/lib/site";

const MARQUEE = ["Toughened", "Laminated", "Mirror", "Low-iron", "Fire rated", "Bullet resistant", "Sandblasted", "Back-painted", "Insulated", "Crackle"];

const SERVICES = [
  {
    icon: Layers,
    title: "Types of glass",
    text: "Tempered, ceramic, mirror, privacy, laminated and annealed, in 4 to 15 mm.",
    href: "/types-of-glass",
  },
  {
    icon: Scissors,
    title: "Custom glass",
    text: "Custom shapes, tints, edge polishing and bevelling, hole drilling and notches.",
    href: "/custom-orders",
  },
  {
    icon: PackageCheck,
    title: "Safe shipping",
    text: "Packed, crated and insured to arrive safely, or delivered and fitted by our own crew.",
    href: "/shipping-policy",
  },
];

const STEPS = [
  { icon: Ruler, title: "Measure", text: "Width, height, thickness, edge and holes. Our how-to guide or a site visit covers the tricky bits." },
  { icon: ShieldCheck, title: "Quote", text: "Build it online and get a price back on WhatsApp or email, free and without obligation." },
  { icon: Scissors, title: "Cut & finish", text: "We cut on CNC, polish, bevel, drill and toughen to your specification." },
  { icon: Truck, title: "Deliver & fit", text: "Collected from Lagos Island, delivered across Nigeria, or fitted by our team." },
];

export default function Home() {
  const featured = ["glass-balustrades", "shower-doors", "painted-toughened-glass-splashbacks", "glass-staircases", "custom-mirrors", "canopy-roofs"]
    .map((s) => products.find((p) => p.slug === s)!)
    .filter(Boolean);

  return (
    <>
      <HomeHero fontFamily={display.style.fontFamily} />

      {/* marquee of glass types, in ink on paper */}
      <div className="overflow-hidden border-y border-ink/10 bg-paper py-5">
        <div className="animate-marquee flex w-max gap-10 font-display text-[28px] font-bold tracking-[-0.03em] whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-10">
              {m} <span className="size-2.5 rotate-45 bg-teal-600" />
            </span>
          ))}
        </div>
      </div>

      {/* welcome, with the die-cut sheet */}
      <Section className="mt-20 grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <span className="label-bar inline-block px-2.5 py-1 text-[12px]">Welcome to Glass Online</span>
          <h2 className="mt-5 font-display text-[clamp(40px,5.6vw,80px)] leading-[0.92] font-bold tracking-[-0.045em]">
            Measured glass, ordered with ease.
          </h2>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-muted-foreground">
            Glass.com.ng is Nigeria’s first online glass platform. Tell us the size, the thickness and the finish, and we cut
            it, polish it and deliver it. No trip to the market, no guesswork, no broken panes on the way home.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ActionButton href="/order-online">
              Order now <ArrowRight />
            </ActionButton>
            <GlassButton href="/about-us">About NFO Glass</GlassButton>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink/10 pt-6">
            {[
              ["2016", "online since"],
              ["4–15mm", "toughened"],
              ["36", "states we ship to"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-[30px] font-bold tracking-[-0.03em]">{v}</dt>
                <dd className="text-[13px] text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <CubeNet className="mx-auto w-full max-w-[640px]" />
      </Section>

      {/* the three promises from the old home page */}
      <Section className="mt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative overflow-hidden rounded-[24px] border border-ink/10 bg-white p-7 transition-all hover:-translate-y-1 hover:border-teal-600/40"
            >
              <s.icon className="size-7 text-teal-700" />
              <h3 className="mt-6 font-display text-[28px] leading-none font-bold tracking-[-0.03em]">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                Read more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* products */}
      <Section className="mt-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-[12px] font-semibold tracking-[0.16em] text-teal-700 uppercase">Products</span>
            <h2 className="mt-3 font-display text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-bold tracking-[-0.04em]">
              Made to measure, for every room.
            </h2>
          </div>
          <GlassButton href="/products">All 16 products</GlassButton>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Card key={p.slug} href={`/products/${p.slug}`} title={p.title} text={lead(p.blocks, 120)} image={img(p.img)} />
          ))}
        </div>
      </Section>

      {/* how ordering works */}
      <Section className="mt-28">
        <div className="theme-ink overflow-hidden rounded-[32px] px-6 py-14 sm:px-12">
          <span className="text-[12px] font-semibold tracking-[0.16em] text-teal-400 uppercase">How it works</span>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-bold tracking-[-0.04em]">
            From tape measure to fitted glass in four steps.
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="fold-x mb-6 text-white/25" />
                <span className="font-display text-[15px] font-bold text-teal-400">0{i + 1}</span>
                <s.icon className="mt-3 size-6 text-teal-200" />
                <h3 className="mt-4 font-display text-[26px] font-bold tracking-[-0.03em]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap gap-4">
            <ActionButton href="/order-online" tone="solid">
              Start your quote <ArrowRight />
            </ActionButton>
            <GlassButton href="/how-to-guide">How to measure</GlassButton>
          </div>
        </div>
      </Section>

      {/* testimonials */}
      <Section className="mt-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="text-[12px] font-semibold tracking-[0.16em] text-teal-700 uppercase">What clients say</span>
            <h2 className="mt-3 font-display text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-bold tracking-[-0.04em]">
              Faster than Mushin Market.
            </h2>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[24px]">
              <Image src={img("mirror")} alt="" fill sizes="(min-width:1024px) 35vw, 100vw" className="object-cover" />
            </div>
            <GlassButton href="/testimonials" className="mt-6">
              Read all testimonials
            </GlassButton>
          </div>
          <div className="columns-1 gap-4 sm:columns-2">
            {testimonials.slice(0, 6).map((t) => (
              <figure key={t.who} className="mb-4 break-inside-avoid rounded-[22px] border border-ink/10 bg-white p-6">
                <blockquote className="text-[15.5px] leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-[13px] font-semibold text-teal-700">{t.who}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      {/* find us: the Lagos map */}
      <div className="mx-auto mt-28 max-w-[1440px] px-3 sm:px-5">
        <Location />
      </div>

      <CtaBand>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-display text-[clamp(36px,5vw,72px)] leading-[0.92] font-bold tracking-[-0.045em]">
              Ready when you are. <br />
              <span className="text-teal-200">Send us your sizes.</span>
            </p>
            <p className="mt-4 max-w-xl text-white/70">
              Send your measurements or a drawing (pdf, dxf, dwg, jpg) and we’ll come back with a price, free.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 [--glass-ink:#fff] [--glass-light:#063f37]">
            <ActionButton href="/order-online">Get a quote</ActionButton>
            <GlassButton href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp us
            </GlassButton>
          </div>
        </div>
      </CtaBand>
    </>
  );
}

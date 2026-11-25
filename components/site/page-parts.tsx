import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Block } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Page opener in the poster style: a small ink label, a big display title, a dashed fold under it. */
export function PageHeader({
  label,
  title,
  intro,
  image,
  children,
}: {
  label: string;
  title: string;
  intro?: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-[1320px] px-5 pt-32 sm:px-8 sm:pt-40">
      <div className={cn("grid items-end gap-10", image && "lg:grid-cols-[1.2fr_1fr]")}>
        <div>
          <span className="label-bar inline-block px-2.5 py-1 text-[12px]">{label}</span>
          <h1 className="mt-5 font-display text-[clamp(44px,7.5vw,104px)] leading-[0.9] font-bold tracking-[-0.045em] text-balance">
            {title}
          </h1>
          {intro && <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">{intro}</p>}
          {children && <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div>}
        </div>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-ink/10 [clip-path:polygon(12%_0,100%_0,100%_88%,88%_100%,0_100%,0_12%)]">
            <Image src={image} alt="" fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
          </div>
        )}
      </div>
      <div className="fold-x mt-12 text-ink/40" />
    </header>
  );
}

/** Renders the old site's text blocks: runs of list items become one list. */
export function Prose({ blocks, className }: { blocks: Block[]; className?: string }) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: number) => {
    if (list.length) {
      out.push(
        <ul key={`ul-${key}`}>
          {list.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  blocks.forEach((b, i) => {
    if (b.k === "li") {
      list.push(b.x);
      return;
    }
    flush(i);
    out.push(b.k === "h" ? <h3 key={i}>{b.x}</h3> : <p key={i}>{b.x}</p>);
  });
  flush(blocks.length);
  return <div className={cn("prose-glass max-w-[68ch] text-[17px]", className)}>{out}</div>;
}

export function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("mx-auto max-w-[1320px] px-5 sm:px-8", className)}>
      {children}
    </section>
  );
}

export function Card({
  href,
  title,
  text,
  image,
  tag,
}: {
  href: string;
  title: string;
  text?: string;
  image?: string;
  tag?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-ink/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(6,63,55,0.55)]"
    >
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={image} alt="" fill sizes="(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          {tag && <span className="label-bar absolute top-3 left-3 px-2 py-0.5 text-[11px]">{tag}</span>}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {!image && tag && <span className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-teal-700 uppercase">{tag}</span>}
        <h3 className="font-display text-[24px] leading-[1.05] font-bold tracking-[-0.03em]">{title}</h3>
        {text && <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{text}</p>}
        <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-teal-700">
          View <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Closing call to action, reused at the foot of most pages. */
export function CtaBand({ children }: { children: React.ReactNode }) {
  return (
    <Section className="mt-24">
      <div className="relative overflow-hidden rounded-[32px] bg-teal-900 px-6 py-14 text-white sm:px-12">
        <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-teal-400/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 left-10 size-72 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="relative">{children}</div>
      </div>
    </Section>
  );
}

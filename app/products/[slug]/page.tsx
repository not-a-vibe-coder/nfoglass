import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, PageHeader, Prose, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { GlassButton } from "@/components/ui/glass-button";
import { CONTACT, img, lead, PRODUCT_FALLBACK, products } from "@/lib/site";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  return p ? { title: p.title, description: lead(p.blocks, 155) } : {};
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();

  const blocks = p.blocks.length ? p.blocks : (PRODUCT_FALLBACK[p.slug] ?? []).map((x) => ({ k: "p" as const, x }));
  const others = products.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <PageHeader label="Product" title={p.title} image={img(p.img)}>
        <ActionButton href={`/order-online?product=${p.slug}`} tone="solid">
          Quote this
        </ActionButton>
        <GlassButton href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
          Ask on WhatsApp
        </GlassButton>
      </PageHeader>
      <Section className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        {blocks.length ? (
          <Prose blocks={blocks} />
        ) : (
          <p className="text-muted-foreground">Ask us for the full specification and a free quote.</p>
        )}
        <aside className="h-fit rounded-[24px] border border-ink/10 bg-white p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-[24px] font-bold tracking-[-0.03em]">Every piece includes</h2>
          <ul className="mt-4 space-y-2 text-[15px] text-muted-foreground">
            <li>Cut to your exact size</li>
            <li>Polished or bevelled edges on request</li>
            <li>Holes, notches and cut-outs</li>
            <li>Toughening to safety standard</li>
            <li>Insured delivery, or fitting by our crew</li>
          </ul>
          <ActionButton href={`/order-online?product=${p.slug}`} className="mt-6">
            Get a price
          </ActionButton>
        </aside>
      </Section>
      <Section className="mt-24">
        <h2 className="font-display text-[36px] font-bold tracking-[-0.04em]">More products</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {others.map((o) => (
            <Card key={o.slug} href={`/products/${o.slug}`} title={o.title} image={img(o.img)} />
          ))}
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand, PageHeader, Prose, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { ABOUT, img, lead, pages } from "@/lib/site";

export function generateStaticParams() {
  return ABOUT.map((a) => ({ slug: a.slug }));
}

const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

export async function generateMetadata({ params }: PageProps<"/about-us/[slug]">): Promise<Metadata> {
  const pg = pages[`about-us/${(await params).slug}`];
  return pg ? { title: titleCase(pg.title), description: lead(pg.blocks, 155) } : {};
}

export default async function AboutSub({ params }: PageProps<"/about-us/[slug]">) {
  const { slug } = await params;
  const pg = pages[`about-us/${slug}`];
  const a = ABOUT.find((x) => x.slug === slug);
  if (!pg || !a) notFound();
  return (
    <>
      <PageHeader label="About us" title={titleCase(pg.title)} image={img(a.img)} />
      <Section className="mt-12">
        <Prose blocks={pg.blocks} className="text-[19px]" />
      </Section>
      <CtaBand>
        <p className="font-display text-[clamp(32px,4vw,56px)] leading-none font-bold tracking-[-0.04em]">Buy glass from us.</p>
        <ActionButton href="/order-online" className="mt-8">
          Order online
        </ActionButton>
      </CtaBand>
    </>
  );
}

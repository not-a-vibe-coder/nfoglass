import type { Metadata } from "next";
import { Card, PageHeader, Prose, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { GlassButton } from "@/components/ui/glass-button";
import { ABOUT, img, lead, pages } from "@/lib/site";

export const metadata: Metadata = { title: "About us", description: "NFO Glass, the Nigerian First Online glass company." };


export default function AboutPage() {
  return (
    <>
      <PageHeader label="About us" title="NFO Glass, online since 2016." image={img("lagos")}>
        <ActionButton href="/order-online" tone="solid">
          Order now
        </ActionButton>
        <GlassButton href="/contact-us">Get a quote</GlassButton>
      </PageHeader>
      <Section className="mt-12">
        <Prose blocks={pages["about-us"].blocks} className="text-[20px]" />
      </Section>
      <Section className="mt-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT.map((a) => {
            const pg = pages[`about-us/${a.slug}`];
            return <Card key={a.slug} href={`/about-us/${a.slug}`} title={pg.title} text={lead(pg.blocks, 100)} image={img(a.img)} />;
          })}
        </div>
      </Section>
    </>
  );
}

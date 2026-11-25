import type { Metadata } from "next";
import { Card, PageHeader, Prose, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { img, lead, pages, types } from "@/lib/site";

export const metadata: Metadata = {
  title: "Types of glass",
  description: "Toughened, laminated, insulated, fire, security, mirror and splashback glass explained.",
};

export default function TypesPage() {
  const groups = Array.from(new Set(types.map((t) => t.group)));
  return (
    <>
      <PageHeader
        label="Types of glass"
        title="Know your glass."
        intro="Toughened glass is five times stronger than normal glass. Laminated holds together when it breaks. Here is every type we cut, and what each one is for."
        image={img("reflect")}
      >
        <ActionButton href="/order-online" tone="solid">
          Order online
        </ActionButton>
      </PageHeader>
      <Section className="mt-12">
        <Prose blocks={pages["types-of-glass"].blocks} />
      </Section>
      {groups.map((g) => (
        <Section key={g} className="mt-16">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-[32px] font-bold tracking-[-0.03em]">{g}</h2>
            <div className="fold-x flex-1 text-ink/30" />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {types
              .filter((t) => t.group === g)
              .map((t) => (
                <Card key={t.slug} href={`/types-of-glass/${t.slug}`} title={t.title} text={lead(t.blocks, 140)} tag={g} />
              ))}
          </div>
        </Section>
      ))}
    </>
  );
}

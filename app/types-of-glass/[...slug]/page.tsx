import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Prose, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { GlassButton } from "@/components/ui/glass-button";
import { lead, types } from "@/lib/site";

export function generateStaticParams() {
  return types.map((t) => ({ slug: t.slug.split("/") }));
}

const find = (slug: string[]) => types.find((t) => t.slug === slug.join("/"));

export async function generateMetadata({ params }: PageProps<"/types-of-glass/[...slug]">): Promise<Metadata> {
  const t = find((await params).slug);
  return t ? { title: t.title, description: lead(t.blocks, 155) } : {};
}

export default async function TypePage({ params }: PageProps<"/types-of-glass/[...slug]">) {
  const t = find((await params).slug);
  if (!t) notFound();
  const siblings = types.filter((x) => x.group === t.group && x.slug !== t.slug);

  return (
    <>
      <PageHeader label={t.group} title={t.title}>
        <ActionButton href="/order-online" tone="solid">
          Order this glass
        </ActionButton>
        <GlassButton href="/types-of-glass">All types</GlassButton>
      </PageHeader>
      <Section className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px]">
        <Prose blocks={t.blocks} />
        {siblings.length > 0 && (
          <aside className="h-fit rounded-[24px] border border-ink/10 bg-white p-6 lg:sticky lg:top-28">
            <h2 className="text-[12px] font-semibold tracking-[0.16em] text-teal-700 uppercase">Also in {t.group}</h2>
            <ul className="mt-4 space-y-3">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link href={`/types-of-glass/${s.slug}`} className="font-display text-[20px] font-bold tracking-[-0.02em] hover:text-teal-700">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </Section>
    </>
  );
}

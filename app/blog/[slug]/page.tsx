import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand, PageHeader, Prose, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { lead, posts } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  return p ? { title: p.title, description: lead(p.blocks, 155) } : {};
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <>
      <PageHeader label={p.date ? `Posted ${p.date}` : "Blog"} title={p.title} />
      <Section className="mt-12">
        <Prose blocks={p.blocks} />
      </Section>
      <CtaBand>
        <p className="font-display text-[clamp(32px,4vw,56px)] leading-none font-bold tracking-[-0.04em]">Ready to order?</p>
        <ActionButton href="/order-online" className="mt-8">
          Get an instant quote
        </ActionButton>
      </CtaBand>
    </>
  );
}

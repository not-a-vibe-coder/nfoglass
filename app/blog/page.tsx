import type { Metadata } from "next";
import { Card, PageHeader, Section } from "@/components/site/page-parts";
import { img, lead, posts } from "@/lib/site";

export const metadata: Metadata = { title: "Blog", description: "Guides and stories about glass, from shower cubicles to the world’s best glass buildings." };

const COVERS = ["balustrade", "door", "shower", "shower", "door2", "dusk", "mirror-round", "stair2", "towers", "facade", "lowangle", "spiral"];

export default function BlogPage() {
  return (
    <>
      <PageHeader label="Blog" title="Notes on glass." intro="How to choose, care for and get the most out of glass in your home and business." />
      <Section className="mt-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Card key={p.slug} href={`/blog/${p.slug}`} title={p.title} text={lead(p.blocks, 120)} image={img(COVERS[i % COVERS.length])} tag={p.date || "Guide"} />
          ))}
        </div>
      </Section>
    </>
  );
}

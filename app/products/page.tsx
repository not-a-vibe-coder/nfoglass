import type { Metadata } from "next";
import { Card, CtaBand, PageHeader, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { img, lead, PRODUCT_FALLBACK, products } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products",
  description: "Custom glass products: mirrors, table tops, shelves, staircases, balustrades, shower doors, splashbacks and more.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        label="Custom glass products"
        title="Sixteen ways to use glass."
        intro="Every product is cut to your measure. Choose a product to see the options, then order online or ask for a free quote."
        image={img("towers")}
      >
        <ActionButton href="/order-online" tone="solid">
          Order online
        </ActionButton>
      </PageHeader>
      <Section className="mt-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <Card
              key={p.slug}
              href={`/products/${p.slug}`}
              title={p.title}
              text={lead(p.blocks, 110) || PRODUCT_FALLBACK[p.slug]?.[0].slice(0, 110) + "…"}
              image={img(p.img)}
            />
          ))}
        </div>
      </Section>
      <CtaBand>
        <p className="font-display text-[clamp(32px,4vw,56px)] leading-none font-bold tracking-[-0.04em]">Don’t see it here?</p>
        <p className="mt-3 max-w-xl text-white/70">We take on custom projects of every kind. Send a sketch or a CAD file.</p>
        <ActionButton href="/custom-orders" className="mt-8">
          Custom orders
        </ActionButton>
      </CtaBand>
    </>
  );
}

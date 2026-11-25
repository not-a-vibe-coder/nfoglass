import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, Section } from "@/components/site/page-parts";
import { QuoteBuilder } from "@/components/site/quote-builder";

export const metadata: Metadata = {
  title: "Order online",
  description: "Build a glass quote: size, type, thickness, tint, edges and delivery. Free, answered the same working day.",
};

// ?product=… pre-fills the notes. Reading it is request-time work, so it streams in behind a
// placeholder builder while the rest of the page is prerendered.
async function Builder({ searchParams }: { searchParams: PageProps<"/order-online">["searchParams"] }) {
  const sp = await searchParams;
  return <QuoteBuilder product={typeof sp.product === "string" ? sp.product : undefined} />;
}

export default function OrderPage({ searchParams }: PageProps<"/order-online">) {
  return (
    <>
      <PageHeader
        label="Instant online quote"
        title="Order your glass."
        intro="Tell us what you need. We’ll price it and reply on WhatsApp or email, usually the same working day."
      />
      <Section className="mt-10">
        <Suspense fallback={<QuoteBuilder />}>
          <Builder searchParams={searchParams} />
        </Suspense>
      </Section>
    </>
  );
}

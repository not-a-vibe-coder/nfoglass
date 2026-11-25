import type { Metadata } from "next";
import { PageHeader, Prose, Section } from "@/components/site/page-parts";
import { img, pages } from "@/lib/site";

export const metadata: Metadata = { title: "Shipping policy", description: "How we pack, crate, insure and deliver your glass." };

export default function ShippingPage() {
  return (
    <>
      <PageHeader label="Safe shipping" title="Shipping policy." intro="Packaging, crating and insured delivery for most orders." image={img("canopy")} />
      <Section className="mt-12">
        <Prose blocks={pages["shipping-policy"].blocks} />
      </Section>
    </>
  );
}

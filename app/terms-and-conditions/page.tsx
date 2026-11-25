import type { Metadata } from "next";
import { PageHeader, Prose, Section } from "@/components/site/page-parts";
import { pages } from "@/lib/site";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHeader label="Legal" title="Terms and conditions." />
      <Section className="mt-12">
        <Prose blocks={pages["terms-and-conditions"].blocks} />
      </Section>
    </>
  );
}

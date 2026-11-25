import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { testimonials } from "@/lib/site";

export const metadata: Metadata = { title: "Testimonials", description: "What customers across Lagos say about NFO Glass." };

export default function TestimonialsPage() {
  return (
    <>
      <PageHeader label="Testimonials" title="In their words.">
        <ActionButton href="/order-online" tone="solid">
          Join them
        </ActionButton>
      </PageHeader>
      <Section className="mt-12">
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.who}
              className={`mb-5 break-inside-avoid rounded-[22px] border p-7 ${i % 4 === 0 ? "border-transparent bg-teal-900 text-white" : "border-ink/10 bg-white"}`}
            >
              <blockquote className="text-[16px] leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className={`mt-5 text-[13px] font-semibold ${i % 4 === 0 ? "text-teal-200" : "text-teal-700"}`}>{t.who}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}

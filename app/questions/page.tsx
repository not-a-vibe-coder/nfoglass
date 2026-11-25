import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { CtaBand, PageHeader, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { CONTACT, faq } from "@/lib/site";

export const metadata: Metadata = { title: "FAQ", description: "Answers on quotes, returns, edge finishes, thicknesses, laminated glass, delivery and fitting." };

export default function FaqPage() {
  return (
    <>
      <PageHeader
        label="FAQ’s"
        title="Questions, answered."
        intro={`${faq.length} answers from our glass team. Still stuck? Email ${CONTACT.emails.support} or call ${CONTACT.phone}.`}
      />
      <Section className="mt-10">
        <div className="mx-auto max-w-4xl divide-y divide-ink/10 rounded-[24px] border border-ink/10 bg-white">
          {faq.map((f, i) => (
            <details key={i} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="font-display text-[20px] leading-snug font-bold tracking-[-0.02em]">{f.q}</span>
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-ink/15 transition-transform group-open:rotate-45 group-open:border-teal-600 group-open:bg-teal-50">
                  <Plus className="size-4" />
                </span>
              </summary>
              <div className="prose-glass mt-3 max-w-none text-[16px]">
                {f.a.split("\n").map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </Section>
      <CtaBand>
        <p className="font-display text-[clamp(32px,4vw,56px)] leading-none font-bold tracking-[-0.04em]">Free quote, no obligation.</p>
        <ActionButton href="/order-online" className="mt-8">
          Start a quote
        </ActionButton>
      </CtaBand>
    </>
  );
}

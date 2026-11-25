import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/site/page-parts";
import { ActionButton } from "@/components/ui/button-4";
import { GlassButton } from "@/components/ui/glass-button";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = { title: "My account" };

// Accounts are not wired to a backend yet. Rather than show a log-in that can't work, this page
// says so and points at the two ways an order actually moves today.
export default function AccountPage() {
  return (
    <>
      <PageHeader label="My account" title="Your orders." />
      <Section className="mt-12">
        <div className="max-w-xl rounded-[28px] border border-ink/10 bg-white p-8">
          <h2 className="font-display text-[28px] font-bold tracking-[-0.03em]">Online accounts are coming soon.</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
            For now, every order is handled by a real person. Send your order number on WhatsApp or by email and we’ll tell
            you exactly where your glass is.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <ActionButton href={CONTACT.whatsapp} target="_blank" rel="noreferrer" tone="solid">
              Track on WhatsApp
            </ActionButton>
            <GlassButton href={`mailto:${CONTACT.emails.orders}`}>{CONTACT.emails.orders}</GlassButton>
          </div>
        </div>
      </Section>
    </>
  );
}

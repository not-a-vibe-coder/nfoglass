import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader, Section } from "@/components/site/page-parts";
import { ContactForm } from "@/components/site/contact-form";
import { GlassButton } from "@/components/ui/glass-button";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = { title: "Contact us", description: `Visit us at ${CONTACT.address}, call ${CONTACT.phone} or send an enquiry.` };

export default function ContactPage() {
  return (
    <>
      <PageHeader label="Contact us" title="Talk to a glass person." intro="Send an enquiry with your drawing, or reach us directly. For a priced order, use the quote form." />
      <Section className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ContactForm />
        <aside className="space-y-4">
          <div className="rounded-[24px] border border-ink/10 bg-white p-6">
            <h2 className="font-display text-[24px] font-bold tracking-[-0.03em]">Showroom</h2>
            <p className="mt-3 flex gap-2 text-[15px] text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-700" /> {CONTACT.address}
            </p>
            <a href={`tel:${CONTACT.tel}`} className="mt-3 flex gap-2 text-[15px] hover:text-teal-700">
              <Phone className="mt-0.5 size-4 shrink-0 text-teal-700" /> {CONTACT.phone} (call or WhatsApp)
            </a>
            {Object.entries(CONTACT.emails).map(([k, e]) => (
              <a key={k} href={`mailto:${e}`} className="mt-3 flex gap-2 text-[15px] hover:text-teal-700">
                <Mail className="mt-0.5 size-4 shrink-0 text-teal-700" /> {e}
              </a>
            ))}
            <div className="mt-6 flex flex-wrap gap-3">
              <GlassButton href={CONTACT.whatsapp} target="_blank" rel="noreferrer" size="sm">
                WhatsApp
              </GlassButton>
              <GlassButton href="/order-online" size="sm">
                Quotation form
              </GlassButton>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-ink/10">
            <iframe
              title="Map of City Hall, Lagos Island"
              src="https://www.google.com/maps?q=City+Hall+Lagos+Island&output=embed"
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-[14px] text-muted-foreground">
            Follow @nfoglass on{" "}
            <a className="underline" href={CONTACT.social.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            ,{" "}
            <a className="underline" href={CONTACT.social.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>{" "}
            and{" "}
            <a className="underline" href={CONTACT.social.x} target="_blank" rel="noreferrer">
              X
            </a>
            .
          </p>
        </aside>
      </Section>
    </>
  );
}

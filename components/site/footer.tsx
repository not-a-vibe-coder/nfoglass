import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT, products } from "@/lib/site";
import { GlassButton } from "@/components/ui/glass-button";
import { Wordmark } from "./header";

const SITE = [
  ["Order online", "/order-online"],
  ["Products", "/products"],
  ["Types of glass", "/types-of-glass"],
  ["Custom orders", "/custom-orders"],
  ["How-to guide", "/how-to-guide"],
  ["Gallery", "/images"],
  ["Testimonials", "/testimonials"],
  ["FAQ", "/questions"],
  ["Blog", "/blog"],
  ["About us", "/about-us"],
  ["Shipping policy", "/shipping-policy"],
  ["Terms and conditions", "/terms-and-conditions"],
  ["My account", "/my-account"],
];

// Cached with the page, so the year is fixed at build time and refreshed on the next deploy
async function Year() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="theme-ink relative mt-24 overflow-hidden">
      <div className="mx-auto max-w-[1320px] px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Wordmark className="text-[34px]" markSize={56} />
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Nigeria’s first online glass company. Glass cut to your measure, toughened, polished and delivered, from our
              showroom on Lagos Island to the rest of the country.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <GlassButton href={CONTACT.whatsapp} target="_blank" rel="noreferrer" size="sm">
                Chat on WhatsApp
              </GlassButton>
              <GlassButton href={`tel:${CONTACT.tel}`} size="sm">
                Call us
              </GlassButton>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-teal-400 uppercase">Products</h3>
            <ul className="mt-4 space-y-2 text-[14.5px]">
              {products.slice(0, 9).map((p) => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`} className="text-muted-foreground transition-colors hover:text-foreground">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-teal-400 uppercase">Site</h3>
            <ul className="mt-4 space-y-2 text-[14.5px]">
              {SITE.map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-teal-400 uppercase">Showroom</h3>
            <ul className="mt-4 space-y-3 text-[14.5px] text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-teal-400" /> {CONTACT.address}
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-teal-400" />
                <a href={`tel:${CONTACT.tel}`} className="hover:text-foreground">
                  {CONTACT.phone}
                </a>
              </li>
              {Object.values(CONTACT.emails).map((e) => (
                <li key={e} className="flex gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0 text-teal-400" />
                  <a href={`mailto:${e}`} className="hover:text-foreground">
                    {e}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-4 text-sm">
              <a href={CONTACT.social.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                Instagram
              </a>
              <a href={CONTACT.social.facebook} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                Facebook
              </a>
              <a href={CONTACT.social.x} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                X
              </a>
            </div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none mt-16 select-none overflow-hidden">
          <p className="font-display text-[19vw] leading-[0.8] font-bold tracking-[-0.05em] text-white/[0.06] lg:text-[16rem]">
            glass.com.ng
          </p>
        </div>
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-border pt-6 text-[13px] text-muted-foreground sm:flex-row">
          <span>© <Year /> Glass Online · NFO Glass. All rights reserved.</span>
          <span>{CONTACT.address}</span>
        </div>
      </div>
    </footer>
  );
}

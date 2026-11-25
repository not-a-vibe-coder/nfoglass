"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { NAV, CONTACT } from "@/lib/site";
import { ActionButton } from "@/components/ui/button-4";
import { cn } from "@/lib/utils";

/** The green glass G, set beside the domain. `markSize` is the logo's edge in px. */
export function Wordmark({ className, markSize = 34 }: { className?: string; markSize?: number }) {
  return (
    <span className={cn("flex items-center gap-2 font-display text-[22px] leading-none font-bold tracking-[-0.03em]", className)}>
      <Image src="/logo-160.png" alt="" width={markSize} height={markSize} priority className="shrink-0 drop-shadow-[0_4px_10px_rgba(37,160,90,0.35)]" />
      <span>
        glass<span className="text-teal-400">.</span>com<span className="text-teal-400">.</span>ng
      </span>
    </span>
  );
}

// A floating frosted bar. Over the dark hero it reads light; once the page moves it turns to paper.
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onHome = path === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * (onHome ? 1.2 : 0.02));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  const dark = onHome && !scrolled && !open;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-[1320px] items-center gap-4 rounded-2xl border px-4 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 sm:px-5",
          dark
            ? "border-white/12 bg-[#0a1412]/40 text-white"
            : "border-ink/10 bg-paper/80 text-ink shadow-[0_14px_34px_-22px_rgba(6,63,55,0.5)]",
        )}
      >
        <Link href="/" aria-label="glass.com.ng home" className="shrink-0">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
          {NAV.map((n) => {
            const on = path === n.href || path.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14.5px] font-medium transition-colors",
                  dark ? "text-white/70 hover:bg-white/8 hover:text-white" : "text-ink/65 hover:bg-ink/5 hover:text-ink",
                  on && (dark ? "text-white" : "text-ink"),
                )}
              >
                {on && <span className="size-1.5 rounded-full bg-teal-400" />}
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <a
            href={`tel:${CONTACT.tel}`}
            className={cn("hidden items-center gap-2 text-sm font-medium xl:flex", dark ? "text-white/75" : "text-ink/70")}
          >
            <Phone className="size-4" /> {CONTACT.phone}
          </a>
          <ActionButton href="/order-online" tone="solid" className="hidden scale-90 sm:inline-flex">
            Order online
          </ActionButton>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "grid size-11 place-items-center rounded-xl border lg:hidden",
              dark ? "border-white/20" : "border-ink/15",
            )}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="mx-auto mt-2 max-w-[1320px] rounded-2xl border border-ink/10 bg-paper/95 p-2 text-ink shadow-xl backdrop-blur-xl lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 text-[17px] font-medium hover:bg-paper-2">
              {n.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink/10 pt-3">
            <a href={`tel:${CONTACT.tel}`} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-ink/15 font-semibold">
              <Phone className="size-4" /> Call
            </a>
            <Link href="/order-online" onClick={() => setOpen(false)} className="flex h-12 items-center justify-center rounded-xl bg-teal-700 font-semibold text-white">
              Order online
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

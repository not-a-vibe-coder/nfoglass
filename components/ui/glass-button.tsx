import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./whatsapp-icon";

// The liquid-glass pill from Muuve (components/ui/sign-up.tsx + glass.css). The styles live in
// glass.css; this file only lays the three layers out: the wrap (tilts on press), the button
// (frosted body, conic rim) and the shadow that sits under it.

const glassButtonVariants = cva("glass-button relative isolate z-10 cursor-pointer rounded-full transition-all", {
  variants: {
    size: {
      default: "text-[15px] font-medium",
      sm: "text-sm font-medium",
      lg: "text-base font-semibold",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: { size: "default" },
});

const glassButtonTextVariants = cva(
  "glass-button-text relative flex items-center justify-center gap-2 select-none whitespace-nowrap tracking-tight [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2",
        lg: "px-8 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { size: "default" },
  },
);

/*
 * What a button does sets how its glass looks. A WhatsApp link is tinted WhatsApp green and
 * carries the WhatsApp glyph, a phone link is teal with a handset, an email link is mint with an
 * envelope. Everything else stays clear frosted glass. The intent is read from the href, so a
 * caller never has to remember to match them.
 */
export type GlassIntent = "whatsapp" | "call" | "mail" | "neutral";

const INTENT: Record<Exclude<GlassIntent, "neutral">, { tint: string; Icon: React.ComponentType<{ className?: string }> }> = {
  whatsapp: { tint: "#25d366", Icon: WhatsAppIcon },
  call: { tint: "#20ccaa", Icon: Phone },
  mail: { tint: "#89fae4", Icon: Mail },
};

export function intentOf(href?: string): GlassIntent {
  if (!href) return "neutral";
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return "whatsapp";
  if (href.startsWith("tel:")) return "call";
  if (href.startsWith("mailto:")) return "mail";
  return "neutral";
}

type Common = VariantProps<typeof glassButtonVariants> & {
  /** Overrides the intent read from the href. */
  intent?: GlassIntent;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export type GlassButtonProps = Common &
  (
    | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">)
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

export function GlassButton(props: GlassButtonProps) {
  const { className, contentClassName, size, children } = props;
  const intent = props.intent ?? intentOf(props.href);
  const look = intent === "neutral" ? null : INTENT[intent];
  const inner = (
    <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>
      {look && <look.Icon className="glass-button-icon" />}
      {children}
    </span>
  );

  let control: React.ReactNode;
  if (props.href !== undefined) {
    const { href, className: _c, contentClassName: _cc, size: _s, children: _ch, intent: _i, ...rest } = props;
    const external = /^(https?:|mailto:|tel:)/.test(href);
    control = external ? (
      <a href={href} className={glassButtonVariants({ size })} {...rest}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={cn("block", glassButtonVariants({ size }))} {...rest}>
        {inner}
      </Link>
    );
  } else {
    const { className: _c, contentClassName: _cc, size: _s, children: _ch, href: _h, intent: _i, type = "button", ...rest } = props;
    control = (
      <button type={type} className={glassButtonVariants({ size })} {...rest}>
        {inner}
      </button>
    );
  }

  return (
    <div
      data-intent={look ? intent : undefined}
      style={look ? ({ "--glass-tint": look.tint } as React.CSSProperties) : undefined}
      className={cn("glass-button-wrap relative inline-block rounded-full", className)}
    >
      {control}
      <div className="glass-button-shadow pointer-events-none rounded-full" />
    </div>
  );
}

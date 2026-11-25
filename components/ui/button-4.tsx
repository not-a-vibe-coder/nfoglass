import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * The "important action" button (button-4): a pill that lifts up and to the left on hover and
 * leaves a stepped trail of three shadows behind it. Recoloured from the original navy to the
 * glass.com.ng teal ramp (#087263 → #0a9e81 → #20ccaa), and made to work as a link or a button.
 */

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Pill styling: "light" is paper with an ink border, "solid" is teal with white text. */
  tone?: "light" | "solid";
} & (
  | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">)
  | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
);

const face = {
  light:
    "border-teal-900 bg-gradient-to-r from-[#f4fffb] to-[#e3f7f0] text-ink",
  solid: "border-teal-900 bg-gradient-to-r from-teal-700 to-teal-600 text-white",
};

export function Component(props: Props) {
  const { children, className, tone = "light" } = props;
  const body = (
    <>
      <span
        className={cn(
          "relative z-10 inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full border-2 px-6 font-semibold tracking-[-0.01em] whitespace-nowrap transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-focus-visible:-translate-x-3 group-focus-visible:-translate-y-3 [&_svg]:size-[18px]",
          face[tone],
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full rounded-full transition-all duration-300 group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:[box-shadow:5px_5px_#087263,10px_10px_#0a9e81,15px_15px_#20ccaa] group-focus-visible:-translate-x-3 group-focus-visible:-translate-y-3 group-focus-visible:[box-shadow:5px_5px_#087263,10px_10px_#0a9e81,15px_15px_#20ccaa]"
      />
    </>
  );
  const cls = cn("group relative inline-flex outline-none motion-reduce:[&_*]:transition-none", className);

  if (props.href !== undefined) {
    const { href, children: _c, className: _cl, tone: _t, ...rest } = props;
    if (/^(https?:|mailto:|tel:)/.test(href))
      return (
        <a href={href} className={cls} {...rest}>
          {body}
        </a>
      );
    return (
      <Link href={href} className={cls} {...rest}>
        {body}
      </Link>
    );
  }
  const { children: _c, className: _cl, tone: _t, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={cls} {...rest}>
      {body}
    </button>
  );
}

/** Site-wide name for the important-action button. */
export const ActionButton = Component;

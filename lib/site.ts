import data from "./site-data.json";

export type Block = { k: "h" | "p" | "li"; x: string };
export type Product = { slug: string; title: string; img: string; blocks: Block[] };
export type GlassType = { slug: string; group: string; title: string; blocks: Block[] };
export type Post = { slug: string; title: string; date: string; blocks: Block[] };

export const CONTACT = {
  name: "Glass Online",
  legal: "NFO Glass, the Nigerian First Online glass company",
  phone: "0809 456 0350",
  tel: "+2348094560350",
  whatsapp: "https://wa.me/2348094560350",
  emails: { info: "info@glass.com.ng", orders: "orders@glass.com.ng", support: "support@glass.com.ng" },
  address: "A1 Spaces, Suite 203E, City Hall, Lagos Island",
  social: {
    instagram: "https://www.instagram.com/nfoglass/",
    facebook: "https://www.facebook.com/nfoglass",
    x: "https://twitter.com/nfoglass",
  },
};

export const products = data.products as Product[];
export const types = data.types as GlassType[];
export const posts = data.blog as Post[];
export const faq = data.faq as { q: string; a: string }[];
export const testimonials = data.testimonials as { quote: string; who: string }[];
export const pages = data.pages as Record<string, { title: string; blocks: Block[] }>;

export const img = (name: string) => `/img/${name}.jpg`;

/** The short blurb for a product or type: its first real paragraph. */
export function lead(blocks: Block[], max = 170) {
  const p = blocks.find((b) => b.k === "p" && b.x.length > 60)?.x ?? blocks[0]?.x ?? "";
  return p.length > max ? `${p.slice(0, max).replace(/\s+\S*$/, "")}…` : p;
}

/** Products whose page on the old site was empty get a written description here. */
export const PRODUCT_FALLBACK: Record<string, string[]> = {
  "custom-glass-projects": [
    "Bring us the drawing, the sketch or the photo. We cut, toughen, polish and drill glass for one-off projects: display cases, partitions, reception counters, signage panels, art pieces and anything else that starts as an idea.",
    "Send a DXF or DWG file and our CNC machines cut the shape exactly. Bevels from 3 to 45 degrees, holes, notches and cut-outs for sockets are all possible.",
  ],
  "deck-glass-panels": [
    "Toughened glass deck panels keep the wind off and the view open. Each panel is made to measure, toughened for safety and finished with polished edges, ready for posts, channels or spigots.",
    "Ask for clear, low-iron for a truer colour, or tinted for privacy. We template, deliver and fit across Lagos.",
  ],
};

export const NAV = [
  { label: "Products", href: "/products" },
  { label: "Types of glass", href: "/types-of-glass" },
  { label: "Custom", href: "/custom-orders" },
  { label: "About", href: "/about-us" },
  { label: "FAQ", href: "/questions" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact-us" },
];

export const ABOUT = [
  { slug: "the-nigerian-first-online-glass-company", img: "facade" },
  { slug: "buy-glass-from-us", img: "balustrade" },
  { slug: "our-mission", img: "dusk" },
  { slug: "our-clients", img: "storefront" },
];

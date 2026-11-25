import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, Section } from "@/components/site/page-parts";
import { img } from "@/lib/site";

export const metadata: Metadata = { title: "Gallery", description: "Glass in homes, shops and buildings." };

const PICS: [string, string][] = [
  ["stair", "Glass balustrade on a marble staircase"],
  ["balustrade", "Glass balcony railing"],
  ["shower", "Glass-enclosed shower"],
  ["splashback", "Kitchen with a green splashback"],
  ["facade", "Glass facade with reflections"],
  ["canopy", "Glass canopy over an entrance"],
  ["mirror-round", "Round mirror"],
  ["spiral", "Spiral staircase with glass railings"],
  ["door", "Clear glass door"],
  ["roof", "Glass roof"],
  ["stair2", "Glass railing with a wooden handrail"],
  ["dusk", "Glass building at dusk"],
  ["mirror", "Framed mirror"],
  ["storefront", "Glass shop door"],
  ["towers", "Glass towers"],
  ["shelves", "Glassware on shelves"],
];

export default function ImagesPage() {
  return (
    <>
      <PageHeader label="Images" title="Glass, in the wild." intro="A look at what glass can do in a home, a shop or a tower." />
      <Section className="mt-12">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {PICS.map(([n, alt], i) => (
            <figure key={n} className="relative mb-4 break-inside-avoid overflow-hidden rounded-[22px]">
              <Image
                src={img(n)}
                alt={alt}
                width={900}
                height={i % 3 === 0 ? 1200 : 680}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="h-auto w-full object-cover"
              />
              <figcaption className="label-bar absolute bottom-3 left-3 px-2 py-0.5 text-[11px]">{alt}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}

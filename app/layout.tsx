import type { Metadata } from "next";
import "./globals.css";
import { display, sans } from "@/lib/fonts";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Loader } from "@/components/site/loader";

export const metadata: Metadata = {
  metadataBase: new URL("https://glass.com.ng"),
  title: {
    default: "glass.com.ng · Nigeria’s first online glass company",
    template: "%s · glass.com.ng",
  },
  description:
    "Order glass cut to your measure: toughened, laminated, mirrors, shower screens, balustrades, splashbacks and more, delivered from Lagos Island across Nigeria.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Loader />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

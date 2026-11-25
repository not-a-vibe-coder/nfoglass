import { Geist, Schibsted_Grotesk } from "next/font/google";

// Schibsted Grotesk: a heavy newspaper grotesk, close to the bold Helvetica of the A24 sheet
// the site borrows from, with enough character to carry the big display lines.
export const display = Schibsted_Grotesk({
  variable: "--font-display-face",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
});

export const sans = Geist({ variable: "--font-sans-face", subsets: ["latin", "latin-ext"] });

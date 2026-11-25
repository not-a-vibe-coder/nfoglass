"use client";

import GoRide from "@/components/ui/goride";
import { CONTACT } from "@/lib/site";

const COPY = {
  headline: "Glass, delivered",
  phrases: ["to Lagos Island.", "to your site.", "cut to measure.", "fitted this week."],
  phraseEvery: 2.8,
  lede: "Find us at City Hall on Lagos Island. Tap anywhere on the map to set your site, then hold to book a measure, a van or a truck.",
  primary: { label: "Order online", hover: "Get a quote", href: "/order-online" },
  secondary: { label: `Call ${CONTACT.phone}`, href: `tel:${CONTACT.tel}` },
  address: CONTACT.address,
  rating: "4.8",
  ratingNote: "from Lagos homes and fabricators",
  stat: { value: "24–72 hrs", label: "cut to delivery" },
  customers: [
    { name: "James, Ikorodu", initials: "J" },
    { name: "Kemi, Lekki", initials: "K" },
    { name: "Mustapha, Mowe", initials: "M" },
    { name: "Akpewe, Banana Island", initials: "A" },
  ],
};

const LIVE = {
  cities: [
    { name: "Lagos Island", rides: 14 },
    { name: "Lekki", rides: 22 },
    { name: "Ikeja", rides: 17 },
    { name: "Abuja", rides: 6 },
    { name: "Port Harcourt", rides: 5 },
  ],
  every: 3.2,
};

const DRIVER = {
  name: "Tunde Adebayo",
  initials: "TA",
  rating: "4.9",
  trips: "1,140 installs",
  plate: "LSD 214 XA",
  pin: "4821",
};

const PAYMENT = { method: "transfer", note: "Pay on delivery · transfer or card" };

export function Location() {
  return (
    <GoRide
      id="find-us"
      brand={{ name: "glass.com.ng" }}
      copy={COPY}
      live={LIVE}
      driver={DRIVER}
      payment={PAYMENT}
    />
  );
}

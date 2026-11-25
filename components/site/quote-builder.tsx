"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ActionButton } from "@/components/ui/button-4";
import { GlassButton } from "@/components/ui/glass-button";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/utils";

// The old site's quote needs: quantity, dimensions, material, thickness, tint, edgework and the
// delivery address. This builds that request and hands it off by WhatsApp or email; the team
// prices it and replies. There is no server: nothing is stored on the site.

const MATERIALS = ["Clear float (annealed)", "Toughened / tempered", "Low-iron toughened", "Laminated", "Laminated + toughened", "Mirror", "Back-painted splashback", "Sandblasted / frosted", "Fire rated", "Insulated (double glazed)"];
const THICKNESS = ["4mm", "5mm", "6mm", "8mm", "10mm", "12mm", "15mm"];
const TINTS = ["Clear", "Grey", "Bronze", "Green", "Blue", "Reflective"];
const EDGES = ["Cut only (rough)", "Flat polished", "Pencil / rounded", "Bevelled", "Ogee (wave)"];
const FULFIL = ["Delivery", "Delivery and fitting", "Collect from Lagos Island"];

function Chips({ value, options, onChange, label }: { value: string; options: string[]; onChange: (v: string) => void; label: string }) {
  return (
    <fieldset>
      <legend className="text-[13px] font-semibold tracking-[0.06em] text-ink/60 uppercase">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full border px-4 py-2 text-[14px] font-medium transition-colors",
              value === o ? "border-teal-700 bg-teal-700 text-white" : "border-ink/15 bg-white hover:border-ink/40",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const input = "h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[15px] outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

export function QuoteBuilder({ product }: { product?: string }) {
  const [material, setMaterial] = useState(MATERIALS[1]);
  const [thickness, setThickness] = useState("6mm");
  const [tint, setTint] = useState("Clear");
  const [edge, setEdge] = useState(EDGES[1]);
  const [fulfil, setFulfil] = useState(FULFIL[0]);
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [qty, setQty] = useState(1);
  const [holes, setHoles] = useState("0");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState(product ? `Product: ${product.replace(/-/g, " ")}` : "");

  const sqm = useMemo(() => {
    const a = (Number(w) / 1000) * (Number(h) / 1000) * qty;
    return Number.isFinite(a) && a > 0 ? a : 0;
  }, [w, h, qty]);

  const ready = Number(w) > 0 && Number(h) > 0 && name.trim().length > 1;

  const message = [
    "Hello Glass Online, I'd like a quote:",
    `• ${qty} × ${w || "?"} × ${h || "?"} mm`,
    `• ${material}, ${thickness}, ${tint}`,
    `• Edges: ${edge}${Number(holes) > 0 ? `, ${holes} hole(s) per piece` : ""}`,
    `• ${fulfil}${area ? ` to ${area}` : ""}`,
    sqm ? `• About ${sqm.toFixed(2)} m² in total` : "",
    notes ? `• Notes: ${notes}` : "",
    `— ${name}`,
  ]
    .filter(Boolean)
    .join("\n");

  const wa = `${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
  const mail = `mailto:${CONTACT.emails.orders}?subject=${encodeURIComponent(`Quote request: ${material} ${thickness}`)}&body=${encodeURIComponent(message)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8 rounded-[28px] border border-ink/10 bg-white p-6 sm:p-8">
        <div>
          <span className="text-[13px] font-semibold tracking-[0.06em] text-ink/60 uppercase">Size (millimetres)</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="sr-only">Width in mm</span>
              <input inputMode="numeric" placeholder="Width, e.g. 1200" value={w} onChange={(e) => setW(e.target.value.replace(/\D/g, ""))} className={input} />
            </label>
            <label className="block">
              <span className="sr-only">Height in mm</span>
              <input inputMode="numeric" placeholder="Height, e.g. 2000" value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, ""))} className={input} />
            </label>
            <div className="flex h-12 items-center rounded-xl border border-ink/15">
              <button type="button" aria-label="Fewer pieces" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-12 place-items-center">
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button type="button" aria-label="More pieces" onClick={() => setQty((q) => q + 1)} className="grid size-12 place-items-center">
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>
        <Chips label="Type of glass" value={material} options={MATERIALS} onChange={setMaterial} />
        <Chips label="Thickness" value={thickness} options={THICKNESS} onChange={setThickness} />
        <Chips label="Tint" value={tint} options={TINTS} onChange={setTint} />
        <Chips label="Edgework" value={edge} options={EDGES} onChange={setEdge} />
        <label className="block max-w-[200px]">
          <span className="text-[13px] font-semibold tracking-[0.06em] text-ink/60 uppercase">Holes per piece</span>
          <input inputMode="numeric" value={holes} onChange={(e) => setHoles(e.target.value.replace(/\D/g, ""))} className={cn(input, "mt-3")} />
        </label>
        <Chips label="Delivery" value={fulfil} options={FULFIL} onChange={setFulfil} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[13px] font-semibold tracking-[0.06em] text-ink/60 uppercase">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={cn(input, "mt-3")} autoComplete="name" />
          </label>
          <label className="block">
            <span className="text-[13px] font-semibold tracking-[0.06em] text-ink/60 uppercase">Area / city</span>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Lekki Phase 1" className={cn(input, "mt-3")} />
          </label>
        </div>
        <label className="block">
          <span className="text-[13px] font-semibold tracking-[0.06em] text-ink/60 uppercase">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Shapes, cut-outs, a radius, or say you’ll send a drawing"
            className={cn(input, "mt-3 h-auto py-3")}
          />
        </label>
      </div>

      <aside className="h-fit rounded-[28px] bg-teal-900 p-6 text-white sm:p-8 lg:sticky lg:top-28">
        <span className="label-bar bg-white px-2 py-0.5 text-[12px] text-ink">Your quote request</span>
        <dl className="mt-6 space-y-3 text-[15px]">
          {[
            ["Pieces", `${qty} × ${w || "—"} × ${h || "—"} mm`],
            ["Glass", `${material}`],
            ["Spec", `${thickness} · ${tint}`],
            ["Edges", edge],
            ["Delivery", fulfil],
            ["Area", sqm ? `${sqm.toFixed(2)} m²` : "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-white/60">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[13px] leading-relaxed text-white/60">
          Every piece is made to order, so we price it by hand and reply the same working day. Quotes are free.
        </p>
        <div className="mt-6 flex flex-col gap-3 [--glass-ink:#fff] [--glass-light:#063f37]">
          {ready ? (
            <ActionButton href={wa} target="_blank" rel="noreferrer">
              <WhatsAppIcon /> Send on WhatsApp
            </ActionButton>
          ) : (
            <p className="rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white/80">Add a width, a height and your name to send.</p>
          )}
          {ready && (
            <GlassButton href={mail} size="sm">
              Or send by email
            </GlassButton>
          )}
        </div>
      </aside>
    </div>
  );
}

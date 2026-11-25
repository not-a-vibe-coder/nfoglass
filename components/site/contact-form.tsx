"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { ActionButton } from "@/components/ui/button-4";
import { CONTACT } from "@/lib/site";

const input = "h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[15px] outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff,.dxf,.dwg,.skf,.doc,.docx,.xls,.xlsx";

// The enquiry form from the old Contact page. With no mail server behind the site yet it opens
// the visitor's email app with everything filled in; a drawing has to be attached there.
export function ContactForm() {
  const [file, setFile] = useState<string>("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const body = [
      `Name: ${get("name")}`,
      get("company") && `Company: ${get("company")}`,
      `Phone: ${get("phone")}`,
      `Address: ${[get("address"), get("city"), get("state")].filter(Boolean).join(", ")}`,
      "",
      get("message"),
      file ? `\n(I'll attach my drawing: ${file})` : "",
    ]
      .filter((x): x is string => typeof x === "string")
      .join("\n");
    window.location.href = `mailto:${CONTACT.emails.info}?subject=${encodeURIComponent(`Enquiry from ${get("name")}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[28px] border border-ink/10 bg-white p-6 sm:grid-cols-2 sm:p-8">
      <input name="name" required placeholder="Name *" autoComplete="name" className={input} />
      <input name="company" placeholder="Company" autoComplete="organization" className={input} />
      <input name="phone" required placeholder="Phone *" type="tel" autoComplete="tel" className={input} />
      <input name="email" required placeholder="Email *" type="email" autoComplete="email" className={input} />
      <input name="address" placeholder="Address" autoComplete="street-address" className={`${input} sm:col-span-2`} />
      <input name="city" placeholder="City" autoComplete="address-level2" className={input} />
      <input name="state" placeholder="State" autoComplete="address-level1" className={input} />
      <textarea name="message" required rows={5} placeholder="Message *" className={`${input} h-auto py-3 sm:col-span-2`} />
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink/25 px-4 py-4 text-[14px] text-ink/70 hover:border-teal-600 sm:col-span-2">
        <Paperclip className="size-5 text-teal-700" />
        <span className="flex-1">{file || "Attach a drawing (pdf, jpg, dxf, dwg, doc, xls…)"}</span>
        <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
      </label>
      {file && <p className="text-[13px] text-ink/60 sm:col-span-2">Your email app will open. Attach {file} there before sending.</p>}
      <div className="sm:col-span-2">
        <ActionButton type="submit" tone="solid">
          Send enquiry
        </ActionButton>
      </div>
    </form>
  );
}

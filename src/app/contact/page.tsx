"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { RiMailLine, RiPhoneLine } from "react-icons/ri";
import { toast } from "sonner";
import { api, ApiRequestError } from "@/lib/api";

gsap.registerPlugin(useGSAP);

const DETAILS = [
  { href: "tel:+13108629113", label: "+1 310-862-9113", icon: RiPhoneLine },
  { href: "mailto:so.caltrucktrade@gmail.com", label: "so.caltrucktrade@gmail.com", icon: RiMailLine },
] as const;

export default function ContactPage() {
  const pageRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const bits = page.querySelectorAll("[data-contact]");
      const cta = ctaRef.current;
      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(bits, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" });
      if (!cta) return;
      const enter = () =>
        gsap.to(cta, { scale: 1.04, filter: "brightness(1.08)", duration: 0.22, ease: "power2.out", overwrite: "auto" });
      const leave = () =>
        gsap.to(cta, { scale: 1, filter: "brightness(1)", duration: 0.22, ease: "power2.out", overwrite: "auto" });
      cta.addEventListener("mouseenter", enter);
      cta.addEventListener("mouseleave", leave);
      return () => {
        cta.removeEventListener("mouseenter", enter);
        cta.removeEventListener("mouseleave", leave);
      };
    },
    { scope: pageRef, dependencies: [sent] },
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.phone || !isPossiblePhoneNumber(form.phone)) {
      toast.error("Enter a valid phone number for the selected country.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSent(true);
      toast.success("Message sent. We will get back to you.");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not send your message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main ref={pageRef} className="bg-brand/8 pb-16 sm:pb-20 lg:pb-24">
      <div className="container-site pt-10 sm:pt-12 lg:pt-14">
        <div data-contact className="text-center">
          <h1 className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]">
            Contact Us
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-black/60 sm:text-base">
            Tell us what you need. We will follow up by phone or email.
          </p>
        </div>

        <div
          data-contact
          className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2"
        >
          {DETAILS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-4 text-sm font-semibold text-white sm:text-base"
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </a>
          ))}
        </div>

        <div
          data-contact
          className="mt-6 rounded-2xl bg-brand p-4 shadow-[0_16px_0_0_var(--color-brand-red)] sm:mt-8 sm:p-6 lg:p-8"
        >
          <div className="rounded-xl bg-white p-4 sm:p-6 lg:p-8">
            {sent ? (
              <div className="py-8 text-center sm:py-12">
                <h2 className="font-heading text-[clamp(1.5rem,4vw,36px)] uppercase tracking-[0.04em] text-black">
                  Message sent
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-black/60 sm:text-base">
                  We have your message and will reply at {form.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Field label="Full name">
                  <input
                    required
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    placeholder="Full name"
                    className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40 sm:text-[15px]"
                  />
                </Field>
                <Field label="Email">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="Email"
                    className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40 sm:text-[15px]"
                  />
                </Field>
                <Field label="Phone" className="sm:col-span-2">
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value || "" })}
                    className="phone-input !border-0 !bg-transparent !p-0"
                  />
                </Field>
                <Field label="Message" className="sm:col-span-2">
                  <textarea
                    required
                    minLength={10}
                    rows={5}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="How can we help?"
                    className="w-full resize-y bg-transparent text-sm text-black outline-none placeholder:text-black/40 sm:text-[15px]"
                  />
                </Field>
                <div className="flex justify-center sm:col-span-2 sm:pt-2">
                  <button
                    ref={ctaRef}
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-w-[180px] cursor-pointer items-center justify-center rounded-[8px] bg-brand-red px-8 py-3.5 text-sm font-semibold text-white sm:text-base"
                  >
                    {submitting ? "Sending..." : "Send message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-brand uppercase">{label}</span>
      <span className="block rounded-lg border border-brand/30 bg-white px-4 py-3.5 shadow-xs transition-[box-shadow,border-color] duration-200 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/20">
        {children}
      </span>
    </label>
  );
}

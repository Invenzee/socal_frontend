"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiHeartFill, RiHeartLine, RiMailSendFill, RiPhoneFill } from "react-icons/ri";
import { toast } from "sonner";
import { api, ApiRequestError, formatMileage, formatPrice } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useAuthDialog } from "@/providers/auth-dialog-provider";
import type { Listing } from "@/types/api";

gsap.registerPlugin(useGSAP);

export default function ListingDetailView({ listing }: { listing: Listing }) {
  const pageRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { requestAuth } = useAuthDialog();
  const [phone, setPhone] = useState(listing.contactPhone);
  const [saved, setSaved] = useState(false);

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const gallery = page.querySelector("[data-detail-gallery]");
      const content = page.querySelector("[data-detail-content]");
      const aside = page.querySelector("[data-detail-aside]");
      if (reduced) {
        gsap.set([gallery, content, aside], { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.set(gallery, { autoAlpha: 0, y: 24 });
      gsap.set(content, { autoAlpha: 0, y: 28 });
      gsap.set(aside, { autoAlpha: 0, y: 28 });
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.to(gallery, { autoAlpha: 1, y: 0, duration: 0.7 });
      intro.to(content, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.15);
      intro.to(aside, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.22);
    },
    { scope: pageRef },
  );

  useEffect(() => {
    const onResume = (event: Event) => {
      const pending = (event as CustomEvent).detail as { type: string; listingId: string };
      if (pending.listingId !== listing.id) return;
      if (pending.type === "reveal") void revealPhone();
      if (pending.type === "chat") void startChat();
      if (pending.type === "favorite") void toggleFavorite();
    };
    window.addEventListener("socal:auth-resume", onResume);
    return () => window.removeEventListener("socal:auth-resume", onResume);
  });

  function ensureReady(action: "reveal" | "chat" | "favorite") {
    if (!user) {
      requestAuth({ type: action, listingId: listing.id });
      return false;
    }
    if (!user.emailVerified) {
      requestAuth({ type: action, listingId: listing.id });
      return false;
    }
    return true;
  }

  async function revealPhone() {
    if (!ensureReady("reveal")) return;
    try {
      const data = await api<{ phone: string }>(`/listings/${listing.id}/reveal-phone`, { method: "POST" });
      setPhone(data.phone);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not reveal number.");
    }
  }

  async function startChat() {
    if (!ensureReady("chat")) return;
    try {
      const data = await api<{ item: { id: string } }>("/conversations", {
        method: "POST",
        body: JSON.stringify({ listingId: listing.id }),
      });
      router.push(`/dashboard/messages/${data.item.id}`);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not start chat.");
    }
  }

  async function toggleFavorite() {
    if (!ensureReady("favorite")) return;
    try {
      if (saved) {
        await api(`/favorites/${listing.id}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await api(`/favorites/${listing.id}`, { method: "POST" });
        setSaved(true);
      }
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not update saved listing.");
    }
  }

  const images = listing.images.length
    ? listing.images
    : [{ url: "/placeholder.svg", publicId: "placeholder", isPrimary: true }];
  const main = images[0];
  const rest = images.slice(1, 3);
  const description = listing.description.split(/\n+/).filter(Boolean);
  const specs = [
    { label: "Make", value: listing.make?.name },
    { label: "Model", value: listing.model?.name },
    { label: "Exterior Color", value: listing.exteriorColor },
    { label: "Interior Color", value: listing.interiorColor },
    { label: "Transmission", value: listing.transmission?.name },
    { label: "Condition", value: listing.condition?.name },
    { label: "Model Year", value: String(listing.year) },
    { label: "Fuel Type", value: listing.fuel?.name },
    { label: "Odometer", value: formatMileage(listing.mileage) },
    { label: "Doors", value: listing.doors },
    { label: "Torque", value: listing.torque },
    { label: "Engine", value: listing.engine },
    { label: "Drive Train", value: listing.driveTrain },
    { label: "Horse Power", value: listing.horsePower },
    { label: "Top Speed", value: listing.topSpeed },
    { label: "VIN", value: listing.vin },
  ].filter((item) => item.value);

  return (
    <main ref={pageRef} className="bg-neutral-100 pb-16 sm:pb-20 lg:pb-24">
      <div className="container-site pt-8 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-medium uppercase tracking-[0.08em] sm:mb-8">
          <Link href="/" className="text-brand-red hover:underline">Home</Link>
          <span className="text-brand-red"> / </span>
          <Link href="/listings" className="text-brand-red hover:underline">Truck Listing</Link>
          <span className="text-black"> / </span>
          <span className="text-black">{listing.title}</span>
        </nav>

        <div data-detail-gallery className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-neutral-200 sm:aspect-[16/9] lg:aspect-auto lg:min-h-[420px]">
            <Image src={main.url} alt={`${listing.title} main view`} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
            {rest.concat(rest.length ? [] : images).slice(0, 2).map((image, index) => (
              <div key={image.publicId + index} className="relative aspect-[16/10] overflow-hidden rounded-lg bg-neutral-200 lg:aspect-auto lg:min-h-[200px]">
                <Image src={image.url} alt={`${listing.title} ${index}`} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <div data-detail-content className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="inline-block text-[clamp(1.75rem,4vw,2.35rem)] font-bold leading-tight text-black">
                  {listing.title}
                  <span className="mt-1 block h-[3px] w-full rounded-full bg-brand" />
                </h1>
                <p className="mt-2 text-sm text-black/50 sm:text-base">
                  {listing.year} {listing.category?.name} {listing.fuel?.name}
                </p>
                <p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-bold text-brand">{formatPrice(listing.price)}</p>
              </div>
              <button type="button" onClick={() => void toggleFavorite()} className="rounded-full bg-white p-3 text-brand-red shadow-sm" aria-label="Save listing">
                {saved ? <RiHeartFill className="size-5" /> : <RiHeartLine className="size-5" />}
              </button>
            </div>

            <h2 className="mt-8 text-lg font-semibold text-black sm:mt-10 sm:text-xl">Description</h2>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-black/70 sm:text-[15px]">
              {description.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-semibold text-black sm:mt-10 sm:text-xl">Features</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listing.features.map((feature) => (
                <li key={feature.id} className="rounded-lg bg-white px-4 py-3 text-center text-sm text-black/70 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>

          <aside data-detail-aside className="flex flex-col gap-3 lg:pt-1">
            <button
              type="button"
              onClick={() => void revealPhone()}
              className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-brand px-5 py-3.5 text-sm font-semibold text-white transition-[filter,transform] duration-200 hover:brightness-110 sm:text-base"
            >
              <RiPhoneFill className="size-5" />
              {phone || "View Number"}
            </button>
            <button
              type="button"
              onClick={() => void startChat()}
              className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-brand px-5 py-3.5 text-sm font-semibold text-white transition-[filter,transform] duration-200 hover:brightness-110 sm:text-base"
            >
              <RiMailSendFill className="size-5" />
              Chat with seller
            </button>
            <div className="mt-2 rounded-xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-6">
              <dl className="space-y-2.5 text-sm text-black/75 sm:text-[15px]">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex flex-wrap gap-x-1">
                    <dt className="font-medium text-black/80">{spec.label}&nbsp;:</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

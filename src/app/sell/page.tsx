"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiArrowDownSLine, RiUploadCloud2Line } from "react-icons/ri";
import { toast } from "sonner";
import { api, ApiRequestError } from "@/lib/api";
import { uploadListingImage } from "@/lib/cloudinary";
import { useAuth } from "@/providers/auth-provider";
import type { ListingImage, TaxonomyItem } from "@/types/api";

gsap.registerPlugin(useGSAP);

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
] as const;

function FieldShell({ children, active = false, className = "" }: { children: React.ReactNode; active?: boolean; className?: string }) {
  return (
    <div className={`rounded-lg bg-white px-4 py-3.5 transition-[box-shadow,border-color] duration-200 ${active ? "border border-brand shadow-[0_0_0_1px_rgba(1,75,173,0.2)]" : "border border-transparent"} ${className}`}>
      {children}
    </div>
  );
}

function TextInput({ placeholder, value, onChange, type = "text", active = false }: { placeholder: string; value: string; onChange: (value: string) => void; type?: string; active?: boolean }) {
  return (
    <FieldShell active={active}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35 sm:text-[15px]" />
    </FieldShell>
  );
}

function SelectInput({ placeholder, value, onChange, options, active = false }: { placeholder: string; value: string; onChange: (value: string) => void; options: Array<{ id: string; name: string }>; active?: boolean }) {
  return (
    <FieldShell active={active} className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full appearance-none bg-transparent pr-8 text-sm outline-none sm:text-[15px] ${value ? "text-black" : "text-black/35"}`}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id} className="text-black">{option.name}</option>
        ))}
      </select>
      <RiArrowDownSLine className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-black/35" />
    </FieldShell>
  );
}

export default function SellPage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const pageRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taxonomy, setTaxonomy] = useState<{
    makes: TaxonomyItem[];
    features: TaxonomyItem[];
    conditions: TaxonomyItem[];
    categories: TaxonomyItem[];
    fuels: TaxonomyItem[];
    transmissions: TaxonomyItem[];
  }>({ makes: [], features: [], conditions: [], categories: [], fuels: [], transmissions: [] });
  const [models, setModels] = useState<TaxonomyItem[]>([]);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    year: "",
    price: "",
    licensePlate: "",
    state: "",
    mileage: "",
    vin: "",
    make: "",
    model: "",
    features: [] as string[],
    condition: "",
    category: "",
    fuel: "",
    transmission: "",
    exteriorColor: "",
    description: "",
  });

  const setField = (key: keyof typeof form, value: string | string[]) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    void api<{ makes: TaxonomyItem[]; features: TaxonomyItem[]; conditions: TaxonomyItem[]; categories: TaxonomyItem[]; fuels: TaxonomyItem[]; transmissions: TaxonomyItem[] }>("/taxonomy/all")
      .then(setTaxonomy)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!form.make) {
      setModels([]);
      return;
    }
    void api<{ items: TaxonomyItem[] }>(`/taxonomy/makes/${form.make}/models`)
      .then((data) => setModels(data.items))
      .catch(() => setModels([]));
  }, [form.make]);

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heading = page.querySelector("[data-sell-heading]");
      const fields = page.querySelector("[data-sell-fields]");
      const extras = page.querySelector("[data-sell-extras]");
      if (reduced) {
        gsap.set([heading, fields, extras], { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo([heading, fields, extras], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power3.out" });
    },
    { scope: pageRef },
  );

  async function becomeSeller() {
    try {
      const updated = await api<{ user: NonNullable<typeof user> }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ role: "seller" }),
      });
      setUser(updated.user);
      toast.success("You can now list vehicles.");
    } catch {
      toast.error("Could not switch to seller.");
    }
  }

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = Array.from(list).filter((file) => ["image/jpeg", "image/png"].includes(file.type)).slice(0, 8 - images.length);
    for (const file of next) {
      try {
        const uploaded = await uploadListingImage(file, setProgress);
        setImages((prev) => [...prev, { ...uploaded, isPrimary: prev.length === 0 }].slice(0, 8));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    }
    setProgress(0);
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      router.push("/login?next=/sell");
      return;
    }
    if (user.role === "buyer") {
      toast.error("Switch to a seller account to list a vehicle.");
      return;
    }
    if (!user.emailVerified) {
      router.push("/verify-email?next=/sell");
      return;
    }
    setSubmitting(true);
    try {
      await api("/listings", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          year: Number(form.year),
          mileage: Number(form.mileage),
          price: Number(form.price),
          make: form.make,
          model: form.model,
          category: form.category,
          condition: form.condition,
          fuel: form.fuel,
          transmission: form.transmission,
          features: form.features,
          exteriorColor: form.exteriorColor,
          vin: form.vin,
          licensePlate: form.licensePlate,
          state: form.state,
          images,
        }),
      });
      toast.success("Listing submitted for admin review.");
      router.push("/dashboard/listings");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not submit listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="container-site py-20 text-sm text-black/55">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="container-site py-20 text-center">
        <h1 className="font-heading text-[clamp(1.75rem,6vw,50px)] text-black">Sign in to list your vehicle</h1>
        <p className="mt-3 text-black/60">Sellers need an account before filling out the listing form.</p>
        <a href="/login?next=/sell" className="mt-6 inline-flex rounded-lg bg-brand px-6 py-3 font-semibold text-white">Log in</a>
        <a href="/register?role=seller&next=/sell" className="mt-3 ml-3 inline-flex rounded-lg bg-brand-red px-6 py-3 font-semibold text-white">Create seller account</a>
      </main>
    );
  }

  if (!user.emailVerified) {
    return (
      <main className="container-site py-20 text-center">
        <h1 className="font-heading text-[clamp(1.75rem,6vw,50px)] text-black">Verify your email</h1>
        <p className="mt-3 text-black/60">You need a verified email before submitting a listing.</p>
        <a href="/verify-email?next=/sell" className="mt-6 inline-flex rounded-lg bg-brand px-6 py-3 font-semibold text-white">Verify email</a>
      </main>
    );
  }

  if (user.role === "buyer") {
    return (
      <main className="container-site py-20 text-center">
        <h1 className="font-heading text-[clamp(1.75rem,6vw,50px)] text-black">Become a seller</h1>
        <p className="mt-3 text-black/60">Your account is currently a buyer account. Switch to seller to list a vehicle.</p>
        <button type="button" onClick={() => void becomeSeller()} className="mt-6 inline-flex rounded-lg bg-brand px-6 py-3 font-semibold text-white">
          Continue as seller
        </button>
      </main>
    );
  }

  return (
    <main ref={pageRef} className="bg-neutral-100 pb-16 sm:pb-20 lg:pb-24">
      <div className="container-site pt-10 sm:pt-12 lg:pt-14">
        <form onSubmit={onSubmit}>
          <h1 data-sell-heading className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.5rem,5vw,42px)]">
            Tell Us About Your Vehicle
          </h1>
          <div data-sell-fields className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            <TextInput placeholder="Truck Name" value={form.title} onChange={(v) => setField("title", v)} />
            <TextInput placeholder="Year" value={form.year} onChange={(v) => setField("year", v)} />
            <TextInput placeholder="Price" value={form.price} onChange={(v) => setField("price", v)} />
            <TextInput placeholder="License Plate#" value={form.licensePlate} onChange={(v) => setField("licensePlate", v)} />
            <SelectInput placeholder="State" value={form.state} onChange={(v) => setField("state", v)} options={US_STATES.map((name) => ({ id: name, name }))} />
            <TextInput placeholder="Mileage" value={form.mileage} onChange={(v) => setField("mileage", v)} />
            <TextInput placeholder="VIN#" value={form.vin} onChange={(v) => setField("vin", v)} />
            <SelectInput placeholder="Make" value={form.make} onChange={(v) => { setField("make", v); setField("model", ""); }} options={taxonomy.makes} active />
            <SelectInput placeholder="Model" value={form.model} onChange={(v) => setField("model", v)} options={models} active />
            <SelectInput placeholder="Category" value={form.category} onChange={(v) => setField("category", v)} options={taxonomy.categories} />
            <SelectInput placeholder="Condition" value={form.condition} onChange={(v) => setField("condition", v)} options={taxonomy.conditions} />
            <SelectInput placeholder="Fuel" value={form.fuel} onChange={(v) => setField("fuel", v)} options={taxonomy.fuels} />
            <SelectInput placeholder="Transmission" value={form.transmission} onChange={(v) => setField("transmission", v)} options={taxonomy.transmissions} />
            <TextInput placeholder="Color" value={form.exteriorColor} onChange={(v) => setField("exteriorColor", v)} />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-black/80">Features</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {taxonomy.features.map((feature) => {
                const on = form.features.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() =>
                      setField(
                        "features",
                        on ? form.features.filter((id) => id !== feature.id) : [...form.features, feature.id],
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-brand text-white" : "bg-white text-black"}`}
                  >
                    {feature.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div data-sell-extras className="mt-8 sm:mt-10">
            <label className="text-sm font-medium text-black/80">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Description"
              rows={5}
              className="mt-2 w-full resize-y rounded-lg border border-black/8 bg-white px-4 py-3.5 text-sm text-black outline-none placeholder:text-black/35 focus:border-brand sm:text-[15px]"
            />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onFiles(e.dataTransfer.files);
              }}
              className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 bg-white px-6 py-10 text-center sm:py-12"
            >
              <RiUploadCloud2Line className="size-10 text-black/45" />
              <p className="mt-3 text-sm font-semibold text-black/75 sm:text-base">Choose a file or drag & drop it here</p>
              <p className="mt-1 text-xs text-black/45 sm:text-sm">JPEG and PNG formats, up to 8 images</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-lg border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-black/70">
                Browse File
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
              {progress > 0 ? <p className="mt-3 text-sm text-brand">Uploading {progress}%</p> : null}
              {images.length > 0 ? (
                <ul className="mt-4 grid w-full max-w-md grid-cols-4 gap-2">
                  {images.map((image) => (
                    <li key={image.publicId} className="relative aspect-square overflow-hidden rounded-md bg-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt="" className="size-full object-cover" />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="mt-8 flex justify-center sm:mt-10">
              <button type="submit" disabled={submitting} className="inline-flex min-w-[180px] items-center justify-center rounded-lg bg-brand-red px-8 py-3.5 text-sm font-semibold text-white hover:brightness-110 sm:text-base">
                {submitting ? "Submitting..." : "Submit listing"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

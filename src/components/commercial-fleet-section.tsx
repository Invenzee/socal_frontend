import Image from "next/image";
import Link from "next/link";

const FLEET_TYPES = [
  {
    title: "Utility & service trucks",
    description: "Find the setup that works for your crew and your next job.",
    imageSrc: "/ram-utility-bed.webp",
    imageAlt: "White Ram utility bed truck with a ladder rack",
    terms: [
      "Plumber truck",
      "Plumber van",
      "Utility bed",
      "Utility truck",
      "Work truck",
      "Lifted truck",
      "Contractor truck",
      "Welding truck",
    ],
  },
  {
    title: "Construction & hauling",
    description: "Make room for the vehicles that keep your business moving.",
    imageSrc: "/ram-commercial-hauler.webp",
    imageAlt: "White Ram commercial truck with a large container body",
    terms: [
      "Construction truck",
      "Cargo van",
      "Water truck",
      "Chipper truck",
      "Dump truck",
    ],
  },
] as const;

const MODEL_GROUPS = [
  {
    title: "Ford",
    models: "F150 · F250 · F350 · F450 · F550 · F650",
    trims: "Lariat · Platinum · King Ranch · Raptor",
  },
  {
    title: "Ram",
    models: "Ram 1500 · 2500 · 3500 · 4500 · 5500",
    trims: "Laramie · TRX",
  },
  {
    title: "Chevy & GMC",
    models: "Chevy GMC 1500 · 2500 · 3500",
    trims: "Denali",
  },
] as const;

export default function CommercialFleetSection() {
  return (
    <section className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-red">
            Commercial fleet
          </p>
          <h2 className="mt-3 font-heading text-[clamp(1.75rem,6vw,50px)] uppercase leading-[1.1] tracking-[0.04em] text-black">
            Trucks for every trade
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-black/70 sm:text-base">
            Downsizing your fleet? Explore or list commercial vehicles,
            including 2016 and above models, service bodies, work trucks, and
            cargo vans.
          </p>
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:mt-12">
          {FLEET_TYPES.map((type) => (
            <article
              key={type.title}
              className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                <Image
                  src={type.imageSrc}
                  alt={type.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-heading text-xl uppercase tracking-[0.03em] text-black sm:text-2xl">
                  {type.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65 sm:text-base">
                  {type.description}
                </p>
                <ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
                  {type.terms.map((term) => (
                    <li
                      key={term}
                      className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand sm:text-sm"
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-black/10 bg-white p-6 sm:p-8">
          <h3 className="font-heading text-xl uppercase tracking-[0.03em] text-black sm:text-2xl">
            Popular models &amp; trims
          </h3>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {MODEL_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold text-brand">{group.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-black/70">
                  {group.models}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-black/60">
                  {group.trims}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-black/10 pt-5 text-sm text-black/70">
            Rear wheel setups: Dually · Dual rear wheel · Single rear wheel
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white sm:text-base"
          >
            Sell your commercial trucks!
          </Link>
          <Link
            href="/listings"
            className="inline-flex items-center justify-center rounded-lg border-2 border-brand px-6 py-3 text-sm font-semibold text-brand sm:text-base"
          >
            Browse listings
          </Link>
        </div>
      </div>
    </section>
  );
}

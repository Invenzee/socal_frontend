import Link from "next/link";
import { Suspense } from "react";
import { apiServer } from "@/lib/api";
import ListingsBrowse from "@/components/listings/listings-browse";
import type { Listing, PaginationMeta, TaxonomyItem } from "@/types/api";

function toQuery(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    params.set(key, Array.isArray(value) ? value.join(",") : value);
  });
  return params.toString();
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = toQuery(sp);

  let items: Listing[] = [];
  let meta: PaginationMeta = { total: 0, page: 1, limit: 12, totalPages: 1 };
  let taxonomy = {
    makes: [] as TaxonomyItem[],
    conditions: [] as TaxonomyItem[],
    categories: [] as TaxonomyItem[],
    fuels: [] as TaxonomyItem[],
    transmissions: [] as TaxonomyItem[],
  };

  try {
    const [list, tax] = await Promise.all([
      apiServer<{ items: Listing[]; meta: PaginationMeta }>(`/listings?${query}`),
      apiServer<typeof taxonomy>("/taxonomy/all"),
    ]);
    items = list.items;
    meta = list.meta;
    taxonomy = tax;
  } catch {
    /* backend may be offline during first paint */
  }

  return (
    <main className="bg-neutral-100 pb-16 sm:pb-20 lg:pb-24">
      <div className="container-site pt-8 sm:pt-10">
        <nav aria-label="Breadcrumb" className="text-xs font-medium uppercase tracking-[0.08em]">
          <Link href="/" className="text-brand-red hover:underline">Home</Link>
          <span className="text-brand-red"> / </span>
          <span className="text-black">Truck Listing</span>
        </nav>
        <Suspense fallback={<p className="mt-8 text-sm text-black/50">Loading listings...</p>}>
          <ListingsBrowse items={items} meta={meta} taxonomy={taxonomy} />
        </Suspense>
      </div>
    </main>
  );
}

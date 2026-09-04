import { notFound } from "next/navigation";
import ListingDetailView from "@/components/listings/listing-detail-view";
import { apiServer } from "@/lib/api";
import type { Listing } from "@/types/api";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  try {
    const data = await apiServer<{ item: Listing }>(`/listings/${id}`);
    return <ListingDetailView listing={data.item} />;
  } catch {
    notFound();
  }
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiArrowRightLine,
  RiCarLine,
  RiChat3Line,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiGroupLine,
  RiHeartLine,
  RiInboxLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiShieldUserLine,
  RiTimeLine,
  RiUserStarLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import Panel from "@/components/dashboard/panel";
import StatCard from "@/components/dashboard/stat-card";
import StatusPill from "@/components/dashboard/status-pill";
import RowThumb from "@/components/dashboard/row-thumb";
import EmptyState from "@/components/dashboard/empty-state";
import { DashLinkButton } from "@/components/dashboard/dash-button";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AdminStats, Conversation, Listing, PaginationMeta } from "@/types/api";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function today() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function primaryImage(listing: Listing) {
  return listing.images?.find((image) => image.isPrimary)?.url || listing.images?.[0]?.url || null;
}

function Bar({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-black/70">{label}</span>
        <span className="text-black/45 tabular-nums">
          <span className="font-semibold text-black">{value}</span> · {percent}%
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand/8">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [saved, setSaved] = useState<Listing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      void api<AdminStats>("/admin/stats").then(setStats).catch(() => undefined);
      void api<{ items: Listing[]; meta: PaginationMeta }>("/admin/listings?status=pending&limit=5")
        .then((data) => setPending(data.items))
        .catch(() => undefined);
    }

    if (user.role === "seller") {
      void api<{ items: Listing[]; meta: PaginationMeta }>("/listings/mine?limit=48")
        .then((data) => setMyListings(data.items))
        .catch(() => undefined);
      void api<{ items: unknown[]; meta: PaginationMeta }>("/listings/leads?limit=1")
        .then((data) => setLeadCount(data.meta.total))
        .catch(() => undefined);
    }

    if (user.role === "buyer") {
      void api<{ items: Array<{ listing: Listing }> }>("/favorites")
        .then((data) => setSaved(data.items.map((item) => item.listing).filter(Boolean)))
        .catch(() => undefined);
    }

    void api<{ items: Conversation[] }>("/conversations")
      .then((data) => setConversations(data.items))
      .catch(() => undefined);
  }, [user]);

  const sellerStats = useMemo(() => {
    const approved = myListings.filter((item) => item.status === "approved").length;
    const pendingCount = myListings.filter((item) => item.status === "pending").length;
    const views = myListings.reduce((sum, item) => sum + (item.views || 0), 0);
    return { total: myListings.length, approved, pending: pendingCount, views };
  }, [myListings]);

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, item) => sum + (item.unread || 0), 0),
    [conversations],
  );

  if (!user) return null;

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={today()}
        title={`${greeting()}, ${firstName}`}
        description={
          user.role === "admin"
            ? "Marketplace health, moderation queue and member activity at a glance."
            : user.role === "seller"
              ? "Track how your trucks are performing and reply to buyers faster."
              : "Pick up where you left off — saved trucks and seller conversations."
        }
        actions={
          user.role === "seller" ? (
            <DashLinkButton href="/sell" variant="onBrand" icon={<RiAddLine className="text-base" />}>
              New listing
            </DashLinkButton>
          ) : user.role === "admin" ? (
            <DashLinkButton
              href="/dashboard/admin/moderation"
              variant="onBrand"
              icon={<RiShieldCheckLine className="text-base" />}
            >
              Review queue
            </DashLinkButton>
          ) : (
            <DashLinkButton href="/listings" variant="onBrand" icon={<RiSearchLine className="text-base" />}>
              Browse trucks
            </DashLinkButton>
          )
        }
      />

      {user.role === "admin" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Members"
              value={stats?.users ?? 0}
              icon={<RiGroupLine />}
              tone="brand"
              href="/dashboard/admin/users"
              linkLabel="Manage users"
            />
            <StatCard
              label="Awaiting review"
              value={stats?.pending ?? 0}
              icon={<RiTimeLine />}
              tone="red"
              href="/dashboard/admin/moderation"
              linkLabel="Open queue"
            />
            <StatCard label="Live listings" value={stats?.approved ?? 0} icon={<RiCheckboxCircleLine />} />
            <StatCard label="Total leads" value={stats?.leads ?? 0} icon={<RiUserStarLine />} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
            <Panel
              title="Listing pipeline"
              description={`${stats?.listings ?? 0} listings in total`}
              icon={<RiCarLine />}
            >
              <div className="space-y-4">
                <Bar label="Approved" value={stats?.approved ?? 0} total={stats?.listings ?? 0} tone="bg-brand" />
                <Bar label="Pending" value={stats?.pending ?? 0} total={stats?.listings ?? 0} tone="bg-amber-500" />
                <Bar
                  label="Other (draft, rejected, sold)"
                  value={Math.max((stats?.listings ?? 0) - (stats?.approved ?? 0) - (stats?.pending ?? 0), 0)}
                  total={stats?.listings ?? 0}
                  tone="bg-brand-red"
                />
                <div className="grid grid-cols-2 gap-3 border-t border-brand/10 pt-4">
                  <div className="rounded-xl bg-brand/6 p-3">
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">Conversations</p>
                    <p className="mt-1 text-2xl font-semibold text-black tabular-nums">{stats?.conversations ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-brand-red/6 p-3">
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-red uppercase">Listings</p>
                    <p className="mt-1 text-2xl font-semibold text-black tabular-nums">{stats?.listings ?? 0}</p>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="Moderation queue"
              description="Newest submissions waiting on a decision"
              icon={<RiShieldCheckLine />}
              action={
                <Link
                  href="/dashboard/admin/moderation"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-red"
                >
                  View all <RiArrowRightLine />
                </Link>
              }
              bodyClassName="divide-y divide-black/5"
            >
              {pending.length === 0 ? (
                <EmptyState
                  icon={<RiCheckboxCircleLine />}
                  title="Queue is clear"
                  description="Every submitted listing has been reviewed."
                />
              ) : (
                pending.map((item) => (
                  <Link
                    key={item.id}
                    href="/dashboard/admin/moderation"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand/4 sm:px-5"
                  >
                    <RowThumb name={item.title} monogram={item.make?.name} src={primaryImage(item)} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-black">{item.title}</p>
                      <p className="truncate text-xs text-black/45">
                        {item.year} · {formatPrice(item.price)} · {item.seller?.fullName || "Unknown seller"}
                      </p>
                    </div>
                    <StatusPill status={item.status} />
                  </Link>
                ))
              )}
            </Panel>
          </div>
        </>
      ) : null}

      {user.role === "seller" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="My listings"
              value={sellerStats.total}
              icon={<RiCarLine />}
              tone="brand"
              href="/dashboard/listings"
              linkLabel="Manage listings"
            />
            <StatCard label="Live" value={sellerStats.approved} icon={<RiCheckboxCircleLine />} />
            <StatCard label="In review" value={sellerStats.pending} icon={<RiTimeLine />} />
            <StatCard
              label="Leads"
              value={leadCount}
              icon={<RiUserStarLine />}
              tone="red"
              href="/dashboard/leads"
              linkLabel="See leads"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Panel
              title="Recent listings"
              description="Your five most recently created trucks"
              icon={<RiCarLine />}
              action={
                <Link
                  href="/dashboard/listings"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-red"
                >
                  View all <RiArrowRightLine />
                </Link>
              }
              bodyClassName="divide-y divide-black/5"
            >
              {myListings.length === 0 ? (
                <EmptyState
                  icon={<RiCarLine />}
                  title="No listings yet"
                  description="Publish your first truck and start collecting buyer leads."
                  action={
                    <DashLinkButton href="/sell" icon={<RiAddLine className="text-base" />}>
                      Create listing
                    </DashLinkButton>
                  }
                />
              ) : (
                myListings.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand/4 sm:px-5"
                  >
                    <RowThumb name={item.title} monogram={item.make?.name} src={primaryImage(item)} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-black">{item.title}</p>
                      <p className="truncate text-xs text-black/45">
                        {formatPrice(item.price)} · {item.views} views
                      </p>
                    </div>
                    <StatusPill status={item.status} />
                  </Link>
                ))
              )}
            </Panel>

            <div className="grid gap-5">
              <Panel title="Total views" description="Across your listings" icon={<RiEyeLine />}>
                <p className="font-heading text-4xl text-brand tabular-nums">
                  {sellerStats.views.toLocaleString("en-US")}
                </p>
                <p className="mt-2 text-sm text-black/50">
                  Listings with clear photos and complete specs get materially more buyer views.
                </p>
              </Panel>
              <Panel title="Inbox" description="Buyer conversations" icon={<RiChat3Line />}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading text-4xl text-brand tabular-nums">{conversations.length}</p>
                    <p className="mt-1 text-sm text-black/50">
                      {unreadTotal > 0 ? `${unreadTotal} unread` : "All caught up"}
                    </p>
                  </div>
                  <DashLinkButton href="/dashboard/messages" variant="red" icon={<RiChat3Line className="text-base" />}>
                    Open inbox
                  </DashLinkButton>
                </div>
              </Panel>
            </div>
          </div>
        </>
      ) : null}

      {user.role === "buyer" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Saved trucks"
              value={saved.length}
              icon={<RiHeartLine />}
              tone="red"
              href="/dashboard/saved"
              linkLabel="View saved"
            />
            <StatCard
              label="Conversations"
              value={conversations.length}
              icon={<RiChat3Line />}
              tone="brand"
              href="/dashboard/messages"
              linkLabel="Open inbox"
            />
            <StatCard label="Unread messages" value={unreadTotal} icon={<RiInboxLine />} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Panel
              title="Recently saved"
              description="Trucks you bookmarked"
              icon={<RiHeartLine />}
              action={
                <Link
                  href="/dashboard/saved"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-red"
                >
                  View all <RiArrowRightLine />
                </Link>
              }
              bodyClassName="divide-y divide-black/5"
            >
              {saved.length === 0 ? (
                <EmptyState
                  icon={<RiHeartLine />}
                  title="Nothing saved yet"
                  description="Tap the heart on any listing to keep it here."
                  action={
                    <DashLinkButton href="/listings" icon={<RiSearchLine className="text-base" />}>
                      Browse trucks
                    </DashLinkButton>
                  }
                />
              ) : (
                saved.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand/4 sm:px-5"
                  >
                    <RowThumb name={item.title} monogram={item.make?.name} src={primaryImage(item)} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-black">{item.title}</p>
                      <p className="truncate text-xs text-black/45">
                        {item.year} · {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="text-brand">
                      <RiArrowRightLine />
                    </span>
                  </Link>
                ))
              )}
            </Panel>

            <Panel title="Next steps" description="Get the most out of the marketplace" icon={<RiShieldUserLine />}>
              <ul className="space-y-3 text-sm">
                {[
                  { text: "Compare trucks side by side before you commit.", href: "/listings", cta: "Browse" },
                  { text: "Message a seller to negotiate or ask for records.", href: "/dashboard/messages", cta: "Inbox" },
                  { text: "Keep your phone number current so sellers can reach you.", href: "/dashboard/profile", cta: "Profile" },
                ].map((row) => (
                  <li key={row.href} className="flex items-start gap-3 rounded-xl bg-brand/5 p-3">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-red" />
                    <span className="flex-1 text-black/70">{row.text}</span>
                    <Link
                      href={row.href}
                      className="shrink-0 text-xs font-semibold text-brand transition-colors hover:text-brand-red"
                    >
                      {row.cta}
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  RiArrowRightSLine,
  RiCarLine,
  RiChat3Line,
  RiDashboardLine,
  RiExternalLinkLine,
  RiHeartLine,
  RiListSettingsLine,
  RiLogoutBoxRLine,
  RiNotification3Line,
  RiSearchLine,
  RiShieldUserLine,
  RiTruckLine,
  RiUserLine,
} from "react-icons/ri";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth-provider";
import { useUnreadCount } from "@/hooks/use-unread";
import type { UserRole } from "@/types/api";
import { cn } from "@/lib/utils";
import ModeSwitch from "@/components/mode-switch";

type NavItem = {
  href: string;
  label: string;
  icon: typeof RiDashboardLine;
  badge?: "unread";
};

type NavGroup = { label: string; items: NavItem[] };

const NAV: Record<UserRole, NavGroup[]> = {
  buyer: [
    {
      label: "Workspace",
      items: [
        { href: "/dashboard", label: "Overview", icon: RiDashboardLine },
        { href: "/dashboard/messages", label: "Messages", icon: RiChat3Line, badge: "unread" },
        { href: "/dashboard/saved", label: "Saved trucks", icon: RiHeartLine },
      ],
    },
    { label: "Account", items: [{ href: "/dashboard/profile", label: "Profile", icon: RiUserLine }] },
  ],
  seller: [
    {
      label: "Workspace",
      items: [
        { href: "/dashboard", label: "Overview", icon: RiDashboardLine },
        { href: "/dashboard/listings", label: "My listings", icon: RiCarLine },
        { href: "/dashboard/leads", label: "Leads", icon: RiShieldUserLine },
      ],
    },
    {
      label: "Communication",
      items: [{ href: "/dashboard/messages", label: "Messages", icon: RiChat3Line, badge: "unread" }],
    },
    { label: "Account", items: [{ href: "/dashboard/profile", label: "Profile", icon: RiUserLine }] },
  ],
  admin: [
    {
      label: "Workspace",
      items: [{ href: "/dashboard", label: "Overview", icon: RiDashboardLine }],
    },
    {
      label: "Manage",
      items: [
        { href: "/dashboard/admin/listings", label: "Listings", icon: RiCarLine },
        { href: "/dashboard/admin/users", label: "Users", icon: RiShieldUserLine },
        { href: "/dashboard/admin/taxonomy", label: "Taxonomy", icon: RiListSettingsLine },
      ],
    },
    {
      label: "Communication",
      items: [{ href: "/dashboard/messages", label: "Messages", icon: RiChat3Line, badge: "unread" }],
    },
    { label: "Account", items: [{ href: "/dashboard/profile", label: "Profile", icon: RiUserLine }] },
  ],
};

const CRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  listings: "My listings",
  messages: "Messages",
  saved: "Saved trucks",
  leads: "Leads",
  profile: "Profile",
  admin: "Admin",
  users: "Users",
  moderation: "Listings",
  taxonomy: "Taxonomy",
};

function initials(name: string) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { count: unread } = useUnreadCount();
  const [query, setQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/dashboard");
  }, [loading, user, router]);

  const crumbs = useMemo(() => {
    // Drop record ids (e.g. /dashboard/messages/<objectId>) so the trail stays readable.
    const segments = pathname.split("/").filter(Boolean).filter((segment) => !/^[a-f0-9]{24}$/i.test(segment));
    return segments.map((segment, index) => {
      const adminListings = segment === "listings" && segments.includes("admin");
      return {
        label: adminListings ? "Listings" : CRUMB_LABELS[segment] || segment.replace(/-/g, " "),
        href: `/${segments.slice(0, index + 1).join("/")}`,
        last: index === segments.length - 1,
      };
    });
  }, [pathname]);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const targets = contentRef.current?.querySelectorAll("[data-dash-reveal]");
      if (!targets?.length) return;
      if (reduced) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.05, ease: "power2.out", overwrite: true },
      );
    },
    { scope: contentRef, dependencies: [pathname] },
  );

  if (loading || !user) {
    return (
      <div className="dash dash-surface flex min-h-svh flex-col items-center justify-center gap-4">
        <span className="grid size-12 animate-pulse place-items-center rounded-2xl bg-brand text-2xl text-white">
          <RiTruckLine />
        </span>
        <p className="text-sm font-medium text-brand">Loading your workspace…</p>
      </div>
    );
  }

  const groups = NAV[user.role];

  return (
    <SidebarProvider className="dash">
      <Sidebar collapsible="icon" className="border-none">
        <div className="dash-rail relative flex size-full flex-col">
          <SidebarHeader className="relative z-10 gap-0 border-b border-white/12 px-3 py-4">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-red text-lg text-white shadow-sm">
                <RiTruckLine />
              </span>
              <span className="min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="block truncate font-heading text-[15px] leading-tight text-white">
                  SoCal Truck Trade
                </span>
                <span className="block text-[10px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                  {user.role} panel
                </span>
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="dash-scroll relative z-10 py-2">
            {groups.map((group) => (
              <SidebarGroup key={group.label} className="py-1">
                <SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {group.items.map((item) => {
                      const active =
                        item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            isActive={active}
                            tooltip={item.label}
                            className={cn(
                              "h-10 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white/75 transition-colors",
                              "hover:bg-white/12 hover:text-white active:bg-white/12 active:text-white",
                              "data-active:bg-white data-active:font-semibold data-active:text-brand data-active:shadow-sm",
                            )}
                            render={<Link href={item.href} />}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-red transition-opacity",
                                active ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <item.icon className="shrink-0 text-base" />
                            <span className="truncate">{item.label}</span>
                            {item.badge === "unread" && unread > 0 ? (
                              <span
                                className={cn(
                                  "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums group-data-[collapsible=icon]:hidden",
                                  active ? "bg-brand-red text-white" : "bg-brand-red text-white",
                                )}
                              >
                                {unread > 99 ? "99+" : unread}
                              </span>
                            ) : null}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="relative z-10 border-t border-white/12 p-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-red text-xs font-bold text-white ring-2 ring-white/25">
                {initials(user.fullName)}
              </span>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-[13px] font-semibold text-white">{user.fullName}</p>
                <p className="truncate text-[11px] text-white/55">{user.email}</p>
                <ModeSwitch tone="dark" className="mt-2 w-full" />
              </div>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Log out"
                      onClick={() => {
                        void logout();
                        router.push("/");
                      }}
                      className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-white/70 transition-colors hover:bg-brand-red hover:text-white group-data-[collapsible=icon]:hidden"
                    >
                      <RiLogoutBoxRLine />
                    </button>
                  }
                />
                <TooltipContent className="bg-brand-red text-white">Log out</TooltipContent>
              </Tooltip>
            </div>
          </SidebarFooter>
        </div>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="dash dash-surface min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-brand/10 bg-white/85 px-3 backdrop-blur-md sm:px-5">
          <SidebarTrigger className="size-9 cursor-pointer rounded-lg text-brand hover:bg-brand/8 hover:text-brand" />

          <span className="min-w-0 truncate text-sm font-semibold text-black capitalize md:hidden">
            {crumbs.at(-1)?.label}
          </span>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-sm md:flex">
            {crumbs.map((crumb) => (
              <span key={crumb.href} className="flex min-w-0 items-center gap-1">
                {crumb.last ? (
                  <span className="truncate font-semibold text-black capitalize">{crumb.label}</span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className="truncate text-black/45 capitalize transition-colors hover:text-brand"
                    >
                      {crumb.label}
                    </Link>
                    <RiArrowRightSLine className="shrink-0 text-black/25" />
                  </>
                )}
              </span>
            ))}
          </nav>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (query.trim()) router.push(`/listings?q=${encodeURIComponent(query.trim())}`);
            }}
            className="ml-auto hidden h-9 w-56 items-center rounded-lg border border-black/10 bg-white transition-all focus-within:w-72 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 lg:flex xl:w-72 xl:focus-within:w-80"
          >
            <RiSearchLine className="ml-3 shrink-0 text-base text-brand/70" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search trucks…"
              aria-label="Search trucks"
              className="h-full w-full bg-transparent px-2.5 text-sm outline-none placeholder:text-black/35"
            />
          </form>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/dashboard/messages"
                    aria-label="Messages"
                    className="relative grid size-9 cursor-pointer place-items-center rounded-lg text-brand transition-colors hover:bg-brand hover:text-white"
                  >
                    <RiNotification3Line className="text-[17px]" />
                    {unread > 0 ? (
                      <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}
                  </Link>
                }
              />
              <TooltipContent className="bg-brand text-white">
                {unread > 0 ? `${unread} unread message${unread === 1 ? "" : "s"}` : "No new messages"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/"
                    aria-label="Open public site"
                    className="hidden size-9 cursor-pointer place-items-center rounded-lg text-brand transition-colors hover:bg-brand hover:text-white sm:grid"
                  >
                    <RiExternalLinkLine className="text-[17px]" />
                  </Link>
                }
              />
              <TooltipContent className="bg-brand text-white">Open public site</TooltipContent>
            </Tooltip>

            <span className="mx-1 hidden h-6 w-px bg-black/10 sm:block" />

            <ModeSwitch tone="brand" className="hidden sm:inline-flex" />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-2 rounded-lg py-1 pr-2 pl-1 transition-colors hover:bg-brand/8"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
                      {initials(user.fullName)}
                    </span>
                    <span className="hidden text-left sm:block">
                      <span className="block max-w-32 truncate text-[13px] leading-tight font-semibold text-black">
                        {user.fullName}
                      </span>
                      <span className="block text-[11px] text-brand capitalize">{user.role}</span>
                    </span>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-black/45">Signed in as</DropdownMenuLabel>
                <div className="px-1.5 pb-1.5">
                  <p className="truncate text-sm font-semibold text-black">{user.fullName}</p>
                  <p className="truncate text-xs text-black/45">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  render={
                    <Link href="/dashboard/profile">
                      <RiUserLine className="text-brand" />
                      Profile settings
                    </Link>
                  }
                />
                <DropdownMenuItem
                  className="cursor-pointer"
                  render={
                    <Link href="/dashboard/messages">
                      <RiChat3Line className="text-brand" />
                      Messages
                      {unread > 0 ? (
                        <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      ) : null}
                    </Link>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => {
                    void logout();
                    router.push("/");
                  }}
                >
                  <RiLogoutBoxRLine />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div ref={contentRef} className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

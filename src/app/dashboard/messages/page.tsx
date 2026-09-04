"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RiArrowDownLine,
  RiArrowLeftLine,
  RiCarLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiChat3Line,
  RiCloseLine,
  RiEmotionLine,
  RiInboxLine,
  RiLock2Line,
  RiMoreFill,
  RiSearchLine,
  RiSendPlane2Fill,
  RiTimeLine,
} from "react-icons/ri";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ActionIcon from "@/components/dashboard/action-icon";
import { api, ApiRequestError, entityId, formatPrice } from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";
import type { ChatMessage, Conversation } from "@/types/api";
import { cn } from "@/lib/utils";

const QUICK_EMOJI = ["👍", "🙏", "🔥", "✅", "🚚", "💰", "😀", "😅", "🤝", "📍", "📞", "❤️"];

function initials(name?: string) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function clockTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dayKey(value: string) {
  return new Date(value).toDateString();
}

function dayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function listTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return clockTime(value);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const activeId = params?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(true);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [side, setSide] = useState<"buying" | "selling">(user?.role === "seller" ? "selling" : "buying");
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<number | undefined>(undefined);

  const active = useMemo(() => conversations.find((item) => item.id === activeId), [conversations, activeId]);

  const partner = useMemo(() => {
    if (!active || !user) return null;
    return entityId(active.buyer) === user.id ? active.seller : active.buyer;
  }, [active, user]);

  const partnerId = partner ? entityId(partner) : "";
  const partnerOnline = partnerId ? Boolean(online[partnerId]) : false;

  const loadConversations = useCallback(async () => {
    try {
      const data = await api<{ items: Conversation[] }>(`/conversations?side=${side}`);
      setConversations(data.items);
    } catch {
      // Keep whatever is on screen rather than blanking the inbox on a failed poll.
    } finally {
      setLoadingList(false);
    }
  }, [side]);

  const loadMessages = useCallback(async (id: string) => {
    try {
      const data = await api<{ items: ChatMessage[] }>(`/conversations/${id}/messages?limit=48`);
      setMessages(data.items);
      const socket = connectSocket();
      if (socket?.connected) socket.emit("message:read", id);
      else await api(`/conversations/${id}/read`, { method: "POST" });
      setConversations((prev) => prev.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
    } catch {
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) void loadMessages(activeId);
  }, [activeId, loadMessages]);

  function openConversation(id: string) {
    if (id === activeId) return;
    setMessages([]);
    setLoadingThread(true);
    setTyping(false);
    setShowEmoji(false);
    setAtBottom(true);
    router.push(`/dashboard/messages/${id}`);
  }

  function closeConversation() {
    setMessages([]);
    setTyping(false);
    setShowEmoji(false);
    router.push("/dashboard/messages");
  }

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: messages.length > 1 ? "smooth" : "auto" });
  }, [messages, atBottom]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket || !user) return;

    const onNew = (payload: { conversationId: string; message: ChatMessage }) => {
      if (payload.conversationId === activeId) {
        setMessages((prev) => {
          const withoutTemp = prev.filter(
            (item) =>
              item.id !== payload.message.id &&
              !(item.id.startsWith("temp-") && item.body === payload.message.body),
          );
          return [...withoutTemp, payload.message];
        });
        const mine = entityId(
          typeof payload.message.sender === "string" ? { id: payload.message.sender } : payload.message.sender,
        );
        if (mine !== user.id) socket.emit("message:read", activeId);
      } else {
        toast.message("New message", { description: payload.message.body.slice(0, 80) });
      }
      void loadConversations();
    };

    const onTyping = (payload: { conversationId: string; userId: string; typing: boolean }) => {
      if (payload.conversationId === activeId && payload.userId !== user.id) setTyping(payload.typing);
    };

    const onRead = (payload: { conversationId: string; userId: string }) => {
      if (payload.conversationId !== activeId || payload.userId === user.id) return;
      setMessages((prev) =>
        prev.map((item) => {
          const sender = entityId(typeof item.sender === "string" ? { id: item.sender } : item.sender);
          return sender === user.id && !item.readAt ? { ...item, readAt: new Date().toISOString() } : item;
        }),
      );
    };

    const onPresence = (payload: { userId: string; online: boolean }) => {
      setOnline((prev) => ({ ...prev, [payload.userId]: payload.online }));
    };

    socket.on("message:new", onNew);
    socket.on("typing", onTyping);
    socket.on("message:read", onRead);
    socket.on("presence", onPresence);
    if (activeId) socket.emit("conversation:join", activeId);

    return () => {
      socket.off("message:new", onNew);
      socket.off("typing", onTyping);
      socket.off("message:read", onRead);
      socket.off("presence", onPresence);
      if (activeId) socket.emit("conversation:leave", activeId);
    };
  }, [activeId, user, loadConversations]);

  const visibleConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations.filter((item) => {
      if (filter === "unread" && !(item.unread || 0)) return false;
      if (!term) return true;
      const other = user && entityId(item.buyer) === user.id ? item.seller : item.buyer;
      return [other?.fullName, item.listing?.title, item.lastMessagePreview]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [conversations, filter, search, user]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, item) => sum + (item.unread || 0), 0),
    [conversations],
  );

  function autoGrow() {
    const node = inputRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 132)}px`;
  }

  function signalTyping() {
    if (!activeId) return;
    const socket = connectSocket();
    socket?.emit("typing", { conversationId: activeId, typing: true });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      socket?.emit("typing", { conversationId: activeId, typing: false });
    }, 1500);
  }

  async function send() {
    const text = draft.trim();
    if (!activeId || !text || !user) return;
    setDraft("");
    setShowEmoji(false);
    window.requestAnimationFrame(autoGrow);
    setAtBottom(true);

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation: activeId,
      sender: user.id,
      body: text,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const socket = connectSocket();
      window.clearTimeout(typingTimer.current);
      socket?.emit("typing", { conversationId: activeId, typing: false });
      if (socket?.connected) {
        socket.emit("message:send", { conversationId: activeId, body: text });
      } else {
        await api(`/conversations/${activeId}/messages`, {
          method: "POST",
          body: JSON.stringify({ body: text }),
        });
        await loadMessages(activeId);
      }
    } catch (error) {
      setMessages((prev) => prev.filter((item) => item.id !== optimistic.id));
      toast.error(error instanceof ApiRequestError ? error.message : "Message failed to send");
    }
  }

  function senderOf(message: ChatMessage) {
    return entityId(typeof message.sender === "string" ? { id: message.sender } : message.sender);
  }

  const listingImage = active?.listing?.images?.[0]?.url;

  return (
    <div className="dash-panel flex h-[calc(100svh-6rem)] overflow-hidden p-0 sm:h-[calc(100svh-7rem)] lg:h-[calc(100svh-8rem)]">
      {/* Conversation list */}
      <aside
        className={cn(
          "flex w-full min-w-0 flex-col border-r border-black/8 bg-white md:w-[340px] md:shrink-0 lg:w-[380px]",
          activeId ? "hidden md:flex" : "flex",
        )}
      >
        <header className="border-b border-black/6 bg-brand px-4 py-3.5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-white/15 text-lg">
                <RiChat3Line />
              </span>
              <div>
                <h1 className="font-heading text-base leading-tight text-white">Messages</h1>
                <p className="text-[11px] text-white/60">
                  {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}
                </p>
              </div>
            </div>
            <div className="flex rounded-lg bg-white/12 p-0.5">
              {(["buying", "selling"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSide(option);
                    setLoadingList(true);
                  }}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                    side === option ? "bg-white text-brand" : "text-white/70 hover:text-white",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mt-3 flex h-9 items-center rounded-lg bg-white/12 transition-colors focus-within:bg-white/20">
            <RiSearchLine className="pointer-events-none absolute left-3 text-base text-white/60" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations…"
              className="h-full w-full bg-transparent pr-9 pl-9 text-sm text-white outline-none placeholder:text-white/50"
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2 grid size-5 cursor-pointer place-items-center rounded-full text-white/70 hover:bg-white/20 hover:text-white"
              >
                <RiCloseLine />
              </button>
            ) : null}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setFilter(filter === "unread" ? "all" : "unread")}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                filter === "unread" ? "bg-white text-brand" : "text-white/70 hover:text-white",
              )}
            >
              {filter === "unread" ? "Unread only" : "All in this tab"}
            </button>
          </div>
        </header>

        <div className="dash-scroll flex-1 overflow-y-auto">
          {loadingList ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-3.5">
                <span className="size-12 animate-pulse rounded-full bg-brand/8" />
                <span className="flex-1 space-y-2">
                  <span className="block h-3 w-1/2 animate-pulse rounded-full bg-brand/8" />
                  <span className="block h-2.5 w-3/4 animate-pulse rounded-full bg-brand/6" />
                </span>
              </div>
            ))
          ) : visibleConversations.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand/8 text-2xl text-brand">
                <RiInboxLine />
              </span>
              <p className="mt-4 font-heading text-base text-black">
                {search || filter === "unread" ? "Nothing here" : `No ${side} conversations yet`}
              </p>
              <p className="mt-1 text-sm text-black/45">
                {search || filter === "unread"
                  ? "Try clearing the search or switching tabs."
                  : side === "selling"
                    ? "When a buyer messages one of your listings, it shows up here."
                    : "Message a seller from any listing and the thread appears here."}
              </p>
            </div>
          ) : (
            visibleConversations.map((conversation) => {
              const other = user && entityId(conversation.buyer) === user.id ? conversation.seller : conversation.buyer;
              const isActive = conversation.id === activeId;
              const unread = conversation.unread || 0;
              const otherId = entityId(other);
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => openConversation(conversation.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 border-b border-black/4 px-4 py-3 text-left transition-colors",
                    isActive ? "bg-brand/8" : "hover:bg-black/3",
                  )}
                >
                  <span className="relative shrink-0">
                    <span className="grid size-12 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                      {initials(other?.fullName)}
                    </span>
                    {online[otherId] ? (
                      <span className="absolute right-0 bottom-0 size-3 rounded-full bg-brand-red ring-2 ring-white" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          unread > 0 ? "font-bold text-black" : "font-semibold text-black/85",
                        )}
                      >
                        {other?.fullName || "Unknown"}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[11px]",
                          unread > 0 ? "font-semibold text-brand-red" : "text-black/40",
                        )}
                      >
                        {listTime(conversation.lastMessageAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-xs",
                          unread > 0 ? "font-medium text-black/70" : "text-black/45",
                        )}
                      >
                        {conversation.lastMessagePreview || conversation.listing?.title || "New conversation"}
                      </span>
                      {unread > 0 ? (
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-red px-1.5 text-[10px] font-bold text-white tabular-nums">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-brand">
                      {conversation.listing?.title}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Thread */}
      <section className={cn("min-w-0 flex-1 flex-col", activeId ? "flex" : "hidden md:flex")}>
        {active && partner ? (
          <>
            <header className="flex items-center gap-3 border-b border-black/8 bg-white px-3 py-2.5 sm:px-4">
              <button
                type="button"
                aria-label="Back to conversations"
                onClick={closeConversation}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-brand transition-colors hover:bg-brand/8 md:hidden"
              >
                <RiArrowLeftLine />
              </button>
              <span className="relative shrink-0">
                <span className="grid size-10 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                  {initials(partner.fullName)}
                </span>
                {partnerOnline ? (
                  <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-brand-red ring-2 ring-white" />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-black">{partner.fullName}</p>
                <p className="truncate text-xs">
                  {typing ? (
                    <span className="font-medium text-brand-red">typing…</span>
                  ) : partnerOnline ? (
                    <span className="font-medium text-brand">online</span>
                  ) : (
                    <span className="text-black/45">{active.listing?.title}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {active.listing ? (
                  <ActionIcon
                    label="View listing"
                    icon={<RiCarLine />}
                    href={`/listings/${entityId(active.listing)}`}
                    className="hidden sm:inline-flex"
                  />
                ) : null}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label="Conversation options"
                              className="grid size-8 cursor-pointer place-items-center rounded-lg border border-black/8 bg-white text-brand shadow-xs transition-all hover:border-transparent hover:bg-brand hover:text-white"
                            >
                              <RiMoreFill />
                            </button>
                          }
                        />
                      }
                    />
                    <TooltipContent className="bg-brand text-white">Conversation options</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-48">
                    {active.listing ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        render={<Link href={`/listings/${entityId(active.listing)}`}>View listing</Link>}
                      />
                    ) : null}
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        const socket = connectSocket();
                        if (socket?.connected) socket.emit("message:read", active.id);
                        void loadConversations();
                        toast.success("Marked as read");
                      }}
                    >
                      Mark as read
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={closeConversation}
                    >
                      Close conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {active.listing ? (
              <Link
                href={`/listings/${entityId(active.listing)}`}
                className="flex items-center gap-3 border-b border-black/6 bg-brand/5 px-3 py-2 transition-colors hover:bg-brand/10 sm:px-4"
              >
                <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-neutral-200">
                  {listingImage ? (
                    <Image src={listingImage} alt="" fill sizes="36px" className="object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-black">{active.listing.title}</span>
                  <span className="block text-[11px] text-brand">{formatPrice(active.listing.price)}</span>
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-brand-red">View</span>
              </Link>
            ) : null}

            <div
              ref={scrollRef}
              onScroll={(event) => {
                const el = event.currentTarget;
                setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
              }}
              className="chat-wallpaper dash-scroll relative flex-1 overflow-y-auto px-3 py-4 sm:px-6"
              style={{ ["--bubble-out" as string]: "#014BAD", ["--bubble-in" as string]: "#FFFFFF" }}
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-0.5">
                <div className="mx-auto mb-4 flex max-w-md items-center gap-2 rounded-lg bg-black/6 px-3 py-1.5 text-[11px] text-black/55">
                  <RiLock2Line className="shrink-0 text-brand" />
                  Keep payments and paperwork on the platform. Never wire money before inspecting a truck.
                </div>

                {loadingThread
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className={cn("flex", index % 2 ? "justify-end" : "justify-start")}>
                        <span className="my-1 h-9 w-40 animate-pulse rounded-xl bg-white/70" />
                      </div>
                    ))
                  : messages.map((message, index) => {
                      const mine = senderOf(message) === user?.id;
                      const previous = messages[index - 1];
                      const next = messages[index + 1];
                      const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
                      const startsGroup = !previous || senderOf(previous) !== senderOf(message) || newDay;
                      const endsGroup = !next || senderOf(next) !== senderOf(message);
                      const pending = message.id.startsWith("temp-");

                      return (
                        <div key={message.id}>
                          {newDay ? (
                            <div className="my-4 flex justify-center">
                              <span className="rounded-lg bg-white/90 px-3 py-1 text-[11px] font-semibold text-black/55 shadow-sm">
                                {dayLabel(message.createdAt)}
                              </span>
                            </div>
                          ) : null}
                          <div
                            className={cn(
                              "flex",
                              mine ? "justify-end" : "justify-start",
                              endsGroup ? "mb-2" : "mb-0.5",
                            )}
                          >
                            <div
                              className={cn(
                                "relative max-w-[85%] px-2.5 py-1.5 shadow-sm sm:max-w-[70%]",
                                mine
                                  ? "rounded-xl rounded-tr-none bg-brand text-white"
                                  : "rounded-xl rounded-tl-none bg-white text-black",
                                startsGroup && (mine ? "bubble-out" : "bubble-in"),
                                !startsGroup && (mine ? "rounded-tr-xl" : "rounded-tl-xl"),
                              )}
                            >
                              <p className="pr-14 text-sm leading-relaxed break-words whitespace-pre-wrap">
                                {message.body}
                              </p>
                              <span
                                className={cn(
                                  "absolute right-2 bottom-1.5 flex items-center gap-0.5 text-[10px]",
                                  mine ? "text-white/70" : "text-black/40",
                                )}
                              >
                                {clockTime(message.createdAt)}
                                {mine ? (
                                  pending ? (
                                    <RiTimeLine className="text-[11px]" />
                                  ) : message.readAt ? (
                                    <RiCheckDoubleLine className="text-[12px] text-white" />
                                  ) : (
                                    <RiCheckLine className="text-[12px] text-white/70" />
                                  )
                                ) : null}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                {typing ? (
                  <div className="mb-2 flex justify-start">
                    <span className="flex items-center gap-1 rounded-xl rounded-tl-none bg-white px-3 py-2.5 shadow-sm">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="chat-typing-dot size-1.5 rounded-full bg-brand"
                          style={{ animationDelay: `${dot * 0.15}s` }}
                        />
                      ))}
                    </span>
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>

              {!atBottom ? (
                <button
                  type="button"
                  aria-label="Scroll to latest"
                  onClick={() => {
                    setAtBottom(true);
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="sticky bottom-2 left-full grid size-10 cursor-pointer place-items-center rounded-full bg-white text-brand shadow-lg ring-1 ring-black/8 transition-transform hover:scale-105"
                >
                  <RiArrowDownLine />
                </button>
              ) : null}
            </div>

            {showEmoji ? (
              <div className="flex flex-wrap gap-1 border-t border-black/6 bg-white px-3 py-2 sm:px-4">
                {QUICK_EMOJI.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setDraft((prev) => prev + emoji);
                      inputRef.current?.focus();
                    }}
                    className="grid size-9 cursor-pointer place-items-center rounded-lg text-lg transition-colors hover:bg-brand/8"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
              className="flex items-end gap-2 border-t border-black/8 bg-white px-3 py-2.5 sm:px-4"
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Quick emoji"
                      onClick={() => setShowEmoji((prev) => !prev)}
                      className={cn(
                        "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-xl transition-colors",
                        showEmoji ? "bg-brand text-white" : "text-black/40 hover:bg-brand/8 hover:text-brand",
                      )}
                    >
                      <RiEmotionLine />
                    </button>
                  }
                />
                <TooltipContent className="bg-brand text-white">Quick emoji</TooltipContent>
              </Tooltip>

              <textarea
                ref={inputRef}
                value={draft}
                rows={1}
                onChange={(event) => {
                  setDraft(event.target.value);
                  autoGrow();
                  signalTyping();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder="Type a message"
                className="dash-scroll max-h-[132px] min-h-10 flex-1 resize-none rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/15"
              />

              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="submit"
                      aria-label="Send message"
                      disabled={!draft.trim()}
                      className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-brand text-lg text-white shadow-sm transition-all hover:bg-[#0158cc] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-black/15 disabled:shadow-none"
                    >
                      <RiSendPlane2Fill />
                    </button>
                  }
                />
                <TooltipContent className="bg-brand text-white">Send · Enter</TooltipContent>
              </Tooltip>
            </form>
          </>
        ) : (
          <div className="chat-wallpaper flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-20 place-items-center rounded-3xl bg-brand text-4xl text-white shadow-lg">
              <RiChat3Line />
            </span>
            <h2 className="mt-5 font-heading text-xl text-black">SoCal Truck Trade Messages</h2>
            <p className="mt-2 max-w-sm text-sm text-black/50">
              Pick a conversation on the left to negotiate, share details and close the deal — everything stays in one
              thread.
            </p>
            <p className="mt-6 flex items-center gap-1.5 text-xs text-black/40">
              <RiLock2Line className="text-brand" />
              Messages are private between you and the other party.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";

/** Live unread-conversation count, refreshed by socket events and a slow poll. */
export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    void api<{ count: number }>("/conversations/unread")
      .then((data) => setCount(data.count))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user?.emailVerified) return;
    load();
    const socket = connectSocket();
    socket?.on("message:new", load);
    // Sockets carry the live updates; the poll is only a backstop, so keep it slow
    // and idle while the tab is hidden.
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    return () => {
      socket?.off("message:new", load);
      window.clearInterval(timer);
    };
  }, [user, load]);

  return { count: user?.emailVerified ? count : 0, refresh: load };
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";

export default function UnreadBadge() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.emailVerified) return;
    const load = () => {
      void api<{ count: number }>("/conversations/unread")
        .then((data) => setCount(data.count))
        .catch(() => undefined);
    };
    load();
    const socket = connectSocket();
    socket?.on("message:new", load);
    const timer = window.setInterval(load, 20000);
    return () => {
      socket?.off("message:new", load);
      window.clearInterval(timer);
    };
  }, [user]);

  if (!count) return null;
  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-red px-1.5 text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (socket) return socket;

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
  socket = io(url, {
    withCredentials: true,
    autoConnect: false,
  });
  return socket;
}

export function connectSocket() {
  const next = getSocket();
  if (next && !next.connected) next.connect();
  return next;
}

export function disconnectSocket() {
  socket?.disconnect();
}

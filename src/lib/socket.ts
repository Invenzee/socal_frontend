"use client";

import { io, type Socket } from "socket.io-client";

declare global {
  interface Window {
    __SOCAL_SOCKET_URL__?: string;
  }
}

let socket: Socket | null = null;

function socketUrl() {
  if (typeof window !== "undefined" && window.__SOCAL_SOCKET_URL__) {
    return window.__SOCAL_SOCKET_URL__;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
}

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (socket) return socket;

  socket = io(socketUrl(), {
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

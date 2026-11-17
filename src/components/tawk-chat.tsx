"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TAWK_SRC = "https://embed.tawk.to/6afc92f26714ba3cc376af1c/1k7l9s1cq";

type TawkApi = {
  hideWidget?: () => void;
  showWidget?: () => void;
  onLoad?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

function onDashboard(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export default function TawkChat() {
  const pathname = usePathname();
  const hidden = onDashboard(pathname);

  useEffect(() => {
    const api = (window.Tawk_API = window.Tawk_API || {});
    const previousOnLoad = api.onLoad;
    api.onLoad = () => {
      previousOnLoad?.();
      if (onDashboard(window.location.pathname)) api.hideWidget?.();
      else api.showWidget?.();
    };

    if (hidden) {
      api.hideWidget?.();
      return;
    }

    api.showWidget?.();

    if (document.querySelector(`script[src="${TAWK_SRC}"]`)) return;

    window.Tawk_LoadStart = new Date();
    const script = document.createElement("script");
    const first = document.getElementsByTagName("script")[0];
    script.async = true;
    script.src = TAWK_SRC;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    first?.parentNode?.insertBefore(script, first);
  }, [hidden]);

  return null;
}

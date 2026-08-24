"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BRANDING } from "@/lib/branding";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Stop loading animation when path or search params change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Safety fallback: Never keep screen locked for more than 2.5 seconds
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Intercept internal link clicks to trigger loading screen smoothly
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement | null;
        const anchor = target?.closest("a");

        if (!anchor) return;

        const href = anchor.getAttribute("href");
        const targetAttr = anchor.getAttribute("target");

        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("//") &&
          !href.startsWith("/#") &&
          targetAttr !== "_blank" &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          const targetUrl = new URL(href, window.location.origin).pathname;

          if (targetUrl !== window.location.pathname) {
            setIsLoading(true);
          }
        }
      } catch (err) {
        // Safe catch
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top Animated Progress Bar Line */}
      <div className="w-full h-1 bg-slate-900/20 overflow-hidden relative z-50">
        <div className="h-full bg-gradient-to-r from-accent via-amber-400 to-primary w-full animate-pulse transform" />
      </div>

      {/* Central Loading Screen Overlay */}
      <div className="flex-1 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm pointer-events-auto transition-all">
        <div className="bg-slate-900/95 text-white border border-white/15 px-6 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in zoom-in-95 duration-200">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Loading...</p>
            <p className="text-[10px] text-white/70 font-normal">{BRANDING.siteName}</p>
          </div>
        </div>
      </div>

      <div className="h-1" />
    </div>
  );
}

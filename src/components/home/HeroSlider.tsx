"use client";

import { useState, useEffect, useRef } from "react";
import { HeroBanner, fetchAllBanners, recordBannerView, recordBannerClick } from "@/lib/slider-service";
import { useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Eye, MousePointerClick, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeroSlider() {
  const db = useFirestore();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (db) {
      fetchAllBanners(db).then(data => {
        const activeOnly = data.filter(b => b.active !== false);
        setBanners(activeOnly.length > 0 ? activeOnly : data);
        setLoading(false);
      });
    }
  }, [db]);

  // Record View when slide changes
  useEffect(() => {
    if (banners.length > 0 && db) {
      const currentBanner = banners[currentIndex];
      if (currentBanner?.id) {
        recordBannerView(db, currentBanner.id);
      }
    }
  }, [currentIndex, banners, db]);

  // Auto-scroll Timer (4 Seconds)
  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  const handlePrev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner: HeroBanner) => {
    if (db && banner.id) {
      recordBannerClick(db, banner.id);
    }
  };

  if (loading || banners.length === 0) {
    return (
      <div className="w-full h-48 md:h-64 rounded-[2rem] bg-muted/30 animate-pulse flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-muted-foreground/40 animate-spin" />
      </div>
    );
  }

  const current = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl border border-primary/10 group">
      {/* Slide Image Background with Dark Gradient Overlay */}
      <div className="relative h-64 md:h-80 w-full transition-all duration-700 ease-in-out">
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent flex flex-col justify-center p-6 md:p-12 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-accent/20 border border-accent/40 text-accent font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
              Featured Opportunity
            </span>
          </div>

          <h2 className="text-xl md:text-3xl font-black font-headline text-white max-w-xl leading-tight drop-shadow-md">
            {current.title}
          </h2>

          {current.subtitle && (
            <p className="text-xs md:text-sm text-white/80 font-medium max-w-lg line-clamp-2 leading-relaxed">
              {current.subtitle}
            </p>
          )}

          <div className="pt-2">
            <Link 
              href={current.targetUrl || '/jobs'}
              onClick={() => handleBannerClick(current)}
            >
              <Button className="bg-accent hover:bg-accent/90 text-slate-950 font-black h-11 px-6 rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95">
                {current.actionText || "Explore Now"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Left / Right Manual Arrow Navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 active:scale-90"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 active:scale-90"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setCurrentIndex(idx);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentIndex ? "w-6 bg-accent" : "w-2 bg-white/40 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

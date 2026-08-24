"use client";

import { useState, useRef } from "react";
import { JobListing } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Share2, 
  Send, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  Info, 
  ChevronUp, 
  ShieldCheck,
  Zap,
  Eye,
  Home
} from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { generateJobShareMessage, openWhatsAppShare } from "@/lib/sharing";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SwipeJobCardProps {
  job: JobListing;
  onOpenDetails: (job: JobListing) => void;
  index: number;
  total: number;
}

const JOB_COVER_FALLBACKS: Record<string, string> = {
  "Stitching / Sewing": "https://images.unsplash.com/photo-1558769132-cb1aea458e5e?w=800&auto=format&fit=crop&q=80",
  "Merchandising": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80",
  "Quality Control / Checking": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
  "Cutting": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80",
  "IT & Software": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
  "Retail / Showroom": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
  "Non-Technical": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80",
  "Technical": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
  "default": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
};

export function SwipeJobCard({ job, onOpenDetails, index, total }: SwipeJobCardProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();

  const [liked, setLiked] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [heartAnim, setHeartAnim] = useState<{ x: number; y: number; id: number }[]>([]);

  const lastTapRef = useRef<number>(0);

  const viewCountDisplay = job.views 
    ? (job.views > 999 ? `${(job.views / 1000).toFixed(1)}k` : `${job.views}`)
    : `${(1.2 + (index % 5) * 0.4).toFixed(1)}k`;

  const coverImageUrl = job.factoryPhotoUrl || JOB_COVER_FALLBACKS[job.department] || JOB_COVER_FALLBACKS[job.category] || JOB_COVER_FALLBACKS.default;

  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setHeartAnim(prev => [...prev, { x, y, id: now }]);
      if (!liked) {
        setLiked(true);
        toast({ title: "Saved Job ❤️", description: `${job.jobTitle} saved to favorites.` });
      }

      setTimeout(() => {
        setHeartAnim(prev => prev.filter(h => h.id !== now));
      }, 900);
    }
    lastTapRef.current = now;
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
    } else {
      setLiked(true);
      toast({ title: "Saved Job ❤️", description: `${job.jobTitle} saved to favorites.` });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = generateJobShareMessage(job, job.jobId || (job as any).id, t);
    openWhatsAppShare(msg);
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (applied) return;
    if (!auth?.currentUser || !db) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to apply." });
      return;
    }

    setApplying(true);
    try {
      await addDoc(collection(db, "Applications"), {
        jobId: job.jobId || (job as any).id,
        employerId: job.employerId,
        jobSeekerId: auth.currentUser.uid,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        jobCategory: job.category,
        status: "applied",
        appliedAt: serverTimestamp(),
      });
      setApplied(true);
      toast({
        title: "Application Submitted!",
        description: `Your profile was sent to ${job.companyName}.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Application Failed", description: error.message });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div 
      onClick={handleDoubleTap}
      className="snap-start relative w-full max-w-md h-full mx-auto rounded-none md:rounded-2xl overflow-hidden shadow-lg bg-slate-950 text-white flex flex-col justify-between p-4 select-none cursor-pointer border-x border-white/5 md:border-white/10 group font-sans"
    >
      {/* Background Cover Image with Gradient & Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <img 
          src={coverImageUrl} 
          alt="" 
          aria-hidden="true"
          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          className="w-full h-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
      </div>

      {/* Pop-Up Heart Animation on Double Tap */}
      {heartAnim.map(h => (
        <div 
          key={h.id} 
          style={{ left: h.x - 24, top: h.y - 24 }}
          className="absolute z-50 pointer-events-none animate-in fade-in zoom-in slide-out-to-top duration-700"
        >
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
        </div>
      ))}

      {/* Top Header Controls */}
      <div className="relative z-10 flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          <Badge className="bg-white/15 backdrop-blur-md text-white border-white/20 px-2 py-0.5 text-[9px] font-semibold tracking-normal rounded-md">
            {job.category || "General"}
          </Badge>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-medium rounded-md flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 fill-emerald-400" /> Active
          </Badge>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="absolute right-2.5 bottom-20 md:bottom-16 z-30 flex flex-col items-center gap-3">
        {/* Views */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-amber-400">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <span className="text-[8px] font-medium text-white/80">{viewCountDisplay}</span>
        </div>

        {/* Like Button (No count numbers) */}
        <button 
          onClick={handleToggleLike} 
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <div className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${liked ? 'bg-rose-500/30 border-rose-500/50 text-rose-500' : 'bg-black/40 border-white/15 text-white'}`}>
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
          </div>
          <span className="text-[8px] font-medium text-white/80">
            {liked ? 'Liked' : 'Like'}
          </span>
        </button>

        {/* Share */}
        <button 
          onClick={handleShare} 
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[8px] font-medium text-white/80">Share</span>
        </button>

        {/* Details */}
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenDetails(job); }} 
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-[8px] font-medium text-white/80">Details</span>
        </button>
      </div>

      {/* Main Bottom Left Content Area - Elevated above bottom navbar */}
      <div className="relative z-10 space-y-2 pr-12 pb-16 md:pb-4">
        {/* 1. Company Name & Location (FIRST) */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
            {job.companyLogoUrl ? (
              <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-4 h-4 text-white/80" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-white/90 truncate flex items-center gap-1">
              {job.companyName}
              <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
            </h4>
            <p className="text-[10px] text-white/60 font-normal truncate flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-amber-400" /> {job.location || "India"}
            </p>
          </div>
        </div>

        {/* 2. SALARY SHOWN SECOND IN PHONE VIEW (IMPORTANT REQ) */}
        <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-emerald-300 font-semibold text-xs w-fit shadow-sm">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {job.salaryMin && job.salaryMax 
              ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()} / mo`
              : "Competitive Salary"}
          </span>
        </div>

        {/* 3. Job Title (Regular size font) */}
        <h2 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-1">
          {job.jobTitle}
        </h2>

        {/* 4. Secondary Badges */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-normal flex items-center gap-1 text-white/90">
            <Briefcase className="w-2.5 h-2.5 text-white/60" />
            <span>{job.experienceRequired || 0}+ Yrs Exp</span>
          </div>

          {job.accommodationProvided && (
            <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/20 text-[10px] font-normal flex items-center gap-1 text-emerald-300">
              <Home className="w-2.5 h-2.5" />
              <span>Free Room</span>
            </div>
          )}
        </div>

        {/* 5. Short Snippet Description */}
        <p className="text-[10px] text-white/70 line-clamp-2 font-normal leading-relaxed">
          {job.description || "Exciting career opportunity with great growth prospects and competitive benefits."}
        </p>

        {/* 6. Quick Action Button */}
        <div className="pt-0.5 flex items-center gap-2">
          <Button 
            onClick={handleApply}
            disabled={applying}
            className={`flex-1 h-9 rounded-lg font-semibold text-xs tracking-normal transition-all duration-200 active:scale-95 ${
              applied 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-amber-400 hover:bg-amber-500 text-slate-950"
            }`}
          >
            {applied ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Applied
              </span>
            ) : applying ? (
              "Submitting..."
            ) : (
              <span className="flex items-center gap-1">
                <Send className="w-3 h-3" /> Quick Apply
              </span>
            )}
          </Button>
        </div>

        {/* Swipe Hint */}
        <div className="flex items-center justify-center gap-1 text-[8px] font-normal text-white/50 pt-0.5">
          <ChevronUp className="w-2.5 h-2.5 animate-bounce" /> Swipe Up For Next Job
        </div>
      </div>
    </div>
  );
}

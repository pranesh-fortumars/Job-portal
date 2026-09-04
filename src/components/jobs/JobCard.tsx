"use client";

import { useState, useEffect, useMemo } from "react";
import { JobListing } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Clock, 
  ChevronRight, 
  MessageCircle, 
  Navigation, 
  Zap, 
  Bus, 
  Coffee, 
  Heart, 
  Eye, 
  CheckCircle2, 
  Gift, 
  Building2, 
  User, 
  Calendar,
  ShieldCheck,
  Timer,
  Users,
  Home,
  ShoppingBag,
  Smartphone,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn, formatCompactNumber, calculateDistance, translateLocation, formatShiftTiming, getLocalizedDesignation } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { generateJobShareMessage, openWhatsAppShare } from "@/lib/sharing";
import { DepartmentLogo } from "@/components/shared/DepartmentLogo";

interface JobCardProps {
  job: JobListing;
  isApplied?: boolean;
  userCoords?: { lat: number, lng: number } | null;
  masterDesignations?: any[] | null;
}

export function JobCard({ job, isApplied = false, userCoords, masterDesignations = null }: JobCardProps) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const distance = useMemo(() => {
    const jobLat = parseFloat(job.latitude as any);
    const jobLng = parseFloat(job.longitude as any);
    const userLat = parseFloat(userCoords?.lat as any);
    const userLng = parseFloat(userCoords?.lng as any);

    if (!isNaN(jobLat) && !isNaN(jobLng) && !isNaN(userLat) && !isNaN(userLng)) {
      return calculateDistance(userLat, userLng, jobLat, jobLng);
    }
    const fallbackDist = parseFloat(job.distance as any);
    return isNaN(fallbackDist) ? null : fallbackDist * 1.5;
  }, [userCoords, job.latitude, job.longitude, job.distance]);

  const distanceLabel = useMemo(() => {
    if (!mounted) return "...";
    if (distance !== null && !isNaN(distance)) return `${distance.toFixed(1)} ${t.km}`;
    if (!userCoords) return "Enable GPS";
    return "Near You";
  }, [distance, mounted, userCoords, t.km]);

  const genderText = useMemo(() => {
    if (job.genderPreference === 'male') return t.malePreferred;
    if (job.genderPreference === 'female') return t.femalePreferred;
    return t.anyGender;
  }, [job.genderPreference, t]);

  const handleWhatsappShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = generateJobShareMessage(job, job.jobId || (job as any).id, t);
    openWhatsAppShare(message);
  };

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = job.latitude && job.longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location || "India")}`;
    window.open(url, '_blank');
  };

  const translatedCategory = (t.categories as any)[job.category] || job.category;
  const translatedDesig = getLocalizedDesignation(job.designation, masterDesignations, language, t);

  const b = job.benefits || { 
    esi: false, 
    epf: false, 
    transport: false, 
    bonusEnabled: false, 
    teaCash: false,
    attendance_incentive: false,
    overtime_pay: false,
    production_incentive: false,
    referral_bonus: false,
    bachelor_accommodation: false,
    family_accommodation: false,
    food: false,
    mobile_allowance: false,
    petrol_allowance: false,
    skill_training: false
  };

  const getSalaryUnit = (basis?: string) => {
    if (basis === 'shift') return t.perShift;
    if (basis === 'piece') return t.perPiece;
    return t.perMonth;
  };

  const formattedPostedDate = useMemo(() => {
    if (!job.createdAt) return null;
    try {
      const date = new Date(job.createdAt);
      return isValid(date) ? format(date, "dd MMM yyyy") : null;
    } catch (e) {
      return null;
    }
  }, [job.createdAt]);

  const isPieceRate = job.salaryBasis === 'piece';

  const salaryDisplay = useMemo(() => {
    if (!job.salaryType || job.salaryType === 'display_range') {
      if (isPieceRate) return t.perPiece;
      return `₹${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}`;
    }
    const typeMap: Record<string, string> = {
      not_disclosed: "Salary Not Disclosed",
      negotiable: "Negotiable",
      experience_based: "Based on Experience",
      company_standard: "As Per Company Standards"
    };
    return typeMap[job.salaryType] || "Salary Not Disclosed";
  }, [job.salaryType, job.salaryMin, job.salaryMax, isPieceRate, t]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 group overflow-hidden rounded-[2rem] flex flex-col h-full bg-white relative">
      {isApplied && (
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 z-30" />
      )}

      <CardHeader className="p-5 md:p-6 pb-3 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="relative shrink-0">
               <div className="w-14 h-14 rounded-xl overflow-hidden border bg-muted flex items-center justify-center shadow-sm">
                 {job.companyLogoUrl ? (
                   <img src={job.companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                 ) : (
                   <Building2 className="w-7 h-7 text-muted-foreground" />
                 )}
               </div>
               <DepartmentLogo 
                 category={job.category} 
                 department={job.department} 
                 className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg border-2 border-white shadow-lg z-10" 
               />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Link href={`/jobs/${job.jobId || (job as any).id}`}>
                <h3 className="text-base md:text-lg font-normal text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight hover:underline decoration-primary/30 underline-offset-4">
                  {translatedDesig}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium truncate group-hover:text-primary transition-colors">
                  {job.companyName}
                </p>
                {job.isEmployerVerified && <Zap className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Button 
              variant="ghost" 
              className="h-auto py-2 px-2 rounded-xl bg-green-50 border border-green-100 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all active:scale-95 flex items-gap-1.5 max-w-[100px] sm:max-w-[120px]"
              onClick={handleWhatsappShare}
              title={t.shareOnWhatsapp}
            >
              <MessageCircle className="w-3 h-3 shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-tight leading-[1.1] text-left whitespace-normal break-words">
                {t.shareThisJob}
              </span>
            </Button>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-semibold px-3 py-1 rounded-lg">
              {translatedCategory}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {isApplied && (
            <Badge className="bg-green-100 text-green-700 border-none font-semibold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> {t.applied}
            </Badge>
          )}
          {mounted && formattedPostedDate && (
            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3 h-3 text-primary/40" />
              Posted {formattedPostedDate}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-5 md:p-6 pt-0 space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-2">
          <button 
            onClick={handleOpenMaps}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-left group/loc min-w-0"
          >
            <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0 group-hover/loc:scale-110 transition-transform" />
            <span className="text-[11px] md:text-sm truncate font-normal border-b border-transparent group-hover/loc:border-primary/30">{translateLocation(job.location, t)}</span>
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="w-3.5 h-3.5 text-accent shrink-0" />
            <div className="flex flex-col min-w-0">
               <span className={cn("text-[11px] md:text-sm font-semibold text-foreground truncate", (!job.salaryType || job.salaryType === 'display_range') ? "" : "font-semibold uppercase")}>
                 {salaryDisplay}
               </span>
               {(!job.salaryType || job.salaryType === 'display_range') && (
                 <span className="text-[8px] uppercase font-medium text-muted-foreground">{getSalaryUnit((job as any).salaryBasis)}</span>
               )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span className="text-[11px] md:text-sm font-normal">{job.experienceRequired}+ Yrs Exp</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span className="text-[11px] md:text-sm font-normal truncate">
              {isPieceRate ? "N/A" : formatShiftTiming(job.shiftTiming || job.interviewTimings)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span className="text-[11px] md:text-sm font-normal truncate">{genderText}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-accent/5 border border-accent/10 p-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm group-hover:bg-accent/10 transition-colors">
            <Navigation className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
            <span className="font-semibold text-accent text-[11px] md:text-xs">
               {distanceLabel}
            </span>
          </div>
          <div className="flex-1 bg-muted/50 border border-muted p-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm group-hover:bg-muted/80 transition-colors">
            <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="font-semibold text-muted-foreground text-[11px] md:text-xs">
              {mounted ? formatCompactNumber(job.views || 0) : "0"} {t.views}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-1">
          {b.esi && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-green-100" title="ESI & EPF">
               <ShieldCheck className="w-2.5 h-3" /> ESI & EPF
            </div>
          )}
          {b.attendance_incentive && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-blue-100" title="Attendance Incentive">
               <Timer className="w-2.5 h-3" /> Attendance
            </div>
          )}
          {b.overtime_pay && (
            <div className="flex items-center gap-1 bg-primary/5 text-primary px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-primary/10" title="Overtime Pay (OT)">
               <Clock className="w-2.5 h-3" /> OT Pay
            </div>
          )}
          {b.production_incentive && (
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-amber-100" title="Production Incentive">
               <Zap className="w-2.5 h-3" /> Production
            </div>
          )}
          {b.referral_bonus && (
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-indigo-100" title="Referral Bonus">
               <Users className="w-2.5 h-3" /> Referral
            </div>
          )}
          {b.transport && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-blue-100" title="Free Transport">
               <Bus className="w-2.5 h-3" /> {t.transport}
            </div>
          )}
          {(b.bachelor_accommodation || b.family_accommodation || b.accommodation) && (
            <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-purple-100" title="Accommodation">
               <Home className="w-2.5 h-3" /> Hostel
            </div>
          )}
          {b.food && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-orange-100" title="Free Meals">
               <ShoppingBag className="w-2.5 h-3" /> Free Food
            </div>
          )}
          {b.mobile_allowance && (
            <div className="flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-cyan-100" title="Mobile Allowance">
               <Smartphone className="w-2.5 h-3" /> Mobile
            </div>
          )}
          {b.petrol_allowance && (
            <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-teal-100" title="Petrol Allowance">
               <Navigation className="w-2.5 h-3" /> Petrol
            </div>
          )}
          {b.skill_training && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-emerald-100" title="Skill Training">
               <GraduationCap className="w-2.5 h-3" /> Training
            </div>
          )}
          {b.teaCash && (
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium border border-amber-100" title="Tea Cash">
               <Coffee className="w-2.5 h-3" /> {t.teaCash}
            </div>
          )}
          {b.bonusEnabled && (
            <div className="flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-medium text-muted-foreground border">
               <Gift className="w-2.5 h-3" /> {b.bonusValue ? `Bonus (${b.bonusType === 'percentage' ? `${b.bonusValue}%` : `₹${b.bonusValue}`})` : t.bonus}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 md:p-6 pt-0 flex gap-2 mt-auto">
        <Link href={`/jobs/${job.jobId || (job as any).id}`} className="flex-1">
          <Button variant="outline" className="w-full font-medium h-10 md:h-11 text-xs md:text-sm rounded-xl border-primary/20 text-primary hover:bg-primary/5 hover:text-primary focus:text-primary active:scale-95 transition-all">
            {t.details}
          </Button>
        </Link>
        <Link href={`/jobs/${job.jobId || (job as any).id}`} className="flex-1">
          <Button className={cn("w-full font-medium h-10 md:h-11 text-xs md:text-sm rounded-xl flex items-center justify-center gap-1 shadow-lg transition-transform active:scale-95", isApplied ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary/90 text-white shadow-primary/20")}>
            {isApplied ? <><CheckCircle2 className="w-3.5 h-3.5" /> {t.applied}</> : <>{t.apply} <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" /></>}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

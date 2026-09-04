
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Filter, 
  ArrowRight, 
  Star, 
  Briefcase, 
  PlusCircle, 
  Building2,
  MessageCircle,
  Headphones,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  User,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
  ShieldAlert,
  Lock,
  Heart,
  Navigation,
  Loader2,
  Gift,
  Timer,
  Tags,
  UserCircle,
  RefreshCw,
  Power
} from "lucide-react";
import { JobListing } from "@/lib/types";
import { JobCard } from "@/components/jobs/JobCard";
import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn, calculateDistance, getLocalizedDesignation } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { collection, query, where, limit, orderBy, doc, setDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { isAfter, startOfDay, subDays, isBefore, addDays, isValid } from "date-fns";
import { BRANDING } from "@/lib/branding";
import { DepartmentLogo } from "@/components/shared/DepartmentLogo";
import { AppLogo } from "@/components/shared/AppLogo";

import {
  WORKER_CLASSIFICATION,
  STAFF_CLASSIFICATION,
  WORKER_CATEGORIES_BASE,
  STAFF_CATEGORIES_BASE
} from "@/lib/constants";

export default function Home() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("nearby");
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [mainCategory, setMainCategory] = useState<'Non-Technical' | 'Technical'>('Non-Technical');
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const profileRef = useMemo(() => (user?.uid && db) ? doc(db, "Users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc<any>(profileRef);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.debug("Home location detection skipped"),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (profile && profile.role === 'employer' && !profile.welcomeOfferClaimed && db && user?.uid) {
      setDoc(doc(db, "Users", user.uid), {
        postCredits: 6,
        totalPurchased: 0,
        totalUsed: 0,
        welcomeOfferClaimed: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [profile, db, user?.uid]);

  const masterDesignationsQuery = useMemo(() => db ? query(collection(db, "Designations")) : null, [db]);
  const { data: masterDesignations } = useCollection<any>(masterDesignationsQuery);

  const employersQuery = useMemo(() => db ? query(collection(db, "Users"), where("role", "==", "employer")) : null, [db]);
  const { data: employersList } = useCollection<any>(employersQuery);

  const employerStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (employersList) {
      employersList.forEach(e => { map[e.id] = e.status || 'approved'; });
    }
    return map;
  }, [employersList]);

  useEffect(() => {
    const saved = localStorage.getItem('sim_job_seeker_category') as 'Non-Technical' | 'Technical';
    if (saved) setMainCategory(saved);
  }, []);

  const jobsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "Jobs"),
      where("status", "==", "approved")
    );
  }, [db]);

  const { data: liveJobs, loading: jobsLoading } = useCollection<JobListing>(jobsQuery as any);

  const parseIndustrialDate = (val: any) => {
    if (!val) return null;
    if (val.toDate) return val.toDate(); 
    if (val.seconds) return new Date(val.seconds * 1000); 
    const d = new Date(val);
    return isValid(d) ? d : null;
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!liveJobs) return counts;

    const now = startOfDay(new Date());
    const fifteenDaysAgo = subDays(now, 15);
    
    let activeTotal = 0;

    liveJobs.forEach(job => {
      if ((job.status as string) !== 'approved' && (job.status as string) !== 'live' && (job.status as string) !== 'open') return;
      // STRICT FILTER: Explicitly exclude closed or archived jobs
      if ((job.status as string) === 'closed' || (job.status as string) === 'archived') return;
      
      // NEW: Suspension Check - Don't count jobs from suspended units
      if (employerStatusMap[job.employerId] === 'suspended') return;

      const createdAtDate = parseIndustrialDate(job.createdAt) || new Date(0);
      if (isBefore(createdAtDate, fifteenDaysAgo)) return;

      const interviewEndDateStr = job.interviewEndDate || job.interviewStartDate;
      const autoCloseDateStr = job.autoCloseDate;
      
      let isTemporalExpired = false;
      const autoCloseDate = parseIndustrialDate(autoCloseDateStr);
      const interviewEndDate = parseIndustrialDate(interviewEndDateStr);

      if (autoCloseDate && isBefore(addDays(startOfDay(autoCloseDate), 1), now)) {
        isTemporalExpired = true;
      } else if (interviewEndDate && isBefore(addDays(startOfDay(interviewEndDate), 1), now)) {
        isTemporalExpired = true;
      }

      if (isTemporalExpired) return;

      activeTotal++;
      const key = `${job.category}_${job.department}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  }, [liveJobs, employerStatusMap]);

  const publicJobs = useMemo(() => {
    if (!liveJobs) return [];
    const now = startOfDay(new Date());
    const fifteenDaysAgo = subDays(now, 15);
    
    return liveJobs
      .filter(job => {
        if (job.category !== mainCategory) return false;
        if ((job.status as string) !== 'approved' && (job.status as string) !== 'live' && (job.status as string) !== 'open') return false;
        // STRICT FILTER: Explicitly exclude closed or archived jobs
        if ((job.status as string) === 'closed' || (job.status as string) === 'archived') return false;

        // NEW: Global Suspension Shield
        if (employerStatusMap[job.employerId] === 'suspended') return false;

        const createdAtDate = parseIndustrialDate(job.createdAt) || new Date(0);
        if (isBefore(createdAtDate, fifteenDaysAgo)) return false;

        const interviewEndDateStr = job.interviewEndDate || job.interviewStartDate;
        const autoCloseDateStr = job.autoCloseDate;
        
        let isTemporalExpired = false;
        const autoCloseDate = parseIndustrialDate(autoCloseDateStr);
        const interviewEndDate = parseIndustrialDate(interviewEndDateStr);

        if (autoCloseDate && isBefore(addDays(startOfDay(autoCloseDate), 1), now)) {
          isTemporalExpired = true;
        } else if (interviewEndDate && isBefore(addDays(startOfDay(interviewEndDate), 1), now)) {
          isTemporalExpired = true;
        }

        return !isTemporalExpired;
      })
      .sort((a, b) => {
        const timeA = parseIndustrialDate(a.createdAt)?.getTime() || 0;
        const timeB = parseIndustrialDate(b.createdAt)?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, 6); 
  }, [liveJobs, mainCategory, employerStatusMap]);

  const categoriesToDisplay = useMemo(() => {
    const base = mainCategory === 'Non-Technical' ? WORKER_CATEGORIES_BASE : STAFF_CATEGORIES_BASE;
    return base.map(cat => {
      const liveCount = categoryCounts[`${mainCategory}_${cat.id}`] || 0;
      return {
        ...cat,
        count: `${liveCount} Jobs`
      };
    });
  }, [mainCategory, categoryCounts]);

  const availableDesignations = useMemo(() => {
    if (!activeDept) return [];
    const classification = mainCategory === 'Non-Technical' ? WORKER_CLASSIFICATION : STAFF_CLASSIFICATION;
    const std = (classification as any)[activeDept] || [];
    const masters = (masterDesignations || [])
      .filter((d: any) => d.category === mainCategory && d.department === activeDept && d.status !== 'inactive')
      .map((d: any) => d.name);
    return Array.from(new Set([...std, ...masters]));
  }, [mainCategory, activeDept, masterDesignations]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("type", mainCategory);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (sortBy !== "latest") params.set("sort", sortBy);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleLoopScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth, scrollWidth } = ref.current;
      let scrollTo = direction === 'left' ? (scrollLeft <= 10 ? scrollWidth - clientWidth : scrollLeft - clientWidth / 1.5) : (scrollLeft + clientWidth >= scrollWidth - 10 ? 0 : scrollLeft + clientWidth / 1.5);
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleDeptClick = (deptId: string) => {
    setSelectedCategory(deptId); 
    const classification = mainCategory === 'Non-Technical' ? WORKER_CLASSIFICATION : STAFF_CLASSIFICATION;
    if ((classification as any)[deptId]) {
      setActiveDept(deptId);
    } else {
      router.push(`/jobs?type=${mainCategory}&category=${encodeURIComponent(deptId)}&sort=${sortBy}`);
    }
  };

  const handleDesignationClick = (des: string) => {
    setActiveDept(null);
    setSelectedCategory(des);
    router.push(`/jobs?type=${mainCategory}&category=${encodeURIComponent(des)}&sort=${sortBy}`);
  };

  const welcomeRemaining = useMemo(() => user ? Math.min(3, profile?.postCredits || 0) : 3, [user, profile]);
  const monthlyRemaining = useMemo(() => user ? Math.max(0, (profile?.postCredits || 0) - 3) : 3, [user, profile]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow pb-12">
        <section className="bg-primary pt-10 md:pt-20 pb-24 md:pb-32 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="max-w-6xl mx-auto text-center space-y-6 md:space-y-10 relative z-10">
            <div className="flex flex-col items-center gap-6 mb-6">
               <div className="w-48 h-32 md:w-72 md:h-48 bg-white rounded-[2.5rem] flex items-center justify-center p-6 shadow-2xl animate-in zoom-in duration-700 overflow-hidden">
                  <AppLogo section="header" width={160} height={160} priority />
               </div>
               <h1 className="text-3xl md:text-5xl font-semibold text-white font-headline tracking-tight drop-shadow-md">{t.heroTitle}</h1>
               <p className="text-primary-foreground/90 text-base md:text-xl max-w-3xl mx-auto font-normal leading-relaxed">{t.heroSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white text-left group hover:bg-white/20 transition-all">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/90 mb-1">For Job Seekers & Interns</p>
                  <p className="text-sm md:text-base font-normal leading-relaxed">{t.heroSeekerText}</p>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white text-left group hover:bg-white/20 transition-all">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">For Employers & Companies</p>
                  <p className="text-sm md:text-base font-normal leading-relaxed">{t.heroEmployerText}</p>
               </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl p-3 md:p-4 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-4 max-w-5xl mx-auto mt-12 border border-white/50">
              <div className="flex-1">
                <Select value={mainCategory} onValueChange={(v: any) => { setMainCategory(v); setSelectedCategory('all'); }}>
                  <SelectTrigger className="h-16 border-none shadow-none text-base md:text-lg font-medium bg-muted/30 rounded-2xl focus:ring-0">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <SelectValue placeholder="Job Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Technical" className="font-medium">{t.staff}</SelectItem>
                    <SelectItem value="Non-Technical" className="font-medium">{t.worker}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={(val) => handleDeptClick(val)}>
                  <SelectTrigger className="h-16 border-none shadow-none text-base md:text-lg font-medium bg-muted/30 rounded-2xl focus:ring-0">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-primary" />
                      <SelectValue placeholder={t.searchPlaceholder} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all" className="font-medium">{t.categories.all}</SelectItem>
                    {categoriesToDisplay.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="font-medium">
                        <div className="flex items-center gap-3">
                          <DepartmentLogo category={mainCategory} department={cat.id} className="w-6 h-6 rounded-lg shrink-0" />
                          {(t.categories as any)[cat.id] || (t.departments as any)[cat.id] || cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-16 border-none shadow-none text-base md:text-lg font-medium bg-muted/30 rounded-2xl focus:ring-0">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <SelectValue placeholder={t.sortBy} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="nearby" className="font-medium">{t.nearestToMe}</SelectItem>
                    <SelectItem value="latest" className="font-medium">{t.latestJobsSort}</SelectItem>
                    <SelectItem value="salary-high" className="font-medium">{t.highestSalary}</SelectItem>
                    <SelectItem value="exp-low" className="font-medium">{t.fresherFriendly}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="h-16 px-10 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg rounded-2xl shadow-xl shadow-accent/30 transition-transform active:scale-95">
                {t.apply}
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Auto & Manual Scrolling Hero Slider */}
        <section className="px-4 max-w-6xl mx-auto -mt-10 md:-mt-16 mb-8 relative z-20">
          <HeroSlider />
        </section>

        <section className="px-4 max-w-7xl mx-auto relative z-30 mb-16">
          <div className="bg-card rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-4 border-white p-8 md:p-14">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold font-headline tracking-tight">{t.popularCategories}</h2>
                <p className="text-sm md:text-base text-muted-foreground font-normal mt-1">Select track to explore opportunities</p>
              </div>
              <Tabs value={mainCategory} onValueChange={(v: any) => { setMainCategory(v); setSelectedCategory('all'); }} className="w-full md:w-auto">
                <TabsList className="bg-muted p-1 h-14 w-full md:w-auto rounded-2xl">
                  <TabsTrigger value="Technical" className="flex-1 md:flex-none font-medium px-6 data-[state=active]:bg-white rounded-xl text-sm md:text-base"><Building2 className="w-4 h-4 mr-2" /> {t.staff}</TabsTrigger>
                  <TabsTrigger value="Non-Technical" className="flex-1 md:flex-none font-medium px-6 data-[state=active]:bg-white rounded-xl text-sm md:text-base"><User className="w-4 h-4 mr-2" /> {t.worker}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="relative flex items-center group">
              <Button variant="outline" size="icon" className="absolute -left-2 md:-left-6 z-20 bg-white shadow-xl rounded-full h-12 w-12 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all" onClick={() => handleLoopScroll(scrollContainerRef, 'left')}><ChevronLeft className="h-6 w-6" /></Button>
              <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 px-1 w-full snap-x">
                {categoriesToDisplay.map((cat) => (
                  <button key={cat.id} onClick={() => handleDeptClick(cat.id)} className="shrink-0 w-[180px] md:w-[220px] snap-start group">
                    <div className={cn("flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] border-2 bg-white hover:border-primary hover:bg-primary/5 hover:-translate-y-2 hover:shadow-2xl duration-300 transition-all shadow-md h-[220px] w-full", (selectedCategory === cat.id || ((mainCategory === 'Non-Technical' ? WORKER_CLASSIFICATION : STAFF_CLASSIFICATION) as any)[cat.id]?.includes(selectedCategory)) && "border-primary bg-primary/5 shadow-inner")}>
                      <DepartmentLogo category={mainCategory} department={cat.id} className="w-14 h-14 md:w-16 md:h-16 mb-4 rounded-2xl group-hover:scale-110 transition-transform shadow-sm" />
                      <span className="font-medium text-sm md:text-base text-center leading-tight group-hover:text-primary transition-colors px-2">
                        {(t.categories as any)[cat.id] || (t.departments as any)[cat.id] || cat.name}
                      </span>
                      <span className="text-xs text-primary font-medium mt-3 bg-primary/10 px-3 py-1 rounded-full">{cat.count}</span>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="outline" size="icon" className="absolute -right-2 md:-right-6 z-20 bg-white shadow-xl rounded-full h-12 w-12 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all" onClick={() => handleLoopScroll(scrollContainerRef, 'right')}><ChevronRight className="h-6 w-6" /></Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold font-headline tracking-tight">
                {mainCategory === 'Technical' ? "Latest IT, Tech & Internship Jobs" : "Latest Skilled Trades & Daily Wage Jobs"}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-normal mt-1">
                {mainCategory === 'Technical' ? "Explore newly verified IT, developer, intern and corporate roles" : "Explore newly verified stitching, cutting, machine and trade positions"}
              </p>
            </div>
            <Link href={`/jobs?type=${mainCategory}`} className="w-full md:auto">
              <Button variant="outline" className="w-full md:w-auto h-12 px-8 rounded-2xl font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all text-sm md:text-base">
                View All {mainCategory === 'Technical' ? "IT & Tech" : "Skilled Trade"} Vacancies
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobsLoading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-full bg-white border border-slate-200 rounded-[3rem] p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded-[1.5rem]" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                        <Skeleton className="h-4 w-1/2 rounded-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <Skeleton className="h-4 w-5/6 rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20 rounded-lg" />
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                  </Card>
                ))}
              </>
            ) : publicJobs.length > 0 ? (
              publicJobs.map((job) => (
                <JobCard key={job.jobId || (job as any).id} job={{ ...job, jobId: job.jobId || (job as any).id }} userCoords={userCoords} masterDesignations={masterDesignations} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/10">
                <p className="font-medium text-xl text-muted-foreground">
                  No {mainCategory === 'Technical' ? "IT, Tech or Internship" : "Skilled Trade or Daily Wage"} opportunities found today. Check back soon!
                </p>
              </div>
            )}
            
            <Link href={`/jobs?type=${mainCategory}`} className="h-full">
              <Card className="h-full bg-primary/5 border-dashed border-2 border-primary/20 flex flex-col items-center justify-center p-10 text-center hover:bg-primary/10 transition-all group rounded-[3rem] min-h-[360px]">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform"><PlusCircle className="w-10 h-10 text-primary" /></div>
                <h3 className="text-2xl font-semibold text-primary font-headline mb-3">{t.exploreMore}</h3>
                <p className="text-sm text-muted-foreground font-normal mb-8">
                  {mainCategory === 'Technical' ? "Explore hundreds of verified software, college internships and tech openings." : "Explore hundreds of verified daily wage, stitching, and factory opportunities."}
                </p>
                <Button className="rounded-[1.5rem] bg-primary text-white font-medium px-8 h-12 shadow-xl shadow-primary/20 text-base">Browse All <ArrowRight className="ml-2 w-5 h-5" /></Button>
              </Card>
            </Link>
          </div>
        </section>

        <section className="px-4 max-w-7xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="bg-gradient-to-br from-primary via-blue-700 to-indigo-900 text-white rounded-[3rem] border border-blue-500/30 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.5)] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="p-8 md:p-14 relative z-10">
              <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-0.5">
                   <h2 className="text-2xl md:text-3xl font-semibold font-headline tracking-tight uppercase">Special Hiring Benefits</h2>
                   <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Exclusive offers for verified employers</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                <div className="flex flex-col md:flex-row items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all gap-4">
                   <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-center md:text-left">
                      <span className="text-[10px] font-semibold uppercase bg-accent text-white px-3 py-1 rounded-full w-fit mx-auto md:mx-0">One-Time</span>
                      <div className="space-y-0.5">
                         <h3 className="text-lg font-medium leading-tight">WELCOME OFFER: 3 Free Job Posts</h3>
                         <p className="text-xs font-normal text-primary-foreground/70">Verified Employers Only • 15 Days Validity</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-medium bg-black/20 px-3 py-1.5 rounded-xl">[{welcomeRemaining}/3 Remaining]</span>
                      <Button onClick={() => router.push(user ? '/employer/post-job' : '/auth/signup')} className="bg-white text-primary hover:bg-primary-foreground font-medium h-11 px-6 rounded-xl active:scale-95 transition-all">Post →</Button>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all gap-4">
                   <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-center md:text-left">
                      <span className="text-[10px] font-semibold uppercase bg-green-500 text-white px-3 py-1 rounded-full w-fit mx-auto md:mx-0">Monthly</span>
                      <div className="space-y-0.5">
                         <h3 className="text-lg font-medium leading-tight">WELFARE OFFER: 3 Free Monthly Posts</h3>
                         <p className="text-xs font-normal text-primary-foreground/70">Every Month • Auto-Renews • Skilled & Daily Wage Roles</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-medium bg-black/20 px-3 py-1.5 rounded-xl">[{monthlyRemaining}/3 Remaining]</span>
                      <Button onClick={() => router.push(user ? '/employer/post-job' : '/auth/signup')} className="bg-white text-primary hover:bg-primary-foreground font-medium h-11 px-6 rounded-xl active:scale-95 transition-all">Post →</Button>
                   </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="px-4 py-8 max-w-7xl mx-auto">
          <Card className="bg-green-600 text-white rounded-[3rem] border-none shadow-2xl overflow-hidden relative group cursor-pointer" onClick={() => router.push('/communities')}>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform" />
             <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-6 relative z-10">
                <div className="flex items-center gap-6 md:gap-8">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20 shrink-0">
                      <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />
                   </div>
                   <div className="space-y-1 text-center md:text-left">
                      <h2 className="text-xl md:text-3xl font-semibold font-headline tracking-tight">{t.whatsappCommunity || "WhatsApp Channels"}</h2>
                      <p className="text-green-50 text-sm md:text-base font-normal max-w-md">
                        {t.whatsappDesc || "Get instant alerts for new jobs and internships directly on your WhatsApp Channels."}
                      </p>
                   </div>
                </div>
                <Button className="bg-white text-green-700 hover:bg-green-50 font-semibold px-8 h-14 rounded-2xl text-base shadow-xl flex items-center gap-2 shrink-0 active:scale-95 transition-all">
                   {t.joinNow || "Join Channel Now"} <ChevronRight className="w-5 h-5" />
                </Button>
             </div>
          </Card>
        </section>

        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-primary/10 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6 md:gap-8 text-center md:text-left">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-xl shrink-0 overflow-hidden p-3">
                  <AppLogo section="dashboard" width={80} height={80} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-3xl font-semibold text-primary font-headline tracking-tight">{t.verifiedCorpTitle}</h3>
                  <p className="text-muted-foreground font-normal text-sm md:text-base">{t.verifiedCorpSub}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                <div className="bg-muted/50 px-5 py-4 rounded-2xl border-2 border-dashed border-primary/20 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{t.msmeRegistered}</p>
                    <p className="text-xs md:text-sm font-medium text-primary mt-1">UDYAM-TN-28-0205876</p>
                  </div>
                </div>
                <div className="bg-muted/50 px-5 py-4 rounded-2xl border-2 border-dashed border-primary/20 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{t.gstCompliant}</p>
                    <p className="text-xs md:text-sm font-medium text-primary mt-1">33OQPPS2202M1Z9</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Dialog open={!!activeDept} onOpenChange={(open) => !open && setActiveDept(null)}>
          <DialogContent className="max-w-lg rounded-[3rem] max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
            <DialogHeader className="p-8 pb-6 bg-primary text-white text-left">
              <div className="flex items-center gap-4 mb-3">
                 <div className="w-14 h-14 rounded-2xl bg-white/20 p-2 flex items-center justify-center overflow-hidden backdrop-blur-md shadow-inner">
                   <DepartmentLogo category={mainCategory} department={activeDept || ""} className="w-full h-full rounded-xl" />
                 </div>
                 <DialogTitle className="text-2xl font-semibold font-headline tracking-tight">
                    {activeDept && ((t.departments as any)[activeDept] || activeDept)} {t.rolesTitle}
                 </DialogTitle>
              </div>
              <DialogDescription className="text-sm font-normal text-white/80">
                {t.rolesSub.replace('{dept}', activeDept ? ((t.departments as any)[activeDept] || activeDept) : '')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 p-8 overflow-y-auto scrollbar-hide flex-1">
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between h-14 mb-2 px-6 font-medium text-primary hover:bg-primary/5 active:text-primary focus:text-primary rounded-2xl transition-all text-base border-2 border-dashed border-primary/20" 
                onClick={() => { if (activeDept) router.push(`/jobs?type=${mainCategory}&category=${encodeURIComponent(activeDept)}&sort=${sortBy}`); setActiveDept(null); }}
              >
                <span>{t.viewAllDeptJobs.replace('{dept}', activeDept ? ((t.departments as any)[activeDept] || activeDept) : '')}</span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              {availableDesignations.map((des: string) => (
                <button key={des} className={cn("flex items-center justify-between h-14 px-6 text-base font-normal rounded-2xl border-2 border-primary/10 hover:bg-primary/5 group transition-all", selectedCategory === des && "bg-primary text-white border-primary font-medium")} onClick={() => handleDesignationClick(des)}>
                  <div className="flex items-center gap-3">
                    <DepartmentLogo category={mainCategory} department={activeDept || ""} className="w-7 h-7 rounded-lg shrink-0 border border-primary/5" />
                    {getLocalizedDesignation(des, masterDesignations, language, t)}
                  </div>
                  <ChevronRight className={cn("w-5 h-5 text-primary group-hover:translate-x-1 transition-transform", selectedCategory === des && "text-white")} />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { JobListing } from "@/lib/types";
import { JobCard } from "@/components/jobs/JobCard";
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  LocateFixed, 
  ChevronRight,
  User,
  Navigation,
  Loader2,
  Clock,
  Heart,
  AlertTriangle,
  Tags,
  UserCircle,
  Mic
} from "lucide-react";
import { cn, calculateDistance, getLocalizedDesignation } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Switch } from "@/components/ui/switch";
import { useFirestore, useCollection, useAuth } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { isBefore, startOfDay, subDays, isAfter, addDays } from "date-fns";
import { DepartmentLogo } from "@/components/shared/DepartmentLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const JobsMap = dynamic(() => import('@/components/jobs/JobsMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] rounded-[3rem] bg-muted animate-pulse flex items-center justify-center font-bold text-muted-foreground border-4 border-white shadow-xl">Initializing Map...</div>
});

import { CLASSIFICATION } from "@/lib/constants";

export default function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const paramsValue = React.use(params);
  const searchParamsValue = React.use(searchParams);

  const { t, language } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const initialCategory = typeof searchParamsValue?.category === 'string' ? searchParamsValue.category : 'all';
  const initialType = typeof searchParamsValue?.type === 'string' ? searchParamsValue.type : 'all';
  const initialSort = typeof searchParamsValue?.sort === 'string' ? searchParamsValue.sort : 'latest';
  const initialLocation = typeof searchParamsValue?.location === 'string' ? searchParamsValue.location : 'all';
  const initialDept = typeof searchParamsValue?.department === 'string' ? searchParamsValue.department : 'all';

  const [searchQuery, setSearchQuery] = useState("");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMapView, setIsMapView] = useState(false);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({ variant: "destructive", title: "Not Supported", description: "Your browser does not support voice search." });
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'Tamil' ? 'ta-IN' : (language === 'Hindi' ? 'hi-IN' : 'en-IN');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setSearchQuery(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };
  
  const [filters, setFilters] = useState({
    category: initialCategory, 
    company: 'all',
    location: initialLocation,
    type: initialType,
    department: initialDept,
    accommodation: false,
    food: false,
    gender: "any",
    minSalary: 0,
    maxExperience: 20,
    nearMe: initialSort === 'nearby',
    maxDistance: 10
  });

  const [sortBy, setSortBy] = useState(initialSort);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "GPS Not Supported" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        toast({ title: "Current Location Detected" });
      },
      () => {
        setIsLocating(false);
        toast({ variant: "destructive", title: "GPS Access Denied" });
        setFilters(prev => ({ ...prev, nearMe: false }));
        setSortBy("latest");
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (sortBy === 'nearby' || filters.nearMe) {
      if (!userCoords) handleGetLocation();
    }
  }, [sortBy, filters.nearMe, userCoords]);

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

  const availableDepartments = useMemo(() => {
    if (filters.type === 'Technical') return (CLASSIFICATION as any).Technical.departments;
    if (filters.type === 'Non-Technical') return (CLASSIFICATION as any)["Non-Technical"].departments;
    return [];
  }, [filters.type]);

  const availableDesignations = useMemo(() => {
    if (filters.department === 'all' || filters.type === 'all') return [];
    
    const std = (CLASSIFICATION as any)[filters.type]?.designations[filters.department] || [];
    const masters = (masterDesignations || [])
      .filter((d: any) => d.category === filters.type && d.department === filters.department)
      .map((d: any) => d.name);
      
    return Array.from(new Set([...std, ...masters]));
  }, [filters.department, filters.type, masterDesignations]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      type: initialType,
      category: initialCategory.trim(),
      location: initialLocation,
      department: initialDept,
      nearMe: initialSort === 'nearby'
    }));
    setSortBy(initialSort);
  }, [initialType, initialCategory, initialLocation, initialSort, initialDept]);

  const jobsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "Jobs"),
      where("status", "==", "approved")
    );
  }, [db]);
  
  const { data: liveJobs, loading: jobsLoading } = useCollection<JobListing>(jobsQuery as any);

  const appsQuery = useMemo(() => {
    if (!auth?.currentUser || !db) return null;
    return query(collection(db, "Applications"), where("jobSeekerId", "==", auth.currentUser.uid));
  }, [db, auth?.currentUser]);
  
  const { data: userApps } = useCollection<any>(appsQuery);

  const appliedJobIds = useMemo(() => {
    if (!userApps) return new Set<string>();
    return new Set(userApps.map(app => app.jobId));
  }, [userApps]);

  const allJobsWithLifecycle = useMemo(() => {
    const now = startOfDay(new Date());
    const fifteenDaysAgo = subDays(now, 15);
    return (liveJobs || [])
      .filter(j => {
        if ((j.status as string) !== 'approved' && (j.status as string) !== 'live' && (j.status as string) !== 'open') return false;
        // STRICT FILTER: Explicitly exclude closed or archived jobs
        if ((j.status as string) === 'closed' || (j.status as string) === 'archived') return false;
        
        if (employerStatusMap[j.employerId] === 'suspended') return false;

        const createdAtDate = j.createdAt ? new Date(j.createdAt) : new Date(0);
        if (isBefore(createdAtDate, fifteenDaysAgo)) return false;

        const interviewEndDateStr = j.interviewEndDate || j.interviewStartDate;
        const autoCloseDateStr = j.autoCloseDate;
        
        let isTemporalExpired = false;
        if (autoCloseDateStr && isBefore(addDays(startOfDay(new Date(autoCloseDateStr)), 1), now)) isTemporalExpired = true;
        else if (interviewEndDateStr && isBefore(addDays(startOfDay(new Date(interviewEndDateStr)), 1), now)) isTemporalExpired = true;

        return !isTemporalExpired;
      })
      .map(j => {
        let distance = null;
        if (userCoords && j.latitude && j.longitude) {
          distance = calculateDistance(userCoords.lat, userCoords.lng, j.latitude, j.longitude);
        }

        return {
          ...j,
          jobId: j.jobId || (j as any).id,
          createdAt: j.createdAt || new Date(0).toISOString(),
          calculatedDistance: distance
        };
      });
  }, [liveJobs, userCoords, employerStatusMap]);

  const filteredJobs = useMemo(() => {
    const queryLower = searchQuery.toLowerCase().trim();
    const catFilterLower = filters.category.toLowerCase().trim();

    return allJobsWithLifecycle.filter(job => {
      const textToSearch = [
        job.jobTitle,
        job.companyName,
        job.location,
        job.department,
        job.designation,
        job.category
      ].join(" ").toLowerCase();
      const matchesSearch = queryLower === "" || textToSearch.includes(queryLower);
      const matchesType = filters.type === 'all' || job.category === filters.type;

      let matchesCategory = filters.category === "all";
      if (!matchesCategory) {
        const jobDes = (job.designation || "").toLowerCase();
        const jobDept = (job.department || "").toLowerCase();
        const jobCat = (job.category || "").toLowerCase();
        matchesCategory = jobDes.includes(catFilterLower) || jobDept.includes(catFilterLower) || jobCat.includes(catFilterLower);
      }

      const matchesDept = filters.department === "all" || job.department === filters.department;
      const matchesLocationSelect = filters.location === "all" || (
        t.locations[filters.location as keyof typeof t.locations] && 
        job.location?.toLowerCase().includes(t.locations[filters.location as keyof typeof t.locations].toLowerCase())
      );

      const matchesAccommodation = !filters.accommodation || job.benefits?.accommodation;
      const matchesFood = !filters.food || job.benefits?.food;
      const matchesGender = filters.gender === "any" || job.genderPreference === filters.gender;
      const matchesSalary = (job.salaryMax || 999999) >= filters.minSalary;
      const matchesExperience = (job.experienceRequired || 0) <= filters.maxExperience;

      let matchesNearMe = true;
      if (filters.nearMe && userCoords) {
        matchesNearMe = job.calculatedDistance !== null && job.calculatedDistance <= filters.maxDistance;
      }
      
      return matchesSearch && matchesType && matchesCategory && matchesDept && matchesLocationSelect && matchesAccommodation && matchesFood && matchesGender && matchesSalary && matchesExperience && matchesNearMe;
    });
  }, [allJobsWithLifecycle, filters, searchQuery, t.locations, userCoords]);

  const sortedJobs = useMemo(() => {
    const jobs = [...filteredJobs];
    if (sortBy === 'nearby' && userCoords) {
      return jobs.sort((a, b) => (a.calculatedDistance || 999) - (b.calculatedDistance || 999));
    }
    if (sortBy === "salary-high") return jobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    if (sortBy === "exp-low") return jobs.sort((a, b) => (a.experienceRequired || 0) - (b.experienceRequired || 0));
    
    return jobs.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [filteredJobs, sortBy, userCoords]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pb-8">
        <div className="relative z-30 bg-primary py-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-semibold font-headline mb-6 text-white text-center md:text-left">{t.findJobs}</h1>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="md:w-48">
                <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val, department: "all", category: "all" }))}>
                  <SelectTrigger className="h-14 bg-white border-none shadow-lg rounded-2xl text-base md:text-lg font-medium">
                    <div className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /><SelectValue placeholder="Job Type" /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="font-medium">All Types</SelectItem>
                    <SelectItem value="Technical" className="font-medium">{t.staff}</SelectItem>
                    <SelectItem value="Non-Technical" className="font-medium">{t.worker}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-60">
                <Select disabled={filters.type === 'all'} value={filters.department} onValueChange={(val) => setFilters(prev => ({ ...prev, department: val, category: "all" }))}>
                  <SelectTrigger className="h-14 bg-white border-none shadow-lg rounded-2xl text-base md:text-lg font-medium">
                    <div className="flex items-center gap-2"><Tags className="w-5 h-5 text-primary" /><SelectValue placeholder={t.departmentLabel} /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="font-medium">All Departments</SelectItem>
                    {availableDepartments.map((dept: any) => (
                      <SelectItem key={dept} value={dept} className="font-medium">
                        <div className="flex items-center gap-3">
                           <DepartmentLogo category={filters.type} department={dept} className="w-6 h-6 rounded-lg shrink-0 border border-primary/5" />
                           {(t.departments as any)[dept] || dept}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-60">
                <Select disabled={filters.department === 'all'} value={filters.category} onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}>
                  <SelectTrigger className="h-14 bg-white border-none shadow-lg rounded-2xl text-base md:text-lg font-medium">
                    <div className="flex items-center gap-2"><UserCircle className="w-5 h-5 text-primary" /> <SelectValue placeholder="Specific Role" /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="font-medium">All Roles</SelectItem>
                    {availableDesignations.map(des => (
                      <SelectItem key={des} value={des} className="font-medium">
                        <div className="flex items-center gap-3">
                          <DepartmentLogo category={filters.type} department={filters.department} className="w-6 h-6 rounded-lg shrink-0 border border-primary/5" />
                          {getLocalizedDesignation(des, masterDesignations, language, t)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-14 bg-white border-none shadow-lg rounded-2xl text-base md:text-lg font-medium">
                    <div className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-primary" /><SelectValue placeholder={t.sortJobs} /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="nearby" className="font-medium">{t.nearestToMe}</SelectItem>
                    <SelectItem value="latest" className="font-medium">{t.latestJobsSort}</SelectItem>
                    <SelectItem value="salary-high" className="font-medium">{t.highestSalary}</SelectItem>
                    <SelectItem value="exp-low" className="font-medium">{t.fresherFriendly}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search jobs by role or company..." 
                  className="pl-12 pr-12 h-14 bg-white border-none shadow-lg rounded-2xl text-base md:text-lg font-medium" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl transition-all", isListening && "bg-red-100 text-red-500 animate-pulse")}
                  onClick={handleVoiceSearch}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-sm">
               <div className="flex items-center gap-3">
                 <Label className="text-white font-medium flex items-center gap-2"><LocateFixed className="w-4 h-4 text-accent" /> {t.nearMe}</Label>
                 <Switch checked={filters.nearMe} onCheckedChange={(v) => setFilters({...filters, nearMe: v})} />
               </div>
               {filters.nearMe && (
                 <div className="flex items-center gap-4 animate-in slide-in-from-left-2">
                    <Label className="text-white text-xs font-medium whitespace-nowrap">{t.radius}: {filters.maxDistance} {t.km}</Label>
                    <Slider value={[filters.maxDistance]} min={1} max={50} step={1} onValueChange={([v]) => setFilters({...filters, maxDistance: v})} className="w-32 md:w-48" />
                 </div>
               )}
               {isLocating && <Badge className="bg-accent text-accent-foreground animate-pulse font-medium">Detecting GPS...</Badge>}
            </div>

            {(filters.category !== 'all' || filters.department !== 'all') && (
              <div className="mt-4 flex flex-wrap items-center gap-2 animate-in slide-in-from-left-4">
                {filters.category !== 'all' && (
                  <Badge className="bg-accent text-accent-foreground font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2">
                    Role: {getLocalizedDesignation(filters.category, masterDesignations, language, t)} 
                    <button onClick={() => setFilters(p => ({...p, category: 'all'}))} className="hover:scale-125 transition-transform"><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {filters.department !== 'all' && (
                  <Badge className="bg-primary text-white font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2">
                    Dept: {(t.departments as any)[filters.department] || filters.department}
                    <button onClick={() => setFilters(p => ({...p, department: 'all', category: 'all'}))} className="hover:scale-125 transition-transform"><X className="w-3 h-3" /></button>
                  </Badge>
                )}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-white/80 text-xs font-medium px-1">
               <div className="flex items-center gap-1.5"><Badge variant="outline" className="border-white/20 text-white rounded-md h-5 px-1 text-[8px]">M</Badge> {t.malePreferred}</div>
               <div className="flex items-center gap-1.5"><Badge variant="outline" className="border-white/20 text-white rounded-md h-5 px-1 text-[8px]">F</Badge> {t.femalePreferred}</div>
               <div className="flex items-center gap-1.5"><Badge variant="outline" className="border-white/20 text-white rounded-md h-5 px-1 text-[8px]">A</Badge> {t.anyGender}</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-end mb-6">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border-2 inline-flex items-center">
              <Button 
                variant={!isMapView ? "default" : "ghost"} 
                className={cn("rounded-xl px-8 h-10 font-bold transition-all", !isMapView && "bg-primary text-white shadow-md")}
                onClick={() => setIsMapView(false)}
              >
                List View
              </Button>
              <Button 
                variant={isMapView ? "default" : "ghost"} 
                className={cn("rounded-xl px-8 h-10 font-bold transition-all", isMapView && "bg-primary text-white shadow-md")}
                onClick={() => setIsMapView(true)}
              >
                Map View
              </Button>
            </div>
          </div>

          {jobsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full bg-white rounded-[3rem] p-6 space-y-4">
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
            </div>
          ) : sortedJobs.length > 0 ? (
            isMapView ? (
              <JobsMap 
                jobs={sortedJobs} 
                userCoords={userCoords} 
                appliedJobIds={appliedJobIds} 
                masterDesignations={masterDesignations || []} 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedJobs.map((job) => (
                  <JobCard key={job.jobId} job={job} isApplied={appliedJobIds.has(job.jobId!)} userCoords={userCoords} masterDesignations={masterDesignations} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-muted-foreground shadow-sm">
                 <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">{t.noResults}</h3>
                <p className="text-muted-foreground font-normal max-w-sm mx-auto">{t.tryRemoving}</p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    category: 'all',
                    company: 'all',
                    location: 'all',
                    type: 'all',
                    department: "all",
                    accommodation: false,
                    food: false,
                    gender: "any",
                    minSalary: 0,
                    maxExperience: 20,
                    nearMe: false,
                    maxDistance: 10
                  })}
                  className="mt-4 rounded-xl font-medium border-primary text-primary"
                >
                  {t.clearAll}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

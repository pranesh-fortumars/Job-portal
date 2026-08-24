"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { 
  Briefcase, 
  IndianRupee, 
  MapPin, 
  Users, 
  Clock, 
  Save, 
  ArrowLeft, 
  Heart, 
  Bus, 
  Coffee, 
  Calendar as CalendarIcon, 
  User, 
  Zap, 
  ShoppingBag,
  Home,
  ShieldCheck,
  LocateFixed,
  Loader2,
  Gift,
  Timer,
  Plus,
  Trash2,
  CheckCircle2,
  Smartphone,
  X,
  FileText,
  BadgeInfo,
  CalendarCheck,
  Tag,
  Info,
  Layers,
  ChevronRight,
  RefreshCw,
  Navigation,
  GraduationCap
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth, useFirestore, useDoc, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, setDoc, query, where } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn, translateLocation } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerDropdown } from "@/components/ui/date-picker-dropdown";
import { Badge } from "@/components/ui/badge";
import { addDays, startOfDay, subDays, isBefore, isAfter, startOfMonth, addMonths, differenceInDays } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

import { CLASSIFICATION } from "@/lib/constants";

const getTime = (val: any) => {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.seconds) return val.seconds * 1000;
  if (val.toMillis) return val.toMillis();
  if (val.toDate) return val.toDate().getTime();
  const d = new Date(val).getTime();
  return isNaN(d) ? Date.now() : d;
};

export default function PostJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const { toast } = useToast();
  const { t } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();
  
  const userRef = useMemo(() => (auth?.currentUser && db) ? doc(db, "Users", auth.currentUser.uid) : null, [db, auth?.currentUser?.uid]);
  const { data: userData, loading: userLoading } = useDoc<any>(userRef);

  useEffect(() => {
    if (!userLoading && userData && userData.status !== 'approved') {
      router.push("/employer/dashboard");
    }
  }, [userData, userLoading, router]);

  const jobsQuery = useMemo(() => (auth?.currentUser && db) ? query(collection(db, "Jobs"), where("employerId", "==", auth.currentUser.uid)) : null, [db, auth?.currentUser?.uid]);
  const { data: rawJobs } = useCollection<any>(jobsQuery);

  const [loading, setLoading] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxAllowedDate = useMemo(() => addDays(today, 15), [today]);

  const offerStats = useMemo(() => {
    if (!userData || !rawJobs) return null;
    
    const now = new Date();
    const regDate = userData.createdAt ? (userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)) : subDays(now, 1);
    const welcomeExpiry = addDays(regDate, 7);
    const isWelcomeExpired = isBefore(welcomeExpiry, now);
    
    const spentJobs = rawJobs.filter((j: any) => j.status !== 'deleted' && j.status !== 'draft')
      .sort((a: any, b: any) => getTime(a.createdAt) - getTime(b.createdAt));
    
    const welcomeJobs = spentJobs.filter((j: any) => isBefore(new Date(j.createdAt), welcomeExpiry)).slice(0, 3);
    const welcomeUsed = welcomeJobs.length;
    const welcomeRemaining = isWelcomeExpired ? 0 : 3 - welcomeUsed;
    
    const monthStart = startOfMonth(now);
    const welfareJobs = spentJobs.filter((j: any) => 
      j.category === 'Non-Technical' && 
      isAfter(new Date(j.createdAt), monthStart) && 
      !welcomeJobs.find(wj => wj.id === j.id)
    ).slice(0, 3);
    const welfareUsed = welfareJobs.length;
    const welfareRemaining = 3 - welfareUsed;
    
    const purchasedAllocated = userData.totalPurchased || 0;
    const otherJobs = spentJobs.filter((j: any) => 
      !welcomeJobs.find(wj => wj.id === j.id) && 
      !welfareJobs.find(wj => wj.id === j.id)
    );
    const purchasedUsed = otherJobs.length;
    const purchasedRemaining = Math.max(0, purchasedAllocated - purchasedUsed);

    const workerSpent = spentJobs.filter((j: any) => j.category === 'Non-Technical').length;
    const staffSpent = spentJobs.filter((j: any) => j.category === 'Technical').length;

    return {
      welcome: { used: welcomeUsed, remaining: welcomeRemaining, total: 3, expiry: welcomeExpiry, daysLeft: Math.max(0, differenceInDays(welcomeExpiry, now)) },
      welfare: { used: welfareUsed, remaining: welfareRemaining, total: 3, reset: addMonths(monthStart, 1), daysToReset: differenceInDays(addMonths(monthStart, 1), now) },
      purchased: { used: purchasedUsed, remaining: purchasedRemaining, total: purchasedAllocated },
      workerRemaining: welcomeRemaining + welfareRemaining + purchasedRemaining,
      staffRemaining: welcomeRemaining + purchasedRemaining,
      totalAvailable: welcomeRemaining + welfareRemaining + purchasedRemaining,
      totalUsed: welcomeUsed + welfareUsed + purchasedUsed
    };
  }, [userData, rawJobs]);

  const availableCredits = useMemo(() => offerStats?.totalAvailable || 0, [offerStats]);

  const [category, setCategory] = useState<'Technical' | 'Non-Technical'>('Non-Technical');
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [workType, setWorkType] = useState<string>("Full-time");
  const [openings, setOpenings] = useState("1");
  const [experience, setExperience] = useState("0");
  const [gender, setGender] = useState("any");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryBasis, setSalaryBasis] = useState("monthly");
  const [salaryType, setSalaryType] = useState("display_range");
  const [payoutSchedule, setPayoutSchedule] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  
  const [interviewStartDate, setInterviewStartDate] = useState<string | null>(null);
  const [interviewEndDate, setInterviewEndDate] = useState<string | null>(null);
  const [shiftTiming, setShiftTiming] = useState("");
  const [autoCloseDate, setAutoCloseDate] = useState<string | null>(null);

  const [benefits, setBenefits] = useState<any>({
    esi: false, 
    epf: false, 
    attendance_incentive: false,
    overtime_pay: false,
    production_incentive: false,
    referral_bonus: false,
    transport: false, 
    bachelor_accommodation: false,
    family_accommodation: false,
    food: false, 
    mobile_allowance: false,
    petrol_allowance: false,
    skill_training: false,
    teaCash: false, 
    accommodation: false, 
    bonusEnabled: false, 
    bonus: "",
    bonusType: "percentage",
    bonusValue: ""
  });

  const [coreSkills, setCoreSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [buyersHandled, setBuyersHandled] = useState("");
  const [auditExperience, setAuditExperience] = useState("");
  const [certifications, setCertifications] = useState("");

  useEffect(() => {
    if (salaryBasis === 'piece') {
      setSalaryMin("N/A");
      setSalaryMax("N/A");
      setShiftTiming("N/A");
      setWorkType("Piece Rate");
    } else {
      if (salaryMin === "N/A") setSalaryMin("");
      if (salaryMax === "N/A") setSalaryMax("");
      if (shiftTiming === "N/A") setShiftTiming("");
    }
  }, [salaryBasis]);

  useEffect(() => {
    if (userData && !draftId) {
      const profileLocation = userData.fullAddress || userData.area || "";
      if (!location) setLocation(profileLocation);
      if (latitude === null && userData.latitude) setLatitude(userData.latitude);
      if (longitude === null && userData.longitude) setLongitude(userData.longitude);
    }
  }, [userData, draftId, location, latitude, longitude]);

  const masterDesignationsQuery = useMemo(() => db ? query(collection(db, "Designations")) : null, [db]);
  const { data: masterDesignations } = useCollection<any>(masterDesignationsQuery);

  useEffect(() => {
    if (draftId && db) {
      getDoc(doc(db, "Jobs", draftId)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setCategory(data.category || 'Non-Technical');
          setDepartment(data.department || "");
          setTimeout(() => { setDesignation(data.designation || ""); }, 0);
          setWorkType(data.workType || "Full-time");
          setOpenings(data.openings?.toString() || "1");
          setExperience(data.experienceRequired?.toString() || "0");
          setGender(data.genderPreference || "any");
          setSalaryBasis(data.salaryBasis || "monthly");
          setSalaryMin(data.salaryMin?.toString() || "");
          setSalaryMax(data.salaryMax?.toString() || "");
          setSalaryType(data.salaryType || "display_range");
          setPayoutSchedule(data.payoutSchedule || "");
          setLocation(data.location || "");
          setLatitude(data.latitude || null);
          setLongitude(data.longitude || null);
          setDescription(data.description || "");
          setContactDetails(data.contactDetails || "");
          setInterviewStartDate(data.interviewStartDate || null);
          setInterviewEndDate(data.interviewEndDate || null);
          setShiftTiming(data.shiftTiming || data.interviewTimings || "");
          setAutoCloseDate(data.autoCloseDate || null);
          if (data.benefits) setBenefits({ ...benefits, ...data.benefits });
          if (data.category === 'Technical') {
            setCoreSkills(data.coreSkills || []);
            setBuyersHandled(data.buyersHandled || "");
            setAuditExperience(data.auditExperience || "");
            setCertifications(data.certifications || "");
          }
        }
      });
    }
  }, [draftId, db]);

  const designations = useMemo(() => {
    if (!department || !category) return [];
    const std = (CLASSIFICATION as any)[category]?.designations[department] || [];
    const masters = (masterDesignations || [])
      .filter((d: any) => d.category === category && d.department === department)
      .map((d: any) => d.name);
    return Array.from(new Set([...std, ...masters]));
  }, [category, department, masterDesignations]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLatitude(lat);
        setLongitude(lng);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
          const data = await res.json();
          if (data?.display_name) { setLocation(data.display_name); toast({ title: "Exact Location Captured" }); }
        } catch (e) { toast({ title: "Coordinates Locked" }); } finally { setIsLocating(false); }
      },
      () => { setIsLocating(false); toast({ variant: "destructive", title: "GPS Access Denied" }); },
      { enableHighAccuracy: true }
    );
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = newSkill.trim().replace(',', '');
      if (skill && !coreSkills.includes(skill)) { setCoreSkills([...coreSkills, skill]); setNewSkill(""); }
    }
  };

  const removeSkill = (skill: string) => { setCoreSkills(coreSkills.filter(s => s !== skill)); };

  const buildJobData = (status: 'pending' | 'draft') => ({
    employerId: auth?.currentUser?.uid,
    companyName: userData?.companyName || "Verified Factory", 
    companyLogoUrl: userData?.companyLogoUrl || "",
    jobTitle: designation || "Industrial Role",
    category, department, designation, workType,
    openings: parseInt(openings) || 0,
    experienceRequired: parseInt(experience) || 0,
    genderPreference: gender,
    salaryMin: salaryType === 'display_range' ? (salaryBasis === 'piece' ? 0 : (parseInt(salaryMin) || 0)) : 0,
    salaryMax: salaryType === 'display_range' ? (salaryBasis === 'piece' ? 0 : (parseInt(salaryMax) || 0)) : 0,
    salaryBasis, salaryType, payoutSchedule,
    location, latitude, longitude,
    description, contactDetails,
    interviewStartDate, interviewEndDate,
    shiftTiming, interviewTimings: shiftTiming,
    autoCloseDate, benefits,
    isEmployerVerified: userData?.status === 'approved',
    status, createdAt: new Date().toISOString(),
    ...(category === 'Technical' ? { coreSkills, buyersHandled, auditExperience, certifications } : {})
  });

  const handleSaveDraft = async () => {
    if (!auth?.currentUser || !db) return;
    setIsDrafting(true);
    try {
      const jobData = buildJobData('draft');
      if (draftId) await updateDoc(doc(db, "Jobs", draftId), { ...jobData, updatedAt: serverTimestamp() });
      else await addDoc(collection(db, "Jobs"), jobData);
      toast({ title: t.saveDraftSuccess });
      router.push("/employer/dashboard");
    } catch (err) { toast({ variant: "destructive", title: "Save Failed" }); } finally { setIsDrafting(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !userData || !db) return;
    if (availableCredits < 1) { toast({ variant: "destructive", title: "No Credits Available" }); router.push("/pricing"); return; }
    if (!department || !designation || !location) { toast({ variant: "destructive", title: "Missing Fields" }); return; }

    setLoading(true);
    try {
      const jobData = buildJobData('pending');
      if (draftId) await updateDoc(doc(db, "Jobs", draftId), { ...jobData, updatedAt: serverTimestamp() });
      else await addDoc(collection(db, "Jobs"), jobData);
      
      await updateDoc(doc(db, "Users", auth.currentUser.uid), { 
        totalUsed: increment(1),
        postCredits: increment(-1),
        updatedAt: serverTimestamp() 
      });

      toast({ title: "Job Posted for Approval!" });
      router.push("/employer/dashboard");
    } catch (error) { toast({ variant: "destructive", title: "Error Posting Job" }); } finally { setLoading(false); }
  };

  if (userLoading) return <div className="h-screen flex items-center justify-center font-bold text-primary gap-3"><Loader2 className="animate-spin" /> Verifying Industrial Pool...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-8">
           <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => router.back()} className="font-bold text-primary gap-2">
                 <ArrowLeft className="w-4 h-4" /> {t.backToPrev}
              </Button>
              <div 
                onClick={() => setShowBreakdown(true)}
                className={cn(
                  "px-6 py-2 rounded-2xl border-2 border-dashed flex items-center gap-3 transition-all cursor-pointer hover:bg-primary/10 hover:border-primary/40", 
                  availableCredits > 0 ? "bg-primary/5 border-primary/20 text-primary" : "bg-red-50 border-red-200 text-red-600"
                )}
              >
                 <Zap className="w-5 h-5 fill-current" />
                 <span className="font-black text-sm uppercase tracking-tight">Shared Balance: {availableCredits} Credits Available</span>
                 <BadgeInfo className="w-3.5 h-3.5 opacity-50" />
              </div>
           </div>

           <Card className="rounded-[2.5rem] overflow-hidden shadow-2xl border-none">
              <CardHeader className="bg-primary text-white p-8 md:p-12">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                       <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                       <CardTitle className="text-3xl md:text-5xl font-black font-headline tracking-tight">{t.postJobNow}</CardTitle>
                       <CardDescription className="text-primary-foreground/80 font-bold uppercase text-xs tracking-[0.2em]">Verified Industrial Listing Terminal</CardDescription>
                    </div>
                 </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                 <CardContent className="p-8 md:p-12 space-y-16">
                    <section className="space-y-8">
                       <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                          <Tag className="w-6 h-6" /> Identity & Quota
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Category</Label>
                             <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                                <SelectTrigger className="h-12 rounded-xl font-black bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                                <SelectContent className="font-bold rounded-xl"><SelectItem value="Non-Technical">{t.worker}</SelectItem><SelectItem value="Technical">{t.staff}</SelectItem></SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.departmentLabel}</Label>
                             <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger className="h-12 rounded-xl font-black bg-muted/20 border-none"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                                <SelectContent className="font-bold rounded-xl max-h-[300px]">
                                   {CLASSIFICATION[category].departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.designationLabel}</Label>
                             <Select key={`${category}-${department}-${draftId || 'new'}`} value={designation} onValueChange={setDesignation}>
                                <SelectTrigger className="h-12 rounded-xl font-black bg-muted/20 border-none"><SelectValue placeholder="Select Role" /></SelectTrigger>
                                <SelectContent className="font-bold rounded-xl max-h-[300px]">
                                   {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.openingsLabel}</Label>
                             <Input type="number" value={openings} onChange={e => setOpenings(e.target.value)} className="h-12 rounded-xl font-black border-primary/10" min="1" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Min Exp (Years)</Label>
                             <Input type="number" value={experience} onChange={e => setExperience(e.target.value)} className="h-12 rounded-xl font-black border-primary/10" min="0" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Gender Preference</Label>
                             <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger className="h-12 rounded-xl font-black border-primary/10"><SelectValue /></SelectTrigger>
                                <SelectContent className="font-bold rounded-xl">
                                  <SelectItem value="any">{t.anyGender}</SelectItem>
                                  <SelectItem value="male">{t.malePreferred}</SelectItem>
                                  <SelectItem value="female">{t.femalePreferred}</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Work Type</Label>
                             <Select disabled={salaryBasis === 'piece'} value={workType} onValueChange={setWorkType}>
                                <SelectTrigger className={cn("h-12 rounded-xl font-black border-primary/10", salaryBasis === 'piece' && "bg-muted opacity-50")}><SelectValue /></SelectTrigger>
                                <SelectContent className="font-bold rounded-xl"><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Shift">Shift Based</SelectItem><SelectItem value="Piece Rate">Piece Rate</SelectItem></SelectContent>
                             </Select>
                          </div>
                       </div>
                    </section>

                    <section className="space-y-8">
                       <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                          <IndianRupee className="w-6 h-6" /> Compensation & Timing
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-2 col-span-1 md:col-span-3">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Salary Details</Label>
                             <Select value={salaryType} onValueChange={setSalaryType}>
                                <SelectTrigger className="h-12 rounded-xl font-black border-primary/10">
                                   <SelectValue placeholder="Select Salary Visibility" />
                                </SelectTrigger>
                                <SelectContent className="font-bold rounded-xl">
                                   <SelectItem value="display_range">Display Salary Range</SelectItem>
                                   <SelectItem value="not_disclosed">Salary Not Disclosed</SelectItem>
                                   <SelectItem value="negotiable">Negotiable</SelectItem>
                                   <SelectItem value="experience_based">Based on Experience</SelectItem>
                                   <SelectItem value="company_standard">As Per Company Standards</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          
                          {salaryType === 'display_range' && (
                            <div className="md:col-span-2 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                               <div className="space-y-2">
                                  <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Min Salary (₹)</Label>
                                  <Input disabled={salaryBasis === 'piece'} value={salaryMin} onChange={e => setSalaryMin(e.target.value)} className={cn("h-12 rounded-xl font-black border-primary/10", salaryBasis === 'piece' && "bg-muted opacity-50")} placeholder={salaryBasis === 'piece' ? "N/A" : "e.g. 15000"} />
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Max Salary (₹)</Label>
                                  <Input disabled={salaryBasis === 'piece'} value={salaryMax} onChange={e => setSalaryMax(e.target.value)} className={cn("h-12 rounded-xl font-black border-primary/10", salaryBasis === 'piece' && "bg-muted opacity-50")} placeholder={salaryBasis === 'piece' ? "N/A" : "e.g. 20000"} />
                               </div>
                            </div>
                          )}

                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Salary Basis</Label>
                             <Select value={salaryBasis} onValueChange={setSalaryBasis}>
                                <SelectTrigger className="h-12 rounded-xl font-black border-primary/10"><SelectValue /></SelectTrigger>
                                <SelectContent className="font-bold rounded-xl"><SelectItem value="monthly">Monthly Salary</SelectItem><SelectItem value="shift">Per Shift</SelectItem><SelectItem value="piece">Piece Rate</SelectItem></SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Payout Schedule</Label>
                             <Input value={payoutSchedule} onChange={e => setPayoutSchedule(e.target.value)} className="h-12 rounded-xl font-bold border-primary/10" placeholder="e.g. Weekly on Sat" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Shift Timings</Label>
                             <Input disabled={salaryBasis === 'piece'} value={shiftTiming} onChange={e => setShiftTiming(e.target.value)} className={cn("h-12 rounded-xl font-bold border-primary/10", salaryBasis === 'piece' && "bg-muted opacity-50")} placeholder={salaryBasis === 'piece' ? "N/A" : "e.g. 9 AM - 6 PM"} />
                          </div>
                       </div>
                    </section>

                    <section className="space-y-8">
                       <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                          <CalendarIcon className="w-6 h-6" /> Logistics & Scheduling
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.residingArea}</Label>
                                <Button type="button" variant="ghost" className="h-6 px-2 text-[10px] text-primary font-black uppercase gap-1" onClick={handleGetLocation} disabled={isLocating}>
                                   {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />} Capture GPS
                                </Button>
                             </div>
                             <Input value={location} onChange={e => setLocation(e.target.value)} className="h-12 rounded-xl font-bold border-primary/10" placeholder="Full address or area in Tirupur..." />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-amber-600 tracking-widest flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" /> Expected Listing Closure</Label>
                             <DatePickerDropdown value={autoCloseDate} onChange={setAutoCloseDate} minDate={today || undefined} maxDate={maxAllowedDate} />
                          </div>
                       </div>

                       <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-dashed border-primary/20 space-y-6">
                          <div className="flex items-center gap-3">
                             <CalendarCheck className="w-5 h-5 text-primary" />
                             <h4 className="font-black text-primary uppercase tracking-tight">Interview Drive Window (Max 15 Days)</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Drive Start Date</Label>
                                <DatePickerDropdown value={interviewStartDate} onChange={setInterviewStartDate} minDate={today || undefined} maxDate={maxAllowedDate} />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Drive End Date (Optional)</Label>
                                <DatePickerDropdown value={interviewEndDate} onChange={setInterviewEndDate} minDate={interviewStartDate ? new Date(interviewStartDate) : (today || undefined)} maxDate={maxAllowedDate} />
                             </div>
                          </div>
                       </div>
                    </section>

                    <section className="space-y-8">
                       <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                          <Heart className="w-6 h-6 text-red-500" /> Welfare & Benefits
                       </h3>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {[
                             { id: 'esi', label: 'ESI & EPF', icon: <ShieldCheck className="w-4 h-4" /> },
                             { id: 'attendance_incentive', label: 'Attendance Incentive', icon: <Timer className="w-4 h-4" /> },
                             { id: 'overtime_pay', label: 'Overtime Pay (OT)', icon: <Clock className="w-4 h-4" /> },
                             { id: 'production_incentive', label: 'Production Incentive', icon: <Zap className="w-4 h-4" /> },
                             { id: 'referral_bonus', label: 'Referral Bonus', icon: <Users className="w-4 h-4" /> },
                             { id: 'transport', label: 'Free Transport', icon: <Bus className="w-4 h-4" /> },
                             { id: 'bachelor_accommodation', label: 'Bachelor Accommodation', icon: <Home className="w-4 h-4" /> },
                             { id: 'family_accommodation', label: 'Family Accommodation', icon: <Home className="w-4 h-4" /> },
                             { id: 'food', label: 'Free Meals', icon: <ShoppingBag className="w-4 h-4" /> },
                             { id: 'mobile_allowance', label: 'Mobile Allowance', icon: <Smartphone className="w-4 h-4" /> },
                             { id: 'petrol_allowance', label: 'Petrol Allowance', icon: <Navigation className="w-4 h-4" /> },
                             { id: 'skill_training', label: 'Skill Training', icon: <GraduationCap className="w-4 h-4" /> },
                             { id: 'teaCash', label: 'Tea Cash', icon: <Coffee className="w-4 h-4" /> },
                             { id: 'bonusEnabled', label: 'Bonus / Gift', icon: <Gift className="w-4 h-4" /> },
                          ].map(item => (
                             <div key={item.id} className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                (benefits as any)[item.id] ? "bg-primary/5 border-primary text-primary shadow-inner" : "bg-white border-muted text-muted-foreground opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                             )} onClick={() => setBenefits({...benefits, [item.id]: !(benefits as any)[item.id]})}>
                                {item.icon}
                                <span className="font-black text-xs uppercase tracking-tight">{item.label}</span>
                             </div>
                          ))}
                       </div>

                       {benefits.bonusEnabled && (
                          <div className="mt-8 p-6 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-primary/20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                             <div className="flex items-center gap-3">
                                <Gift className="w-5 h-5 text-primary" />
                                <h4 className="font-black text-primary uppercase tracking-tight">Bonus Configuration (Optional)</h4>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                   <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Bonus Type</Label>
                                   <Select 
                                      value={benefits.bonusType || "percentage"} 
                                      onValueChange={v => setBenefits({...benefits, bonusType: v as any})}
                                   >
                                      <SelectTrigger className="h-12 rounded-xl font-bold bg-white border-primary/10 shadow-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent className="font-bold rounded-xl">
                                         <SelectItem value="percentage">Percentage (%)</SelectItem>
                                         <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Bonus Value</Label>
                                   <Input 
                                      value={benefits.bonusValue || ""} 
                                      onChange={e => setBenefits({...benefits, bonusValue: e.target.value})}
                                      placeholder={benefits.bonusType === 'fixed' ? "e.g. 1000" : "e.g. 8.33"}
                                      className="h-12 rounded-xl font-bold bg-white border-primary/10 shadow-sm"
                                   />
                                </div>
                             </div>
                          </div>
                       )}
                    </section>

                    <section className="space-y-8">
                       <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                          <FileText className="w-6 h-6" /> Job Dossier
                       </h3>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Listing Description</Label>
                             <Textarea value={description} onChange={e => setDescription(e.target.value)} className="min-h-[150px] rounded-[2rem] font-medium p-6 border-primary/10 bg-muted/10 text-lg leading-relaxed" placeholder="Mention shift patterns, department specific requirements, etc..." />
                          </div>
                       </div>
                    </section>
                 </CardContent>

                 <CardFooter className="p-8 md:p-12 border-t bg-muted/5 flex flex-col md:flex-row gap-6">
                    <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={loading || isDrafting} className="w-full md:w-auto h-14 px-8 rounded-2xl font-black border-2 border-primary/20 text-primary hover:bg-primary/5">
                       {isDrafting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5 mr-2" />} Save as Draft
                    </Button>
                    <Button type="submit" disabled={loading || isDrafting || availableCredits < 1} className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-transform uppercase tracking-tight">
                       {loading ? <Loader2 className="animate-spin" /> : <>Establish Verified Listing <Zap className="w-5 h-5 ml-2 fill-current" /></>}
                    </Button>
                 </CardFooter>
              </form>
           </Card>
        </div>
      </main>

      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-white">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                 <Zap className="w-6 h-6 text-white fill-white" />
               </div>
               <div>
                 <DialogTitle className="text-2xl font-black uppercase tracking-tight">How Your Posting Balance Is Calculated</DialogTitle>
                 <DialogDescription className="text-white/80 font-medium">Complete industrial credit audit for your factory.</DialogDescription>
               </div>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col justify-between h-32">
                 <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Welcome Offer</p>
                 <div className="space-y-1">
                    <p className="text-2xl font-black text-blue-900">{offerStats?.welcome.remaining}</p>
                    <p className="text-[9px] font-bold text-blue-700/60 uppercase">Expires in {offerStats?.welcome.daysLeft}D</p>
                 </div>
              </div>
              <div className="p-5 bg-green-50 rounded-2xl border border-green-100 flex flex-col justify-between h-32">
                 <p className="text-[10px] font-black text-green-800 uppercase tracking-widest">Welfare Offer</p>
                 <div className="space-y-1">
                    <p className="text-2xl font-black text-green-900">{offerStats?.welfare.remaining}</p>
                    <p className="text-[9px] font-bold text-green-700/60 uppercase">Resets in {offerStats?.welfare.daysToReset}D</p>
                 </div>
              </div>
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col justify-between h-32">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Purchased Plan</p>
                 <div className="space-y-1">
                    <p className="text-2xl font-black text-primary">{offerStats?.purchased.remaining}</p>
                    <p className="text-[9px] font-bold text-primary/40 uppercase">Lifetime Validity</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center">
                     <span className="text-xs font-bold text-muted-foreground uppercase">Worker Posts Available</span>
                     <span className="text-sm font-black">{offerStats?.workerRemaining}</span>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center">
                     <span className="text-xs font-bold text-muted-foreground uppercase">Staff Posts Available</span>
                     <span className="text-sm font-black">{offerStats?.staffRemaining}</span>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center">
                     <span className="text-xs font-bold text-muted-foreground uppercase">Total Used Posts</span>
                     <span className="text-sm font-black">{offerStats?.totalUsed}</span>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-xl flex justify-between items-center">
                     <span className="text-xs font-black text-primary uppercase">Current Shared Balance</span>
                     <span className="text-lg font-black text-primary">{offerStats?.totalAvailable}</span>
                  </div>
               </div>
            </div>

            <div className="bg-muted/20 p-6 rounded-2xl space-y-4">
               <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Industrial Credit Logic</h4>
               <ul className="space-y-3">
                  <li className="text-[11px] font-medium text-muted-foreground flex gap-2"><span className="text-primary">•</span> Welcome Offer provides 3 one-time posts valid for 7 days.</li>
                  <li className="text-[11px] font-medium text-muted-foreground flex gap-2"><span className="text-primary">•</span> Welfare Offer provides 3 Worker-only posts every month. No carry forward.</li>
                  <li className="text-[11px] font-medium text-muted-foreground flex gap-2"><span className="text-primary">•</span> Purchased plans are shared across all roles with lifetime validity.</li>
                  <li className="text-[11px] font-medium text-muted-foreground flex gap-2"><span className="text-primary">•</span> Shared Balance is your actual usable credit pool for the next listing.</li>
               </ul>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/10 border-t">
             <Button className="w-full h-12 bg-primary text-white font-black rounded-xl" onClick={() => setShowBreakdown(false)}>Dismiss Audit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

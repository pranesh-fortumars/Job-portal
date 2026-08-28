"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  IndianRupee, 
  ChevronLeft, 
  Building2, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Phone,
  MessageCircle,
  Flag,
  Calendar as CalendarIcon,
  AlertTriangle,
  Heart,
  Bus,
  Coffee,
  FileText,
  Eye,
  Zap,
  Loader2,
  Home,
  ShoppingBag,
  XCircle,
  MapPin,
  Timer,
  Power,
  Navigation,
  Clock,
  Briefcase,
  UserCircle,
  Calendar,
  ChevronRight,
  Smartphone,
  GraduationCap,
  Gift,
  Camera,
  Maximize2,
  EyeOff,
  Lock
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCompactNumber, translateLocation, calculateDistance, formatShiftTiming, getLocalizedDesignation } from "@/lib/utils";
import { useFirestore, useDoc, useUser, useCollection } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, increment, setDoc, limit } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { format, isValid, isBefore, startOfDay, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePickerDropdown } from "@/components/ui/date-picker-dropdown";
import { generateJobShareMessage, openWhatsAppShare } from "@/lib/sharing";
import { DepartmentLogo } from "@/components/shared/DepartmentLogo";
import { sendAuthkeyNotification } from "@/lib/authkey";

const ApplicationFormInputs = ({ 
  t, 
  expectedSalary, 
  setExpectedSalary, 
  preferredInterviewDate, 
  setPreferredInterviewDate, 
  minPickerDate, 
  job 
}: any) => {
  if (job.category !== 'Technical') return null;

  return (
    <div className="p-5 bg-primary/5 rounded-[1.5rem] border-2 border-dashed border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5 w-full shadow-inner">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5 mb-1.5">
          <IndianRupee className="w-3 h-3" /> {t.salaryExpectedLabel} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-primary/40 text-sm">₹</div>
          <Input 
            type="number" 
            placeholder="e.g. 25000" 
            value={expectedSalary} 
            onChange={(e) => setExpectedSalary(e.target.value)} 
            className="h-12 pl-8 rounded-xl font-black border-primary/10 bg-white text-black text-lg focus-visible:ring-primary/20 shadow-sm"
          />
        </div>
      </div>
      {job.interviewStartDate && (
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5 mb-1.5">
            <CalendarIcon className="w-3 h-3" /> Preferred Interview Date <span className="text-red-500">*</span>
          </Label>
          <div className="bg-white rounded-xl shadow-sm">
            <DatePickerDropdown 
              value={preferredInterviewDate} 
              onChange={setPreferredInterviewDate}
              minDate={minPickerDate}
              maxDate={job.interviewEndDate ? new Date(job.interviewEndDate) : null}
            />
          </div>
          <p className="text-[9px] font-bold text-muted-foreground mt-2 italic px-1">* Select your preferred walk-in slot for the interview drive.</p>
        </div>
      )}
    </div>
  );
};

export default function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const paramsValue = React.use(params);
  const jobId = paramsValue.jobId;

  const { t, language } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  const jobRef = useMemo(() => (db && jobId) ? doc(db, "Jobs", jobId) : null, [db, jobId]);
  const { data: job, loading: jobLoading } = useDoc<any>(jobRef);

  const currentUserRef = useMemo(() => (user?.uid && db) ? doc(db, "Users", user.uid) : null, [db, user?.uid]);
  const { data: currentUserProfile, loading: profileLoading } = useDoc<any>(currentUserRef);

  // Fetch Employer Profile to retrieve the Factory Gate Photo and Mobile
  const employerRef = useMemo(() => (db && job?.employerId) ? doc(db, "Users", job.employerId) : null, [db, job?.employerId]);
  const { data: employerData, loading: employerLoading } = useDoc<any>(employerRef);

  const masterDesignationsQuery = useMemo(() => db ? query(collection(db, "Designations")) : null, [db]);
  const { data: masterDesignations } = useCollection<any>(masterDesignationsQuery);

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preferredInterviewDate, setPreferredInterviewDate] = useState<string | null>(null);
  const [expectedSalary, setExpectedSalary] = useState("");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);

  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  // Persistence guard for view tracking within the current session
  const viewLoggedId = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.debug("Home location detection skipped"),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  const employersQuery = useMemo(() => db ? query(collection(db, "Users"), where("role", "==", "employer")) : null, [db]);
  const { data: employersList } = useCollection<any>(employersQuery);

  const employerStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (employersList) {
      employersList.forEach(e => { map[e.id] = e.status || 'approved'; });
    }
    return map;
  }, [employersList]);

  const isSuspended = useMemo(() => employerData?.status === 'suspended', [employerData]);

  const isInterviewPassed = useMemo(() => {
    if (!job) return false;
    const now = startOfDay(new Date());
    const interviewEndDateStr = job.interviewEndDate || job.interviewStartDate;
    if (interviewEndDateStr && isBefore(addDays(startOfDay(new Date(interviewEndDateStr)), 1), now)) return true;
    return false;
  }, [job]);

  const isClosed = useMemo(() => {
    if (!job) return false;
    
    if (job.status === 'closed' || job.status === 'archived' || job.status === 'deleted' || job.status === 'rejected') return true;
    if (isSuspended) return true;

    const now = startOfDay(new Date());
    const autoCloseDateStr = job.autoCloseDate;

    if (autoCloseDateStr && isBefore(addDays(startOfDay(new Date(autoCloseDateStr)), 1), now)) return true;
    if (isInterviewPassed) return true;
    
    return false;
  }, [job, isSuspended, isInterviewPassed]);

  const dynamicDistance = useMemo(() => {
    const jobLat = parseFloat(job?.latitude as any);
    const jobLng = parseFloat(job?.longitude as any);
    const userLat = parseFloat(userCoords?.lat as any);
    const userLng = parseFloat(userCoords?.lng as any);

    if (!isNaN(jobLat) && !isNaN(jobLng) && !isNaN(userLat) && !isNaN(userLng)) {
      const d = calculateDistance(userLat, userLng, jobLat, jobLng);
      return (d !== null && !isNaN(d)) ? d.toFixed(1) : null;
    }
    return null;
  }, [userCoords, job?.latitude, job?.longitude]);

  const distanceBadgeText = useMemo(() => {
    if (!mounted) return "...";
    if (dynamicDistance !== null) return `${dynamicDistance} km`;
    if (!userCoords) return "Enable GPS";
    return "Tirupur Hub";
  }, [dynamicDistance, mounted, userCoords]);

  useEffect(() => {
    if (!mounted || !db || !jobId || !job || viewLoggedId.current === jobId || isClosed) return;
    if (user && profileLoading) return;
    const isOwner = user?.uid === job.employerId;
    const isAdmin = currentUserProfile?.role === 'admin';
    if (isOwner || isAdmin) return;
    viewLoggedId.current = jobId;
    if (user?.uid && currentUserProfile?.role === 'job_seeker') {
      const viewDetailRef = doc(db, "Jobs", jobId, "Views", user.uid);
      setDoc(viewDetailRef, {
        userId: user.uid,
        name: currentUserProfile?.name || "Registered Seeker",
        viewedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.debug("Detailed view record failed", err));
    }
    const docRef = doc(db, "Jobs", jobId);
    updateDoc(docRef, {
      views: increment(1)
    }).catch(err => {
      console.debug("Atomic view increment blocked.", err);
    });
  }, [mounted, db, jobId, !!job, !!user, profileLoading, isClosed]);

  useEffect(() => {
    if (user?.uid && job && db) {
      const checkApplied = async () => {
        const appsRef = collection(db, "Applications");
        const q = query(appsRef, where("jobId", "==", jobId), where("jobSeekerId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) setApplied(true);
      };
      checkApplied();
    }
  }, [user?.uid, job, db, jobId]);

  const handleApply = () => {
    if (isClosed) {
      toast({ variant: "destructive", title: "Applications Closed", description: "This vacancy is no longer accepting new applications." });
      return;
    }
    if (!user) {
      toast({ title: "Login Required" });
      router.push("/auth/login");
      return;
    }
    if (profileLoading || !db) return;
    if (currentUserProfile?.role === 'employer' || currentUserProfile?.role === 'admin') {
      toast({ variant: "destructive", title: "Action Denied" });
      return;
    }
    if (!currentUserProfile?.onboarded) {
      toast({ title: "Profile Required" });
      router.push("/seeker/onboarding");
      return;
    }

    const targetEmployerId = job.employerId || job.employerUID;
    if (!targetEmployerId) {
      toast({ variant: "destructive", title: "Job Configuration Error", description: "Unable to identify the factory owner." });
      return;
    }

    if (job.category === 'Technical') {
      if (!expectedSalary) {
        toast({ variant: "destructive", title: "Salary Required", description: "Please enter your expected salary." });
        return;
      }
      if (job.interviewStartDate && !preferredInterviewDate) {
        toast({ variant: "destructive", title: "Selection Required", description: "Please select an interview date." });
        return;
      }
    }

    setApplying(true);
    const appData: any = {
      jobId: jobId,
      jobSeekerId: user.uid,
      employerId: targetEmployerId,
      status: 'pending',
      appliedAt: serverTimestamp(),
      jobTitle: job.jobTitle || "Industrial Role",
      jobCategory: job.category,
      department: job.department,
      companyName: job.companyName || "Verified Factory",
      seekerName: currentUserProfile.name || "User",
      phone: currentUserProfile.phone || user.phoneNumber || "",
      experience: currentUserProfile.experience || currentUserProfile.digitalResume?.professional?.totalExperience || "0",
      gender: currentUserProfile.gender || "Not Specified",
      location: currentUserProfile.location || "Tirupur Hub",
    };

    if (job.category === 'Technical') {
      appData.preferredInterviewDate = preferredInterviewDate || null;
      appData.expectedSalary = expectedSalary || null;
    }

    const appsRef = collection(db, "Applications");
    addDoc(appsRef, appData)
      .then(async (docRef) => {
        setApplied(true);
        toast({ title: t.applyNow });
        
        // TRIGGER: worker_applicant
        if (job.category === 'Non-Technical' && employerData?.phone) {
           const payload = {
              phone: employerData.phone,
              companyName: employerData.companyName || job.companyName,
              designation: job.designation || job.jobTitle,
              candidateName: appData.seekerName,
              candidateLocation: translateLocation(appData.location, t),
              candidateMobile: appData.phone,
              eventType: 'worker_application_received' as const
           };

           sendAuthkeyNotification(payload).then(async result => {
              await addDoc(collection(db, "WhatsAppLogs"), {
                 eventType: 'worker_application_received',
                 templateId: '39528',
                 jobId: jobId,
                 applicationId: docRef.id,
                 employerId: targetEmployerId,
                 mobileNumber: employerData.phone,
                 status: result.success ? 'success' : 'failed',
                 timestamp: serverTimestamp(),
                 apiResponse: result.data || null
              });
           });
        }

        // TRIGGER: staff_new_applicants
        if (job.category === 'Technical' && employerData?.phone) {
           const payload = {
              phone: employerData.phone,
              companyName: employerData.companyName || job.companyName,
              designation: job.designation || job.jobTitle,
              candidateName: appData.seekerName,
              candidateLocation: translateLocation(appData.location, t),
              candidateMobile: appData.phone,
              eventType: 'staff_application_received' as const
           };

           sendAuthkeyNotification(payload).then(async result => {
              await addDoc(collection(db, "WhatsAppLogs"), {
                 eventType: 'staff_application_received',
                 templateId: '39522',
                 jobId: jobId,
                 applicationId: docRef.id,
                 employerId: targetEmployerId,
                 mobileNumber: employerData.phone,
                 status: result.success ? 'success' : 'failed',
                 timestamp: serverTimestamp(),
                 apiResponse: result.data || null
              });
           });
        }

        if (job.category === 'Technical') {
          sendAuthkeyNotification({
            candidateName: appData.seekerName,
            designation: appData.jobTitle || "Industrial Role",
            department: appData.companyName || "Verified Factory",
            phone: appData.phone,
            eventType: 'submitted'
          }).then(result => {
             const logData = {
               eventType: result.eventType,
               templateName: result.templateName,
               templateId: result.wid,
               candidateId: appData.jobSeekerId,
               employerId: appData.employerId,
               jobId: appData.jobId,
               mobileNumber: result.mobile,
               apiRequestStatus: result.status,
               authkeyResponse: result.data || null,
               errorMessage: result.error || null,
               timestamp: serverTimestamp()
             };
             addDoc(collection(db, "WhatsAppLogs"), logData).catch(e => console.error("Dossier Log failed", e));
          }).catch(err => console.debug("Authkey submission background dispatch failed", err));
        }
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: appsRef.path,
          operation: 'create',
          requestResourceData: appData,
        }));
      })
      .finally(() => setApplying(false));
  };

  const handleReportSubmit = () => {
    if (!user || !db) {
      toast({ title: "Login Required" });
      router.push("/auth/login");
      return;
    }
    if (!reportReason) {
      toast({ variant: "destructive", title: "Reason Required" });
      return;
    }

    setReporting(true);
    const reportData = {
      reportedByUserId: user.uid,
      reportedByName: currentUserProfile?.name || "Industrial User",
      role: currentUserProfile?.role || "job_seeker",
      reportedItemId: jobId,
      targetName: job.jobTitle,
      targetId: jobId,
      targetOwnerId: job.employerId,
      type: "job",
      reason: reportReason,
      description: reportDescription,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      status: "pending"
    };

    addDoc(collection(db, "Reports"), reportData)
      .then((docRef) => {
        addDoc(collection(db, "AdminNotifications"), {
          type: "report",
          title: "New Incident Reported",
          message: `A job listing "${job.jobTitle}" has been reported for: ${reportReason}.`,
          targetId: docRef.id,
          status: "unread",
          createdAt: serverTimestamp()
        });
        toast({ title: t.reportSuccess });
        setIsReportDialogOpen(false);
      })
      .finally(() => setReporting(false));
  };

  const handleOpenMaps = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const url = job.latitude && job.longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((job.location || "") + " Tirupur")}`;
    window.open(url, '_blank');
  };

  const interviewDateText = useMemo(() => {
    if (!job?.interviewStartDate) return null;
    try {
      const dateVal = job.interviewStartDate;
      const dateObj = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (!isValid(dateObj)) return null;
      const start = format(dateObj, "dd MMM");
      if (!job.interviewEndDate) return start;
      const endDateVal = job.interviewEndDate;
      const endDateObj = endDateVal.toDate ? endDateVal.toDate() : new Date(endDateVal);
      if (!isValid(endDateObj) || endDateObj.getTime() === dateObj.getTime()) return start;
      return `${start} to ${format(endDateObj, "dd MMM yyyy")}`;
    } catch (e) {
      return null;
    }
  }, [job?.interviewStartDate, job?.interviewEndDate]);

  const minPickerDate = useMemo(() => {
    if (!job?.interviewStartDate) return startOfDay(new Date());
    const start = new Date(job.interviewStartDate);
    const today = startOfDay(new Date());
    return isBefore(start, today) ? today : start;
  }, [job?.interviewStartDate]);

  const formattedPostedDate = useMemo(() => {
    if (!job?.createdAt) return null;
    try {
      const date = new Date(job.createdAt);
      return isValid(date) ? format(date, "dd MMM yyyy") : null;
    } catch (e) {
      return null;
    }
  }, [job?.createdAt]);

  const recommendationsQuery = useMemo(() => {
    if (!db || !job?.category) return null;
    return query(
      collection(db, "Jobs"),
      where("status", "==", "approved"),
      where("category", "==", job.category),
      limit(10)
    );
  }, [db, job?.category]);

  const { data: rawRecommendedJobs, loading: recsLoading } = useCollection<any>(recommendationsQuery);

  const filteredRecommendations = useMemo(() => {
    if (!rawRecommendedJobs) return [];
    const now = startOfDay(new Date());
    return rawRecommendedJobs.filter(j => {
      if (j.id === jobId) return false;
      if (employerStatusMap[j.employerId] === 'suspended') return false;

      const interviewEndDateStr = j.interviewEndDate || j.interviewStartDate;
      const autoCloseDateStr = j.autoCloseDate;
      
      let isTemporalExpired = false;
      const autoCloseDate = startOfDay(new Date(autoCloseDateStr || 0));
      const interviewEndDate = startOfDay(new Date(interviewEndDateStr || 0));

      if (autoCloseDateStr && isBefore(addDays(autoCloseDate, 1), now)) isTemporalExpired = true;
      else if (interviewEndDateStr && isBefore(addDays(interviewEndDate, 1), now)) isTemporalExpired = true;

      return !isTemporalExpired;
    }).slice(0, 3);
  }, [rawRecommendedJobs, jobId, employerStatusMap]);

  const isPieceRate = job?.salaryBasis === 'piece';

  const salaryDisplay = useMemo(() => {
    if (!job) return "";
    if (!job.salaryType || job.salaryType === 'display_range') {
      if (isPieceRate) return t.perPiece;
      return `₹${job.salaryMin?.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()}`;
    }
    const typeMap: Record<string, string> = {
      not_disclosed: "Salary Not Disclosed",
      negotiable: "Negotiable",
      experience_based: "Based on Experience",
      company_standard: "As Per Company Standards"
    };
    return typeMap[job.salaryType] || "Salary Not Disclosed";
  }, [job?.salaryType, job?.salaryMin, job?.salaryMax, isPieceRate, t]);

  if (jobLoading) return <div className="min-h-screen flex items-center justify-center font-bold"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center font-bold">Job Not Found</div>;

  const b = job.benefits || {};
  const isJobSeeker = currentUserProfile?.role === 'job_seeker';
  const showApplicationForm = user && isJobSeeker && !applied && !isClosed && currentUserProfile?.onboarded;

  const benefitsList = [
    { id: 'esi', label: 'ESI & EPF', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'attendance_incentive', label: 'Attendance Incentive', icon: <Timer className="w-5 h-5" /> },
    { id: 'overtime_pay', label: 'Overtime Pay (OT)', icon: <Clock className="w-5 h-5" /> },
    { id: 'production_incentive', label: 'Production Incentive', icon: <Zap className="w-5 h-5" /> },
    { id: 'referral_bonus', label: 'Referral Bonus', icon: <Users className="w-5 h-5" /> },
    { id: 'transport', label: t.transport, icon: <Bus className="w-5 h-5" /> },
    { id: 'bachelor_accommodation', label: 'Bachelor Accommodation', icon: <Home className="w-5 h-5" /> },
    { id: 'family_accommodation', label: 'Family Accommodation', icon: <Home className="w-5 h-5" /> },
    { id: 'food', label: 'Free Meals', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'mobile_allowance', label: 'Mobile Allowance', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'petrol_allowance', label: 'Petrol Allowance', icon: <Navigation className="w-5 h-5" /> },
    { id: 'skill_training', label: 'Skill Training', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'teaCash', label: t.teaCash, icon: <Coffee className="w-5 h-5" /> },
    { id: 'bonusEnabled', label: t.bonus, icon: <Gift className="w-5 h-5" /> },
    { id: 'accommodation', label: t.accommodation, icon: <Home className="w-5 h-5" /> },
  ];

  const getSalaryUnit = (basis?: string) => {
    if (basis === 'shift') return t.perShift;
    if (basis === 'piece') return t.perPiece;
    return t.perMonth;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pb-16">
        <div className="bg-primary pt-8 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
               <Link href="/jobs" className="inline-flex items-center text-primary-foreground/80 hover:text-white font-bold transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" /> {t.backToJobs}
              </Link>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => openWhatsAppShare(generateJobShareMessage(job, jobId, t))} className="text-primary-foreground/60 hover:text-white font-bold gap-2"><MessageCircle className="w-4 h-4" /> {t.shareThisJob}</Button>
                <Button variant="ghost" onClick={() => setIsReportDialogOpen(true)} className="text-primary-foreground/60 hover:text-white font-bold gap-2"><Flag className="w-4 h-4" /> {t.report}</Button>
              </div>
            </div>
            
            <Card className="rounded-[2.5rem] p-6 md:p-10 shadow-2xl bg-white border-none relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 flex items-center gap-6 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border bg-muted flex items-center justify-center shadow-xl">
                      {job.companyLogoUrl ? <img src={job.companyLogoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-10 h-10 md:w-16 md:h-16 text-muted-foreground" />}
                    </div>
                    <DepartmentLogo 
                      category={job.category} 
                      department={job.department} 
                      className="absolute -bottom-3 -right-3 w-12 h-12 md:w-16 md:h-16 rounded-2xl border-4 border-white shadow-2xl z-10" 
                    />
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-lg border-none">{job.category}</Badge>
                      <Badge variant="outline" className="border-primary/20 text-primary font-bold px-4 py-1.5 rounded-lg">{job.workType}</Badge>
                      <Badge variant="outline" className="border-primary/10 text-muted-foreground font-black px-4 py-1.5 rounded-lg bg-muted/5 flex items-center gap-1.5 uppercase text-[10px]">
                        <CalendarIcon className="w-3.5 h-3.5" /> Posted: {formattedPostedDate}
                      </Badge>
                      {(isClosed || isSuspended) && (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-none font-black px-4 py-1.5 rounded-lg uppercase">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> 
                          {isSuspended ? 'Halt: Employer Suspended' : job.status === 'closed' ? (job.closedBy === 'admin' ? 'Closed by Admin' : 'Closed by Owner') : t.expired}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black font-headline text-primary break-words tracking-tight language-tight leading-tight">
                      {getLocalizedDesignation(job.designation || job.jobTitle, masterDesignations, language, t)}
                    </h1>
                    <div className="flex items-center gap-3 text-muted-foreground text-xl font-bold">
                      <Building2 className="w-7 h-7 shrink-0 text-primary" /> 
                      <span className="truncate">{job.companyName}</span>
                      {job.isEmployerVerified && <Zap className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-5 w-full">
                  <div className="w-full">
                    {showApplicationForm && (
                      <div className="mb-6">
                        <ApplicationFormInputs 
                          t={t} 
                          expectedSalary={expectedSalary} 
                          setExpectedSalary={setExpectedSalary}
                          preferredInterviewDate={preferredInterviewDate}
                          setPreferredInterviewDate={setPreferredInterviewDate}
                          minPickerDate={minPickerDate}
                          job={job}
                        />
                      </div>
                    )}
                    {applied ? (
                      <Button disabled className="w-full h-16 md:h-20 px-12 bg-green-500 text-white font-black text-xl md:text-2xl rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl">
                        <CheckCircle2 className="w-8 h-8" /> {t.alreadyApplied}
                      </Button>
                    ) : (isClosed || isSuspended || isInterviewPassed) ? (
                      <Button disabled className="w-full h-16 md:h-20 bg-muted text-muted-foreground font-black text-xl rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl border-dashed border-2">
                         {isSuspended ? <EyeOff className="w-8 h-8" /> : (isInterviewPassed ? <Lock className="w-8 h-8" /> : <XCircle className="w-8 h-8" />)} 
                         {isSuspended ? "Recruitment Halted" : (isInterviewPassed ? "🔒 Interview Passed" : t.expired)}
                      </Button>
                    ) : (
                      <Button disabled={applying} onClick={handleApply} className="w-full h-16 md:h-20 px-12 bg-accent hover:bg-accent/90 text-accent-foreground font-black text-xl md:text-2xl rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group">
                        {applying ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t.applyNow} <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" /></>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-12">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                {(isClosed || isSuspended || isInterviewPassed) && (
                   <Card className="rounded-[2.5rem] shadow-xl border-none p-8 bg-red-50 border-l-8 border-red-400">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                           {isSuspended ? <EyeOff className="w-7 h-7" /> : isInterviewPassed ? <Lock className="w-7 h-7" /> : job.status === 'closed' ? <Power className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                         </div>
                         <div>
                           <h3 className="text-xl font-black text-red-900 uppercase">
                             {isSuspended ? "Employer Temporarily Suspended" : isInterviewPassed ? "Interview Timeline Passed" : job.status === 'closed' ? `Recruitment Halted by ${job.closedBy === 'admin' ? 'Admin' : 'Owner'}` : t.expired}
                           </h3>
                           <p className="text-sm font-bold text-red-800/70">
                             {isSuspended ? "This factory's recruitment terminal is currently offline. Please check back later." : isInterviewPassed ? "The interview dates for this job have expired. No new applications are being accepted." : "This job is no longer accepting applications."}
                           </p>
                         </div>
                      </div>
                   </Card>
                )}

                {interviewDateText && !isClosed && !isSuspended && !isInterviewPassed && (
                   <Card className={cn("rounded-[2.5rem] shadow-xl border-none p-8 border-l-8 bg-amber-50 border-amber-400")}>
                     <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 text-amber-900">
                        <Zap className="w-5 h-5 fill-current text-amber-500" /> {t.interviewSchedule}
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                       <div className="flex items-center gap-3">
                         <CalendarIcon className="w-6 h-6 text-amber-700" />
                         <div><p className="text-[10px] font-black uppercase opacity-60">{t.interviewDates}</p><p className="font-black text-lg">{interviewDateText}</p></div>
                       </div>
                     </div>
                   </Card>
                )}

                <Card className="rounded-[2.5rem] shadow-xl border-none p-8 md:p-10 bg-white">
                  <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-3 uppercase tracking-tight">Functional Area</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="p-5 bg-muted/20 rounded-2xl border border-dashed text-center">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground">{t.categoryLabel}</Label>
                      <p className="text-lg font-black text-foreground mt-1">{job.category}</p>
                    </div>
                    <div className="p-5 bg-muted/20 rounded-2xl border border-dashed text-center">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground">{t.departmentLabel}</Label>
                      <p className="text-lg font-black text-foreground mt-1">{job.department}</p>
                    </div>
                    <div className="p-5 bg-muted/20 rounded-2xl border border-dashed text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">{t.designationLabel}</Label>
                        <DepartmentLogo category={job.category} department={job.department} className="w-12 h-12 rounded-xl border-2 border-primary/10 shadow-sm" />
                        <p className="text-lg font-black text-primary text-center leading-tight">
                          {getLocalizedDesignation(job.designation || job.jobTitle, masterDesignations, language, t)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[2.5rem] shadow-xl border-none p-8 md:p-10 bg-white">
                  <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-3 uppercase tracking-tight"><Heart className="w-6 h-6 text-red-500" /> {t.benefits}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {benefitsList.map(benefit => {
                      const isActive = b[benefit.id];
                      let displayLabel = benefit.label;
                      if (benefit.id === 'bonusEnabled' && b.bonusValue) {
                         displayLabel += ` (${b.bonusType === 'percentage' ? `${b.bonusValue}%` : `₹${b.bonusValue}`})`;
                      }

                      return (
                        <div key={benefit.id} className={cn(
                          "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-2",
                          isActive ? `bg-primary/5 border-primary/50 text-primary shadow-sm` : "bg-white border-muted text-muted-foreground opacity-30 grayscale"
                        )}>
                          {benefit.icon}<span className="font-black text-[10px] text-center uppercase tracking-tighter">{displayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="rounded-[2.5rem] shadow-xl border-none p-8 md:p-12 space-y-8 bg-white">
                   <h2 className="text-2xl font-black text-primary flex items-center gap-3 border-b-4 border-primary/10 pb-3"><FileText className="w-8 h-8" /> {t.jobDetails}</h2>
                   <div className="text-muted-foreground text-lg leading-relaxed font-medium whitespace-pre-line bg-muted/10 p-8 rounded-[2rem] italic border-2 border-dashed">"{job.description || "No detailed description provided."}"</div>
                </Card>
             </div>

             <div className="space-y-8">
                <Card className="rounded-[2.5rem] shadow-2xl border-none bg-primary text-white overflow-hidden p-8 space-y-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary-foreground/60 tracking-widest">
                      {(!job.salaryType || job.salaryType === 'display_range') ? (isPieceRate ? t.salaryBasis : `${t.salaryExpectedLabel} (${job.salaryBasis === 'shift' ? t.perShift : t.perMonth})`) : "Salary Structure"}
                    </Label>
                    <div className="flex items-center gap-1.5 flex-wrap whitespace-nowrap">
                       <span className={cn("text-2xl font-black tracking-tight", (!job.salaryType || job.salaryType === 'display_range') ? "" : "uppercase")}>
                         {salaryDisplay}
                       </span>
                    </div>
                  </div>
                </Card>

                {/* Verified Workplace Entrance Section */}
                {employerData?.photo && (
                  <Card className="rounded-[2.5rem] shadow-xl border-none overflow-hidden bg-white group cursor-pointer" onClick={() => setIsPhotoOpen(true)}>
                    <CardHeader className="p-8 pb-3">
                       <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Camera className="w-4 h-4 text-primary" /> Verified Workplace Entrance</h4>
                    </CardHeader>
                    <CardContent className="p-0 relative aspect-video">
                       <img src={employerData.photo} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Factory Gate" />
                       <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                          <Maximize2 className="w-8 h-8 text-white mb-2" />
                          <Badge className="bg-white/90 text-primary font-black uppercase text-[10px] px-4 py-2 rounded-xl shadow-lg border-none">Click to View Entrance</Badge>
                       </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-[2.5rem] shadow-xl border-none p-8 bg-white space-y-8">
                  <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b pb-2">{t.requirements}</h4>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-brand-secondarySoft rounded-xl flex items-center justify-center shrink-0 text-brand-primary"><Users className="w-5 h-5" /></div>
                      <div><p className="text-[10px] font-black text-brand-primary uppercase">{t.openingsLabel}</p><p className="text-lg font-black text-foreground">{job.openings} Seats</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 text-primary"><Clock className="w-5 h-5" /></div>
                      <div><p className="text-[10px] font-black text-muted-foreground uppercase">{t.shiftTimingLabel}</p><p className="text-lg font-black text-foreground">{isPieceRate ? "N/A" : formatShiftTiming(job.shiftTiming || job.interviewTimings)}</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 text-primary"><Briefcase className="w-5 h-5" /></div>
                      <div><p className="text-[10px] font-black text-muted-foreground uppercase">{t.totalExpLabel}</p><p className="text-lg font-black text-foreground">{job.experienceRequired}+ Years Required</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 text-primary"><UserCircle className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground uppercase">{t.genderPref}</p>
                        <p className="text-lg font-black text-foreground capitalize">
                          {job.genderPreference === 'male' ? t.malePreferred : job.genderPreference === 'female' ? t.femalePreferred : t.anyGender}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[2.5rem] shadow-xl border-none p-8 bg-muted/30 space-y-6">
                   <div className="grid grid-cols-2 gap-4 pb-4 border-b border-primary/10">
                      <div className="text-center">
                         <p className="text-[10px] font-black uppercase text-primary/60">{t.views}</p>
                         <div className="flex items-center justify-center gap-2 mt-1"><Eye className="w-4 h-4 text-primary" /><span className="text-xl font-black text-primary">{mounted ? formatCompactNumber(job.views || 0) : "0"}</span></div>
                      </div>
                      <div className="text-center border-l border-primary/10">
                         <p className="text-[10px] font-black uppercase text-muted-foreground">{t.distance}</p>
                         <div className="flex items-center justify-center gap-2 mt-1"><Navigation className="w-4 h-4 text-accent fill-accent" /><span className="text-xl font-black text-accent">{distanceBadgeText}</span></div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary" /><h4 className="text-sm font-black text-primary uppercase">Location Info</h4></div>
                      <button onClick={() => handleOpenMaps()} className="text-left group/loc w-full">
                        <p className="text-lg font-black text-foreground leading-snug group-hover/loc:text-primary transition-colors border-b-2 border-transparent group-hover/loc:border-primary/20 inline-block">
                          {translateLocation(job.location, t)}
                        </p>
                      </button>
                      <div className="p-4 bg-white/60 rounded-xl border border-primary/5 text-xs font-medium text-muted-foreground">
                        <Label className="text-[10px] font-black uppercase opacity-60 block mb-1">Registered Address</Label>
                        {translateLocation(job.location, t)}
                      </div>
                   </div>
                   {job.autoCloseDate && (
                      <div className="pt-4 border-t border-dashed flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Timer className="w-5 h-5" /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground">Expected Closure</p>
                          <p className="text-sm font-bold text-amber-700">{format(new Date(job.autoCloseDate), "dd MMM yyyy")}</p>
                        </div>
                      </div>
                   )}
                </Card>

                <div className="pt-4 space-y-3">
                  {showApplicationForm && (
                    <div className="mb-4">
                      <ApplicationFormInputs 
                        t={t} 
                        expectedSalary={expectedSalary} 
                        setExpectedSalary={setExpectedSalary}
                        preferredInterviewDate={preferredInterviewDate}
                        setPreferredInterviewDate={setPreferredInterviewDate}
                        minPickerDate={minPickerDate}
                        job={job}
                      />
                    </div>
                  )}
                  <Button 
                    onClick={handleApply} 
                    disabled={applying || applied || isClosed || isSuspended || isInterviewPassed}
                    className={cn(
                      "w-full h-14 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all",
                      applied ? "bg-green-50 text-white" : 
                      (isClosed || isSuspended || isInterviewPassed) ? "bg-muted text-muted-foreground" : 
                      "bg-accent hover:bg-accent/90 text-accent-foreground"
                    )}
                  >
                    {applied ? t.applied : (isClosed || isSuspended || isInterviewPassed) ? (isSuspended ? "Recruitment Halted" : isInterviewPassed ? "🔒 Interview Passed" : t.expired) : t.applyNow}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => openWhatsAppShare(generateJobShareMessage(job, jobId, t))}
                    className="w-full h-12 rounded-2xl border-green-600 text-green-600 hover:bg-green-50 font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" /> {t.shareThisJob}
                  </Button>
                </div>

                {filteredRecommendations.length > 0 && (
                   <div className="space-y-4 pt-8">
                      <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Matching Vacancies</h4>
                      <div className="space-y-4">
                         {filteredRecommendations.map((recJob: any) => (
                           <Link key={recJob.id} href={`/jobs/${recJob.id}`}>
                              <Card className="p-4 rounded-2xl hover:border-primary/50 transition-all cursor-pointer bg-white group">
                                 <div className="flex items-center gap-3">
                                    <DepartmentLogo category={job.category} department={recJob.department} className="w-10 h-10 rounded-xl shrink-0" />
                                    <div className="min-w-0 flex-1">
                                       <p className="font-black text-sm truncate group-hover:text-primary">
                                          {getLocalizedDesignation(recJob.jobTitle, masterDesignations, language, t)}
                                       </p>
                                       <p className="text-[10px] font-bold text-muted-foreground truncate">{recJob.companyName}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                 </div>
                              </Card>
                           </Link>
                         ))}
                      </div>
                   </div>
                )}
             </div>
           </div>
        </div>
      </main>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
           <DialogHeader className="p-8 bg-red-600 text-white text-left">
              <div className="flex items-center gap-3 mb-2"><AlertTriangle className="w-6 h-6" /><DialogTitle className="text-xl font-black uppercase tracking-tight">{t.reportJob}</DialogTitle></div>
              <DialogDescription className="text-white/80 font-medium">Help us keep Tirupur safe.</DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-6">
              <div className="space-y-2">
                 <Label className="font-bold text-xs uppercase text-muted-foreground">{t.reasonForReport}</Label>
                 <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select Reason" /></SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                       <SelectItem value="fake_job">Fake Job Listing Encountered</SelectItem>
                       <SelectItem value="asking_money">Employer Asked for Money</SelectItem>
                       <SelectItem value="wrong_details">Incorrect Job Details</SelectItem>
                       <SelectItem value="other">Other Issue</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label className="font-bold text-xs uppercase text-muted-foreground">{t.reportDescriptionLabel}</Label>
                 <Input value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Provide more details..." className="h-12 rounded-xl font-medium" />
              </div>
           </div>
           <DialogFooter className="p-6 bg-muted/20 border-t flex gap-3">
              <Button variant="ghost" onClick={() => setIsReportDialogOpen(false)} className="flex-1 font-bold rounded-xl">{t.cancelDelete}</Button>
              <Button disabled={reporting || !reportReason.trim()} onClick={handleReportSubmit} className="flex-[2] bg-red-600 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">{t.submitReport}</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workplace Photo Full Preview */}
      <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
        <DialogContent className="max-w-4xl p-0 border-none rounded-[2rem] overflow-hidden bg-black/90 backdrop-blur-xl">
           <div className="relative w-full aspect-video flex items-center justify-center group">
              <img src={employerData?.photo} className="max-w-full max-h-full object-contain" alt="Factory Gate Full" />
              <button 
                onClick={() => setIsPhotoOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <div className="absolute bottom-8 left-8">
                 <Badge className="bg-primary text-white font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full shadow-2xl border-none">
                    Verified Workplace Entrance
                 </Badge>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

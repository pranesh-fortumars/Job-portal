"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription, 
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Bell, 
  ChevronRight, 
  MapPin, 
  Briefcase,
  FileText,
  UserCircle,
  Info,
  Calendar,
  ShieldCheck,
  Loader2,
  TrendingUp,
  Mail,
  Trash2,
  IndianRupee,
  Zap,
  AlertTriangle,
  Navigation,
  Power,
  Phone,
  Building2,
  User,
  MessageCircle,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn, translateLocation, getLocalizedDesignation } from "@/lib/utils";
import { useAuth, useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { collection, query, where, orderBy, doc, updateDoc, deleteDoc, limit, addDoc, serverTimestamp, getDocs, writeBatch } from "firebase/firestore";
import { formatDistanceToNow, isValid, isBefore, startOfDay, format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DepartmentLogo } from "@/components/shared/DepartmentLogo";

function ApplicationTimeline({ status, t }: { status: string, t: any }) {
  const steps = ["applied", "shortlisted", "hired"];
  const isRejected = status === "rejected";
  const currentIndex = steps.indexOf(status);

  return (
    <div className="mt-4 md:mt-6 pt-4 border-t border-muted/30">
      <div className="relative flex justify-between items-center px-4 md:px-6">
        <div className="absolute top-[10px] left-6 right-6 h-0.5 bg-muted/20 -translate-y-1/2 z-0" />
        {isRejected ? (
          <div className="absolute top-[10px] left-6 right-6 h-0.5 bg-red-50 -translate-y-1/2 z-0" />
        ) : (
          currentIndex >= 0 && (
            <div 
              className="absolute top-[10px] left-6 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-700" 
              style={{ width: `${(currentIndex / (steps.length - 1)) * (100 - 12)}%` }}
            />
          )
        )}

        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const isActive = !isRejected && idx <= currentIndex;
          const isCompleted = !isRejected && idx < currentIndex;
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-white",
                isRejected ? "border-red-500 bg-red-500" : (isActive ? "border-primary" : "border-muted"),
                isCompleted ? "bg-primary" : ""
              )}>
                {isRejected ? (
                  isLast ? <XCircle className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-white" /> : <CheckCircle className="w-2 md:w-3 h-2 md:h-3 text-white" />
                ) : (
                  isCompleted ? (
                    <CheckCircle className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 text-white" />
                  ) : isActive ? (
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary rounded-full animate-pulse" />
                  ) : null
                )}
              </div>
              <span className={cn(
                "text-[8px] md:text-[10px] font-bold uppercase tracking-wider mt-2",
                isRejected ? "text-red-500" : (isActive ? "text-primary" : "text-muted-foreground")
              )}>
                {isRejected && isLast ? t.rejected : (step === 'hired' ? 'Result' : t[step as keyof typeof t] || step)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SeekerDashboard() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const [openNotifications, setOpenNotifications] = useState(false);
  const [userCategory, setUserCategory] = useState<'Non-Technical' | 'Technical'>('Non-Technical');

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);

  const profileRef = useMemo(() => (auth?.currentUser && db) ? doc(db, "Users", auth.currentUser.uid) : null, [db, auth?.currentUser]);
  const { data: profile } = useDoc<any>(profileRef);

  const masterDesignationsQuery = useMemo(() => db ? query(collection(db, "Designations")) : null, [db]);
  const { data: masterDesignations } = useCollection<any>(masterDesignationsQuery);

  const appsQuery = useMemo(() => {
    if (!auth?.currentUser || !db) return null;
    return query(
      collection(db, "Applications"),
      where("jobSeekerId", "==", auth.currentUser.uid)
    );
  }, [auth?.currentUser, db]);

  const { data: rawApps, loading: appsLoading } = useCollection<any>(appsQuery);

  const employersQuery = useMemo(() => db ? query(collection(db, "Users"), where("role", "==", "employer")) : null, [db]);
  const { data: employersList } = useCollection<any>(employersQuery);

  const employerStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (employersList) {
      employersList.forEach(e => { map[e.id] = e.status || 'approved'; });
    }
    return map;
  }, [employersList]);

  // HIGH-FIDELITY SILENT BACKFILL
  useEffect(() => {
    if (auth?.currentUser && profile?.onboarded && rawApps && rawApps.length > 0 && db) {
      const needsSync = rawApps.some(app => !app.gender || app.gender === "Not Specified");
      if (needsSync && profile.gender) {
        const batch = writeBatch(db);
        let count = 0;
        rawApps.forEach(app => {
          if (!app.gender || app.gender === "Not Specified") {
            const appUpdate: Record<string, any> = {};
            if (profile.gender) appUpdate.gender = profile.gender;
            if (profile.name || app.seekerName) appUpdate.seekerName = profile.name || app.seekerName || "";
            if (profile.location || app.location) appUpdate.location = profile.location || app.location || "";
            if (profile.phone || app.phone) appUpdate.phone = profile.phone || app.phone || "";
            
            const expVal = profile.experience !== undefined ? profile.experience : app.experience;
            if (expVal !== undefined && expVal !== null) {
              appUpdate.experience = Number(expVal) || 0;
            }

            if (Object.keys(appUpdate).length > 0) {
              batch.update(doc(db, "Applications", app.id), appUpdate);
              count++;
            }
          }
        });
        if (count > 0) {
          batch.commit().catch(e => console.debug("Silent backfill deferred.", e));
        }
      }
    }
  }, [auth?.currentUser, profile, rawApps, db]);

  const appliedJobIds = useMemo(() => {
    if (!rawApps) return [];
    return Array.from(new Set(rawApps.map((a: any) => a.jobId))).slice(0, 10);
  }, [rawApps]);

  const appliedJobsQuery = useMemo(() => {
    if (!db || appliedJobIds.length === 0) return null;
    return query(collection(db, "Jobs"), where("__name__", "in", appliedJobIds));
  }, [db, appliedJobIds]);

  const { data: appliedJobsData } = useCollection<any>(appliedJobsQuery);

  const shortlistedEmployerIds = useMemo(() => {
    if (!rawApps) return [];
    return Array.from(new Set(
      rawApps
        .filter((a: any) => a.status === 'shortlisted' || a.status === 'hired')
        .map((a: any) => a.employerId)
    )).slice(0, 10);
  }, [rawApps]);

  const employerProfilesQuery = useMemo(() => {
    if (!db || shortlistedEmployerIds.length === 0) return null;
    return query(collection(db, "Users"), where("__name__", "in", shortlistedEmployerIds));
  }, [db, shortlistedEmployerIds]);

  const { data: employerProfiles } = useCollection<any>(employerProfilesQuery);

  const employerInfoMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (employerProfiles) {
      employerProfiles.forEach(p => { map[p.id] = p; });
    }
    return map;
  }, [employerProfiles]);

  const jobStatusMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (appliedJobsData) {
      appliedJobsData.forEach(j => {
        const now = startOfDay(new Date());
        const endDateStr = j.interviewEndDate || j.interviewStartDate;
        const autoCloseDateStr = j.autoCloseDate;
        
        let isExpired = false;
        if (autoCloseDateStr && isBefore(startOfDay(new Date(autoCloseDateStr)), now)) isExpired = true;
        else if (endDateStr && isBefore(startOfDay(new Date(endDateStr)), now)) isExpired = true;

        map[j.id] = {
          status: j.status,
          isExpired: isExpired,
          closedBy: j.closedBy
        };
      });
    }
    return map;
  }, [appliedJobsData]);

  const realApps = useMemo(() => {
    if (!rawApps) return [];
    return [...rawApps].sort((a, b) => {
      const timeA = a.appliedAt?.seconds || a.appliedAt?.toMillis?.() || Date.now();
      const timeB = b.appliedAt?.seconds || b.appliedAt?.toMillis?.() || Date.now();
      return timeB - timeA;
    });
  }, [rawApps]);

  const recommendationsQuery = useMemo(() => {
    if (!profile || !db) return null;
    return query(
      collection(db, "Jobs"),
      where("status", "==", "approved"),
      where("category", "==", profile.category || userCategory),
      limit(10)
    );
  }, [db, profile, userCategory]);

  const { data: rawRecommendedJobs, loading: recsLoading } = useCollection<any>(recommendationsQuery);

  const filteredRecommendedJobs = useMemo(() => {
    if (!rawRecommendedJobs) return [];
    return rawRecommendedJobs.filter(j => employerStatusMap[j.employerId] !== 'suspended').slice(0, 3);
  }, [rawRecommendedJobs, employerStatusMap]);

  const notificationsQuery = useMemo(() => {
    if (!auth?.currentUser || !db) return null;
    return query(
      collection(db, "UserNotifications"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
  }, [auth?.currentUser, db]);

  const { data: notifications, loading: notifLoading } = useCollection<any>(notificationsQuery);

  useEffect(() => {
    const saved = localStorage.getItem('sim_job_seeker_category') as 'Non-Technical' | 'Technical';
    if (saved) setUserCategory(saved);
  }, []);

  const unreadCount = useMemo(() => {
    return (notifications || []).filter(n => n.status === 'unread').length;
  }, [notifications]);

  const handleMarkAsRead = (notif: any) => {
    if (notif.status === 'read' || !db) return;
    const notifRef = doc(db, "UserNotifications", notif.id);
    updateDoc(notifRef, { status: 'read' });
  };

  const handleClearAll = async () => {
    if (!notifications || !db) return;
    notifications.forEach(n => {
      deleteDoc(doc(db, "UserNotifications", n.id));
    });
  };

  const handleReportSubmit = () => {
    if (!auth?.currentUser || !db) {
      toast({ title: t.login });
      return;
    }
    if (!reportReason) {
      toast({ variant: "destructive", title: t.reasonForReport });
      return;
    }

    setReporting(true);
    const reportData = {
      reportedByUserId: auth.currentUser.uid,
      reportedByName: profile?.name || "Industrial Seeker",
      role: profile?.role || "job_seeker",
      reportedItemId: "general_seeker_dashboard",
      targetName: "Platform Issue",
      targetId: "general",
      targetOwnerId: "admin", 
      type: "general",
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
          title: "New Seeker Dashboard Report",
          message: `A seeker has submitted a report from their dashboard: ${reportReason}.`,
          targetId: docRef.id,
          status: "unread",
          createdAt: serverTimestamp()
        });

        toast({ title: t.reportSuccess });
        setIsReportDialogOpen(false);
        setReportReason("");
        setReportDescription("");
      })
      .finally(() => setReporting(false));
  };

  const handleOpenMaps = (job: any) => {
    const url = job.latitude && job.longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location + " Tirupur")}`;
    window.open(url, '_blank');
  };

  const safeFormatDistance = (dateVal: any) => {
    if (!dateVal) return "Just now";
    try {
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (!isValid(date)) return "Recently";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "Recently";
    }
  };

  const safeFormatDate = (dateVal: any) => {
    if (!dateVal) return "N/A";
    try {
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      return isValid(date) ? format(date, "dd MMM yyyy") : "N/A";
    } catch (e) { return "N/A"; }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 w-full">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/10 bg-muted shrink-0 shadow-sm">
              {profile?.photo ? (
                <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                   <UserCircle className="w-10 h-10 text-primary/40" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black font-headline text-primary">
                Welcome Back, {profile?.name || "Seeker"} 👋
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-muted-foreground text-sm font-medium">
                  India's All-in-One Job Portal — MNCs, Corporates, Retail & Skilled Workers
                </p>
                <Badge variant="outline" className="w-fit text-[9px] uppercase tracking-widest border-primary/20 text-primary bg-primary/5 font-bold py-1 px-3">
                  <Calendar className="w-3 h-3 mr-1.5" /> Active Seeker
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Link href="/jobs" className="flex-1 md:flex-none">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-11 px-6 shadow-lg shadow-accent/20 rounded-xl transition-all active:scale-95">
                <Search className="mr-2 w-4 h-4 md:w-5 md:h-5" /> {t.findJobs}
              </Button>
            </Link>
            
            <Dialog open={openNotifications} onOpenChange={setOpenNotifications}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 relative rounded-xl border-primary/20 text-primary hover:bg-primary/5 transition-all active:scale-95">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-in zoom-in" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] max-w-md w-[95%] p-0 border-none shadow-2xl overflow-hidden flex flex-col h-[70vh]">
                <DialogHeader className="p-6 bg-primary text-white text-left shrink-0">
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-xl font-bold font-headline flex items-center gap-2">
                      <Bell className="w-5 h-5" /> {t.reportAlert}
                    </DialogTitle>
                    {notifications && notifications.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-white hover:bg-white/10 font-bold text-xs h-8 px-2">Clear All</Button>
                    )}
                  </div>
                </DialogHeader>
                <ScrollArea className="flex-1">
                  {notifLoading ? (
                    <div className="p-20 text-center space-y-4"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /><p className="text-xs font-bold text-muted-foreground">Syncing alerts...</p></div>
                  ) : (notifications || []).length === 0 ? (
                    <div className="p-20 text-center space-y-3">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30"><Bell className="w-8 h-8" /></div>
                      <p className="text-sm font-black text-muted-foreground">No updates yet.</p>
                      <p className="text-[10px] font-medium text-muted-foreground/60">We'll notify you when a factory owner shortlists your application.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-muted">
                      {(notifications || []).map((n: any) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n)}
                          className={cn(
                            "p-5 space-y-2 hover:bg-muted/30 transition-colors cursor-pointer relative",
                            n.status === 'unread' && "bg-primary/5 border-l-4 border-primary"
                          )}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="text-xs font-black text-primary uppercase tracking-tight">{n.title}</h4>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase shrink-0">{safeFormatDistance(n.createdAt)}</span>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground leading-snug">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2 px-1">
              <FileText className="w-5 h-5 text-primary" /> {t.appliedFor}
            </h2>
            
            <div className="space-y-4">
              {appsLoading ? (
                <div className="py-20 text-center space-y-4 bg-muted/10 rounded-3xl border-2 border-dashed">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                  <p className="font-bold text-muted-foreground">Syncing your status...</p>
                </div>
              ) : (realApps || []).length === 0 ? (
                <div className="py-20 text-center space-y-6 bg-muted/10 rounded-3xl border-2 border-dashed">
                  <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-black text-lg text-muted-foreground">No Applications Yet</h3>
                    <p className="text-sm font-medium text-muted-foreground/60">Start applying to factory jobs to track them here.</p>
                  </div>
                  <Link href="/jobs">
                    <Button variant="outline" className="rounded-xl border-primary text-primary hover:text-primary active:scale-95 transition-all font-bold">Find Local Jobs</Button>
                  </Link>
                </div>
              ) : (
                realApps.map((app: any) => {
                  const jobMeta = jobStatusMap[app.jobId];
                  const isSuspendedEmployer = employerStatusMap[app.employerId] === 'suspended';
                  const isJobClosed = jobMeta?.status === 'closed' || jobMeta?.status === 'archived' || jobMeta?.status === 'rejected' || jobMeta?.status === 'deleted';
                  const isJobExpired = jobMeta?.isExpired;
                  const isNoLongerAccepting = isJobClosed || isJobExpired || isSuspendedEmployer;
                  const employerInfo = employerInfoMap[app.employerId];

                  return (
                    <Card key={app.id} className="group hover:border-primary/30 transition-all shadow-sm rounded-2xl overflow-hidden border-muted/60">
                      <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex gap-4 w-full">
                            <div className="relative shrink-0">
                               <div className={cn(
                                 "w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                                 app.status === 'shortlisted' || app.status === 'hired' ? 'bg-green-500' : 
                                 app.status === 'rejected' ? 'bg-red-500' : 'bg-primary'
                               )}>
                                 <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
                               </div>
                               <DepartmentLogo 
                                 category={profile?.category || userCategory} 
                                 department={app.department || "General"} 
                                 className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-md border-2 border-white shadow-md z-10" 
                               />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link href={`/jobs/${app.jobId}`}>
                                <h3 className="font-bold text-base md:text-lg truncate group-hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4">
                                  {getLocalizedDesignation(app.jobTitle, masterDesignations, language, t)}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-2">
                                <p className="text-xs md:sm text-muted-foreground font-medium truncate">{app.companyName || "Industrial Unit"}</p>
                                {isNoLongerAccepting && (
                                  <Badge className="bg-red-100 text-red-700 border-none font-black text-[8px] uppercase px-1.5 py-0">
                                    {isSuspendedEmployer ? <EyeOff className="w-2.5 h-2.5 mr-1" /> : <Power className="w-2.5 h-2.5 mr-1" />}
                                    {isSuspendedEmployer ? 'Halt' : isJobExpired ? t.expired : t.expired}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Applied {safeFormatDistance(app.appliedAt)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <Badge className={cn(
                                "h-fit capitalize font-black px-3 py-1 rounded-lg text-[10px] md:text-xs border-none shadow-sm",
                                app.status === 'applied' ? "bg-blue-100 text-blue-700" :
                                app.status === 'shortlisted' ? "bg-green-100 text-green-700" :
                                app.status === 'rejected' ? "bg-red-100 text-red-700" :
                                "bg-purple-100 text-purple-700"
                              )} variant="secondary">
                                {t[app.status as keyof typeof t] || app.status}
                              </Badge>
                              {isNoLongerAccepting && (
                                <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">
                                  {isSuspendedEmployer ? 'Employer suspended' : 'No longer accepting apps'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ApplicationTimeline status={app.status} t={t} />

                        {(app.status === 'shortlisted' || app.status === 'hired') && employerInfo && !isSuspendedEmployer && (
                          <div className="mt-6 p-5 bg-green-50 border border-green-100 rounded-[1.5rem] space-y-4 animate-in fade-in slide-in-from-top-2 duration-500 shadow-inner">
                            <div className="flex items-center gap-2 border-b border-green-200 pb-2">
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                              <h4 className="text-[10px] font-black uppercase text-green-800 tracking-widest">Employer Contact Information</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-green-700/60 uppercase tracking-tighter">Verified Point of Contact</p>
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-green-900 leading-none">{employerInfo.contactPersonName || "HR Manager"}</p>
                                    <p className="text-[10px] font-bold text-green-700/80 mt-1 uppercase">{employerInfo.designation || "Recruitment Lead"}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-green-700/60 uppercase tracking-tighter">Industrial Unit</p>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                                      <Building2 className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-black text-green-900 leading-tight truncate">{employerInfo.name || app.companyName}</p>
                                      {(employerInfo.fullAddress || employerInfo.area) && (
                                        <p className="text-[10px] font-bold text-green-700/70 truncate mt-0.5">
                                          {translateLocation(employerInfo.fullAddress || employerInfo.area, t)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {(employerInfo.latitude || employerInfo.fullAddress) && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-100 shrink-0 transition-all active:scale-90"
                                            onClick={() => {
                                              const url = employerInfo.latitude && employerInfo.longitude 
                                                ? `https://www.google.com/maps/search/?api=1&query=${employerInfo.latitude},${employerInfo.longitude}`
                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((employerInfo.fullAddress || employerInfo.area || "") + " Tirupur")}`;
                                              window.open(url, '_blank');
                                            }}
                                          >
                                            <MapPin className="w-4 h-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-green-600 text-white border-none font-bold text-[10px] uppercase tracking-wider">
                                          <p>View Company Location</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-green-700/60 uppercase tracking-tighter">Primary Communication</p>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2 font-black shadow-lg shadow-green-600/20 active:scale-95 transition-all" 
                                    onClick={() => window.open(`tel:${employerInfo.phone || employerInfo.contactNumber}`)}
                                  >
                                    <Phone className="w-3.5 h-3.5" /> +91 {employerInfo.phone || employerInfo.contactNumber}
                                  </Button>
                                </div>
                              </div>
                              {(employerInfo.email || employerInfo.emailId) && (
                                <div className="space-y-1.5">
                                  <p className="text-[9px] font-black text-green-700/60 uppercase tracking-tighter">Email Record</p>
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                      <Mail className="w-4 h-4" />
                                    </div>
                                    <p className="text-sm font-bold text-green-900 truncate">{employerInfo.email || employerInfo.emailId}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="pt-2 border-t border-green-200/50">
                               <p className="text-[8px] font-bold text-green-600/80 italic">* This information is shared exclusively for shortlisted industrial candidates.</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-xl font-bold font-headline flex items-center gap-2 px-1">
              <TrendingUp className="w-5 h-5 text-accent" /> {t.explore}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {recsLoading ? (
                [1, 2].map(i => (
                  <Card key={i} className="animate-pulse bg-muted/20 border-none rounded-[2rem] h-40" />
                ))
              ) : (filteredRecommendedJobs || []).length === 0 ? (
                <Card className="border-dashed bg-muted/10 rounded-[2rem] p-8 text-center space-y-3">
                  <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground">No specific matches yet.</p>
                  <Link href="/jobs">
                    <Button variant="link" className="text-primary text-xs font-bold">Browse all jobs</Button>
                  </Link>
                </Card>
              ) : (
                filteredRecommendedJobs.map((job: any) => (
                  <Card key={job.id} className="bg-primary text-white border-none shadow-2xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="pb-3 pt-6 px-6">
                      <div className="flex items-center gap-3">
                        <DepartmentLogo category={job.category} department={job.department} className="w-10 h-10 rounded-xl border border-white/20 shrink-0" />
                        <CardTitle className="font-headline text-lg truncate">{job.companyName}</CardTitle>
                      </div>
                      <CardDescription className="text-primary-foreground/70 font-medium text-xs line-clamp-1 mt-2">
                        Matching your "{getLocalizedDesignation(job.jobTitle, masterDesignations, language, t)}" skill • Posted {safeFormatDate(job.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-6">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={(e) => { e.preventDefault(); handleOpenMaps(job); }}
                          className="flex items-center gap-2 text-[10px] font-bold bg-white/10 p-2 rounded-xl truncate hover:bg-white/20 transition-colors text-left"
                        >
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" /> 
                          <span className="truncate border-b border-transparent group-hover:border-accent/30">{translateLocation(job.location, t)}</span>
                        </button>
                        <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 p-2 rounded-xl truncate">
                          <IndianRupee className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="truncate">₹{job.salaryMin ? `${(job.salaryMin/1000).toFixed(0)}k` : '?'}-{(job.salaryMax/1000).toFixed(0)}k</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button className="w-full bg-white text-primary hover:bg-white/90 font-extrabold h-11 rounded-xl shadow-lg text-sm transition-transform active:scale-95">
                            View Match
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Card className="border-primary/10 bg-muted/20 rounded-[2rem] overflow-hidden border-2 border-dashed">
               <CardContent className="p-6 text-center space-y-4">
                 <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                   <UserCircle className="w-8 h-8 text-primary" />
                 </div>
                 <div className="space-y-1">
                   <h3 className="font-bold text-lg">Update Records</h3>
                   <p className="text-xs text-muted-foreground font-medium leading-snug">Increases hiring chances by 60% with verified badges.</p>
                 </div>
                 <Link href="/seeker/profile" className="block">
                    <Button variant="outline" className="w-full font-bold h-11 border-primary text-primary hover:bg-primary/5 hover:text-primary active:scale-95 transition-all rounded-xl">Open Profile</Button>
                 </Link>
               </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-100 rounded-[2rem] p-6 space-y-4 border">
               <div className="flex items-center gap-3 text-green-900 font-bold">
                 <ShieldCheck className="w-6 h-6 text-green-600" /> Safe Hiring
               </div>
               <p className="text-xs text-green-800/70 font-medium leading-relaxed">
                 All jobs on NexTirupur are verified with GST and Photo proof. Genuine work is always free.
               </p>
               <Link href="/safety" className="text-xs font-bold text-green-700 hover:underline inline-flex items-center gap-1">
                 {t.readSafetyTips} <ChevronRight className="w-3 h-3" />
               </Link>
            </Card>
          </div>
        </div>

        <div className="pt-8 border-t border-muted/30">
          <Card className="bg-red-50 border-red-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border shadow-sm">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-red-900 text-lg uppercase tracking-tight">{t.reportIncident}</h3>
                <p className="text-sm text-red-800/70 font-medium max-w-md leading-relaxed">
                  Found something suspicious or facing an issue with a listing? Help us keep NexTirupur 100% genuine and safe.
                </p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setIsReportDialogOpen(true)}
              className="w-full md:w-auto rounded-xl font-bold px-10 h-12 shadow-lg active:scale-95 transition-all bg-red-600 hover:bg-red-700"
            >
              {t.report}
            </Button>
          </Card>
        </div>
      </main>

      <Dialog open={isReportDialogOpen} onOpenChange={isReportDialogOpen => setIsReportDialogOpen(isReportDialogOpen)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
           <DialogHeader className="p-8 bg-red-600 text-white text-left">
              <div className="flex items-center gap-3 mb-2">
                 <AlertTriangle className="w-6 h-6" />
                 <DialogTitle className="text-xl font-black uppercase tracking-tight">{t.reportIncident}</DialogTitle>
              </div>
              <DialogDescription className="text-white/80 font-medium">
                 Help keep Tirupur safe. What issue are you facing today?
              </DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-6">
              <div className="space-y-2">
                 <Label className="font-bold text-xs uppercase text-muted-foreground">{t.reasonForReport}</Label>
                 <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger className="h-12 rounded-xl font-bold">
                       <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                       <SelectItem value="fake_job">Fake Job Listing Encountered</SelectItem>
                       <SelectItem value="asking_money">Employer Asked for Money</SelectItem>
                       <SelectItem value="wrong_details">Incorrect Factory Details</SelectItem>
                       <SelectItem value="behavior">Unprofessional Behavior</SelectItem>
                       <SelectItem value="other">Other Technical Issue</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label className="font-bold text-xs uppercase text-muted-foreground">{t.reportDescriptionLabel}</Label>
                 <Textarea 
                    value={reportDescription}
                    onChange={e => setReportDescription(e.target.value)}
                    placeholder="Provide more details for our team..."
                    className="min-h-[100px] rounded-xl font-medium"
                    maxLength={500}
                 />
              </div>
           </div>
           <DialogFooter className="p-6 bg-muted/20 border-t flex gap-3">
              <Button variant="ghost" onClick={() => { setIsReportDialogOpen(false); setReportReason(""); setReportDescription(""); }} className="flex-1 font-bold rounded-xl">{t.cancelDelete}</Button>
              <Button disabled={reporting || !reportReason.trim()} onClick={handleReportSubmit} className="flex-[2] bg-red-600 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">
                 {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.submitReport}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dynamic Support Contact Terminal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center animate-in slide-in-from-bottom-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a 
                href="tel:+919025404014"
                className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl flex items-center justify-center p-0 active:scale-90 transition-all border-4 border-white"
              >
                <Phone className="w-7 h-7" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-blue-600 text-white border-none font-bold rounded-xl px-4 py-2">
              <p>Call Official Support: +91 90254 04014</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => window.open('https://wa.me/917305505311')}
                className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-2xl flex items-center justify-center p-0 active:scale-90 transition-all border-4 border-white"
              >
                <MessageCircle className="w-7 h-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-green-600 text-white border-none font-bold rounded-xl px-4 py-2">
              <p>Chat with Support: 7305505311</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

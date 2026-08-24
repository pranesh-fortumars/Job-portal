"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2,
  Clock,
  MapPin,
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Briefcase,
  UserCircle,
  BarChart3,
  Users,
  Smartphone,
  ChevronRight,
  Building2,
  PhoneCall,
  Phone,
  Trash2,
  FileText,
  Flag,
  AlertTriangle,
  GraduationCap,
  Heart,
  Bus,
  Coffee,
  History,
  Copy,
  Download,
  Archive,
  MessageCircle,
  Zap,
  IndianRupee,
  Power,
  RefreshCcw,
  ShoppingBag,
  Home,
  Gift,
  Timer,
  UserX,
  ArrowUpDown,
  Rocket,
  Star,
  Check,
  Tag,
  Layers,
  Languages,
  Mail,
  LocateFixed,
  TrendingUp,
  PieChart,
  User,
  ShieldAlert,
  ImageIcon,
  Plus,
  X,
  ShieldX,
  Filter,
  RefreshCw,
  Lock,
  Globe,
  Monitor,
  Navigation,
  SlidersHorizontal,
  LayoutDashboard,
  Info,
  BadgeInfo,
  EyeOff
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useFirestore, useCollection, useUser, useDoc, useAuth } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp, addDoc, setDoc, increment, writeBatch, getDocs, getDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { format, isValid, startOfDay, isBefore, addDays, isAfter, endOfDay, startOfMonth, addMonths, differenceInDays, subDays, startOfToday, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { cn, translateLocation, formatShiftTiming } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { sendAuthkeyNotification } from "@/lib/authkey";
import { generateCandidateShortlistMessage, openWhatsAppShare } from "@/lib/sharing";
import { DepartmentLogo } from "@/components/shared/DepartmentLogo";
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  Legend,
  AreaChart,
  Area
} from "recharts";
import { JobListing } from "@/lib/types";

const getTime = (val: any) => {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.seconds) return val.seconds * 1000;
  if (val.toMillis) return val.toMillis();
  if (val.toDate) return val.toDate().getTime();
  const d = new Date(val).getTime();
  return isNaN(d) ? Date.now() : d;
};

const safeFormatDateOnly = (dateVal: any) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    return isValid(d) ? format(d, "dd MMM yyyy") : "N/A";
  } catch (e) { return "N/A"; }
};

const ProgressDots = ({ total, used, color = "bg-primary" }: { total: number, used: number, color?: string }) => {
  const displayTotal = total > 10 ? 8 : total;
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {Array.from({ length: displayTotal }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-2.5 h-2.5 rounded-full border transition-all",
              i < used ? `${color} border-transparent shadow-sm` : "bg-muted border-muted-foreground/10"
            )} 
          />
        ))}
        {total > displayTotal && <span className="text-[9px] font-medium text-muted-foreground ml-1">+{total - displayTotal}</span>}
      </div>
      <div className="flex justify-between w-full px-0.5">
         <span className="text-[8px] font-medium uppercase text-muted-foreground tracking-tighter">
           {used} Used
         </span>
         <span className="text-[8px] font-medium uppercase text-muted-foreground tracking-tighter">
           {total - used} Avail
         </span>
      </div>
    </div>
  );
};

const PrintProfile = ({ user, app, t }: { user: any, app: any, t: any }) => {
  if (!user) return null;
  const resume = user.digitalResume;
  
  return (
    <div className="print-container w-full text-black bg-white p-0 m-0">
      <div className="resume-document-frame">
        <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-medium uppercase tracking-tighter mb-1">{user.name}</h1>
            <p className="text-lg font-bold text-gray-700 uppercase tracking-wide">
              {user.designation || app?.jobTitle} • {user.department || "Industrial Sector"}
            </p>
            <div className="flex wrap gap-x-4 gap-y-1 mt-2 text-sm font-medium">
              <span className="flex items-center gap-1">Mobile: +91 {user.phone}</span>
              {user.email && <span className="flex items-center gap-1">Email: {user.email}</span>}
              <span className="flex items-center gap-1">Location: {translateLocation(user.location, t)}</span>
            </div>
          </div>
          {user.photo && (
            <div className="w-24 h-24 border-2 border-black rounded-lg overflow-hidden shrink-0 ml-6 bg-gray-50 flex items-center justify-center">
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Industrial Profile</h2>
          <table className="print-table w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400 w-1/4">Global Category</th>
                <td className="p-2 border border-gray-400 w-1/4 font-bold">{user.category}</td>
                <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400 w-1/4">Total Experience</th>
                <td className="p-2 border border-gray-400 w-1/4 font-bold">{user.experience || resume?.professional?.totalExperience || "0"} Years</td>
              </tr>
              <tr>
                <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400">Residing Area</th>
                <td className="p-2 border border-gray-400">{translateLocation(user.location, t)}</td>
                <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400">Date of Birth</th>
                <td className="p-2 border border-gray-400">{safeFormatDateOnly(user.dob)}</td>
              </tr>
              <tr>
                <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400">Gender / Age</th>
                <td className="p-2 border border-gray-400">{user.gender || "Not Specified"} / {user.age || "?"} Yrs</td>
                <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400">Languages Known</th>
                <td className="p-2 border border-gray-400">{(user.languages || resume?.personal?.languages || []).join(', ') || "N/A"}</td>
              </tr>
              {app && (
                <tr>
                  <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400">Expected Salary</th>
                  <td className="p-2 border border-gray-400 font-medium">₹{app.expectedSalary ? parseInt(app.expectedSalary).toLocaleString() : "Not Specified"}</td>
                  <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400">Interview Slot</th>
                  <td className="p-2 border border-gray-400 font-bold">{app.preferredInterviewDate && isValid(new Date(app.preferredInterviewDate)) ? format(new Date(app.preferredInterviewDate), "dd MMM yyyy") : "Immediate Walk-in"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {(resume?.professional || user.category === 'Staff') && (
          <section className="mb-6">
            <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Technical Assets & Skills</h2>
            <table className="print-table w-full border-collapse border border-gray-400">
              <tbody>
                <tr>
                  <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400 w-1/4">Buyers Handled</th>
                  <td colSpan={3} className="p-2 border border-gray-400">{resume?.professional?.buyersHandled || "N/A"}</td>
                </tr>
                <tr>
                  <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400 w-1/4">Audit Knowledge</th>
                  <td colSpan={3} className="p-2 border border-gray-400">{resume?.professional?.auditExperience || "N/A"}</td>
                </tr>
                <tr>
                  <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400 w-1/4">Software Proficiency</th>
                  <td colSpan={3} className="p-2 border border-gray-400">{resume?.professional?.certifications || "N/A"}</td>
                </tr>
                <tr>
                  <th className="bg-gray-100 text-[9pt] font-medium uppercase p-2 border border-gray-400 w-1/4">Core Skills</th>
                  <td colSpan={3} className="p-2 border border-gray-400 font-bold">{(resume?.professional?.coreSkills || []).join(', ') || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {resume?.academic?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Academic Records</h2>
            <table className="print-grid-table w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium">Level</th>
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium">Degree / Specialization</th>
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium">Institution / College</th>
                  <th className="border border-gray-400 p-2 text-center text-[8pt] uppercase font-medium">Year</th>
                </tr>
              </thead>
              <tbody>
                {resume.academic.map((edu: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-gray-400 p-2 font-bold">{edu.education}</td>
                    <td className="border border-gray-400 p-2">{edu.degree}</td>
                    <td className="border border-gray-400 p-2">{edu.institute}</td>
                    <td className="border border-gray-400 p-2 text-center">{edu.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {resume?.recentCompany?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Employment History</h2>
            <table className="print-grid-table w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium" style={{ width: '30%' }}>Company & Role</th>
                  <th className="border border-gray-400 p-2 text-center text-[8pt] uppercase font-medium" style={{ width: '25%' }}>Tenure</th>
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium" style={{ width: '45%' }}>Remarks / Responsibilities</th>
                </tr>
              </thead>
              <tbody>
                {resume.recentCompany.map((job: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-gray-400 p-2">
                      <div className="font-bold">{job.name}</div>
                      <div className="text-[7pt] italic uppercase">{job.position}</div>
                    </td>
                    <td className="border border-gray-400 p-2 text-center font-medium">{job.startDate} — {job.endDate}</td>
                    <td className="border border-gray-400 p-2 text-[8pt] leading-relaxed italic">"{job.remarks || "No specific details provided."}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {resume?.references?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Industrial References</h2>
            <table className="print-grid-table w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium">Ref. Name</th>
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium">Designation & Firm</th>
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium">Contact Information</th>
                  <th className="border border-gray-400 p-2 text-left text-[8pt] uppercase font-medium">Context / Relationship</th>
                </tr>
              </thead>
              <tbody>
                {resume.references.map((ref: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-gray-400 p-2 font-bold">{ref.name}</td>
                    <td className="border border-gray-400 p-2">{ref.designation} @ {ref.company}</td>
                    <td className="border border-gray-400 p-2">
                      <div className="font-bold">+91 {ref.contact}</div>
                      {ref.email && <div className="text-[7pt] text-gray-600">{ref.email}</div>}
                    </td>
                    <td className="border border-gray-400 p-2 text-[8pt]">{ref.remarks || ref.relationship || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <div className="mt-10 pt-4 border-t border-dotted border-gray-400 text-center">
          <p className="text-[7pt] text-gray-500 uppercase tracking-widest">
            Verified Industrial Audit Dossier • Generated via NexTirupur.in • {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function EmployerDashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const db = useFirestore();
  const { user, isLoading: userLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("applicants");
  const [subTab, setSubTab] = useState("pending");
  const [jobLifecycleTab, setJobLifecycleTab] = useState<"active" | "closed" | "archived" | "plan">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);

  const [printBuffer, setPrintBuffer] = useState<{user: any, app: any} | null>(null);

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportingCandidate, setReportingCandidate] = useState<any>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReportingSubmitting, setIsReportingSubmitting] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'appliedAt',
    direction: 'desc'
  });

  const [viewingJobStats, setViewingJobStats] = useState<any>(null);

  const userProfileRef = useMemo(() => (user?.uid && db) ? doc(db, "Users", user.uid) : null, [db, user?.uid]);
  const { data: userData, loading: userProfileLoading } = useDoc<any>(userProfileRef);

  const selectedCandidateRef = useMemo(() => (selectedApp?.jobSeekerId && db) ? doc(db, "Users", selectedApp.jobSeekerId) : null, [db, selectedApp?.jobSeekerId]);
  const { data: fullProfile, loading: candidateLoading } = useDoc<any>(selectedCandidateRef);

  const jobsQuery = useMemo(() => (user?.uid && db) ? query(collection(db, "Jobs"), where("employerId", "==", user.uid)) : null, [db, user?.uid]);
  const appsQuery = useMemo(() => (user?.uid && db) ? query(collection(db, "Applications"), where("employerId", "==", user.uid)) : null, [db, user?.uid]);
  const reportsAgainstJobsQuery = useMemo(() => (user?.uid && db) ? query(collection(db, "Reports"), where("targetOwnerId", "==", user.uid)) : null, [db, user?.uid]);
  const myCandidateReportsQuery = useMemo(() => (user?.uid && db) ? query(collection(db, "Reports"), where("reportedByUserId", "==", user.uid), where("type", "==", "user")) : null, [db, user?.uid]);

  const { data: rawApps, loading: appsLoading } = useCollection<any>(appsQuery);
  const { data: rawJobs, loading: jobsLoading } = useCollection<JobListing>(jobsQuery as any);
  const { data: rawReports, loading: reportsLoading } = useCollection<any>(reportsAgainstJobsQuery);
  const { data: myCandidateReports, loading: myReportsLoading } = useCollection<any>(myCandidateReportsQuery);

  const applicantUserIds = useMemo(() => Array.from(new Set((rawApps || []).map(a => a.jobSeekerId))), [rawApps]);
  const [liveGenderMap, setLiveGenderMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (db && applicantUserIds.length > 0) {
      const fetchGenders = async () => {
        const usersRef = collection(db, "Users");
        const results: Record<string, string> = {};
        for (let i = 0; i < applicantUserIds.length; i += 30) {
          const chunk = applicantUserIds.slice(i, i + 30);
          const q = query(usersRef, where("__name__", "in", chunk));
          const snap = await getDocs(q);
          snap.docs.forEach(doc => {
            if (doc.data().gender) results[doc.id] = doc.data().gender;
          });
        }
        setLiveGenderMap(results);
      };
      fetchGenders();
    }
  }, [db, applicantUserIds]);

  const nonDeletedJobs = useMemo(() => (rawJobs || []).filter(j => j.status !== 'deleted'), [rawJobs]);

  const categorizedJobs = useMemo(() => {
    const now = new Date();
    const active: any[] = [];
    const closed: any[] = [];
    const archived: any[] = [];
    const drafts: any[] = [];

    const parseDate = (val: any) => {
      if (!val) return null;
      if (val.toDate) return val.toDate();
      if (typeof val === 'string' || typeof val === 'number') {
        const d = new Date(val);
        return isValid(d) ? d : null;
      }
      return null;
    };

    nonDeletedJobs.forEach(job => {
      if (job.status === 'draft') { drafts.push(job); return; }
      if (job.status === 'archived') { archived.push(job); return; }

      const manualClosed = job.status === 'closed';
      const interviewEndDate = parseDate(job.interviewEndDate || job.interviewStartDate);
      const autoCloseDate = parseDate(job.autoCloseDate);
      
      let isAutoClosed = false;
      let closureReason = "";
      let closureSource: 'admin' | 'employer' | 'auto' | 'system' = 'auto';

      if (manualClosed) {
        closureReason = (job as any).closureReason || "Manually Closed by Company Owner";
        closureSource = job.closedBy === 'admin' ? 'admin' : 'employer';
      } else {
        const driveEndOfDay = interviewEndDate ? endOfDay(interviewEndDate) : null;
        const expiryEndOfDay = autoCloseDate ? endOfDay(autoCloseDate) : null;

        if (expiryEndOfDay && isAfter(now, expiryEndOfDay)) {
          isAutoClosed = true;
          closureReason = "Closed Automatically (Expired)";
        } else if (driveEndOfDay && isAfter(now, driveEndOfDay)) {
          isAutoClosed = true;
          closureReason = "Closed Automatically (Drive Date Completed)";
        } else if (job.status === 'rejected') {
          isAutoClosed = true;
          closureReason = "Rejected during Admin Audit";
          closureSource = 'admin';
        }
      }

      const jobWithAudit = {
        ...job,
        closureAudit: (manualClosed || isAutoClosed) ? {
          reason: closureReason,
          source: closureSource,
          closedAt: job.closedAt || (isAutoClosed ? (autoCloseDate || interviewEndDate)?.toISOString() : job.updatedAt),
          closedByName: (job as any).closedByName || (closureSource === 'admin' ? "Super Admin" : "Company Owner"),
          driveEndDate: interviewEndDate?.toISOString(),
          expiryDate: autoCloseDate?.toISOString()
        } : null
      };

      if (manualClosed || isAutoClosed) {
        closed.push(jobWithAudit);
      } else if (['approved', 'pending', 'open', 'live', 'live'].includes(job.status)) {
        active.push(jobWithAudit);
      } else {
        closed.push({
          ...jobWithAudit,
          closureAudit: { reason: `System Rule - ${job.status}`, source: 'system', closedAt: job.updatedAt }
        });
      }
    });

    const sortByDate = (a: any, b: any) => getTime(b.createdAt) - getTime(a.createdAt);
    return {
      active: active.sort(sortByDate),
      closed: closed.sort(sortByDate),
      archived: archived.sort(sortByDate),
      drafts: drafts.sort(sortByDate)
    };
  }, [nonDeletedJobs]);

  const liveApps = useMemo(() => {
    let apps = (rawApps || []).filter(app => {
      const seekerName = (app.seekerName || "").toLowerCase();
      const jobTitle = (app.jobTitle || "").toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      return !searchQuery || seekerName.includes(queryLower) || jobTitle.includes(queryLower);
    });

    if (sortConfig.key && sortConfig.direction) {
      apps.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'experience' || sortConfig.key === 'expectedSalary') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else if (sortConfig.key === 'appliedAt') {
          valA = getTime(valA);
          valB = getTime(valB);
        } else {
          valA = (valA || "").toString().toLowerCase();
          valB = (valB || "").toString().toLowerCase();
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      apps.sort((a, b) => getTime(b.appliedAt) - getTime(a.appliedAt));
    }
    return apps;
  }, [rawApps, searchQuery, sortConfig]);

  const filteredApps = useMemo(() => {
    const normalizeStatus = (s: string) => s?.toLowerCase() || "";
    if (subTab === 'pending' || subTab === 'applied') {
      return liveApps.filter(app => {
        const s = normalizeStatus(app.status);
        return !s || s === 'applied' || s === 'pending';
      });
    }
    if (subTab === 'shortlisted') {
      return liveApps.filter(app => {
        const s = normalizeStatus(app.status);
        return s === 'shortlisted' || s === 'hired';
      });
    }
    if (subTab === 'rejected') {
      return liveApps.filter(app => normalizeStatus(app.status) === 'rejected');
    }
    return liveApps.filter(app => normalizeStatus(app.status) === subTab);
  }, [liveApps, subTab]);

  const offerStats = useMemo(() => {
    if (!userData || !rawJobs) return null;
    
    const now = new Date();
    const regDate = userData.createdAt ? (userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)) : subDays(now, 1);
    const welcomeExpiry = addDays(regDate, 7);
    const isWelcomeExpired = isBefore(welcomeExpiry, now);
    
    const spentJobs = nonDeletedJobs.filter(j => j.status !== 'draft')
      .sort((a,b) => getTime(a.createdAt) - getTime(b.createdAt));
    
    const welcomeJobs = spentJobs.filter(j => isBefore(new Date(j.createdAt), welcomeExpiry)).slice(0, 3);
    const welcomeUsed = welcomeJobs.length;
    const welcomeRemaining = isWelcomeExpired ? 0 : 3 - welcomeUsed;
    
    const monthStart = startOfToday();
    const welfareJobs = spentJobs.filter(j => 
      j.category === 'Worker' && 
      isAfter(new Date(j.createdAt), monthStart) && 
      !welcomeJobs.find(wj => wj.id === j.id)
    ).slice(0, 3);
    const welfareUsed = welfareJobs.length;
    const welfareRemaining = 3 - welfareUsed;
    
    const purchasedAllocated = userData.totalPurchased || 0;
    const otherJobs = spentJobs.filter(j => 
      !welcomeJobs.find(wj => wj.id === j.id) && 
      !welfareJobs.find(wj => wj.id === j.id)
    );
    const purchasedUsed = otherJobs.length;
    const purchasedRemaining = Math.max(0, purchasedAllocated - purchasedUsed);

    const workerSpent = spentJobs.filter(j => j.category === 'Worker').length;
    const staffSpent = spentJobs.filter(j => j.category === 'Staff').length;

    return {
      welcome: { used: welcomeUsed, remaining: welcomeRemaining, total: 3, expiry: welcomeExpiry, isExpired: isWelcomeExpired, daysLeft: Math.max(0, differenceInDays(welcomeExpiry, now)) },
      welfare: { used: welfareUsed, remaining: welfareRemaining, total: 3, reset: addMonths(monthStart, 1), daysToReset: differenceInDays(addMonths(monthStart, 1), now) },
      purchased: { 
        used: purchasedUsed, 
        remaining: purchasedRemaining, 
        total: purchasedAllocated, 
        planName: userData.subscription?.activePlanId || "No Active Plan", 
        planPrice: userData.subscription?.price || 0 
      },
      worker: { spent: workerSpent, remaining: Math.max(0, (welcomeRemaining + welfareRemaining + (purchasedRemaining > 0 ? purchasedRemaining : 0))) }, 
      staff: { spent: staffSpent, remaining: Math.max(0, (welcomeRemaining + (purchasedRemaining > 0 ? purchasedRemaining : 0))) }, 
      totalAvailable: welcomeRemaining + welfareRemaining + purchasedRemaining,
      totalUsed: welcomeUsed + welfareUsed + purchasedUsed,
      totalAllocated: 3 + 3 + purchasedAllocated,
      sharedBalance: welcomeRemaining + welfareRemaining + purchasedRemaining
    };
  }, [userData, rawJobs, nonDeletedJobs]);

  const visualizationData = useMemo(() => {
    if (!offerStats) return { pie: [], bar: [], trend: [] };

    const totalUsed = (offerStats.welcome.used || 0) + (offerStats.welfare.used || 0) + (offerStats.purchased.used || 0);
    const totalRemaining = (offerStats.welcome.remaining || 0) + (offerStats.welfare.remaining || 0) + (offerStats.purchased.remaining || 0);

    const trend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'dd MMM');
      const count = (rawJobs || []).filter(j => {
        if (j.status === 'draft' || !j.createdAt) return false;
        try {
          const d = (j.createdAt as any)?.toDate ? (j.createdAt as any).toDate() : ((j.createdAt as any)?.seconds ? new Date((j.createdAt as any).seconds * 1000) : new Date(j.createdAt));
          return isValid(d) && format(d, 'dd MMM') === dateStr;
        } catch {
          return false;
        }
      }).length;
      return { date: dateStr, posts: count };
    }).reverse();

    return {
      pie: [
        { name: 'Used', value: totalUsed, color: '#0F52BA' },
        { name: 'Available', value: totalRemaining, color: '#0EA5E9' }
      ],
      bar: [
        { name: 'Welcome', used: offerStats.welcome.used, remaining: offerStats.welcome.remaining },
        { name: 'Welfare', used: offerStats.welfare.used, remaining: offerStats.welfare.remaining },
        { name: 'Plan', used: offerStats.purchased.used, remaining: offerStats.purchased.remaining }
      ],
      trend
    };
  }, [offerStats, rawJobs]);

  const counts = useMemo(() => {
    const normalizeStatus = (s: string) => s?.toLowerCase() || "";
    const apps = rawApps || [];
    return {
      pending: apps.filter(a => {
        const s = normalizeStatus(a.status);
        return !s || s === 'applied' || s === 'pending';
      }).length,
      shortlisted: apps.filter(a => {
        const s = normalizeStatus(a.status);
        return s === 'shortlisted' || s === 'hired';
      }).length,
      rejected: apps.filter(a => normalizeStatus(a.status) === 'rejected').length,
      active: categorizedJobs.active.length,
      closed: categorizedJobs.closed.length,
      archived: categorizedJobs.archived.length,
      drafts: categorizedJobs.drafts.length,
      reports: (rawReports || []).length,
      candidateReports: (myCandidateReports || []).length,
    };
  }, [rawApps, categorizedJobs, rawReports, myCandidateReports]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc' }));
  };

  const executeAction = async () => {
    if (!confirmAction || isProcessing || !db) return;
    setIsProcessing(true);
    const { type, coll, id, data } = confirmAction;
    
    setConfirmAction(null);
    setSelectedApp(null);

    try {
      if (type === 'delete') {
        const targetJob = rawJobs?.find(j => j.id === id);
        const wasUsed = targetJob && targetJob.status !== 'draft' && targetJob.status !== 'deleted';
        
        const batch = writeBatch(db);
        batch.update(doc(db, coll, id), { 
          status: 'deleted', 
          deletedAt: new Date().toISOString(), 
          updatedAt: serverTimestamp() 
        });
        
        if (wasUsed && user?.uid) {
           batch.update(doc(db, "Users", user.uid), {
             postCredits: increment(1),
             totalUsed: increment(-1),
             updatedAt: serverTimestamp()
           });
        }
        
        await batch.commit().catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `${coll}/${id}`, operation: 'update' }));
        });
        toast({ title: wasUsed ? "Record Removed & Credit Synchronized" : "Record Removed" });
      } else if (type === 'close') {
        updateDoc(doc(db, "Jobs", id), { 
          status: 'closed', 
          closedBy: 'employer', 
          closedByName: userData?.companyName || userData?.name || "Company Owner",
          closedAt: new Date().toISOString(),
          closureReason: "Manually Closed by Company Owner",
          updatedAt: serverTimestamp() 
        }).catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `Jobs/${id}`, operation: 'update' }));
        });
        toast({ title: "Drive Closed" });
      } else if (type === 'update') {
        updateDoc(doc(db, coll, id), { ...data, updatedAt: serverTimestamp() }).catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `${coll}/${id}`, operation: 'update' }));
        });
        toast({ title: "Status Synchronized" });
      }
    } catch (e) {
      console.error("Action error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (app: any, newStatus: string) => {
    if (!db) return;
    setIsProcessing(true);
    const appRef = doc(db, "Applications", app.id);
    const notificationsRef = collection(db, "UserNotifications");
    const updatePayload = { status: newStatus, updatedAt: serverTimestamp() };
    
    setSelectedApp(null);

    try {
      await updateDoc(appRef, updatePayload).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: appRef.path, operation: 'update', requestResourceData: updatePayload }));
      });
      await addDoc(notificationsRef, {
        userId: app.jobSeekerId,
        title: newStatus === 'shortlisted' ? "Application Shortlisted!" : (newStatus === 'pending' ? "Application Re-Review" : "Application Update"),
        message: `Your application status for "${app.jobTitle}" at ${app.companyName} has been updated to ${newStatus}.`,
        status: "unread",
        createdAt: serverTimestamp()
      });
      
      if ((newStatus.toLowerCase() === 'shortlisted' || newStatus.toLowerCase() === 'rejected') && 
          newStatus.toLowerCase() !== (app.status || "").toLowerCase() && 
          app.phone) {
        
        sendAuthkeyNotification({
          candidateName: app.seekerName || "Candidate",
          designation: app.jobTitle || "Industrial Role",
          companyName: app.companyName || userData?.companyName || "Verified Factory",
          phone: app.phone,
          eventType: newStatus.toLowerCase() === 'shortlisted' ? 'shortlisted' : 'rejected'
        }).then(result => {
          console.group(`%cWhatsApp Automation: ${newStatus.toUpperCase()}`, "color: #25D366; font-weight: bold;");
          console.log("Trigger Time:", new Date().toISOString());
          console.log("Record ID:", app.id);
          console.log("Recipient Mobile:", result.mobile);
          console.log("Sender Number:", "917305505311");
          console.log("Template Name:", result.templateName);
          console.log("WID:", result.wid);
          console.log("Template Variables:", result.bodyValues);
          console.log("API Endpoint:", result.endpoint);
          console.log("Success Status:", result.success ? "SUCCESS" : "FAILURE");
          console.log("API Response:", result.data);
          if (result.error) console.error("Error Message:", result.error);
          console.log("Final Completion Status:", result.status);
          console.groupEnd();

          const logData = {
            eventType: result.eventType,
            templateName: result.templateName,
            templateId: result.wid,
            candidateId: app.jobSeekerId,
            employerId: app.employerId,
            jobId: app.jobId,
            mobileNumber: result.mobile,
            whatsappStatus: result.success ? 'success' : 'failed',
            apiResponse: result.data || null,
            errorMessage: result.error || null,
            timestamp: serverTimestamp()
          };
          addDoc(collection(db, "WhatsAppLogs"), logData)
            .catch(async (logError) => {
               errorEmitter.emit('permission-error', new FirestorePermissionError({
                 path: 'WhatsAppLogs',
                 operation: 'create',
                 requestResourceData: logData
               } satisfies SecurityRuleContext));
            });
        });
      }
      
      toast({ title: `Candidate status: ${newStatus.toUpperCase()}` });
    } catch (err: any) {
      console.error("Status update error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportCandidate = (app: any) => {
    setReportingCandidate(app);
    setReportReason("");
    setReportDescription("");
    setIsReportDialogOpen(true);
  };

  const submitCandidateReport = async () => {
    if (!db || !user || !reportingCandidate || !reportReason) return;
    
    setIsReportingSubmitting(true);
    const reportId = `REP_CAND_${Date.now()}_${user.uid.slice(0,5)}`;
    const reportRef = doc(db, "Reports", reportId);

    const reportData = {
      id: reportId,
      reportedByUserId: user.uid,
      reportedByName: userData?.companyName || userData?.name || "Verified Employer",
      targetId: reportingCandidate.jobSeekerId,
      targetName: reportingCandidate.seekerName || "Industrial Candidate",
      targetType: 'user',
      type: 'user',
      jobId: reportingCandidate.jobId,
      jobTitle: reportingCandidate.jobTitle,
      reason: reportReason,
      description: reportDescription,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      targetOwnerId: 'admin' 
    };

    setDoc(reportRef, reportData)
      .then(() => {
        addDoc(collection(db, "AdminNotifications"), {
          type: "candidate_report",
          title: "New Candidate Misconduct Report",
          message: `${reportData.reportedByName} has reported candidate ${reportData.targetName} for ${reportReason}.`,
          targetId: reportId,
          status: "unread",
          createdAt: serverTimestamp()
        });
        toast({ title: t.reportSuccess, description: "Compliance team will audit this profile within 24 hours." });
        setIsReportDialogOpen(false);
        setReportingCandidate(null);
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: reportRef.path,
          operation: 'create',
          requestResourceData: reportData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsReportingSubmitting(false));
  };

  const handleInitiatePrint = (u: any, a: any) => {
    if (!u) {
      toast({ variant: "destructive", title: "Missing Record", description: "Candidate profile telemetry not yet synchronized." });
      return;
    }
    setPrintBuffer({ user: u, app: a });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadProfile = () => {
    if (fullProfile) {
      handleInitiatePrint(fullProfile, selectedApp);
    } else {
      toast({ variant: "destructive", title: "Dossier Loading", description: "Fetching full candidate history..." });
    }
  };

  const getStatusBadge = (job: any) => {
    if (job.status === 'closed') return <Badge className="bg-red-100 text-red-700 font-bold border-none">{t.expired}</Badge>;
    if (['approved', 'open', 'live', 'live'].includes(job.status)) return <Badge className="bg-green-100 text-green-700 font-bold border-none">Live</Badge>;
    if (job.status === 'pending') return <Badge className="bg-amber-100 text-amber-700 font-bold border-none">{t.pendingApproval}</Badge>;
    return <Badge variant="outline">{job.status}</Badge>;
  };

  const safeFormatDate = (dateVal: any) => {
    if (!dateVal) return "N/A";
    try {
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      return isValid(date) ? format(date, "dd MMM yyyy HH:mm") : "N/A";
    } catch (e) { return "N/A"; }
  };

  // HIGH-FIDELITY LOADING GUARD
  if (userLoading || userProfileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 font-medium uppercase text-[10px] text-muted-foreground tracking-[0.3em] animate-pulse">
          Verifying Industrial Access...
        </p>
      </div>
    );
  }

  // Warning Terminal
  if (userData?.status !== 'approved') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full rounded-[3rem] border-none shadow-2xl overflow-hidden">
            <CardHeader className="bg-amber-500 text-white p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
                <ShieldAlert className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-3xl font-medium uppercase tracking-tight">{t.underReview}</CardTitle>
              <CardDescription className="text-white/80 font-medium text-lg mt-2">
                {t.underReviewDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12 space-y-8 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium">
                  To maintain the trust of Tirupur's labor market, we manually verify every factory's GST, GPS location, and entrance proof.
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-left bg-muted/30 p-4 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span>Profile Submission: {userData?.photo ? 'Complete' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-left bg-muted/30 p-4 rounded-2xl">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Verification Status: {userData?.status || 'Pending'}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                 <Button onClick={() => router.push('/employer/profile')} className="w-full h-14 rounded-2xl bg-primary text-white font-medium text-lg shadow-xl active:scale-95 transition-all">
                    {userData?.photo ? t.viewProfile : "Complete Company Profile Now"}
                 </Button>
                 <Button variant="ghost" onClick={() => auth.signOut().then(() => router.push('/'))} className="text-muted-foreground font-bold hover:text-primary">
                    {t.logout} & Check Later
                 </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-6 border-t text-center">
              <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest mx-auto">
                Typical verification time: 12-24 Industrial Hours
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium font-headline text-primary tracking-tight">{t.manageOps}</h1>
            <p className="text-muted-foreground text-sm font-medium">{t.reviewCandidates}</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={`${t.designationLabel} / ${t.candidate}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 rounded-xl bg-muted/30 border-none" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="w-full overflow-x-auto border-b scrollbar-hide">
            <TabsList className="bg-transparent p-0 h-14 space-x-8 w-max min-w-full justify-start">
              <TabsTrigger value="applicants" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 font-medium text-lg h-14 whitespace-nowrap">{t.candidate}</TabsTrigger>
              <TabsTrigger value="my-jobs" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 font-medium text-lg h-14 whitespace-nowrap">{t.myJobs}</TabsTrigger>
              <TabsTrigger value="drafts" className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 font-medium text-lg h-14 whitespace-nowrap">{t.drafts} ({counts.drafts})</TabsTrigger>
              <TabsTrigger value="plan" className="rounded-none border-b-4 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-2 font-medium text-lg h-14 text-accent whitespace-nowrap">{t.planStatus}</TabsTrigger>
              <TabsTrigger value="incidents" className="rounded-none border-b-4 border-transparent data-[state=active]:border-destructive data-[state=active]:bg-transparent px-2 font-medium text-lg h-14 text-destructive whitespace-nowrap">{t.reportAlert} ({counts.reports})</TabsTrigger>
              <TabsTrigger value="candidate-reports" className="rounded-none border-b-4 border-transparent data-[state=active]:border-amber-600 data-[state=active]:bg-transparent px-2 font-medium text-lg h-14 text-amber-600 whitespace-nowrap">{t.candidateReportsManagement} ({counts.candidateReports})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="applicants" className="m-0 space-y-6">
            <div className="flex bg-muted/40 p-1 rounded-2xl w-fit">
              <button onClick={() => setSubTab("pending")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", (subTab === 'pending' || subTab === 'applied') ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>{t.pending} ({counts.pending})</button>
              <button onClick={() => setSubTab("shortlisted")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", subTab === 'shortlisted' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>{t.shortlisted} ({counts.shortlisted})</button>
              <button onClick={() => setSubTab("rejected")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", subTab === 'rejected' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>{t.rejected} ({counts.rejected})</button>
            </div>

            <Card className="rounded-[1.5rem] border-none shadow-xl overflow-x-auto bg-white">
              <Table className="min-w-[1300px] border-collapse">
                <TableHeader className="bg-muted/30 border-b-2">
                  <TableRow>
                    <TableHead className="pl-10 font-bold border-r border-muted/50">{t.candidate}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50"><button onClick={() => handleSort('gender')} className="flex items-center gap-1 uppercase text-[10px] tracking-widest">{t.genderLabel} <ArrowUpDown className="w-3 h-3" /></button></TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">{t.location}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50"><button onClick={() => handleSort('experience')} className="flex items-center gap-1 uppercase text-[10px] tracking-widest">{t.totalExpLabel} <ArrowUpDown className="w-3 h-3" /></button></TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">{t.appliedFor}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50"><button onClick={() => handleSort('expectedSalary')} className="flex items-center gap-1 uppercase text-[10px] tracking-widest">{t.salaryExpectedLabel} <ArrowUpDown className="w-3 h-3" /></button></TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">{t.status}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50 w-[100px]">{t.applied}</TableHead>
                    <TableHead className="pr-10 text-right font-bold">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProcessing || appsLoading ? (
                    <TableRow><TableCell colSpan={9} className="h-60 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredApps.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="h-60 text-center font-bold text-muted-foreground italic">{t.noResults}</TableCell></TableRow>
                  ) : (
                    filteredApps.map(app => {
                    const liveGender = liveGenderMap[app.jobSeekerId] || app.gender;
                    
                    return (
                    <TableRow key={app.id} className="hover:bg-primary/5 border-b border-muted/30">
                      <TableCell className="pl-10 py-6 border-r border-muted/30">
                        <div className="space-y-1">
                          <p className="font-medium text-lg whitespace-nowrap">{app.seekerName || "Industrial Candidate"}</p>
                          <p className="text-[11px] font-medium text-primary whitespace-nowrap">{app.phone ? `+91 ${app.phone}` : "Contact Private"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-6 font-bold text-sm capitalize border-r border-muted/30">
                        {liveGender || "Not Specified"}
                      </TableCell>
                      <TableCell className="px-4 py-6 font-bold text-sm border-r border-muted/30">{translateLocation(app.location, t)}</TableCell>
                      <TableCell className="px-4 py-6 border-r border-muted/30"><Badge variant="outline" className="font-medium border-primary/10 text-primary">{app.experience || '0'} YRS</Badge></TableCell>
                      <TableCell className="px-4 py-6 font-medium text-primary truncate max-w-[200px] border-r border-muted/30">{app.jobTitle}</TableCell>
                      <TableCell className="px-4 py-6 border-r border-muted/30">
                        {app.expectedSalary ? (
                          <p className="font-medium text-accent text-sm">₹{parseInt(app.expectedSalary).toLocaleString()}</p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">
                            {(app.jobCategory === 'Staff' || (!app.jobCategory && (rawJobs || []).find((j: any) => j.id === app.jobId)?.category === 'Staff')) 
                              ? "Not Entered" 
                              : "N/A (Worker)"}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-6 border-r border-muted/30"><Badge className={cn("capitalize font-medium text-[10px]", (app.status === 'applied' || app.status === 'pending') ? "bg-blue-100 text-blue-700" : app.status === 'shortlisted' ? "bg-green-100 text-green-700" : app.status === 'hired' ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700")}>{app.status || 'pending'}</Badge></TableCell>
                      <TableCell className="px-4 py-6 text-muted-foreground font-bold text-sm border-r border-muted/30 w-[100px] max-w-[100px] whitespace-normal break-words leading-tight">{formatDistanceToNow(app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt), { addSuffix: true })}</TableCell>
                      <TableCell className="pr-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-100 text-blue-600 hover:bg-blue-50" onClick={() => setSelectedApp(app)} title={t.viewProfile}><Eye className="w-4 h-4" /></Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 rounded-full border-blue-100 text-blue-600 hover:bg-blue-50" 
                            onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                            title={t.downloadReport}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {(app.status === 'applied' || app.status === 'pending' || app.status === 'rejected') && <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-green-100 text-green-600 hover:bg-green-100" onClick={() => handleUpdateStatus(app, 'shortlisted')} title={t.shortlisted}><CheckCircle2 className="w-4 h-4" /></Button>}
                          {(app.status === 'applied' || app.status === 'pending' || app.status === 'shortlisted' || app.status === 'hired') && <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-red-100 text-red-600 hover:bg-red-100" onClick={() => handleUpdateStatus(app, 'rejected')} title={t.reject}><XCircle className="w-4 h-4" /></Button>}
                          {(app.status === 'rejected' || app.status === 'shortlisted' || app.status === 'hired') && <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-amber-100 text-amber-600 hover:bg-amber-100" onClick={() => handleUpdateStatus(app, 'pending')} title="Move to Pending"><RefreshCcw className="w-4 h-4" /></Button>}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl font-bold bg-green-50 text-green-600 gap-2" 
                            onClick={() => {
                              if (app.phone) {
                                window.open(`https://wa.me/91${app.phone.replace(/\D/g, "")}?text=${encodeURIComponent(generateCandidateShortlistMessage(app))}`, '_blank');
                              } else {
                                toast({ 
                                  variant: "destructive", 
                                  title: "Phone Missing", 
                                  description: "This candidate's contact details are private. Information cannot be shared via WhatsApp." 
                                });
                              }
                            }}
                          >
                            <MessageCircle className="w-4 h-4" /> {t.shareMessage}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-600 hover:bg-amber-50" onClick={() => handleReportCandidate(app)} title={t.reportCandidate}>
                            <ShieldAlert className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  }))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="candidate-reports" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h2 className="text-xl font-medium text-primary uppercase tracking-tight">{t.candidateReportsManagement}</h2>
                  <p className="text-sm font-medium text-muted-foreground">{t.trackCandidateReports}</p>
               </div>
               <div className="flex gap-2">
                  <Badge variant="outline" className="px-4 py-2 border-primary/20 text-primary font-medium uppercase text-[10px]">
                     {counts.candidateReports} Total Logged
                  </Badge>
               </div>
            </div>

            <Card className="rounded-[1.5rem] border-none shadow-xl overflow-hidden bg-white">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/30 border-b-2">
                  <TableRow>
                    <TableHead className="pl-10 font-bold border-r border-muted/50">{t.candidate}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">{t.reasonForReport}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">Incident Date</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">Governance Status</TableHead>
                    <TableHead className="pr-10 text-right font-bold">Audit History</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myReportsLoading ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : (myCandidateReports || []).length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground italic">No candidate reports found.</TableCell></TableRow>
                  ) : (
                    (myCandidateReports || []).map((report: any) => (
                    <TableRow key={report.id} className="hover:bg-amber-50/30 border-b border-muted/30">
                      <TableCell className="pl-10 py-6 border-r border-muted/30">
                         <div className="space-y-1">
                            <p className="font-medium text-lg text-foreground">{report.targetName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: {report.targetId?.slice(0, 8)}</p>
                         </div>
                      </TableCell>
                      <TableCell className="px-4 py-6 border-r border-muted/30">
                         <Badge className="bg-red-50 text-red-700 border-none font-medium uppercase text-[9px] px-3 py-1">
                            {report.reason}
                         </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-6 text-muted-foreground font-bold text-sm border-r border-muted/30">
                         {safeFormatDate(report.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-6 border-r border-muted/30">
                         <Badge className={cn(
                           "capitalize font-medium text-[10px] border-none px-3 py-1",
                           report.status === 'pending' ? "bg-amber-100 text-amber-700" :
                           report.status === 'under_review' ? "bg-blue-100 text-blue-700" :
                           report.status === 'resolved' ? "bg-green-100 text-green-700" :
                           "bg-muted text-muted-foreground"
                         )}>
                            {report.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="pr-10 py-6 text-right">
                         <Button variant="ghost" size="sm" className="font-bold text-primary gap-2" onClick={() => toast({ title: "Incident Snapshot", description: report.description || "No description provided." })}>
                            <FileText className="w-4 h-4" /> {t.details}
                         </Button>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="my-jobs" className="m-0 space-y-6">
             <div className="flex bg-muted/40 p-1 rounded-2xl w-fit">
              <button onClick={() => setJobLifecycleTab("active")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", jobLifecycleTab === 'active' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>{t.activeJobs} ({counts.active})</button>
              <button onClick={() => setJobLifecycleTab("closed")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", jobLifecycleTab === 'closed' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>{t.expired} ({counts.closed})</button>
              <button onClick={() => setJobLifecycleTab("archived")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", jobLifecycleTab === 'archived' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>{(t as any).archive || "Archived"} ({counts.archived})</button>
            </div>
            <Card className="rounded-[1.5rem] border-none shadow-xl overflow-hidden bg-white">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/30 border-b-2">
                  <TableRow>
                    <TableHead className="pl-10 font-bold border-r border-muted/50">{t.jobDetails}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">{t.status}</TableHead>
                    <TableHead className="px-4 font-bold text-center border-r border-muted/50">{t.candidate}</TableHead>
                    {jobLifecycleTab === 'closed' ? (
                      <>
                        <TableHead className="px-4 font-bold border-r border-muted/50">Closed By / Reason</TableHead>
                        <TableHead className="px-4 font-bold border-r border-muted/50">Closure Details</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="px-4 font-bold border-r border-muted/50">Posted</TableHead>
                      </>
                    )}
                    <TableHead className="pr-10 text-right font-bold">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categorizedJobs as any)[jobLifecycleTab].length === 0 ? (
                    <TableRow><TableCell colSpan={jobLifecycleTab === 'closed' ? 6 : 4} className="h-40 text-center font-bold text-muted-foreground italic">{t.noResults}</TableCell></TableRow>
                  ) : (
                    (categorizedJobs as any)[jobLifecycleTab].map((job: any) => (
                    <TableRow key={job.id} className="hover:bg-primary/5 border-b border-muted/30">
                      <TableCell className="pl-10 py-6 font-medium text-lg border-r border-muted/30"><button onClick={() => router.push(`/jobs/${job.id}`)} className="hover:text-primary">{job.jobTitle}</button></TableCell>
                      <TableCell className="px-4 py-6 border-r border-muted/30">
                        {jobLifecycleTab === 'closed' ? (
                          <Badge className="bg-red-100 text-red-700 font-medium border-none uppercase text-[10px]">{t.expired}</Badge>
                        ) : getStatusBadge(job)}
                      </TableCell>
                      <TableCell className="px-4 py-6 text-center border-r border-muted/30">
                        <div className="flex flex-col items-center">
                           <span className="font-medium text-lg">{(rawApps || []).filter((a:any) => a.jobId === job.id).length}</span>
                           <span className="text-[8px] font-bold text-muted-foreground uppercase">Total</span>
                        </div>
                      </TableCell>
                      {jobLifecycleTab === 'closed' ? (
                        <>
                          <TableCell className="px-4 py-6 border-r border-muted/30">
                            <div className="space-y-1">
                              <p className="font-bold text-sm leading-tight text-foreground">{job.closureAudit?.reason}</p>
                              <div className="flex items-center gap-1.5">
                                 <Badge variant="outline" className="text-[8px] font-medium uppercase tracking-tighter border-muted-foreground/20 text-muted-foreground">Source: {job.closureAudit?.source}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-6 border-r border-muted/30">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                 <Calendar className="w-3 h-3" />
                                 <span>{safeFormatDate(job.closureAudit?.closedAt)}</span>
                              </div>
                              {job.closureAudit?.closedByName && (
                                <div className="flex items-center gap-1.5 text-primary/70 font-medium uppercase text-[9px]">
                                   <UserIcon className="w-3 h-3" />
                                   <span>{job.closureAudit.closedByName}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="px-4 py-6 font-bold text-sm text-muted-foreground border-r border-muted/30">{safeFormatDate(job.createdAt)}</TableCell>
                        </>
                      )}
                      <TableCell className="pr-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="font-bold text-primary gap-2" onClick={() => router.push(`/jobs/${job.id}`)}><Eye className="w-4 h-4" /> {t.viewProfile}</Button>
                          <Button variant="ghost" size="sm" className="font-bold text-primary gap-2" onClick={() => setViewingJobStats(job)}><BarChart3 className="w-4 h-4" /> {t.jobPerformance}</Button>
                          {jobLifecycleTab === 'active' && job.status !== 'closed' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-amber-600" onClick={() => setConfirmAction({ type: 'close', id: job.id })}>
                                    <Power className="w-5 h-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl font-bold bg-amber-600 text-white border-none">
                                  <p>Close the Job</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setConfirmAction({ type: 'delete', coll: 'Jobs', id: job.id })}><Trash2 className="w-5 h-5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="drafts" className="m-0 space-y-6">
            <Card className="rounded-[1.5rem] border-none shadow-xl overflow-hidden bg-white">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/30 border-b-2">
                  <TableRow>
                    <TableHead className="pl-10 font-bold border-r border-muted/50">{t.jobDetails}</TableHead>
                    <TableHead className="px-4 font-bold border-r border-muted/50">Last Updated</TableHead>
                    <TableHead className="pr-10 text-right font-bold">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorizedJobs.drafts.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="h-40 text-center font-bold text-muted-foreground italic">{t.noResults}</TableCell></TableRow>
                  ) : (
                    categorizedJobs.drafts.map((job: any) => (
                    <TableRow key={job.id} className="hover:bg-primary/5 border-b border-muted/30">
                      <TableCell className="pl-10 py-6 font-medium text-lg border-r border-muted/30">{job.jobTitle}</TableCell>
                      <TableCell className="px-4 py-6 text-muted-foreground font-bold border-r border-muted/50">{safeFormatDate(job.updatedAt || job.createdAt)}</TableCell>
                      <TableCell className="pr-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="font-bold text-primary" onClick={() => router.push(`/employer/post-job?draftId=${job.id}`)}>Resume Draft</Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setConfirmAction({ type: 'delete', coll: 'Jobs', id: job.id })}><Trash2 className="w-5 h-5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="plan" className="m-0 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
               <div className="space-y-1">
                  <h2 className="text-xs font-medium uppercase text-muted-foreground tracking-[0.3em] leading-none">{t.availableCredits}</h2>
                  <div className="h-0.5 w-12 bg-primary/20 mx-auto mt-2" />
               </div>
               <p className="text-sm font-bold text-muted-foreground">Total available posts across all offers: <span className="text-primary font-medium">{offerStats?.totalAvailable}</span></p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "WELCOME REMAINING", val: offerStats?.welcome.remaining, sub: `ENDS IN ${offerStats?.welcome.daysLeft}D`, color: "border-blue-500", icon: Gift },
                { label: "WELFARE REMAINING", val: offerStats?.welfare.remaining, sub: `RESETS IN ${offerStats?.welfare.daysToReset}D`, color: "border-green-500", icon: RefreshCw },
                { label: "PLAN BALANCE", val: offerStats?.purchased.remaining, sub: "LIFETIME VALIDITY", color: "border-primary", icon: ShieldCheck },
                { label: "TOTAL AVAILABLE", val: offerStats?.totalAvailable, sub: "SHARED BALANCE", color: "border-primary", icon: Zap, bg: "bg-primary/5" }
              ].map((s, i) => (
                <Card key={i} className={cn("border-l-4 shadow-md rounded-xl p-4 flex flex-col justify-between h-32 bg-white relative overflow-hidden group", s.color)}>
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">{s.label}</p>
                    <s.icon className="w-4 h-4 text-primary/20 absolute top-4 right-4 group-hover:text-primary/40 transition-colors" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-3xl font-medium">{s.val}</p>
                    <p className="text-[9px] font-medium text-muted-foreground tracking-tighter">{s.sub}</p>
                  </div>
                </Card>
              ))}
            </div>

            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                 <BadgeInfo className="w-6 h-6 text-primary" />
                 <h3 className="text-xl font-medium text-primary uppercase tracking-tight">Post Balance Breakdown</h3>
              </div>
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                   <div className="lg:col-span-8 p-8 md:p-12 space-y-8 border-r">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-3">
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-widest border-b pb-2">Welcome Offer</p>
                            <div className="space-y-1">
                               <div className="flex justify-between"><span className="text-xs font-medium text-muted-foreground">Allocated:</span> <span className="text-sm font-medium">3</span></div>
                               <div className="flex justify-between"><span className="text-xs font-medium text-muted-foreground">Used:</span> <span className="text-sm font-medium">{offerStats?.welcome.used}</span></div>
                               <div className="flex justify-between border-t pt-1"><span className="text-xs font-medium text-blue-600">Remaining:</span> <span className="text-sm font-medium text-blue-600">{offerStats?.welcome.remaining}</span></div>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <p className="text-xs font-medium text-green-600 uppercase tracking-widest border-b pb-2">Welfare Offer</p>
                            <div className="space-y-1">
                               <div className="flex justify-between"><span className="text-xs font-medium text-muted-foreground">Allocated:</span> <span className="text-sm font-medium">3</span></div>
                               <div className="flex justify-between"><span className="text-xs font-medium text-muted-foreground">Used:</span> <span className="text-sm font-medium">{offerStats?.welfare.used}</span></div>
                               <div className="flex justify-between border-t pt-1"><span className="text-xs font-medium text-green-600">Remaining:</span> <span className="text-sm font-medium text-green-600">{offerStats?.welfare.remaining}</span></div>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <p className="text-xs font-medium text-primary uppercase tracking-widest border-b pb-2">Purchased Plans</p>
                            <div className="space-y-1">
                               <div className="flex justify-between"><span className="text-xs font-medium text-muted-foreground">Allocated:</span> <span className="text-sm font-medium">{offerStats?.purchased.total}</span></div>
                               <div className="flex justify-between"><span className="text-xs font-medium text-muted-foreground">Used:</span> <span className="text-sm font-medium">{offerStats?.purchased.used}</span></div>
                               <div className="flex justify-between border-t pt-1"><span className="text-xs font-medium text-primary">Remaining:</span> <span className="text-sm font-medium text-primary">{offerStats?.purchased.remaining}</span></div>
                            </div>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-dashed">
                        <div className="flex items-center gap-2 mb-4">
                           <Layers className="w-4 h-4 text-muted-foreground" />
                           <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Worker & Staff Utilization</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-muted/20 p-4 rounded-2xl flex justify-between items-center">
                              <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Worker Posts Remaining</p><p className="text-lg font-medium text-foreground">{offerStats?.worker.remaining}</p></div>
                              <Users className="w-6 h-6 text-primary/20" />
                           </div>
                           <div className="bg-muted/20 p-4 rounded-2xl flex justify-between items-center">
                              <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Staff Posts Remaining</p><p className="text-lg font-medium text-foreground">{offerStats?.staff.remaining}</p></div>
                              <Briefcase className="w-6 h-6 text-primary/20" />
                           </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic mt-4">* Purchased plans support both Worker and Staff roles. The balance is consumed based on your current recruitment priority.</p>
                      </div>
                   </div>

                   <div className="lg:col-span-4 p-8 md:p-12 bg-muted/5 space-y-8">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-primary uppercase tracking-tight flex items-center gap-2">
                           <Info className="w-4 h-4" /> How Posting Balance Works
                        </h4>
                        <div className="h-0.5 w-8 bg-primary/20" />
                      </div>
                      <ul className="space-y-4">
                         {[
                           { text: "Welcome Offer provides 3 one-time job posts valid for 7 days from registration.", icon: Gift, color: "text-blue-600" },
                           { text: "Welfare Offer provides 3 Worker job posts every month and resets monthly. Unused posts do not carry forward.", icon: RefreshCw, color: "text-green-600" },
                           { text: "Purchased Plans provide credits based on the selected plan with lifetime validity.", icon: ShieldCheck, color: "text-primary" },
                           { text: "Staff and Worker balances are tracked separately for free offers but shared for purchased plans.", icon: Layers, color: "text-muted-foreground" },
                           { text: "Shared Balance represents the currently usable posting credits for your factory.", icon: Zap, color: "text-amber-50" }
                         ].map((rule, idx) => (
                           <li key={idx} className="flex gap-3 text-[11px] font-medium text-muted-foreground leading-relaxed">
                              <rule.icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", rule.color)} />
                              <span>{rule.text}</span>
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                 <TrendingUp className="w-6 h-6 text-primary" />
                 <h3 className="text-xl font-medium text-primary uppercase tracking-tight">Posting Intelligence</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="rounded-[2.5rem] border border-muted shadow-xl bg-white p-8">
                    <CardHeader className="p-0 mb-6">
                       <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Overall Capacity Utilization</CardTitle>
                    </CardHeader>
                    <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <RePieChart margin={{ bottom: 20 }}>
                             <Pie 
                                data={visualizationData.pie} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={8} 
                                dataKey="value"
                             >
                                {visualizationData.pie.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                          </Pie>
                          <ReTooltip 
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', paddingTop: '20px' }} />
                       </RePieChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <Card className="rounded-[2.5rem] border border-muted shadow-xl bg-white p-8">
                 <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Entitlement Breakdown</CardTitle>
                 </CardHeader>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ReBarChart data={visualizationData.bar} layout="vertical" margin={{ left: 20, right: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis 
                             dataKey="name" 
                             type="category" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fontSize: 10, fontWeight: 600, fill: '#666' }} 
                          />
                          <ReTooltip 
                             cursor={{ fill: 'transparent' }}
                             contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="used" name="Spent" fill="#0F52BA" radius={[0, 4, 4, 0]} barSize={20} />
                          <Bar dataKey="remaining" name="Available" fill="#0EA5E9" radius={[0, 4, 4, 0]} barSize={20} />
                       </ReBarChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <Card className="rounded-[2.5rem] border border-muted shadow-xl bg-white p-8">
                 <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Industrial Posting Pulse</CardTitle>
                 </CardHeader>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={visualizationData.trend} margin={{ bottom: 20, left: 0, right: 10, top: 10 }}>
                          <defs>
                             <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }} tick={{ fontSize: 10, fontWeight: 800, fill: '#666' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#666' }} />
                          <ReTooltip 
                             contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="posts" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorPosts)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </Card>
           </div>
         </section>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="rounded-[2.5rem] border border-muted shadow-xl bg-white overflow-hidden flex flex-col border-t-4 border-t-blue-500 hover:shadow-2xl transition-all duration-300">
             <CardHeader className="p-8 pb-4 relative">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                   <Gift className="w-6 h-6" />
                 </div>
                 {offerStats?.welcome.isExpired ? (
                   <Badge className="bg-red-500 text-white font-medium uppercase text-[8px] px-3 py-1 rounded-full shadow-md">Offer Expired</Badge>
                 ) : (
                   <Badge className="bg-blue-600 text-white font-medium uppercase text-[8px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                     <Timer className="w-3 h-3" /> Expires in {offerStats?.welcome.daysLeft} days
                   </Badge>
                 )}
               </div>
               <CardTitle className="text-2xl font-medium tracking-tight">WELCOME OFFER</CardTitle>
               <CardDescription className="text-xs font-bold text-muted-foreground uppercase pt-1 tracking-tight">One-time · Worker or Staff · 7 days from registration</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-8 flex-grow">
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Progress Indicators</Label>
                      <ProgressDots total={3} used={offerStats?.welcome.used || 0} color="bg-blue-500" />
                   </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Details</p>
                  <div className="flex flex-col gap-0.5">
                     <p className="text-sm font-bold">Posts used: <span className="text-blue-600 font-medium">{offerStats?.welcome.used} of 3</span></p>
                     <p className="text-xs font-medium text-muted-foreground">Expires: {safeFormatDateOnly(offerStats?.welcome.expiry)}</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-dashed">
                   <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Rules</p>
                   <ul className="space-y-3">
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       3 Free Job Posts
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       Worker or Staff Jobs
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       One-Time Offer
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                       <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0"><Clock className="w-3 h-3" /></div>
                       Job Post Validity: 15 Days
                     </li>
                   </ul>
                </div>
             </CardContent>
             <CardFooter className="p-8 pt-0">
                <Button 
                 className="w-full h-14 rounded-2xl bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-sm transition-all shadow-sm active:scale-95"
                 disabled={offerStats?.welcome.remaining === 0 || offerStats?.welcome.isExpired}
                 onClick={() => router.push('/employer/post-job')}
                >
                  {offerStats?.welcome.remaining === 0 ? "[ Offer Exhausted ]" : `[ Post Job Now — ${offerStats?.welcome.remaining} Post Remaining ]`}
                </Button>
             </CardFooter>
           </Card>

           <Card className="rounded-[2.5rem] border border-muted shadow-xl bg-white overflow-hidden flex flex-col border-t-4 border-t-green-500 hover:shadow-2xl transition-all duration-300">
             <CardHeader className="p-8 pb-4 relative">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-inner">
                   <RefreshCw className="w-6 h-6" />
                 </div>
                 <Badge className="bg-green-600 text-white font-medium uppercase text-[8px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                   <RefreshCcw className="w-3 h-3" /> Resets in {offerStats?.welfare.daysToReset} days
                 </Badge>
               </div>
               <CardTitle className="text-2xl font-medium tracking-tight">MONTHLY WELFARE OFFER</CardTitle>
               <CardDescription className="text-xs font-bold text-muted-foreground uppercase pt-1 tracking-tight">Monthly · Worker roles only · No carry forward</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-8 flex-grow">
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Progress Indicators</Label>
                      <ProgressDots total={3} used={offerStats?.welfare.used || 0} color="bg-green-600" />
                   </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Details</p>
                  <div className="flex flex-col gap-0.5">
                     <p className="text-sm font-bold">Posts used: <span className="text-green-600 font-medium">{offerStats?.welfare.used} of 3</span></p>
                     <p className="text-xs font-medium text-muted-foreground">Resets on: {safeFormatDateOnly(offerStats?.welfare.reset)}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-dashed">
                   <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Rules</p>
                   <ul className="space-y-3">
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       3 Free Job Posts Every Month
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       Worker Jobs Only
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       Lifetime Validity
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       Monthly Reset
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       No Carry Forward
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                       <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0"><Clock className="w-3 h-3" /></div>
                       Job Post Validity: 15 Days
                     </li>
                   </ul>
                </div>
             </CardContent>
             <CardFooter className="p-8 pt-0">
                <Button 
                 className="w-full h-14 rounded-2xl bg-green-100 text-green-700 hover:bg-green-200 font-medium text-sm transition-all shadow-sm active:scale-95"
                 disabled={offerStats?.welfare.remaining === 0}
                 onClick={() => router.push('/employer/post-job')}
                >
                  {offerStats?.welfare.remaining === 0 ? "[ Welfare Posts Exhausted ]" : "[ Post Worker Job Free ]"}
                </Button>
             </CardFooter>
           </Card>

           <Card className="rounded-[2.5rem] border border-muted shadow-xl bg-white overflow-hidden flex flex-col border-t-4 border-t-primary hover:shadow-2xl transition-all duration-300">
             <CardHeader className="p-8 pb-4 relative">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                   <ShieldCheck className="w-6 h-6" />
                 </div>
                 <Badge variant="outline" className="border-primary text-primary font-medium uppercase text-[8px] px-3 py-1 rounded-full flex items-center gap-1">
                   <Lock className="w-3 h-3" /> Validity: Lifetime
                 </Badge>
               </div>
               <CardTitle className="text-2xl font-medium tracking-tight truncate uppercase">{(offerStats?.purchased.planName || "Plan")}</CardTitle>
               <CardDescription className="text-xs font-bold text-muted-foreground uppercase pt-1 tracking-tight">Purchased · Worker or Staff</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-8 flex-grow">
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Progress Indicators</Label>
                      <ProgressDots total={offerStats?.purchased.total || 0} used={offerStats?.purchased.used || 0} />
                   </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Details</p>
                  <p className="text-sm font-bold">Posts used: <span className="text-primary font-medium">{offerStats?.purchased.used} of {offerStats?.purchased.total}</span></p>
                </div>

                <div className="space-y-4 pt-4 border-t border-dashed">
                   <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Plan Information</p>
                   <div className="p-4 bg-muted/20 rounded-2xl border border-muted-foreground/10">
                      <p className="text-xs font-medium text-primary uppercase">Plan: {offerStats?.purchased.planName} ₹{offerStats?.purchased.planPrice}</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-dashed">
                   <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Rules</p>
                   <ul className="space-y-3">
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       Worker or Staff Jobs allowed
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-foreground">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check className="w-3 h-3 stroke-[4]" /></div>
                       Lifetime Validity
                     </li>
                     <li className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                       <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0"><Clock className="w-3 h-3" /></div>
                       Job Post Validity: 15 Days
                     </li>
                   </ul>
                </div>
             </CardContent>
             <CardFooter className="p-8 pt-0 flex gap-4">
                <Button className="flex-[2] h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 font-medium text-sm transition-all shadow-lg active:scale-95" onClick={() => router.push('/employer/post-job')}>
                  [ Post Job Now ]
                </Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary text-primary font-bold text-sm transition-all active:scale-95" onClick={() => router.push('/pricing')}>
                  [ Renew Plan ]
                </Button>
             </CardFooter>
           </Card>
         </div>

         <section className="space-y-8 pt-12 border-t border-dashed">
            <div className="text-center space-y-2">
               <h3 className="text-2xl font-medium text-primary uppercase tracking-tight">Industrial Feature Matrix</h3>
               <p className="text-sm font-medium text-muted-foreground">Premium capabilities active on your industrial terminal.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                  { title: "Privacy Shield", icon: Lock, desc: "Mobile numbers hidden from public. Protected against agents." },
                  { title: "Verified Dossier Downloads", icon: Download, desc: "Export candidate profiles as high-fidelity PDF dossiers for offline review." },
                  { title: "Multi-Channel Broadcast", icon: Globe, desc: "Job listings propagated to WhatsApp, Facebook, and Web." },
                  { title: "GPS Seeker Filtering", icon: Navigation, desc: "Filter workers by exact radial distance from your factory." },
                  { title: "Real-time Auditing", icon: ShieldCheck, desc: "Track listing views and application metrics in live mode." },
                  { title: "Dedicated Support", icon: PhoneCall, desc: "Local Tirupur office support from 9 AM to 9 PM daily." }
               ].map((feat, i) => (
                 <div key={i} className="flex gap-5 p-6 bg-white rounded-[2rem] border-2 border-primary/5 hover:border-primary/20 transition-all group">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-inner">
                       <feat.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-medium text-base leading-tight uppercase tracking-tight">{feat.title}</h4>
                       <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </section>
       </TabsContent>

       <TabsContent value="incidents" className="m-0 space-y-6">
         <Card className="rounded-[1.5rem] border-none shadow-xl overflow-hidden bg-white">
           <Table className="border-collapse">
             <TableHeader className="bg-muted/30 border-b-2">
               <TableRow>
                 <TableHead className="pl-10 font-bold border-r border-muted/50">Issue Reported</TableHead>
                 <TableHead className="px-4 font-bold border-r border-muted/50">Status</TableHead>
                 <TableHead className="px-4 font-bold border-r border-muted/50">Reported Date</TableHead>
                 <TableHead className="pr-10 text-right font-bold">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {reportsLoading ? (
                 <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
               ) : (rawReports || []).length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="h-40 text-center font-bold text-muted-foreground italic">No reports found.</TableCell></TableRow>
               ) : (
                 (rawReports || []).map((report: any) => (
                 <TableRow key={report.id} className="hover:bg-red-50/50 border-b border-muted/30">
                   <TableCell className="pl-10 py-6 border-r border-muted/30">
                     <div className="space-y-1">
                       <p className="font-medium text-lg text-red-700">{report.reason}</p>
                       <p className="text-xs font-medium text-muted-foreground line-clamp-1">{report.description}</p>
                     </div>
                   </TableCell>
                   <TableCell className="px-4 py-6 border-r border-muted/30"><Badge className={cn("capitalize font-medium text-[10px]", report.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>{report.status}</Badge></TableCell>
                   <TableCell className="px-4 py-6 text-muted-foreground font-bold text-sm border-r border-muted/30">{safeFormatDate(report.createdAt)}</TableCell>
                   <TableCell className="pr-10 text-right"><Button variant="outline" size="sm" className="rounded-xl border-primary text-primary font-bold" onClick={() => toast({ title: "Admin Review", description: "This incident is under review by our compliance team." })}>Track Status</Button></TableCell>
                 </TableRow>
               )))}
             </TableBody>
           </Table>
         </Card>
       </TabsContent>
     </Tabs>
   </main>

   <AlertDialog open={!!confirmAction} onOpenChange={o => !o && setConfirmAction(null)}>
     <AlertDialogContent className="rounded-[2rem] p-8 border-none shadow-2xl">
       <AlertDialogHeader>
         <AlertDialogTitle className="text-2xl font-medium">Confirm Execution?</AlertDialogTitle>
         <AlertDialogDescription className="text-lg font-medium text-muted-foreground leading-relaxed">
           This action will modify industrial records and affect platform visibility. Proceed?
         </AlertDialogDescription>
       </AlertDialogHeader>
       <AlertDialogFooter className="mt-6 gap-3">
         <AlertDialogCancel className="h-12 rounded-xl font-bold flex-1">Cancel</AlertDialogCancel>
         <AlertDialogAction className="h-12 rounded-xl bg-primary text-white font-medium flex-1 active:scale-95 transition-all" onClick={executeAction}>Confirm</AlertDialogAction>
       </AlertDialogFooter>
     </AlertDialogContent>
   </AlertDialog>

   <Dialog open={isReportDialogOpen} onOpenChange={o => !o && setIsReportDialogOpen(false)}>
     <DialogContent className="max-w-xl rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden flex flex-col h-fit">
        <DialogHeader className="p-8 bg-amber-600 text-white text-left shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                 <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                 <DialogTitle className="text-2xl font-medium font-headline uppercase tracking-tight">Report Candidate Misconduct</DialogTitle>
                 <DialogDescription className="text-white/80 font-medium">Protect Tirupur's industrial labor market.</DialogDescription>
              </div>
           </div>
        </DialogHeader>
        <ScrollArea className="flex-1 p-8">
           <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50 space-y-1">
                    <Label className="text-[10px] font-medium uppercase opacity-60">Candidate Name</Label>
                    <p className="font-medium text-sm truncate">{reportingCandidate?.seekerName || "Industrial Seeker"}</p>
                 </div>
                 <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50 space-y-1">
                    <Label className="text-[10px] font-medium uppercase opacity-60">Job Applied For</Label>
                    <p className="font-medium text-sm truncate">{reportingCandidate?.jobTitle || "Verified Role"}</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.reasonForReport}</Label>
                 <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger className="h-12 rounded-xl font-bold bg-white border-primary/10 shadow-sm">
                       <SelectValue placeholder="Select specific reason" />
                    </SelectTrigger>
                    <SelectContent className="font-bold rounded-xl max-h-60">
                       <SelectItem value={t.reasonFakeProfile}>{t.reasonFakeProfile}</SelectItem>
                       <SelectItem value={t.reasonNoShow}>{t.reasonNoShow}</SelectItem>
                       <SelectItem value={t.reasonIncorrectInfo}>{t.reasonIncorrectInfo}</SelectItem>
                       <SelectItem value={t.reasonFraud}>{t.reasonFraud}</SelectItem>
                       <SelectItem value={t.reasonMisconduct}>{t.reasonMisconduct}</SelectItem>
                       <SelectItem value={t.reasonInappropriateComm}>{t.reasonInappropriateComm}</SelectItem>
                       <SelectItem value={t.reasonFakeExp}>{t.reasonFakeExp}</SelectItem>
                       <SelectItem value={t.reasonFakeDocs}>{t.reasonFakeDocs}</SelectItem>
                       <SelectItem value={t.reasonDuplicate}>{t.reasonDuplicate}</SelectItem>
                       <SelectItem value="other">Other Violation</SelectItem>
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                 <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.reportDescriptionLabel}</Label>
                 <Textarea 
                    value={reportDescription} 
                    onChange={e => setReportDescription(e.target.value)}
                    placeholder="Describe the incident in detail..."
                    className="min-h-[120px] rounded-2xl font-medium bg-muted/5 focus-visible:ring-primary/20"
                 />
              </div>

              <div className="p-5 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex items-start gap-4">
                 <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-900 uppercase">Strict Governance Note</p>
                    <p className="text-[10px] font-medium text-amber-800/80 leading-relaxed italic">
                      Your report will be reviewed by the Super Admin compliance team. Misuse of the reporting tool or false reports may lead to employer account suspension.
                    </p>
                 </div>
              </div>
           </div>
        </ScrollArea>
        <DialogFooter className="p-8 bg-muted/10 border-t flex wrap gap-4 shrink-0">
           <Button variant="ghost" onClick={() => setIsReportDialogOpen(false)} className="flex-1 font-bold h-14 rounded-2xl active:scale-95 transition-all">{t.cancelDelete}</Button>
           <Button 
             disabled={isReportingSubmitting || !reportReason} 
             onClick={submitCandidateReport} 
             className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white font-medium h-14 rounded-2xl shadow-xl active:scale-95 transition-all gap-2"
           >
              {isReportingSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />} {t.submitReport}
           </Button>
        </DialogFooter>
     </DialogContent>
   </Dialog>

   <Dialog open={!!selectedApp} onOpenChange={o => !o && setSelectedApp(null)}>
     <DialogContent className="max-w-5xl h-[90vh] p-0 border-none rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl print:hidden">
       <DialogHeader className="p-8 bg-primary text-white shrink-0">
          <div className="flex justify-between items-start gap-4">
             <div className="space-y-2">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 overflow-hidden shadow-xl shrink-0">
                      {fullProfile?.photo ? (
                        <img src={fullProfile.photo} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-8 h-8 text-white/40" />
                      )}
                   </div>
                   <div>
                     <DialogTitle className="text-3xl font-medium font-headline tracking-tight">{fullProfile?.name || selectedApp?.seekerName}</DialogTitle>
                     <DialogDescription className="text-primary-foreground/80 font-bold uppercase text-xs tracking-widest flex items-center gap-2 mt-1">
                       <ShieldCheck className="w-4 h-4" /> Verified Industrial Profile • {fullProfile?.category || "Industrial Candidate"}
                     </DialogDescription>
                   </div>
                </div>
             </div>
             <div className="flex flex-col items-end gap-2">
               <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-medium px-4 py-2 rounded-xl h-fit">
                 {selectedApp?.status?.toUpperCase()}
               </Badge>
               <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest">Applied: {safeFormatDate(selectedApp?.appliedAt)}</p>
             </div>
          </div>
       </DialogHeader>
       
       <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {candidateLoading ? (
            <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
          ) : (
          <div className="resume-document-frame">
           <div className="space-y-12">
             <section className="space-y-6">
                <h4 className="text-xs font-medium uppercase text-accent border-b-2 border-accent/10 pb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Application Specifics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-5 bg-accent/5 rounded-2xl border border-dashed border-accent/20 space-y-2">
                     <Label className="text-[10px] font-medium uppercase text-accent/60">{t.salaryExpectedLabel}</Label>
                     <div className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-accent" />
                        <p className="font-medium text-2xl text-accent">₹{selectedApp?.expectedSalary ? parseInt(selectedApp.expectedSalary).toLocaleString() : "Not Specified"}</p>
                     </div>
                   </div>
                   <div className="p-5 bg-amber-50 rounded-2xl border border-dashed border-amber-200 space-y-2">
                     <Label className="text-[10px] font-medium uppercase text-amber-600/60">Preferred Interview Date</Label>
                     <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <p className="font-medium text-lg text-amber-900">{selectedApp?.preferredInterviewDate && isValid(new Date(selectedApp.preferredInterviewDate)) ? format(new Date(selectedApp.preferredInterviewDate), "eeee, dd MMM yyyy") : "Any/Immediate Walk-in"}</p>
                     </div>
                   </div>
                </div>
             </section>

             <section className="space-y-6">
                <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><UserIcon className="w-4 h-4" /> {t.personalInfo}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-medium uppercase text-muted-foreground opacity-60">{t.fullNameLabel}</Label>
                     <p className="font-medium text-lg">{fullProfile?.name || selectedApp?.seekerName}</p>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-medium uppercase text-muted-foreground opacity-60">{t.mobileLabel}</Label>
                     <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-dashed border-primary/10">
                        <p className="font-medium text-xl text-primary">+91 {fullProfile?.phone || selectedApp?.phone}</p>
                        <div className="flex gap-2">
                           <Button size="icon" variant="ghost" className="h-9 w-9 text-green-600 bg-green-50 rounded-lg" onClick={() => window.open(`tel:${fullProfile?.phone || selectedApp?.phone}`)}><PhoneCall className="w-4 h-4" /></Button>
                        </div>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><Label className="text-[9px] font-medium uppercase opacity-60">{t.ageLabel} / {t.genderLabel}</Label><p className="font-bold text-sm capitalize">{fullProfile?.age || "?"} Yrs • {fullProfile?.gender || selectedApp?.gender}</p></div>
                     <div className="space-y-2"><Label className="text-[9px] font-medium uppercase opacity-60">{t.languagesKnown}</Label><p className="font-bold text-sm">{(fullProfile?.languages || fullProfile?.digitalResume?.personal?.languages || []).join(', ') || "N/A"}</p></div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-medium uppercase text-muted-foreground opacity-60">{t.residingArea}</Label>
                     <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {translateLocation(fullProfile?.location || selectedApp?.location, t)}
                     </div>
                   </div>
                </div>
             </section>

             <section className="space-y-6">
                <h4 className="text-xs font-medium uppercase text-primary border-b pb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Industrial Classification</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="p-5 bg-primary/5 rounded-2xl border border-dashed border-primary/20 text-center space-y-1">
                      <Label className="text-[9px] font-medium uppercase opacity-60">{t.categoryLabel}</Label>
                      <p className="font-medium text-sm">{fullProfile?.category || "N/A"}</p>
                   </div>
                   <div className="p-5 bg-primary/5 rounded-2xl border border-dashed border-primary/20 text-center space-y-1">
                      <Label className="text-[9px] font-medium uppercase opacity-60">{t.departmentLabel}</Label>
                      <p className="font-medium text-sm text-primary">{fullProfile?.department || "N/A"}</p>
                   </div>
                   <div className="p-5 bg-primary/5 rounded-2xl border border-dashed border-primary/20 text-center space-y-1 md:col-span-2">
                      <Label className="text-[9px] font-medium uppercase opacity-60">{t.designationLabel}</Label>
                      <p className="font-medium text-sm">{fullProfile?.designation || selectedApp?.jobTitle}</p>
                   </div>
                </div>
             </section>

             <section className="space-y-6">
                <h4 className="text-xs font-medium uppercase text-accent border-b pb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> {t.skillsCompliance}</h4>
                <div className="grid grid-cols-1 gap-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-muted/20 rounded-2xl border border-dashed space-y-1">
                         <Label className="text-[9px] font-medium uppercase opacity-60">{t.buyersHandledLabel}</Label>
                         <p className="text-sm font-bold">{fullProfile?.digitalResume?.professional?.buyersHandled || fullProfile?.buyersHandled || "Not Provided"}</p>
                      </div>
                      <div className="p-5 bg-muted/20 rounded-2xl border border-dashed space-y-1">
                         <Label className="text-[9px] font-medium uppercase opacity-60">{t.auditExperienceLabel}</Label>
                         <p className="text-sm font-bold">{fullProfile?.digitalResume?.professional?.auditExperience || fullProfile?.auditExperience || "Not Provided"}</p>
                      </div>
                   </div>
                   <div className="p-5 bg-blue-50 rounded-2xl border border-dashed border-blue-200 space-y-1">
                      <Label className="text-[9px] font-medium uppercase text-blue-700 opacity-60">{t.certificationsLabel}</Label>
                      <p className="text-sm font-bold text-blue-900">{fullProfile?.digitalResume?.professional?.certifications || fullProfile?.certifications || "Not Provided"}</p>
                   </div>
                   <div className="p-5 bg-accent/5 rounded-2xl border border-dashed border-accent/20 space-y-3">
                      <Label className="text-[9px] font-medium uppercase opacity-60">{t.skillsLabel}</Label>
                      <div className="flex wrap gap-2">
                         {(fullProfile?.digitalResume?.professional?.coreSkills || fullProfile?.coreSkills || []).length > 0 ? (
                            (fullProfile?.digitalResume?.professional?.coreSkills || fullProfile?.coreSkills || []).map((s: string) => <Badge key={s} className="bg-accent text-white border-none font-bold">{s}</Badge>)
                         ) : (
                            <p className="text-xs italic text-muted-foreground">No specific skills listed.</p>
                         )}
                      </div>
                   </div>
                </div>
             </section>

             {fullProfile?.digitalResume?.academic?.length > 0 && (
                <section className="space-y-6">
                   <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {t.academic}</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fullProfile.digitalResume.academic.map((edu: any, i: number) => (
                        <div key={i} className="flex gap-4 p-5 rounded-2xl bg-muted/10 border hover:bg-muted/20 transition-colors shadow-sm">
                           <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-primary/5"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                           <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-medium uppercase text-primary">{edu.education}</p>
                              <p className="font-medium text-base truncate leading-tight">{edu.degree}</p>
                              <p className="text-xs font-bold text-muted-foreground truncate mt-0.5">{edu.institute}</p>
                              <Badge variant="outline" className="mt-3 text-[9px] font-medium uppercase bg-white border-primary/10 tracking-widest px-2">Batch of {edu.year}</Badge>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
             )}

             {fullProfile?.digitalResume?.recentCompany?.length > 0 && (
                <section className="space-y-6">
                   <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><History className="w-4 h-4" /> Professional Employment History</h4>
                   <div className="space-y-4">
                      {fullProfile.digitalResume.recentCompany.map((job: any, i: number) => (
                        <div key={i} className="p-6 rounded-[2rem] bg-muted/10 border border-dashed border-primary/10 space-y-4 shadow-sm">
                           <div className="flex justify-between items-start">
                              <div className="min-w-0">
                                 <p className="font-medium text-primary text-xl leading-tight truncate">{job.name}</p>
                                 <p className="font-bold text-xs text-muted-foreground uppercase mt-1 tracking-widest">{job.position}</p>
                              </div>
                              <Badge className="bg-primary/5 text-primary border-none font-bold text-[10px] px-3 py-1">Period: {job.startDate} — {job.endDate}</Badge>
                           </div>
                           {job.remarks && (
                             <div className="p-5 bg-white rounded-2xl italic text-sm font-medium text-muted-foreground leading-relaxed border shadow-inner">
                               " {job.remarks} "
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </section>
             )}

             {fullProfile?.digitalResume?.references?.length > 0 && (
                <section className="space-y-6">
                   <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Industry References</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fullProfile.digitalResume.references.map((ref: any, i: number) => (
                        <div key={i} className="p-6 rounded-3xl bg-amber-50/30 border border-amber-100 space-y-4 shadow-sm">
                           <div className="flex justify-between items-start">
                              <div className="min-w-0">
                                 <p className="font-medium text-primary text-base truncate">{ref.name}</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">{ref.designation} @ {ref.company}</p>
                              </div>
                              <Badge variant="outline" className="text-[8px] font-medium uppercase bg-white border-amber-200 text-amber-700 shrink-0">{ref.relationship || "Contact"}</Badge>
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-3 text-11px font-medium text-primary">
                                 <Phone className="w-3.5 h-3.5" /> +91 {ref.contact}
                              </div>
                              {ref.email && (
                                <div className="flex items-center gap-3 text-11px font-medium text-muted-foreground">
                                   <Mail className="w-3.5 h-3.5" /> {ref.email}
                                </div>
                              )}
                           </div>
                           {ref.remarks && (
                             <p className="text-11px italic text-muted-foreground font-medium border-t border-dashed border-amber-200 pt-3 leading-relaxed">
                               "{ref.remarks}"
                             </p>
                           )}
                        </div>
                      ))}
                   </div>
                </section>
             )}
           </div>
          </div>
          )}
       </div>
       
       <DialogFooter className="p-8 bg-muted/20 border-t flex wrap gap-4 shrink-0">
          <Button variant="ghost" onClick={() => setSelectedApp(null)} className="flex-1 font-bold h-14 rounded-2xl min-w-[140px]">Dismiss Dossier</Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadProfile} 
            className="flex-1 sm:flex-none font-bold text-primary hover:text-primary active:text-primary h-14 px-6 rounded-xl border-primary/20 hover:bg-primary/5 gap-2"
          >
            <Download className="w-4 h-4" /> {t.downloadReport} (PDF)
          </Button>
          {(selectedApp?.status === 'applied' || selectedApp?.status === 'pending' || selectedApp?.status === 'rejected') && (
             <Button onClick={() => handleUpdateStatus(selectedApp, 'shortlisted')} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-2xl shadow-xl min-w-[180px] active:scale-95 transition-all">{t.shortlisted} Now</Button>
          )}
          {(selectedApp?.status === 'applied' || selectedApp?.status === 'pending' || selectedApp?.status === 'shortlisted' || selectedApp?.status === 'hired') && (
             <Button variant="destructive" onClick={() => handleUpdateStatus(selectedApp, 'rejected')} className="flex-1 font-medium h-14 rounded-2xl shadow-lg min-w-[140px] active:scale-95 transition-all">{t.reject}</Button>
          )}
          {(selectedApp?.status === 'rejected' || selectedApp?.status === 'shortlisted' || selectedApp?.status === 'hired') && (
             <Button variant="outline" onClick={() => handleUpdateStatus(selectedApp, 'pending')} className="flex-1 border-primary text-primary font-bold h-14 rounded-2xl hover:bg-primary/5 active:scale-95 transition-all">Restore to Pending</Button>
          )}
          <Button variant="outline" className="flex-1 border-amber-200 text-amber-600 font-bold h-14 rounded-2xl gap-2 hover:bg-amber-50" onClick={() => handleReportCandidate(selectedApp)}>
             <ShieldAlert className="w-4 h-4" /> {t.reportCandidate}
          </Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>

   <Dialog open={!!viewingJobStats} onOpenChange={o => !o && setViewingJobStats(null)}>
     <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
       <DialogHeader className="p-8 bg-primary text-white">
         <div className="flex items-center gap-3">
           <BarChart3 className="w-8 h-8" />
           <div>
             <DialogTitle className="text-2xl font-medium">{t.jobPerformance}</DialogTitle>
             <DialogTitle className="text-white/80 font-bold uppercase text-xs tracking-widest">{viewingJobStats?.jobTitle}</DialogTitle>
           </div>
         </div>
       </DialogHeader>
       <div className="p-8 space-y-8">
         <div className="grid grid-cols-2 gap-6">
            <div className="bg-primary/5 p-6 rounded-3xl text-center space-y-1">
               <p className="text-[10px] font-medium uppercase text-primary/60">{t.views}</p>
               <p className="text-4xl font-medium text-primary">{viewingJobStats?.views || 0}</p>
            </div>
            <div className="bg-accent/5 p-6 rounded-3xl text-center space-y-1">
               <p className="text-[10px] font-medium uppercase text-accent/60">Total Applicants</p>
               <p className="text-4xl font-medium text-accent">{(rawApps || []).filter((a:any) => a.jobId === viewingJobStats?.id).length}</p>
            </div>
         </div>
         
         <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-primary/10">
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-4">Industrial Insight</h4>
            <p className="text-sm font-medium leading-relaxed">
              This job listing is performing well in the <span className="font-bold text-primary">{viewingJobStats?.department}</span> sector. 
              Most applicants are applying from within a <span className="font-bold text-accent">10km radius</span> of your location.
            </p>
         </div>
       </div>
       <DialogFooter className="p-8 bg-muted/20 border-t">
         <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl" onClick={() => setViewingJobStats(null)}>Close Analytics</Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>

   {printBuffer && (
     <div className="print-container">
       <PrintProfile user={printBuffer.user} app={printBuffer.app} t={t} />
     </div>
   )}
 </div>
);
}

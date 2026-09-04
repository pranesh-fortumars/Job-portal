"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { ProfileTab } from "@/components/admin/ProfileTab";
import { ManageAdminsTab } from "@/components/admin/ManageAdminsTab";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { BrandingHubTab } from "@/components/admin/BrandingHubTab";
import { DesignationRegistryTab } from "@/components/admin/DesignationRegistryTab";
import { DepartmentAssetManagerTab } from "@/components/admin/DepartmentAssetManagerTab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Wallet, 
  Trash2, 
  Search, 
  Loader2, 
  Eye, 
  Flag, 
  ShieldBan, 
  Smartphone, 
  Lock, 
  Edit3, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Tag, 
  Copy, 
  PhoneCall,
  GraduationCap,
  History,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ShieldX,
  UserPlus,
  RefreshCw,
  Ban,
  Briefcase,
  Layers,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Zap,
  Building,
  ImageIcon,
  Download,
  Archive,
  BarChart3,
  Heart,
  Bus,
  Coffee,
  ShoppingBag,
  Home,
  Gift,
  IndianRupee,
  Navigation,
  User,
  FileText,
  Power,
  RefreshCcw,
  LocateFixed,
  TrendingUp,
  Upload,
  Plus,
  Monitor,
  Info,
  CalendarCheck,
  Timer,
  Calendar,
  Save,
  Undo2,
  Palette,
  Globe,
  Settings2,
  UserCircle,
  UserX,
  PieChart as PieChartIcon,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Star,
  Languages,
  X,
  EyeOff,
  Camera,
  FileDown
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, translateLocation, formatShiftTiming, getLocalizedDesignation } from "@/lib/utils";
import { useFirestore, useCollection, useUser, useDoc, useAuth } from "@/firebase";
import { collection, doc, updateDoc, query, deleteDoc, serverTimestamp, where, getDocs, setDoc, addDoc, writeBatch, getDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { format, isValid, startOfDay, isBefore, addDays, subDays, startOfMonth, startOfToday, isWithinInterval, endOfDay, subWeeks, subMonths, subYears, startOfYear } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { generateJobShareMessage, openWhatsAppShare, routeJobToWhatsApp } from "@/lib/sharing";
import { DepartmentLogo } from "@/components/shared/DepartmentLogo";
import { AppLogo } from "@/components/shared/AppLogo";
import { HeroSliderManager } from "@/components/admin/HeroSliderManager";
import { Textarea } from "@/components/ui/textarea";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { sendAuthkeyNotification } from "@/lib/authkey";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { firebaseConfig } from "@/firebase/config";
import { JobListing } from "@/lib/types";

import { CLASSIFICATION } from "@/lib/constants";

const LOGO_SECTIONS = [
  { id: 'header', name: 'Home Page & Header', description: 'Primary brand identity visible across all public navigation bars.' },
  { id: 'auth', name: 'Auth Terminal (Login/Signup)', description: 'Branding used on the Login and Registration screens.' },
  { id: 'dashboard', name: 'User Dashboards', description: 'Logo displayed in the Seeker and Employer dashboards.' },
  { id: 'admin', name: 'Admin Dashboard', description: 'Branding for the internal administrative management suite.' },
  { id: 'splash', name: 'Loading Splash Screen', description: 'The animated logo shown during initial application load.' },
  { id: 'pdf', name: 'Digital Resume & PDF', description: 'High-resolution logo for generated professional dossiers.' },
  { id: 'footer', name: 'Site Footer', description: 'Branding visible at the bottom of all application pages.' },
  { id: 'corp_badge', name: 'Corporate Legitimacy Badge', description: 'The logo displayed in the verified MSME/GST section at the bottom of the home page.' }
];

const MOCK_ADMIN_EMAIL = 'iamnithyaprakash@gmail.com';
const CHART_COLORS = ['#0F52BA', '#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#FB923C', '#F59E0B'];

const PrintProfile = ({ user }: { user: any }) => {
  if (!user) return null;
  const resume = user.digitalResume || {};
  const professional = resume.professional || {};
  
  return (
    <div className="w-full text-black bg-white p-0 m-0 print-container">
      <div className="resume-document-frame" style={{ backgroundColor: 'white', border: 'none', margin: 0 }}>
        <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-medium uppercase tracking-tighter mb-1">{user.name}</h1>
            <p className="text-lg font-bold text-gray-700 uppercase tracking-wide">{user.designation} • {user.department}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm font-medium">
              <span className="flex items-center gap-1">Mobile: +91 {user.phone}</span>
              {user.email && <span className="flex items-center gap-1">Email: {user.email}</span>}
              <span className="flex items-center gap-1">Location: {user.location}</span>
            </div>
          </div>
          {user.photo && (
            <div className="w-24 h-24 border-2 border-black rounded-lg overflow-hidden shrink-0 ml-6 bg-white">
              <img src={user.photo} alt="Profile" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Industrial Profile</h2>
          <table className="print-table w-full border-collapse">
            <tbody>
              <tr>
                <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Global Category</th>
                <td className="p-2 border border-gray-300">{user.category}</td>
                <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Total Experience</th>
                <td className="p-2 border border-gray-300">{user.experience || professional.totalExperience || "0"} Years</td>
              </tr>
              <tr>
                <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Residing Area</th>
                <td className="p-2 border border-gray-300">{user.location}</td>
                <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Date of Birth</th>
                <td className="p-2 border border-gray-300">{user.dob || "N/A"}</td>
              </tr>
              {user.category === 'Technical' && (
                <>
                  <tr>
                    <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Buyers Handled</th>
                    <td colSpan={3} className="p-2 border border-gray-300">{professional.buyersHandled || "N/A"}</td>
                  </tr>
                  <tr>
                    <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Audit Knowledge</th>
                    <td colSpan={3} className="p-2 border border-gray-300">{professional.auditExperience || "N/A"}</td>
                  </tr>
                  <tr>
                    <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Software Skills</th>
                    <td colSpan={3} className="p-2 border border-gray-300">{professional.certifications || "N/A"}</td>
                  </tr>
                  <tr>
                    <th className="bg-gray-50 p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Core Skills</th>
                    <td colSpan={3} className="p-2 border border-gray-300 font-bold">{(professional.coreSkills || []).join(', ') || "N/A"}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </section>

        {user.category === 'Technical' && resume.academic?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Academic Records</h2>
            <table className="print-grid-table w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Level</th>
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Degree / Specialization</th>
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Institution</th>
                  <th className="p-2 border border-gray-300 text-center font-medium uppercase text-[8pt]">Year</th>
                </tr>
              </thead>
              <tbody>
                {resume.academic.map((edu: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2 border border-gray-300 font-bold">{edu.education}</td>
                    <td className="p-2 border border-gray-300">{edu.degree}</td>
                    <td className="p-2 border border-gray-300">{edu.institute}</td>
                    <td className="p-2 border border-gray-300 text-center">{edu.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {user.category === 'Technical' && resume.recentCompany?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Employment History</h2>
            <table className="print-grid-table w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]" style={{ width: '30%' }}>Company & Role</th>
                  <th className="p-2 border border-gray-300 text-center font-medium uppercase text-[8pt]" style={{ width: '20%' }}>Tenure</th>
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]" style={{ width: '50%' }}>Remarks / Responsibilities</th>
                </tr>
              </thead>
              <tbody>
                {resume.recentCompany.map((job: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2 border border-gray-300">
                      <div className="font-bold">{job.name}</div>
                      <div className="text-[7pt] italic uppercase">{job.position}</div>
                    </td>
                    <td className="p-2 border border-gray-300 text-center font-medium">{job.startDate} - {job.endDate}</td>
                    <td className="p-2 border border-gray-300 text-[8pt] leading-relaxed italic">"{job.remarks || "No specific details provided."}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {user.category === 'Technical' && resume.references?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-medium uppercase border-b-2 border-black mb-3">Professional References</h2>
            <table className="print-grid-table w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Name</th>
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Firm & Role</th>
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Contact</th>
                  <th className="p-2 border border-gray-300 text-left font-medium uppercase text-[8pt]">Context</th>
                </tr>
              </thead>
              <tbody>
                {resume.references.map((ref: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2 border border-gray-300 font-bold">{ref.name}</td>
                    <td className="p-2 border border-gray-300">{ref.designation} @ {ref.company}</td>
                    <td className="p-2 border border-gray-300">
                      <div className="font-bold">+91 {ref.contact}</div>
                      {ref.email && <div className="text-[7pt] text-gray-600">{ref.email}</div>}
                    </td>
                    <td className="p-2 border border-gray-300 text-[8pt]">
                      <div className="font-medium text-primary">{ref.relationship || "Contact"}</div>
                      <div className="italic mt-1">"{ref.remarks || "Professional reference."}"</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <div className="mt-10 pt-4 border-t border-dotted border-gray-400 text-center">
          <p className="text-[7pt] text-gray-500 uppercase tracking-widest">
            Verified Administrative Audit • generated via NexTirupur.in • {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};


export default function AdminDashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const profileRef = useMemo(() => (user && db) ? doc(db, "Users", user.uid) : null, [db, user]);
  const { data: userProfile, loading: profileLoading } = useDoc<any>(profileRef);
  
  const isActuallyAdmin = useMemo(() => userProfile?.role === 'admin', [userProfile]);
  
  const usersQuery = useMemo(() => (isActuallyAdmin && db) ? query(collection(db, "Users")) : null, [db, isActuallyAdmin]);
  const reportsQuery = useMemo(() => (isActuallyAdmin && db) ? query(collection(db, "Reports")) : null, [db, isActuallyAdmin]);
  const paymentsQuery = useMemo(() => (isActuallyAdmin && db) ? query(collection(db, "Payments")) : null, [db, isActuallyAdmin]);
  const allJobsQuery = useMemo(() => (isActuallyAdmin && db) ? query(collection(db, "Jobs")) : null, [db, isActuallyAdmin]);
  const appsQuery = useMemo(() => (isActuallyAdmin && db) ? query(collection(db, "Applications")) : null, [db, isActuallyAdmin]);
  
  const { data: rawAdminUsers, loading: usersLoading } = useCollection<any>(usersQuery);
  const { data: rawAdminReports, loading: reportsLoading } = useCollection<any>(reportsQuery);
  const { data: rawAdminPayments, loading: paymentsLoading } = useCollection<any>(paymentsQuery);
  const { data: rawAdminJobs, loading: jobsLoading } = useCollection<JobListing>(allJobsQuery as any);
  const { data: rawAdminApps } = useCollection<any>(appsQuery);

  const nameChangeRequestsQuery = useMemo(() => (isActuallyAdmin && db) ? query(collection(db, "CompanyNameChangeRequests"), where("status", "==", "pending")) : null, [db, isActuallyAdmin]);
  const { data: nameRequests } = useCollection<any>(nameChangeRequestsQuery);

  const roleChangeRequestsQuery = useMemo(() => (isActuallyAdmin && db) ? query(collection(db, "DesignationChangeRequests"), where("status", "==", "pending")) : null, [db, isActuallyAdmin]);
  const { data: roleRequests } = useCollection<any>(roleChangeRequestsQuery);

  const [jobsSearchQuery, setJobsSearchQuery] = useState("");
  const [lifecycleSearchQuery, setLifecycleSearchQuery] = useState("");
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [financialSearchQuery, setFinancialSearchQuery] = useState("");
  const [identitySearchQuery, setIdentitySearchQuery] = useState("");
  const [reportsSearchQuery, setReportsSearchQuery] = useState("");
  const [suspendedSearchQuery, setSuspendedSearchQuery] = useState("");

  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "my-profile");
  const [jobLifecycleFilter, setJobLifecycleFilter] = useState<"all" | "active" | "closed" | "archived">("all");
  const [jobSubTab, setJobSubTab] = useState<"pending" | "approved">("pending");
  const [reportSubTab, setReportSubTab] = useState<"all" | "user" | "company">("all");
  const [companySubTab, setCompanySubTab] = useState<"all" | "pending" | "approved" | "suspended" | "rejected" | "location_requests">("all");
  const [financialTimeRange, setFinancialTimeRange] = useState<string>("30d");
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedReportGroup, setSelectedReportGroup] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);

  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editedJob, setEditedJob] = useState<any>(null);

  const [selectedNameRequest, setSelectedNameRequest] = useState<any>(null);
  const [selectedRoleRequest, setSelectedRoleRequest] = useState<any>(null);
  const [selectedEmployerForLocation, setSelectedEmployerForLocation] = useState<any>(null);
  const [employerActionProcessing, setEmployerActionProcessing] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");

  const [exportDate, setExportDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);

  const [deletingUser, setDeletingUser] = useState<any>(null);

  const resumeRef = useRef<HTMLDivElement>(null);

  const designationsRegistryQuery = useMemo(() => (db && isActuallyAdmin) ? query(collection(db, "Designations")) : null, [db, isActuallyAdmin]);
  const { data: customDesignations } = useCollection<any>(designationsRegistryQuery);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    setIsEditingJob(false);
    setEditedJob(null);
  }, [selectedJob]);

  const handleEditJobField = (field: string, value: any) => {
    setEditedJob((prev: any) => ({ ...prev, [field]: value }));
  };

  const editedDesignations = useMemo(() => {
    if (!editedJob?.category || !editedJob?.department) return [];
    const cat = editedJob.category as "Technical" | "Non-Technical";
    const std = (CLASSIFICATION[cat] as any).designations[editedJob.department] || [];
    const masters = (customDesignations || [])
      .filter((d: any) => d.category === cat && d.department === editedJob.department && d.status !== 'inactive')
      .map((d: any) => d.name);
      
    return Array.from(new Set([...std, ...masters]));
  }, [editedJob?.category, editedJob?.department, customDesignations]);

  useEffect(() => {
    if (!selectedUser && !selectedJob && !selectedReportGroup && !confirmAction) {
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = 'auto';
      }
    }
  }, [selectedUser, selectedJob, selectedReportGroup, confirmAction]);

  const liveUsers = useMemo(() => (rawAdminUsers || []).filter(u => !processedIds.has(u.id) && u.email !== MOCK_ADMIN_EMAIL), [rawAdminUsers, processedIds]);
  const liveJobs = useMemo(() => (rawAdminJobs || []).filter((j: any) => !processedIds.has(j.id) && j.status !== 'deleted'), [rawAdminJobs, processedIds]);
  const liveReports = useMemo(() => (rawAdminReports || []).filter(r => !processedIds.has(r.id) && r.status !== 'dismissed'), [rawAdminReports, processedIds]);

  const categorizedJobs = useMemo(() => {
    const now = new Date();
    const active: any[] = [];
    const closed: any[] = [];
    const archived: any[] = [];

    liveJobs.forEach((job: any) => {
      if (job.status === 'draft') return;
      if (job.status === 'closed') { closed.push(job); return; }
      if (job.status === 'archived') { archived.push(job); return; }

      const interviewEndDateStr = job.interviewEndDate || job.interviewStartDate;
      const autoCloseDateStr = job.autoCloseDate;
      
      let isAutoClosed = false;
      if (autoCloseDateStr && isBefore(addDays(startOfDay(new Date(autoCloseDateStr)), 1), now)) isAutoClosed = true;
      else if (interviewEndDateStr && isBefore(addDays(startOfDay(new Date(interviewEndDateStr)), 1), now)) isAutoClosed = true;

      if (isAutoClosed) closed.push(job);
      else if (['approved', 'pending', 'open', 'live'].includes(job.status)) active.push(job);
      else closed.push(job);
    });

    return { active, closed, archived };
  }, [liveJobs]);

  const filteredJobsByLifecycle = useMemo(() => {
    const now = startOfToday();
    const jobs = jobLifecycleFilter === 'all' ? liveJobs.filter((j: any) => j.status !== 'pending' && j.status !== 'draft') : (categorizedJobs as any)[jobLifecycleFilter];
    return (jobs || []).map((job: any) => {
      const interviewEndDateStr = job.interviewEndDate || job.interviewStartDate;
      const autoCloseDateStr = job.autoCloseDate;
      
      let isAutoClosed = false;
      if (autoCloseDateStr && isBefore(addDays(startOfDay(new Date(autoCloseDateStr)), 1), now)) isAutoClosed = true;
      else if (interviewEndDateStr && isBefore(addDays(startOfDay(new Date(interviewEndDateStr)), 1), now)) isAutoClosed = true;

      return { ...job, isAutoClosed };
    });
  }, [categorizedJobs, liveJobs, jobLifecycleFilter]);

  const filteredLifecycleJobs = useMemo(() => {
    if (!lifecycleSearchQuery) return filteredJobsByLifecycle;
    const q = lifecycleSearchQuery.toLowerCase();
    return (filteredJobsByLifecycle || []).filter((j: any) => 
      (j.jobTitle || "").toLowerCase().includes(q) || 
      (j.companyName || "").toLowerCase().includes(q)
    );
  }, [filteredJobsByLifecycle, lifecycleSearchQuery]);

  const companies = useMemo(() => liveUsers.filter(u => u.role === 'employer'), [liveUsers]);

  const filteredCompanies = useMemo(() => {
    let list = companies;
    if (companySubTab === 'location_requests') list = list.filter(c => c.locationRequestStatus === 'change_requested');
    else if (companySubTab !== 'all') list = list.filter(c => c.status === companySubTab);
    return list;
  }, [companies, companySubTab]);

  const suspendedAssets = useMemo(() => {
    const suspendedEmployerIds = new Set(liveUsers.filter(u => u.status === 'suspended').map(u => u.id));
    return liveJobs.filter(j => suspendedEmployerIds.has(j.employerId));
  }, [liveJobs, liveUsers]);

  const filteredSuspendedAssets = useMemo(() => {
    if (!suspendedSearchQuery) return suspendedAssets;
    const q = suspendedSearchQuery.toLowerCase();
    return suspendedAssets.filter(j => 
      (j.jobTitle || "").toLowerCase().includes(q) || 
      (j.companyName || "").toLowerCase().includes(q)
    );
  }, [suspendedAssets, suspendedSearchQuery]);

  const groupedReports = useMemo(() => {
    const groups: Record<string, any> = {};
    liveReports.forEach(report => {
      const targetId = report.targetId;
      if (!targetId) return;
      if (!groups[targetId]) {
        groups[targetId] = {
          targetId: targetId,
          targetName: report.targetName || "Unknown Entity",
          targetType: report.type || report.targetType || "general",
          targetOwnerId: report.targetOwnerId,
          reports: [],
          status: report.status || "pending"
        };
      }
      groups[targetId].reports.push(report);
      if (report.status === 'under_review') groups[targetId].status = 'under_review';
    });
    return Object.values(groups).sort((a, b) => b.reports.length - a.reports.length);
  }, [liveReports]);

  const filteredReports = useMemo(() => {
    if (reportSubTab === 'all') return groupedReports;
    if (reportSubTab === 'user') return groupedReports.filter(g => g.targetType === 'user');
    if (reportSubTab === 'company') return groupedReports.filter(g => g.targetType === 'job' || g.targetType === 'company');
    return groupedReports;
  }, [groupedReports, reportSubTab]);

  const financialAnalytics = useMemo(() => {
    if (!rawAdminPayments && !rawAdminUsers) return null;
    
    const userFinancialActivities: any[] = [];
    const priceMap: Record<string, number> = {
      'single': 400,
      'starter': 999,
      'growth': 1499,
      'volume': 2499,
      'trial': 0
    };

    rawAdminUsers?.forEach(u => {
      if (u.email === MOCK_ADMIN_EMAIL) return;
      if (u.subscription?.planHistory) {
        u.subscription.planHistory.forEach((h: any) => {
          if (!h.date) return;
          userFinancialActivities.push({
            id: `user_act_${u.id}_${h.date}`,
            employerId: u.id,
            employerName: u.companyName || u.name || `Unit: ${u.id.slice(0,6)}`,
            amount: h.amount || priceMap[h.planId?.toLowerCase()] || 0,
            planId: h.planId,
            createdAt: h.date,
            status: 'paid',
            paymentStatus: 'paid',
            source: 'Subscription Profile'
          });
        });
      }
    });

    const allActivities = [
      ...(rawAdminPayments || []).map(p => ({ 
        ...p, 
        employerName: rawAdminUsers?.find(u => u.id === (p.employerId || p.uid))?.companyName || rawAdminUsers?.find(u => u.id === (p.employerId || p.uid))?.name || "Unknown Unit",
        source: 'Payment Record'
      })),
      ...userFinancialActivities
    ].sort((a, b) => {
      const getTime = (val: any) => {
        if (!val) return 0;
        if (typeof val.toMillis === 'function') return val.toMillis();
        return new Date(val).getTime();
      };
      return getTime(b.createdAt) - getTime(a.createdAt);
    });

    const now = new Date();
    
    const successPayments = allActivities.filter(p => 
      p.paymentStatus === 'success' || 
      p.status === 'paid' || 
      p.paymentStatus === 'paid' ||
      p.status === 'success'
    );
    
    const parseDate = (val: any) => {
      if (!val) return new Date(0);
      if (typeof val.toDate === 'function') return val.toDate();
      const d = new Date(val);
      return isValid(d) ? d : new Date(0);
    };

    const todayStart = startOfToday();
    const weekStart = subWeeks(now, 1);
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    const revenueToday = successPayments.filter(p => parseDate(p.createdAt) >= todayStart).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const revenueWeek = successPayments.filter(p => parseDate(p.createdAt) >= weekStart).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const revenueMonth = successPayments.filter(p => parseDate(p.createdAt) >= monthStart).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const revenueYear = successPayments.filter(p => parseDate(p.createdAt) >= yearStart).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalRevenue = successPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const planBreakdown: Record<string, number> = {};
    successPayments.forEach(p => {
      const plan = (p.planId || p.planType || 'other').toLowerCase();
      planBreakdown[plan] = (planBreakdown[plan] || 0) + (Number(p.amount) || 0);
    });

    const pieData = Object.entries(planBreakdown).map(([name, value]) => ({ name: name.toUpperCase(), value }));

    const trendMap: Record<string, number> = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(now, i), 'dd MMM'));
    last30Days.forEach(d => { trendMap[d] = 0; });

    successPayments.forEach(p => {
      const dateStr = format(parseDate(p.createdAt), 'dd MMM');
      if (trendMap[dateStr] !== undefined) trendMap[dateStr] += (Number(p.amount) || 0);
    });

    const areaData = last30Days.reverse().map(date => ({ date, revenue: trendMap[date] }));

    const employerContMap: Record<string, { total: number, name: string }> = {};
    successPayments.forEach(p => {
      const uid = p.employerId || p.uid;
      if (!uid) return;
      if (!employerContMap[uid]) {
        employerContMap[uid] = { total: 0, name: p.employerName || `ID: ${uid.slice(0,6)}` };
      }
      employerContMap[uid].total += (Number(p.amount) || 0);
    });

    const topContributors = Object.values(employerContMap).sort((a, b) => b.total - a.total).slice(0, 5);

    const successfulCount = successPayments.length;
    const failedCount = allActivities.filter(p => p.paymentStatus === 'failed' || p.status === 'failed').length;
    const pendingCount = allActivities.filter(p => p.paymentStatus === 'pending' || p.status === 'pending').length;

    return {
      revenueToday, revenueWeek, revenueMonth, revenueYear, totalRevenue,
      pieData, areaData, topContributors,
      successfulCount, failedCount, pendingCount,
      totalTransactions: allActivities.length,
      allActivities
    };
  }, [rawAdminPayments, rawAdminUsers]);

  const filteredFinancialActivities = useMemo(() => {
    if (!financialAnalytics) return [];
    if (!financialSearchQuery) return financialAnalytics.allActivities;
    const q = financialSearchQuery.toLowerCase();
    return financialAnalytics.allActivities.filter(p => 
      (p.razorpayPaymentId || "").toLowerCase().includes(q) || 
      (p.paymentId || "").toLowerCase().includes(q) || 
      (p.id || "").toLowerCase().includes(q) || 
      (p.employerName || "").toLowerCase().includes(q) || 
      (p.employerId || "").toLowerCase().includes(q) || 
      (p.uid || "").toLowerCase().includes(q)
    );
  }, [financialAnalytics, financialSearchQuery]);

  const filteredJobsQueue = useMemo(() => {
    const list = liveJobs.filter(j => j.status === jobSubTab);
    if (!jobsSearchQuery) return list;
    const q = jobsSearchQuery.toLowerCase();
    return list.filter(j => (j.jobTitle || "").toLowerCase().includes(q) || (j.companyName || "").toLowerCase().includes(q));
  }, [liveJobs, jobSubTab, jobsSearchQuery]);

  const finalFilteredCompanies = useMemo(() => {
    if (!companySearchQuery) return filteredCompanies;
    const q = companySearchQuery.toLowerCase();
    return filteredCompanies.filter(c => (c.companyName || c.name || "").toLowerCase().includes(q) || (c.area || "").toLowerCase().includes(q) || (c.contactPersonName || "").toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q));
  }, [filteredCompanies, companySearchQuery]);

  const filteredIdentityUsers = useMemo(() => {
    if (!identitySearchQuery) return liveUsers;
    const q = identitySearchQuery.toLowerCase();
    return liveUsers.filter(u => (u.companyName || u.name || "").toLowerCase().includes(q) || (u.phone || "").toLowerCase().includes(q) || (u.uid || u.id || "").toLowerCase().includes(q));
  }, [liveUsers, identitySearchQuery]);

  const finalFilteredReports = useMemo(() => {
    if (!reportsSearchQuery) return filteredReports;
    const q = reportsSearchQuery.toLowerCase();
    return filteredReports.filter(g => (g.targetName || "").toLowerCase().includes(q) || (g.targetId || "").toLowerCase().includes(q) || g.reports.some((r: any) => (r.reason || "").toLowerCase().includes(q)));
  }, [filteredReports, reportsSearchQuery]);

  const stats = useMemo(() => ({
    totalCompanies: companies.length,
    pendingApprovals: companies.filter(c => c.status === 'pending').length,
    approvedCompanies: companies.filter(c => c.status === 'approved').length,
    rejectedCompanies: companies.filter(c => c.status === 'rejected').length,
    suspendedCompanies: companies.filter(c => c.status === 'suspended').length,
    locationRequests: companies.filter(c => c.locationRequestStatus === 'change_requested').length,
    workers: liveUsers.filter(u => u.role === 'job_seeker' && u.category === 'Non-Technical').length,
    staff: liveUsers.filter(u => u.role === 'job_seeker' && u.category === 'Technical').length,
    pendingJobs: liveJobs.filter(j => j.status === 'pending').length,
    approvedJobs: liveJobs.filter(j => ['approved', 'live', 'open'].includes(j.status)).length,
    completedDrives: categorizedJobs.archived.length + categorizedJobs.closed.length,
    pendingReports: groupedReports.length,
    blockedUsers: liveUsers.filter(u => u.status === 'blocked').length,
    dues: (rawAdminPayments || []).filter(p => p.status !== 'paid' && p.paymentStatus !== 'success').length,
    openCandidateReports: groupedReports.filter(g => g.targetId !== 'all' && g.targetType === 'user' && g.status === 'pending').length,
    reviewCandidateReports: groupedReports.filter(g => g.targetId !== 'all' && g.targetType === 'user' && g.status === 'under_review').length,
    resolvedCandidateReports: groupedReports.filter(g => g.targetId !== 'all' && g.targetType === 'user' && g.status === 'resolved').length,
    nameRequestsCount: (nameRequests || []).length,
    roleRequestsCount: (roleRequests || []).length,
    suspendedJobsCount: suspendedAssets.length,
    adminsCount: liveUsers.filter(u => u.role === 'admin').length
  }), [liveUsers, liveJobs, groupedReports, companies, rawAdminPayments, categorizedJobs, nameRequests, roleRequests, suspendedAssets]);

  if (profileLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!user || !isActuallyAdmin) return <div className="p-20 text-center"><ShieldBan className="mx-auto w-12 h-12 text-destructive mb-4" /><h2 className="text-2xl font-medium">Access Denied</h2><Button className="mt-4" onClick={() => router.push('/auth/login')}>Login as Admin</Button></div>;

  const SearchBar = ({ value, onChange, placeholder = "Search records...", onClear }: { value: string, onChange: (v: string) => void, placeholder?: string, onClear: () => void }) => (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="pl-10 pr-10 h-11 rounded-xl bg-white border-none shadow-sm" />
      {value && (
        <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const handleNameRequestAction = async (status: 'approved' | 'rejected') => {
    if (!selectedNameRequest || !db || !user) return;
    setIsProcessing(true);
    
    try {
      const batch = writeBatch(db);
      const reqRef = doc(db, "CompanyNameChangeRequests", selectedNameRequest.id);
      
      batch.update(reqRef, { 
        status, 
        adminRemarks, 
        approvedBy: user.uid, 
        processedAt: serverTimestamp() 
      });

      const employerRef = doc(db, "Users", selectedNameRequest.uid);
      batch.update(employerRef, { 
        nameRequestStatus: status,
        updatedAt: serverTimestamp() 
      });

      if (status === 'approved') {
         batch.update(employerRef, { companyName: selectedNameRequest.requestedName });

         const jobsQ = query(collection(db, "Jobs"), where("employerId", "==", selectedNameRequest.uid));
         const jobsSnap = await getDocs(jobsQ);
         jobsSnap.docs.forEach(jDoc => {
           batch.update(jDoc.ref, { companyName: selectedNameRequest.requestedName, updatedAt: serverTimestamp() });
         });
      }

      await batch.commit();
      toast({ title: `Identity Override ${status.toUpperCase()}` });
      setSelectedNameRequest(null);
      setAdminRemarks("");
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.location.reload();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Global Sync Failure", description: err.message });
      setIsProcessing(false);
    }
  };

  const handleRoleRequestAction = async (status: 'approved' | 'rejected') => {
    if (!selectedRoleRequest || !db || !user) return;
    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      const reqRef = doc(db, "DesignationChangeRequests", selectedRoleRequest.id);
      
      batch.update(reqRef, { 
        status, 
        adminRemarks, 
        approvedBy: user.uid, 
        processedAt: serverTimestamp() 
      });

      if (status === 'approved') {
         const userRef = doc(db, "Users", selectedRoleRequest.uid);
         batch.update(userRef, { 
           designation: selectedRoleRequest.requestedDesignation, 
           department: selectedRoleRequest.requestedDepartment, 
           updatedAt: serverTimestamp() 
         });

         const appsQ = query(collection(db, "Applications"), where("jobSeekerId", "==", selectedRoleRequest.uid));
         const appsSnap = await getDocs(appsQ);
         appsSnap.docs.forEach(aDoc => {
           batch.update(aDoc.ref, { 
             jobTitle: selectedRoleRequest.requestedDesignation, 
             department: selectedRoleRequest.requestedDepartment 
           });
         });
      }

      await batch.commit();
      toast({ title: `Role Override ${status.toUpperCase()}` });
      setSelectedRoleRequest(null);
      setAdminRemarks("");
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.location.reload();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Cascading Update Failed" });
      setIsProcessing(false);
    }
  };

  const handleOpenUserLocation = (u: any) => {
    if (!u) return;
    const url = u.latitude && u.longitude 
      ? `https://www.google.com/maps?q=${u.latitude},${u.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((u.fullAddress || u.area || "") + " Tirupur")}`;
    window.open(url, '_blank');
  };

  const executeAction = async () => {
    if (!confirmAction || isProcessing || !db) return;
    
    const startTime = Date.now();
    const { type, coll, id, data, reportGroupId } = confirmAction;
    
    const targetJobToApprove = selectedJob || liveJobs.find(j => j.id === id);
    const targetUserToVerify = selectedUser || liveUsers.find(u => u.id === id);

    setIsProcessing(true);
    setConfirmAction(null);
    setSelectedUser(null);
    setSelectedJob(null);
    setSelectedReportGroup(null);

    try {
      if (type === 'delete') {
        await updateDoc(doc(db, coll, id), { 
          status: 'deleted', 
          deletedAt: new Date().toISOString(),
          deletedBy: user?.uid || 'admin',
          updatedAt: serverTimestamp() 
        });
        toast({ title: "Record Deleted" });
      } else if (type === 'dismiss-group') {
        const group = groupedReports.find(g => g.targetId === reportGroupId);
        if (group) {
          const batch = writeBatch(db);
          group.reports.forEach((r: any) => {
            batch.update(doc(db, "Reports", r.id), { status: "dismissed", updatedAt: serverTimestamp() });
          });
          await batch.commit();
        }
        toast({ title: "Reports Dismissed" });
      } else if (type === 'approve-share' || (coll === 'Jobs' && data?.status === 'approved')) {
        await setDoc(doc(db, coll, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
        if (type === 'approve-share' && targetJobToApprove) {
          await routeJobToWhatsApp(targetJobToApprove, id, user?.uid || 'admin', db, t);
        }
        toast({ title: "Approved & Synchronized" });
      } else if (type === 'approve-location') {
        const request = targetUserToVerify?.pendingLocationChange;
        if (request) {
          const batch = writeBatch(db);
          batch.update(doc(db, "Users", id), {
            fullAddress: request.fullAddress,
            area: request.area || targetUserToVerify.area,
            latitude: request.latitude,
            longitude: request.longitude,
            locationRequestStatus: 'approved',
            pendingLocationChange: null,
            updatedAt: serverTimestamp()
          });
          batch.set(doc(collection(db, "LocationHistory")), {
            uid: id, companyName: targetUserToVerify.companyName || targetUserToVerify.name, oldLocation: targetUserToVerify.fullAddress,
            newLocation: request.fullAddress, reason: request.reason, approvedBy: user?.uid,
            status: 'approved', createdAt: serverTimestamp()
          });
          await batch.commit();
          toast({ title: "Relocation Finalized" });
        }
      } else if (type === 'reject-location') {
        await updateDoc(doc(db, "Users", id), {
          locationRequestStatus: 'rejected',
          pendingLocationChange: null,
          updatedAt: serverTimestamp()
        });
        toast({ title: "Relocation Denied" });
      } else {
        await setDoc(doc(db, coll, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: "Terminal Record Updated" });
      }

      if (coll === 'Jobs' && data?.status === 'approved') {
         console.group("%cWhatsApp Automation: JOB_APPROVED [WID 39519]", "color: #25D366; font-weight: bold;");
         console.log("Trigger Detected: Status Transition -> approved");
         console.log("Record ID:", id);
         
         const jobData = targetJobToApprove || (await getDoc(doc(db, "Jobs", id))).data();
         if (jobData) {
            const empId = jobData.employerId || jobData.employerUID;
            console.log("Locating Employer Recipient:", empId);
            const empSnap = await getDoc(doc(db, "Users", empId));
            
            if (empSnap.exists() && empSnap.data().phone) {
               const emp = empSnap.data();
               const payload = {
                  phone: emp.phone,
                  companyName: emp.companyName || "Verified Factory", 
                  designation: jobData.jobTitle || jobData.designation,
                  eventType: 'approved' as const
               };
               console.log("Request Payload:", payload);
               console.log("API URL: console.authkey.io/restapi/requestjson.php");

               const result = await sendAuthkeyNotification(payload);
               
               console.log("API Response Status:", result.success ? "SUCCESS" : "FAILED");
               console.log("Gateway Response:", result.data);
               console.log("Execution Time:", Date.now() - startTime, "ms");
               
               await addDoc(collection(db, "WhatsAppLogs"), {
                  eventType: 'approved',
                  templateId: '39519',
                  jobId: id,
                  mobileNumber: emp.phone,
                  status: result.success ? 'success' : 'failed',
                  timestamp: serverTimestamp(),
                  apiResponse: result.data || null
               });
            } else {
               console.warn("Trigger Aborted: Missing recipient phone number.");
            }
         }
         console.groupEnd();
      }

      if (coll === 'Users' && data?.status === 'approved') {
         console.group("%cWhatsApp Automation: VERIFICATION_APPROVED [WID 39508]", "color: #25D366; font-weight: bold;");
         console.log("Trigger Detected: Employer Identity Audit Approved");
         console.log("User ID:", id);
         
         const userDataNotify = targetUserToVerify || (await getDoc(doc(db, "Users", id))).data();
         if (userDataNotify && userDataNotify.role === 'employer' && userDataNotify.phone) {
            const payload = {
               phone: userDataNotify.phone,
               companyName: userDataNotify.companyName || "Verified Factory", 
               eventType: 'verification_approved' as const
            };
            console.log("Request Payload:", payload);
            console.log("API URL: console.authkey.io/restapi/requestjson.php");

            const result = await sendAuthkeyNotification(payload);
            
            console.log("API Response Status:", result.success ? "SUCCESS" : "FAILED");
            console.log("Gateway Response:", result.data);
            console.log("Execution Time:", Date.now() - startTime, "ms");

            await addDoc(collection(db, "WhatsAppLogs"), {
               eventType: 'verification_approved',
               templateId: '39508',
               employerId: id,
               mobileNumber: userDataNotify.phone,
               status: result.success ? 'success' : 'failed',
               timestamp: serverTimestamp(),
               apiResponse: result.data || null
            });
         } else {
            console.warn("Trigger Aborted: Not an employer or missing phone number.");
         }
         console.groupEnd();
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
      window.location.reload();
    } catch (err: any) {
      console.error("[Audit Fault]", err);
      toast({ variant: "destructive", title: "Execution Failed", description: err.message });
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedUser || !resumeRef.current) return;
    setIsProcessing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedUser.name.replace(/\s+/g, '_')}_Resume.pdf`);
      toast({ title: "Resume Downloaded Successfully" });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({ variant: "destructive", title: "PDF Generation Failed", description: "Could not create resume document." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewPDF = async () => {
    if (!selectedUser || !resumeRef.current) return;
    setIsProcessing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const blobUrl = pdf.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error("PDF viewing failed:", error);
      toast({ variant: "destructive", title: "PDF Preview Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsappShare = (job: any) => {
    if (!job || !db) return;
    routeJobToWhatsApp(job, job.id, user?.uid || 'admin', db, t);
  };

  const handleExportCSV = async () => {
    if (!exportDate || !db) return;
    setIsExporting(true);

    try {
      const selectedDate = new Date(exportDate);
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      const startISO = start.toISOString();
      const endISO = end.toISOString();

      const q = query(
        collection(db, "Jobs"),
        where("createdAt", ">=", startISO),
        where("createdAt", "<=", endISO)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({ title: "No Data Found", description: "No job postings found for the selected date." });
        setIsExporting(false);
        return;
      }

      const rows = [
        ["Category", "Company Name", "Address", "Designation", "Salary", "Experience"]
      ];

      querySnapshot.forEach((docSnap) => {
        const job = docSnap.data();
        
        if (job.status === 'deleted' || job.status === 'draft') return;

        const salaryText = (() => {
          if (!job.salaryType || job.salaryType === 'display_range') {
            if (job.salaryBasis === 'piece') return "Piece Rate";
            return `₹${job.salaryMin || 0} - ₹${job.salaryMax || 0} (${job.salaryBasis || 'Monthly'})`;
          }
          const typeMap: Record<string, string> = {
            not_disclosed: "Salary Not Disclosed",
            negotiable: "Negotiable",
            experience_based: "Based on Experience",
            company_standard: "As Per Company Standards"
          };
          return typeMap[job.salaryType] || "Salary Not Disclosed";
        })();

        const clean = (val: any) => `"${(val || "").toString().replace(/"/g, '""')}"`;

        rows.push([
          clean(job.category),
          clean(job.companyName),
          clean(job.location),
          clean(job.jobTitle || job.designation),
          clean(salaryText),
          clean(`${job.experienceRequired || 0}+ Years`)
        ]);
      });

      if (rows.length === 1) {
         toast({ title: "No Data Found", description: "No active job postings found for the selected date." });
         setIsExporting(false);
         return;
      }

      const csvContent = rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      link.setAttribute("href", url);
      link.setAttribute("download", `Job_Postings_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Export Complete", description: `Dossier for ${dateStr} has been generated.` });
    } catch (error) {
      console.error("Export Error:", error);
      toast({ variant: "destructive", title: "Export Failed", description: "Failed to generate CSV audit." });
    } finally {
      setIsExporting(false);
    }
  };

  const confirmDeleteUser = async () => {
      if (!deletingUser || !db || !isActuallyAdmin) return;
      setIsProcessing(true);
      try {
        await deleteDoc(doc(db, "Users", deletingUser.id));
        toast({ title: "Identity Record Permanently Deleted" });
        setDeletingUser(null);
      } catch (err: any) {
        toast({ variant: "destructive", title: "Deletion Failed", description: err.message });
      } finally {
        setIsProcessing(false);
      }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {isProcessing && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 bg-primary/5 rounded-[2.5rem] flex items-center justify-center shadow-inner animate-pulse overflow-hidden">
                <AppLogo section="splash" width={100} height={100} priority />
              </div>
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-medium text-primary tracking-tight uppercase">Processing Industrial Audit</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] animate-pulse">Synchronizing Terminal Records...</p>
              </div>
           </div>
        </div>
      )}

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-4xl font-semibold text-primary tracking-tight">Admin Terminal</h1>
            <p className="text-muted-foreground font-medium">Governance & Lifecycle Moderation</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-xl font-bold text-primary hover:text-primary active:text-primary hover:bg-primary/5 focus:text-primary transition-all" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Live Sync
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 print:hidden">
          {[
            { label: "Factories", val: stats.totalCompanies, icon: Building2, side: "bg-primary", text: "text-primary", bg: "bg-primary/10", sub: `${stats.pendingApprovals} Pending` },
            { label: "Approved", val: stats.approvedCompanies, icon: CheckCircle2, side: "bg-green-500", text: "text-green-600", bg: "bg-green-100", sub: "Verified Units" },
            { label: "Identity Hub", val: stats.nameRequestsCount + stats.roleRequestsCount, icon: UserCircle, side: "bg-purple-500", text: "text-purple-600", bg: "bg-purple-100", sub: "Override Pending" },
            { label: "Jobs Queue", val: stats.pendingJobs, icon: ShieldAlert, side: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-100", sub: "Approval Needed" },
            { label: "Incidents", val: stats.pendingReports, icon: Flag, side: "bg-red-500", text: "text-red-600", bg: "bg-red-100", sub: "Open Reports" }
          ].map((s, i) => (
            <Card key={i} className="border border-slate-800/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 bg-white group cursor-default ring-1 ring-slate-800/5 overflow-hidden relative rounded-[1.5rem]">
              <div className={cn("absolute inset-y-0 left-0 w-1.5 transition-all group-hover:w-2", s.side)} />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pl-6 pt-6">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-900 transition-colors tracking-widest">{s.label}</CardTitle>
                <div className={cn("p-2.5 rounded-2xl transition-transform duration-300 group-hover:scale-110", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.text)} />
                </div>
              </CardHeader>
              <CardContent className="pl-6 pb-6">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">{s.val}</div>
                <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full shadow-sm", s.side)} /> {s.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden">
          <div className="w-full overflow-x-auto pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsList className="bg-slate-100/80 p-1.5 h-auto rounded-2xl space-x-2 w-max min-w-full justify-start shadow-inner border border-slate-200/50 backdrop-blur-md">
              <TabsTrigger value="my-profile" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <User className="w-4 h-4" /> My Profile
              </TabsTrigger>
              <TabsTrigger value="admin-mgmt" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Users className="w-4 h-4" /> Admin Mgmt <Badge className="ml-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 rounded-full h-5 text-[10px]">{stats.adminsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="branding-hub" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-500" /> App Branding
              </TabsTrigger>
              <TabsTrigger value="hero-sliders" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent fill-accent" /> Hero Sliders
              </TabsTrigger>
              <TabsTrigger value="jobs-queue" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" /> Jobs Registry <Badge className="ml-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-2 rounded-full h-5 text-[10px]">{stats.pendingJobs}</Badge>
              </TabsTrigger>
              <TabsTrigger value="job-export" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <FileDown className="w-4 h-4 text-teal-500" /> Job Export
              </TabsTrigger>
              <TabsTrigger value="suspended-assets" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <ShieldBan className="w-4 h-4 text-red-500" /> Suspended <Badge className="ml-1.5 bg-red-100 text-red-700 hover:bg-red-200 border-none px-2 rounded-full h-5 text-[10px]">{stats.suspendedJobsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="name-requests" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" /> Name Requests <Badge className="ml-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 rounded-full h-5 text-[10px]">{stats.nameRequestsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="role-overrides" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-500" /> Role Overrides <Badge className="ml-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none px-2 rounded-full h-5 text-[10px]">{stats.roleRequestsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="company-hub" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Factory Hub <Badge className="ml-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 rounded-full h-5 text-[10px]">{stats.pendingApprovals}</Badge>
              </TabsTrigger>
              <TabsTrigger value="job-lifecycle" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-blue-500" /> Drive Lifecycle <Badge className="ml-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 rounded-full h-5 text-[10px]">{stats.completedDrives}</Badge>
              </TabsTrigger>
              <TabsTrigger value="designation-registry" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-500" /> Designation Registry
              </TabsTrigger>
              <TabsTrigger value="asset-hub" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Asset Hub
              </TabsTrigger>
              <TabsTrigger value="financial-hub" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-500" /> Financial Hub
              </TabsTrigger>
              <TabsTrigger value="identity-hub" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> Identity Hub
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-md px-5 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-500" /> Incidents <Badge className="ml-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 border-none px-2 rounded-full h-5 text-[10px]">{stats.pendingReports}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hero-sliders" className="mt-6 space-y-6">
             <HeroSliderManager />
          </TabsContent>

          <TabsContent value="my-profile" className="mt-6 space-y-6">
             <ErrorBoundary><ProfileTab db={db} profile={userProfile} /></ErrorBoundary>
          </TabsContent>

          <TabsContent value="admin-mgmt" className="mt-6 space-y-6">
             <ErrorBoundary><ManageAdminsTab db={db} liveUsers={liveUsers} /></ErrorBoundary>
          </TabsContent>

          <TabsContent value="branding-hub" className="mt-6 space-y-6">
             <ErrorBoundary><BrandingHubTab db={db} /></ErrorBoundary>
          </TabsContent>

          <TabsContent value="job-export" className="mt-6 space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-medium text-primary uppercase tracking-tight">Daily Job Export Terminal</h2>
                  <p className="text-sm font-medium text-muted-foreground">Download comprehensive CSV audit for specific creation dates.</p>
                </div>
             </div>
             
             <Card className="rounded-[2.5rem] p-10 border-none shadow-xl bg-white overflow-hidden max-w-2xl">
                <div className="flex flex-col md:flex-row items-end gap-6">
                   <div className="flex-1 space-y-2">
                      <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Creation Date Audit Target</Label>
                      <Input 
                        type="date" 
                        value={exportDate} 
                        onChange={(e) => setExportDate(e.target.value)} 
                        className="h-12 rounded-xl font-medium bg-muted/20 border-none"
                      />
                   </div>
                   <Button 
                    disabled={isExporting || !exportDate} 
                    onClick={handleExportCSV}
                    className="h-12 px-10 rounded-xl bg-primary text-white font-medium shadow-xl shadow-primary/20 active:scale-95 transition-all gap-2"
                   >
                     {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                     Download CSV Dossier
                   </Button>
                </div>
                <div className="mt-8 pt-8 border-t border-dashed space-y-4">
                   <h4 className="text-[10px] font-medium uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                      <Info className="w-4 h-4" /> Export Protocol Specification
                   </h4>
                   <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <li className="text-[11px] font-bold text-muted-foreground flex gap-2"><span className="text-primary">•</span> Category (Staff/Worker)</li>
                      <li className="text-[11px] font-bold text-muted-foreground flex gap-2"><span className="text-primary">•</span> Verified Company Name</li>
                      <li className="text-[11px] font-bold text-muted-foreground flex gap-2"><span className="text-primary">•</span> Registered Plant Address</li>
                      <li className="text-[11px] font-bold text-muted-foreground flex gap-2"><span className="text-primary">•</span> Designation Identity</li>
                      <li className="text-[11px] font-bold text-muted-foreground flex gap-2"><span className="text-primary">•</span> Localized Salary Schema</li>
                      <li className="text-[11px] font-bold text-muted-foreground flex gap-2"><span className="text-primary">•</span> Experience Benchmark</li>
                   </ul>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="suspended-assets" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-medium text-red-700 uppercase tracking-tight">Suspended Factory Jobs</h2>
                <p className="text-sm font-medium text-muted-foreground">Monitoring hidden job postings from suspended industrial units.</p>
              </div>
              <SearchBar value={suspendedSearchQuery} onChange={setSuspendedSearchQuery} onClear={() => setSuspendedSearchQuery("")} placeholder="Search hidden jobs..." />
            </div>

            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
              <Table>
                <TableHeader className="bg-red-50/50">
                  <TableRow>
                    <TableHead className="pl-8 font-medium uppercase text-[10px]">Hidden Listing</TableHead>
                    <TableHead className="font-medium uppercase text-[10px]">Suspended Factory</TableHead>
                    <TableHead className="font-medium uppercase text-[10px]">Last Updated</TableHead>
                    <TableHead className="font-medium uppercase text-[10px]">Visibility Status</TableHead>
                    <TableHead className="pr-8 text-right font-medium uppercase text-[10px]">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredSuspendedAssets.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold italic">No hidden assets detected.</TableCell></TableRow>
                  ) : (
                    filteredSuspendedAssets.map(job => (
                      <TableRow key={job.id} className="hover:bg-red-50/30 transition-colors">
                        <TableCell className="pl-8 py-5">
                          <div className="space-y-0.5">
                             <p className="font-medium text-xs">{job.jobTitle}</p>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase">{job.category} • {job.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-0.5">
                              <p className="font-bold text-xs text-red-900">{job.companyName}</p>
                              <Badge className="bg-red-100 text-red-700 border-none font-medium text-[8px] uppercase">Employer Suspended</Badge>
                           </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-muted-foreground">
                          {safeFormatDate(job.updatedAt || job.createdAt)}
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="border-red-200 text-red-600 font-medium uppercase text-[9px] px-2 flex items-center gap-1.5 w-fit">
                              <EyeOff className="w-3 h-3" /> Invisible to Public
                           </Badge>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                           <Button variant="ghost" size="sm" className="font-bold text-primary" onClick={() => setSelectedJob(job)}>
                              Dossier Audit
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="name-requests" className="mt-6 space-y-6">
             <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
                <Table>
                   <TableHeader className="bg-muted/50">
                      <TableRow>
                         <TableHead className="pl-8 font-medium uppercase text-[10px]">Employer Identity</TableHead>
                         <TableHead className="font-medium uppercase text-[10px]">Current Brand</TableHead>
                         <TableHead className="font-medium uppercase text-[10px]">Requested Brand</TableHead>
                         <TableHead className="font-medium uppercase text-[10px]">Justification</TableHead>
                         <TableHead className="pr-8 text-right font-medium uppercase text-[10px]">Audit</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {!nameRequests || nameRequests.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold italic">No pending company name override requests.</TableCell></TableRow>
                      ) : (
                        nameRequests.map(req => (
                          <TableRow key={req.id} className="hover:bg-primary/5 transition-colors">
                            <TableCell className="pl-8 py-5">
                               <div className="space-y-0.5">
                                  <p className="font-medium text-xs">{req.employerName || "Employer"}</p>
                                  <p className="text-[9px] font-bold text-primary uppercase">+91 {req.phone}</p>
                               </div>
                            </TableCell>
                            <TableCell className="font-bold text-xs text-muted-foreground">{req.currentName}</TableCell>
                            <TableCell className="font-medium text-xs text-indigo-700">{req.requestedName}</TableCell>
                            <TableCell className="text-xs font-medium italic truncate max-w-[200px]">"{req.reason}"</TableCell>
                            <TableCell className="pr-8 text-right">
                               <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 rounded-lg h-8" onClick={() => setSelectedNameRequest(req)}>Process Audit</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                   </TableBody>
                </Table>
             </Card>
          </TabsContent>

          <TabsContent value="role-overrides" className="mt-6 space-y-6">
             <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
                <Table>
                   <TableHeader className="bg-muted/50">
                      <TableRow>
                         <TableHead className="pl-8 font-medium uppercase text-[10px]">Candidate Identity</TableHead>
                         <TableHead className="font-medium uppercase text-[10px]">Current Role</TableHead>
                         <TableHead className="font-medium uppercase text-[10px]">Requested Role</TableHead>
                         <TableHead className="font-medium uppercase text-[10px]">Justification</TableHead>
                         <TableHead className="pr-8 text-right font-medium uppercase text-[10px]">Audit</TableHead>
                      </TableRow>
                   </TableHeader>                   <TableBody>
                      {!roleRequests || roleRequests.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold italic">No pending designation override requests.</TableCell></TableRow>
                      ) : (
                        roleRequests.map(req => (
                          <TableRow key={req.id} className="hover:bg-primary/5 transition-colors">
                            <TableCell className="pl-8 py-5">
                               <div className="space-y-0.5">
                                  <p className="font-medium text-xs">{req.candidateName || "Seeker"}</p>
                                  <p className="text-[9px] font-bold text-primary uppercase">+91 {req.phone}</p>
                               </div>
                            </TableCell>
                            <TableCell className="font-bold text-xs text-muted-foreground">{req.currentDesignation} ({req.currentDepartment})</TableCell>
                            <TableCell className="font-medium text-xs text-teal-700">{req.requestedDesignation} ({req.requestedDepartment})</TableCell>
                            <TableCell className="text-xs font-medium italic truncate max-w-[200px]">"{req.reason}"</TableCell>
                            <TableCell className="pr-8 text-right">
                               <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 rounded-lg h-8" onClick={() => setSelectedRoleRequest(req)}>Process Audit</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                   </TableBody>
                </Table>
             </Card>
          </TabsContent>

          <TabsContent value="financial-hub" className="mt-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <SearchBar value={financialSearchQuery} onChange={setFinancialSearchQuery} onClear={() => setFinancialSearchQuery("")} placeholder="Search by Reference / Factory..." />
            </div>
            {financialAnalytics && financialAnalytics.totalTransactions === 0 ? (
              <div className="py-20 text-center bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-primary/10">
                <IndianRupee className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-2xl font-medium text-muted-foreground">No financial transactions available yet</h3>
                <p className="text-sm font-medium text-muted-foreground/60 max-w-sm mx-auto mt-2">Revenue analytics will automatically populate once hiring packs are purchased.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Total Revenue", val: `₹${financialAnalytics?.totalRevenue.toLocaleString()}`, sub: "All time records", icon: IndianRupee, color: "border-green-600" },
                    { label: "This Year", val: `₹${financialAnalytics?.revenueYear.toLocaleString()}`, sub: `${format(new Date(), 'yyyy')}`, icon: ArrowUpRight, color: "border-indigo-600" },
                    { label: "This Month", val: `₹${financialAnalytics?.revenueMonth.toLocaleString()}`, sub: `${format(new Date(), 'MMMM yyyy')}`, icon: TrendingUp, color: "border-blue-600" },
                    { label: "Today's Intake", val: `₹${financialAnalytics?.revenueToday.toLocaleString()}`, sub: "Live updates", icon: Zap, color: "border-amber-50" },
                    { label: "Success Rate", val: `${financialAnalytics?.totalTransactions ? ((financialAnalytics.successfulCount / financialAnalytics.totalTransactions) * 100).toFixed(1) : 0}%`, sub: `${financialAnalytics?.successfulCount} Successful`, icon: CheckCircle2, color: "border-teal-500" }
                  ].map((s, i) => (
                    <Card key={i} className={cn("border-l-4 shadow-sm", s.color)}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-[10px] font-medium uppercase text-muted-foreground">{s.label}</CardTitle>
                          <s.icon className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-medium">{s.val}</div>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{s.sub}</p>
                        </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <Card className="lg:col-span-8 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-medium uppercase tracking-tight text-primary">Revenue Pulse</h3>
                            <p className="text-xs font-medium text-muted-foreground">30-Day Industrial Growth Trend</p>
                        </div>
                      </div>
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financialAnalytics?.areaData}>
                              <defs>
                                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0F52BA" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0F52BA" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} tickFormatter={(v) => `₹${v/1000}k`} />
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Revenue']}
                              />
                              <Area type="monotone" dataKey="revenue" stroke="#0F52BA" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                      </div>
                  </Card>

                  <Card className="lg:col-span-4 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                      <h3 className="text-xl font-medium uppercase tracking-tight text-primary mb-6">Plan Breakdown</h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie 
                                data={financialAnalytics?.pieData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                              >
                                {financialAnalytics?.pieData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                formatter={(v: any) => `₹${v.toLocaleString()}`}
                              />
                              <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', fontStyle: 'bold', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4 mt-8">
                        <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest border-b pb-2">Top Contributing Factories</p>
                        {financialAnalytics?.topContributors.map((c, i) => (
                          <div key={i} className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-medium">#{i+1}</div>
                                <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{c.name}</p>
                              </div>
                              <p className="text-sm font-medium text-primary">₹{c.total.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                  </Card>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="p-8 border-b bg-muted/10">
                      <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-medium uppercase tracking-tight text-primary">Industrial Ledger</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed Transaction History</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="rounded-xl px-4 py-2 border-primary/20 text-primary font-medium uppercase text-[10px]">
                              {financialAnalytics?.successfulCount} Paid
                            </Badge>
                            <Badge variant="outline" className="rounded-xl px-4 py-2 border-red-200 text-red-600 font-medium uppercase text-[10px]">
                              {financialAnalytics?.failedCount} Failed
                            </Badge>
                        </div>
                      </div>
                  </CardHeader>
                  <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="pl-8 font-medium uppercase text-[10px]">Reference ID</TableHead>
                            <TableHead className="font-medium uppercase text-[10px]">Factory Identity</TableHead>
                            <TableHead className="font-medium uppercase text-[10px]">Hiring Pack</TableHead>
                            <TableHead className="font-medium uppercase text-[10px]">Revenue</TableHead>
                            <TableHead className="font-medium uppercase text-[10px]">Status</TableHead>
                            <TableHead className="pr-8 text-right font-medium uppercase text-[10px]">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentsLoading ? (
                          <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                        ) : filteredFinancialActivities.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-bold italic">No financial records found.</TableCell></TableRow>
                        ) : (
                          filteredFinancialActivities.slice(0, 50).map((p, idx) => (
                            <TableRow key={p.id || idx} className="hover:bg-primary/5 transition-colors">
                              <TableCell className="pl-8 py-4">
                                  <p className="font-mono text-[10px] font-medium uppercase">{p.razorpayPaymentId || p.paymentId || p.id?.slice(0, 12) || "SIMULATED"}</p>
                              </TableCell>
                              <TableCell>
                                  <div className="space-y-0.5">
                                    <p className="font-medium text-xs">{p.employerName || "Unknown Unit"}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{p.employerId || p.uid}</p>
                                  </div>
                              </TableCell>
                              <TableCell>
                                  <Badge variant="outline" className="font-medium uppercase text-[9px] border-primary/10 text-primary">
                                    {p.planId || p.planType || 'Other'}
                                  </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-sm text-green-700">₹{p.amount?.toLocaleString()}</TableCell>
                              <TableCell>
                                  <Badge className={cn(
                                    "font-medium uppercase text-[9px] border-none",
                                    (p.paymentStatus === 'success' || p.status === 'paid' || p.paymentStatus === 'paid' || p.status === 'success') ? "bg-green-100 text-green-700" :
                                    (p.paymentStatus === 'failed' || p.status === 'failed') ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                  )}>
                                    {p.paymentStatus || p.status || 'Pending'}
                                  </Badge>
                              </TableCell>
                              <TableCell className="pr-8 text-right font-bold text-xs text-muted-foreground">
                                  {safeFormatDate(p.createdAt || p.date)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                  </Table>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="designation-registry" className="mt-6 space-y-6">
            <ErrorBoundary><DesignationRegistryTab db={db} /></ErrorBoundary>
          </TabsContent>

          <TabsContent value="branding-hub" className="mt-6 space-y-6">
             <Card className="rounded-[2.5rem] p-8 md:p-12 border-none shadow-xl bg-muted/20">
                <div className="max-w-6xl mx-auto space-y-10">
                   <div className="space-y-2">
                      <h2 className="text-3xl font-medium tracking-tight text-primary uppercase">Application Branding Hub</h2>
                      <p className="text-muted-foreground font-medium">Manage the global visual identity or define section-specific overrides for a tailored platform experience.</p>
                   </div>
                   <ErrorBoundary><BrandingHubTab db={db} /></ErrorBoundary>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="asset-hub" className="mt-6 space-y-6">
             <Card className="rounded-[2.5rem] p-8 md:p-12 border-none shadow-xl bg-muted/20">
                <div className="max-w-4xl mx-auto space-y-10">
                   <div className="space-y-2">
                      <h2 className="text-3xl font-semibold tracking-tight text-primary uppercase">Department & Track Asset Hub</h2>
                      <p className="text-muted-foreground font-medium text-sm">Dynamically manage and customize departments for IT, Tech & Internships and Skilled Trades & Daily Wages. Uploaded logos propagate platform-wide to Job Cards and Seeker Profiles.</p>
                   </div>
                   <ErrorBoundary><DepartmentAssetManagerTab db={db} /></ErrorBoundary>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="jobs-queue" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex bg-muted/40 p-1 rounded-2xl w-fit">
                <button onClick={() => setJobSubTab("pending")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", jobSubTab === 'pending' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Approval Queue ({stats.pendingJobs})</button>
                <button onClick={() => setJobSubTab("approved")} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", jobSubTab === 'approved' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Approved List ({stats.approvedJobs})</button>
              </div>
              <SearchBar value={jobsSearchQuery} onChange={setJobsSearchQuery} onClear={() => setJobsSearchQuery("")} placeholder="Search listings / factories..." />
            </div>
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/50 border-b-2">
                  <TableRow>
                    <TableHead className="font-bold border-r border-muted/50">Listing Title</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Factory</TableHead>
                    <TableHead className="text-right font-bold">Audit Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsLoading ? (
                    <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredJobsQueue.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-bold italic">No jobs matching "{jobsSearchQuery}" in this category.</TableCell></TableRow>
                  ) : (
                    filteredJobsQueue.map(j => (
                      <TableRow key={j.id} className="hover:bg-primary/5">
                        <TableCell className="font-medium border-r border-muted/30">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg overflow-hidden border shrink-0">
                               {j.companyLogoUrl ? <img src={j.companyLogoUrl} className="w-full h-full object-cover" /> : <Building className="w-full h-full p-1.5 bg-muted text-muted-foreground" />}
                             </div>
                             {j.jobTitle}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-muted-foreground border-r border-muted/30">{j.companyName}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                             {j.status === 'approved' && (
                               <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" onClick={() => handleWhatsappShare(j)}>
                                 <MessageCircle className="w-5 h-5" />
                               </button>
                             )}
                             <Button size="sm" variant="outline" onClick={() => setSelectedJob(j)} className="font-bold text-primary hover:text-primary active:text-primary rounded-lg transition-all border-primary/20 hover:bg-primary/5">
                               <Eye className="w-4 h-4 mr-2" /> Audit
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="job-lifecycle" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex bg-muted/40 p-1 rounded-2xl w-fit overflow-x-auto">
                {['all', 'active', 'closed', 'archived'].map((f: any) => (
                  <button key={f} onClick={() => setJobLifecycleFilter(f)} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap", jobLifecycleFilter === f ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>{f} Drives</button>
                ))}
              </div>
              <SearchBar value={lifecycleSearchQuery} onChange={setLifecycleSearchQuery} onClear={() => setLifecycleSearchQuery("")} placeholder="Search titles / factories..." />
            </div>

            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/50 border-b-2">
                  <TableRow>
                    <TableHead className="font-bold border-r border-muted/50">Drive Title & Factory</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Drive End Date</TableHead>
                    <TableHead className="font-bold text-center border-r border-muted/50">Applicants (T/S)</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Lifecycle</TableHead>
                    <TableHead className="text-right font-bold">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsLoading ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredLifecycleJobs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold italic">No listings found matching "{lifecycleSearchQuery}".</TableCell></TableRow>
                  ) : (
                    filteredLifecycleJobs.map((job: any) => {
                      const jobApps = (rawAdminApps || []).filter(a => a.jobId === job.id);
                      const shortlisted = jobApps.filter(a => a.status === 'shortlisted' || a.status === 'hired').length;
                      
                      return (
                        <TableRow key={job.id} className="hover:bg-primary/5 group">
                          <TableCell className="font-medium border-r border-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl border border-muted overflow-hidden shrink-0">
                                 {job.companyLogoUrl ? <img src={job.companyLogoUrl} className="w-full h-full object-cover" /> : <Building className="w-full h-full p-2 bg-muted text-muted-foreground" />}
                              </div>
                              <div>
                                {job.jobTitle}
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{job.companyName}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-sm border-r border-muted/30">
                            {job.interviewEndDate ? format(new Date(job.interviewEndDate), "dd MMM yyyy") : "N/A"}
                          </TableCell>
                          <TableCell className="text-center border-r border-muted/30">
                            <div className="flex flex-col items-center">
                               <span className="font-medium text-lg leading-none">{jobApps.length}</span>
                               <span className="text-[8px] font-medium text-green-600 uppercase mt-1">{shortlisted} SHORTLISTED</span>
                            </div>
                          </TableCell>
                          <TableCell className="border-r border-muted/30">
                            {job.status === 'closed' ? (
                               <Badge className="bg-red-100 text-red-700 border-none font-medium uppercase text-[9px]"><Power className="w-3 h-3 mr-1" /> {job.closedBy === 'admin' ? 'Admin Closed' : 'Owner Closed'}</Badge>
                            ) : job.status === 'archived' ? (
                              <Badge variant="outline" className="bg-muted text-muted-foreground border-none font-medium uppercase text-[9px]"><Archive className="w-3 h-3 mr-1" /> Archived</Badge>
                            ) : job.isAutoClosed ? (
                               <Badge className="bg-amber-100 text-amber-700 border-none font-medium uppercase text-[9px]"><Clock className="w-3 h-3 mr-1" /> Auto Closed</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-none font-medium uppercase text-[9px]"><Zap className="w-3 h-3 mr-1" /> Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" className="font-bold text-primary hover:text-primary active:text-primary focus:text-primary rounded-lg transition-all border-primary/20 hover:bg-primary/5" onClick={() => setSelectedJob(job)}>
                                  <Eye className="w-4 h-4 mr-2" /> Audit
                                </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="company-hub" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex bg-muted/40 p-1 rounded-2xl w-fit overflow-x-auto">
                {['all', 'pending', 'approved', 'suspended', 'rejected', 'location_requests'].map((s: any) => (
                  <button key={s} onClick={() => setCompanySubTab(s)} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap", companySubTab === s ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>
                    {s.replace('_', ' ')} {s === 'pending' ? `(${stats.pendingApprovals})` : s === 'location_requests' ? `(${stats.locationRequests})` : ''}
                  </button>
                ))}
              </div>
              <SearchBar value={companySearchQuery} onChange={setCompanySearchQuery} onClear={() => setCompanySearchQuery("")} placeholder="Search factory / area / phone..." />
            </div>

            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/50 border-b-2">
                  <TableRow>
                    <TableHead className="font-bold border-r border-muted/50">Factory Identity</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Verification Status</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Contact Person</TableHead>
                    <TableHead className="font-bold text-center border-r border-muted/50">Jobs (Total/Live)</TableHead>
                    <TableHead className="text-right font-bold">Audit Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : finalFilteredCompanies.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold italic">No companies matching "{companySearchQuery}" in "{companySubTab}" filter.</TableCell></TableRow>
                  ) : (
                    finalFilteredCompanies.map(c => {
                      const employerJobs = liveJobs.filter(j => j.employerId === c.id);
                      const liveEmployerJobs = employerJobs.filter(j => ['approved', 'live', 'open'].includes(j.status));
                      return (
                        <TableRow key={c.id} className="hover:bg-primary/5">
                          <TableCell className="font-medium border-r border-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl border border-muted overflow-hidden shrink-0">
                                {c.companyLogoUrl ? <img src={c.companyLogoUrl} className="w-full h-full object-cover" /> : <Building className="w-full h-full p-2 bg-muted text-muted-foreground" />}
                              </div>
                              <div>
                                {c.companyName || (c.role === 'employer' ? "Pending Brand Setup" : c.name)}
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{c.area || "Tirupur Hub"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="border-r border-muted/30">
                            <div className="flex flex-col gap-1">
                              <Badge className={cn(
                                "font-medium uppercase text-[9px] border-none w-fit",
                                c.status === 'approved' ? 'bg-green-100 text-green-700' :
                                c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                c.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                              )}>{c.status || 'Unknown'}</Badge>
                              {c.locationRequestStatus === 'change_requested' && (
                                <Badge className="bg-amber-500 text-white border-none font-medium uppercase text-[8px] animate-pulse">Loc Change</Badge>
                              )}
                              {c.nameRequestStatus === 'change_requested' && (
                                <Badge className="bg-indigo-500 text-white border-none font-medium uppercase text-[8px] animate-pulse">Name Change</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-sm border-r border-muted/30">
                            {c.contactPersonName || "N/A"}
                            <div className="text-[10px] text-primary font-medium">+91 {c.phone}</div>
                          </TableCell>
                          <TableCell className="text-center border-r border-muted/30">
                            <div className="flex flex-col items-center">
                               <span className="font-medium text-lg leading-none">{employerJobs.length}</span>
                               <span className="text-[8px] font-bold text-green-600 uppercase mt-1">{liveEmployerJobs.length} ACTIVE</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(c)} className="font-bold text-primary hover:text-primary active:text-primary focus:text-primary hover:bg-primary/5 transition-all">Manage Profile <ChevronRight className="ml-1 w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="identity-hub" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <SearchBar value={identitySearchQuery} onChange={setIdentitySearchQuery} onClear={() => setIdentitySearchQuery("")} placeholder="Search users / phones / IDs..." />
            </div>
             <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/50 border-b-2">
                  <TableRow>
                    <TableHead className="font-bold border-r border-muted/50">User Identity</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Classification</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Status</TableHead>
                    <TableHead className="text-right font-bold">Identity Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIdentityUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold italic">No matching users found.</TableCell></TableRow>
                  ) : (
                    filteredIdentityUsers.map(u => (
                    <TableRow key={u.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium border-r border-muted/30">
                         {u.companyName || u.name}
                         <div className="text-[10px] text-muted-foreground uppercase font-bold">
                            {u.role === 'employer' ? "Business Account" : "Seeker"} • +91 {u.phone}
                         </div>
                      </TableCell>
                      <TableCell className="border-r border-muted/30">
                        <div className="flex gap-2">
                           <Badge variant="outline" className="border-primary/20 text-primary font-medium uppercase text-[9px]">{u.role}</Badge>
                           {u.category && <Badge className="bg-muted text-foreground border-none font-medium text-[9px] uppercase">{u.category}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-muted/30">
                        <Badge className={cn(
                          "font-medium uppercase text-[9px] border-none",
                          u.status === 'suspended' ? 'bg-red-100 text-red-700' :
                          u.status === 'blocked' ? 'bg-black text-white' : 'bg-green-100 text-green-700'
                        )}>{u.status || 'Active'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/5 focus:text-primary active:text-primary transition-all" onClick={() => setSelectedUser(u)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50 transition-all" onClick={() => setDeletingUser(u)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: "Open (Candidates)", val: stats.openCandidateReports, icon: ShieldAlert, color: "bg-red-50 text-red-700" },
                 { label: "Under Review", val: stats.reviewCandidateReports, icon: Clock, color: "bg-amber-50 text-amber-700" },
                 { label: "Resolved", val: stats.resolvedCandidateReports, icon: CheckCircle2, color: "bg-green-50 text-green-700" },
                 { label: "Total Active", val: filteredReports.length, icon: Flag, color: "bg-primary/5 text-primary" }
               ].map((s, i) => (
                 <Card key={i} className={cn("border-none shadow-sm rounded-2xl p-4 flex items-center gap-3", s.color)}>
                    <s.icon className="w-5 h-5" />
                    <div>
                       <p className="text-[10px] font-medium uppercase tracking-wider">{s.label}</p>
                       <p className="text-lg font-medium">{s.val}</p>
                    </div>
                 </Card>
               ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex bg-muted/40 p-1 rounded-2xl w-fit">
                {['all', 'user', 'company'].map(s => (
                  <button key={s} onClick={() => setReportSubTab(s as any)} className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize", reportSubTab === s ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>
                    {s === 'user' ? 'Candidate Reports' : s === 'company' ? 'Job Reports' : 'All Reports'}
                  </button>
                ))}
              </div>
              <SearchBar value={reportsSearchQuery} onChange={setReportsSearchQuery} onClear={() => setReportsSearchQuery("")} placeholder="Search targets / reasons / IDs..." />
            </div>
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl">
              <Table className="border-collapse">
                <TableHeader className="bg-muted/50 border-b-2">
                  <TableRow>
                    <TableHead className="font-bold border-r border-muted/50">Incident Target</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Report Category</TableHead>
                    <TableHead className="font-bold text-center border-r border-muted/50">Total Claims</TableHead>
                    <TableHead className="font-bold border-r border-muted/50">Governance Status</TableHead>
                    <TableHead className="text-right font-bold">Enforcement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finalFilteredReports.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold italic">No matching reports found.</TableCell></TableRow>
                  ) : (
                    finalFilteredReports.map(group => (
                    <TableRow key={group.targetId} className={cn("hover:bg-red-50/30 transition-colors", group.targetType === 'user' && "bg-amber-50/10")}>
                      <TableCell className="font-medium border-r border-muted/30 py-5">
                        <div className="flex items-center gap-3">
                           {group.targetType === 'user' ? <UserX className="w-5 h-5 text-amber-600" /> : <Briefcase className="w-5 h-5 text-primary" />}
                           <div>
                              {group.targetName}
                              <div className="text-[10px] text-muted-foreground font-medium uppercase">ID: {group.targetId.slice(0, 8)}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-muted/30">
                        <Badge variant="outline" className={cn(
                          "capitalize font-bold px-3 py-1 rounded-lg border-none",
                          group.targetType === 'user' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                        )}>
                          {group.targetType === 'user' ? 'Candidate Report' : 'Listing Incident'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center border-r border-muted/30">
                        <Badge className={cn("rounded-full h-7 w-7 flex items-center justify-center font-medium", group.reports.length > 2 ? "bg-red-600 text-white" : "bg-muted text-foreground")}>{group.reports.length}</Badge>
                      </TableCell>
                      <TableCell className="border-r border-muted/30">
                         <Badge className={cn(
                           "font-medium uppercase text-[9px] border-none px-2",
                           group.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                           group.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                           'bg-green-100 text-green-700'
                         )}>{group.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 focus:text-primary active:text-primary transition-all font-bold" onClick={() => setSelectedReportGroup(group)}>Audit History <ChevronRight className="ml-1 w-4 h-4" /></Button></TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        {!user || !isActuallyAdmin ? <div className="p-20 text-center"><ShieldBan className="mx-auto w-12 h-12 text-destructive mb-4" /><h2 className="text-2xl font-medium">Access Denied</h2><Button className="mt-4" onClick={() => router.push('/auth/login')}>Login as Admin</Button></div> : null}
      </main>

      <Dialog open={!!selectedUser} onOpenChange={o => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-5xl rounded-[2.5rem] p-0 border-none shadow-2xl flex flex-col h-[90vh] print-area print:h-auto print:block">
          {/* HIDDEN RESUME FOR PDF CAPTURE */}
          <div className="absolute opacity-0 pointer-events-none -z-50" style={{ width: '210mm' }}>
            <div ref={resumeRef}>
              <PrintProfile user={selectedUser} />
            </div>
          </div>

          <DialogHeader className={cn("p-8 text-white shrink-0", selectedUser?.role === 'employer' ? "bg-accent" : "bg-primary")}>
             <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10 shrink-0">
                         {selectedUser?.companyLogoUrl ? <img src={selectedUser.companyLogoUrl} className="w-full h-full object-cover" /> : <Building className="w-full h-full p-4 text-white/40" />}
                      </div>
                      <div>
                        <DialogTitle className="text-4xl font-medium tracking-tight">{selectedUser?.companyName || selectedUser?.name}</DialogTitle>
                        <DialogTitle className="text-white/80 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Comprehensive Administrative Audit
                        </DialogTitle>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  {(selectedUser?.photo || selectedUser?.digitalResume?.personal?.profileImage) && (
                     <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl">
                        <img src={selectedUser.photo || selectedUser.digitalResume?.personal?.profileImage} className="w-full h-full object-contain" />
                     </div>
                  )}
                </div>
             </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
             <TabsList className="bg-muted px-8 h-12 rounded-none border-b shrink-0 print:hidden">
                <TabsTrigger value="overview" className="font-medium text-[10px] uppercase tracking-widest px-6">Identity Control</TabsTrigger>
                {selectedUser?.role === 'employer' && <TabsTrigger value="company-profile" className="font-medium text-[10px] uppercase tracking-widest px-6">Company Dossier</TabsTrigger>}
                {selectedUser?.role === 'job_seeker' && <TabsTrigger value="resume" className="font-medium text-[10px] uppercase tracking-widest px-6">Professional Resume</TabsTrigger>}
             </TabsList>
             
             <ScrollArea className="flex-1 p-8">
                <TabsContent value="overview" className="m-0 space-y-10">
                   <section className="space-y-6 break-inside-avoid">
                      <h4 className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-2 border-b pb-1"><Lock className="w-4 h-4" /> Identity Locking</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Global Role</Label>
                            <Select value={selectedUser?.role} onValueChange={v => setConfirmAction({ type: 'update', coll: 'Users', id: selectedUser.id, data: { role: v } })}>
                              <SelectTrigger className="h-12 rounded-xl font-medium bg-muted/20 border-none shadow-sm"><SelectValue /></SelectTrigger>
                              <SelectContent className="font-bold"><SelectItem value="job_seeker">Job Seeker</SelectItem><SelectItem value="employer">Employer</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Industrial Status</Label>
                            <Select value={selectedUser?.status} onValueChange={v => setConfirmAction({ type: 'update', coll: 'Users', id: selectedUser.id, data: { status: v } })}>
                              <SelectTrigger className="h-12 rounded-xl font-medium bg-muted/20 border-none shadow-sm"><SelectValue /></SelectTrigger>
                              <SelectContent className="font-bold"><SelectItem value="approved">Approved</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="blocked">Blocked</SelectItem></SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Account Created</Label>
                            <div className="h-12 flex items-center px-4 rounded-xl bg-muted/20 text-sm font-medium italic text-muted-foreground">
                               {isValid(selectedUser?.createdAt?.toDate?.()) ? format(selectedUser.createdAt.toDate(), "dd MMM yyyy") : "N/A"}
                            </div>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Date of Birth</Label>
                            <div className="h-12 flex items-center px-5 bg-muted/10 rounded-xl font-bold border border-dashed">{safeFormatDateOnly(selectedUser?.dob)}</div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gender</Label>
                            <div className="h-12 flex items-center px-4 rounded-xl bg-muted/10 font-bold border border-dashed capitalize">{selectedUser?.gender || "Not Specified"}</div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Registered Full Address</Label>
                            <div className="h-16 flex items-center px-4 rounded-xl bg-muted/10 font-bold border border-dashed text-sm leading-snug">{selectedUser?.fullAddress || "N/A"}</div>
                        </div>
                      </div>
                   </section>

                   {selectedUser?.role === 'employer' && selectedUser?.pendingLocationChange && (
                     <section className="space-y-6 break-inside-avoid animate-in fade-in slide-in-from-top-4 duration-500">
                        <h4 className="text-xs font-medium uppercase text-amber-600 flex items-center gap-2 border-b border-amber-200 pb-1"><Navigation className="w-4 h-4" /> Pending Location Update</h4>
                        <Card className="border-2 border-amber-200 bg-amber-50 shadow-lg p-6 rounded-[2rem] space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                 <div><p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Current Registered Address</p><p className="text-xs font-bold text-muted-foreground bg-white/50 p-3 rounded-xl border border-muted/50">{selectedUser.fullAddress}</p></div>
                                 <div className="flex gap-4">
                                    <div><p className="text-[8px] font-medium text-muted-foreground uppercase">Lat</p><p className="font-mono text-xs">{selectedUser.latitude?.toFixed(4)}</p></div>
                                    <div><p className="text-[8px] font-medium text-muted-foreground uppercase">Lng</p><p className="font-mono text-xs">{selectedUser.longitude?.toFixed(4)}</p></div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div><p className="text-[10px] font-medium text-amber-700 uppercase mb-1">Requested New Address</p><p className="text-xs font-bold text-amber-900 bg-white p-3 rounded-xl border-2 border-amber-300 shadow-sm">{selectedUser.pendingLocationChange.fullAddress}</p></div>
                                 <div className="flex gap-4">
                                    <div><p className="text-[8px] font-medium text-amber-700 uppercase">Lat</p><p className="font-mono text-xs font-medium">{selectedUser.pendingLocationChange.latitude?.toFixed(4)}</p></div>
                                    <div><p className="text-[8px] font-medium text-amber-700 uppercase">Lng</p><p className="font-mono text-xs font-medium">{selectedUser.pendingLocationChange.longitude?.toFixed(4)}</p></div>
                                 </div>
                              </div>
                           </div>
                           <div className="pt-4 border-t border-amber-200">
                              <Label className="text-[10px] font-medium uppercase text-amber-800">Employer's Stated Reason</Label>
                              <p className="text-sm font-medium italic text-amber-900 mt-1 leading-relaxed">"{selectedUser.pendingLocationChange.reason}"</p>
                           </div>
                           <div className="flex gap-4 pt-2">
                              <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium h-12 rounded-xl shadow-lg active:scale-95 transition-all" onClick={() => setConfirmAction({ type: 'approve-location', id: selectedUser.id })}>Approve Relocation</Button>
                              <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-medium h-12 rounded-xl active:scale-95 transition-all" onClick={() => setConfirmAction({ type: 'reject-location', id: selectedUser.id })}>Reject Request</Button>
                           </div>
                        </Card>
                     </section>
                   )}
                   
                   <section className="space-y-6 break-inside-avoid">
                      <h4 className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-2 border-b pb-1"><Smartphone className="w-4 h-4" /> Verified Communication</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-muted/10 p-5 rounded-2xl border border-dashed border-muted/50 flex justify-between items-center print:bg-transparent">
                            <div><p className="text-[10px] font-medium text-muted-foreground uppercase">Mobile Registry</p><p className="font-medium text-xl text-primary">+91 {selectedUser?.phone}</p></div>
                            <Button variant="ghost" size="icon" className="text-green-600 h-10 w-10 bg-green-50 rounded-xl hover:text-green-700 active:scale-95 transition-all print:hidden" onClick={() => window.open(`tel:${selectedUser.phone}`)}><PhoneCall className="w-5 h-5" /></Button>
                         </div>
                         <div className="bg-muted/10 p-5 rounded-2xl border border-dashed border-muted/50 flex justify-between items-center print:bg-transparent">
                            <div><p className="text-[10px] font-medium text-muted-foreground uppercase">Email Record</p><p className="font-medium text-xl text-primary truncate">{selectedUser?.email || "N/A"}</p></div>
                            <Button variant="ghost" size="icon" className="text-blue-600 h-10 w-10 bg-blue-50 rounded-xl hover:text-blue-700 active:scale-95 transition-all print:hidden" onClick={() => window.open(`mailto:${selectedUser.email}`)}><Mail className="w-5 h-5" /></Button>
                         </div>
                      </div>
                   </section>
                </TabsContent>

                <TabsContent value="company-profile" className="m-0 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <section className="space-y-6 break-inside-avoid">
                         <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-1">Firm Credentials</h4>
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div><Label className="text-xs font-bold text-muted-foreground uppercase">Business Name</Label><p className="font-medium">{selectedUser?.companyName || selectedUser?.name || "N/A"}</p></div>
                               <div><Label className="text-xs font-bold text-muted-foreground uppercase">Est. Year</Label><p className="font-medium">{selectedUser?.establishedYear || "N/A"}</p></div>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-xl border border-dashed border-muted/50 flex justify-between items-center print:bg-transparent">
                               <div><Label className="text-xs font-bold text-muted-foreground uppercase">GST Number</Label><p className="font-medium font-mono text-lg tracking-widest">{selectedUser?.gst || "MISSING"}</p></div>
                               <Button variant="ghost" size="sm" className="h-8 rounded-lg text-primary hover:text-primary hover:bg-primary/5 transition-all print:hidden" onClick={() => { navigator.clipboard.writeText(selectedUser?.gst); toast({title:"Copied"}); }}><Copy className="w-4 h-4" /></Button>
                            </div>
                            <div className="group/loc cursor-pointer" onClick={() => handleOpenUserLocation(selectedUser)}>
                              <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                Industrial Area <Navigation className="w-3 h-3 text-primary opacity-0 group-hover/loc:opacity-100 transition-opacity" />
                              </Label>
                              <p className="font-medium group-hover/loc:text-primary transition-colors underline decoration-primary/20 underline-offset-4 decoration-dashed">
                                {translateLocation(selectedUser?.area, t) || "N/A"}
                              </p>
                            </div>
                            <div className="relative group/loc cursor-pointer" onClick={() => handleOpenUserLocation(selectedUser)}>
                               <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                 Full Plant Address <MapPin className="w-3 h-3 text-primary opacity-0 group-hover/loc:opacity-100 transition-opacity" />
                               </Label>
                               <p className="text-sm font-bold leading-relaxed group-hover/loc:text-primary transition-colors underline decoration-primary/20 underline-offset-4 decoration-dashed">
                                 {selectedUser?.fullAddress || "N/A"}
                               </p>
                               <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-primary">
                                  <LocateFixed className="w-3.5 h-3.5" /> GPS Verified: {selectedUser?.latitude?.toFixed(4)}, {selectedUser?.longitude?.toFixed(4)}
                               </div>
                            </div>
                         </div>
                      </section>

                      <section className="space-y-6 break-inside-avoid">
                         <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-1">Management Profile</h4>
                         <div className="space-y-4">
                            <div><Label className="text-xs font-bold text-muted-foreground uppercase">Point of Contact</Label><p className="font-medium text-lg">{selectedUser?.contactPersonName || "N/A"}</p></div>
                            <div><Label className="text-xs font-bold text-muted-foreground uppercase">Designation</Label><p className="font-bold text-primary">{selectedUser?.designation || "N/A"}</p></div>
                            <div className="pt-4">
                               <Label className="text-xs font-bold text-muted-foreground uppercase">Branding & Proof</Label>
                               <div className="grid grid-cols-2 gap-4 mt-2">
                                  {selectedUser?.companyLogoUrl ? (
                                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-muted shadow-sm print:shadow-none">
                                       <img src={selectedUser.companyLogoUrl} className="w-full h-full object-cover" alt="Company Logo" />
                                       <p className="text-[8px] font-medium text-center uppercase bg-muted py-1 print:hidden">Brand Logo</p>
                                    </div>
                                  ) : (
                                    <div className="aspect-square rounded-2xl bg-muted/30 border border-dashed border-muted/50 flex items-center justify-center text-[10px] text-muted-foreground print:hidden">No Logo</div>
                                  )}
                                  {selectedUser?.photo ? (
                                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-muted shadow-sm print:shadow-none">
                                       <img src={selectedUser.photo} className="w-full h-full object-cover" alt="Factory Gate" />
                                       <p className="text-[8px] font-medium text-center uppercase bg-muted py-1 print:hidden">Gate Proof</p>
                                    </div>
                                  ) : (
                                    <div className="aspect-square rounded-2xl bg-muted/30 border border-dashed border-muted/50 flex items-center justify-center text-[10px] text-muted-foreground print:hidden">No Photo</div>
                                  )}
                               </div>
                            </div>
                         </div>
                      </section>
                   </div>
                </TabsContent>

                <TabsContent value="resume" className="m-0 space-y-10">
                   <div className="print:hidden space-y-12">
                    <section className="space-y-6 break-inside-avoid">
                      <h4 className="text-xs font-medium uppercase text-primary border-b-2 border-primary/10 pb-1 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Industrial Profile</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-5 bg-primary/5 rounded-2xl border border-dashed border-primary/20 space-y-1">
                            <Label className="text-[10px] font-medium uppercase opacity-60">Global Category</Label>
                            <p className="font-medium text-lg">{selectedUser?.category}</p>
                         </div>
                         <div className="p-5 bg-primary/5 rounded-2xl border border-dashed border-primary/20 space-y-1">
                            <Label className="text-[10px] font-medium uppercase opacity-60">Total Experience</Label>
                            <p className="font-medium text-lg">{selectedUser?.experience || selectedUser?.digitalResume?.professional?.totalExperience || "0"} Years</p>
                         </div>
                      </div>
                    </section>

                    {selectedUser?.category === 'Technical' && (
                      <section className="space-y-6 break-inside-avoid pt-6 border-t-2 border-dashed">
                        <h4 className="text-xs font-medium uppercase text-primary border-b-2 border-primary/10 pb-1 flex items-center gap-2"><Zap className="w-4 h-4" /> Technical Assets</h4>
                        <div className="grid grid-cols-1 gap-6">
                          <div className="bg-primary/5 p-6 rounded-[2rem] border border-dashed border-primary/20 space-y-2">
                            <Label className="text-[10px] font-medium uppercase text-primary/60">Buyers Handled</Label>
                            <p className="text-sm font-bold text-foreground">{selectedUser?.digitalResume?.professional?.buyersHandled || "N/A"}</p>
                          </div>
                          <div className="bg-primary/5 p-6 rounded-[2rem] border border-dashed border-primary/20 space-y-2">
                            <Label className="text-[10px] font-medium uppercase text-primary/60">Audit Experience</Label>
                            <p className="text-sm font-bold text-foreground">{selectedUser?.digitalResume?.professional?.auditExperience || "N/A"}</p>
                          </div>
                          <div className="bg-blue-50 p-6 rounded-[2rem] border border-dashed border-blue-200 space-y-2">
                            <Label className="text-[10px] font-medium uppercase text-blue-800/60">Computer & Software Skills</Label>
                            <p className="text-sm font-bold text-blue-900">{selectedUser?.digitalResume?.professional?.certifications || "N/A"}</p>
                          </div>
                          <div className="bg-accent/5 p-6 rounded-[2rem] border border-dashed border-accent/20 space-y-3">
                            <Label className="text-[10px] font-medium uppercase text-accent/60">Core Skills</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedUser?.digitalResume?.professional?.coreSkills?.map((s: string) => <Badge key={s} className="bg-accent text-white border-none font-bold">{s}</Badge>) || <p className="text-xs italic text-muted-foreground">No specific skills listed.</p>}
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    <section className="space-y-4 break-inside-avoid">
                      <h4 className="text-xs font-medium uppercase text-primary border-b-2 border-primary/10 pb-1 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Academic Records</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedUser?.digitalResume?.academic?.map((edu: any, i: number) => (
                          <div key={i} className="bg-muted/5 p-4 rounded-2xl border border-muted/50 flex gap-4 print:bg-transparent break-inside-avoid w-full">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><CheckCircle className="w-5 h-5" /></div>
                             <div>
                                <p className="text-[10px] font-medium uppercase text-primary">{edu.education}</p>
                                <p className="font-medium leading-none mb-1">{edu.degree}</p>
                                <p className="text-xs font-bold text-muted-foreground">{edu.institute}</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">Class of {edu.year}</p>
                             </div>
                          </div>
                        )) || <p className="italic text-muted-foreground p-4">No records provided.</p>}
                      </div>
                    </section>

                    {selectedUser?.digitalResume?.recentCompany?.length > 0 && (
                      <section className="space-y-6 break-inside-avoid pt-6 border-t-2 border-dashed">
                        <h4 className="text-xs font-medium uppercase text-primary border-b-2 border-primary/10 pb-1 flex items-center gap-2"><History className="w-4 h-4" /> Employment History</h4>
                        <div className="space-y-4">
                           {selectedUser.digitalResume.recentCompany.map((job: any, i: number) => (
                             <Card key={i} className="bg-muted/5 border-none shadow-none p-5 rounded-2xl border border-muted/50">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                     <p className="font-medium text-primary text-lg">{job.name}</p>
                                     <p className="text-xs font-bold text-muted-foreground uppercase">{job.position}</p>
                                  </div>
                                  <Badge variant="outline" className="text-[9px] font-medium">{job.startDate} — {job.endDate}</Badge>
                               </div>
                               {job.remarks && <p className="text-xs italic text-muted-foreground border-t pt-2 mt-2">"{job.remarks}"</p>}
                             </Card>
                           ))}
                        </div>
                      </section>
                    )}

                    {selectedUser?.digitalResume?.references?.length > 0 && (
                      <section className="space-y-6 break-inside-avoid pt-6 border-t-2 border-dashed">
                        <h4 className="text-xs font-medium uppercase text-primary border-b-2 border-primary/10 pb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Professional References</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {selectedUser.digitalResume.references.map((ref: any, i: number) => (
                             <Card key={i} className="bg-muted/5 border-none shadow-none p-5 rounded-2xl border border-muted/50">
                               <p className="font-medium text-primary">{ref.name}</p>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">{ref.designation} • {ref.company}</p>
                               <div className="space-y-1 mt-2">
                                 <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <Smartphone className="w-3.5 h-3.5" /> +91 {ref.contact}
                                 </div>
                                 {ref.email && <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {ref.email}</div>}
                               </div>
                               <div className="mt-3 pt-2 border-t border-dashed">
                                  <p className="text-[10px] font-medium text-primary uppercase">{ref.relationship || "Reference"}</p>
                                  <p className="text-[11px] italic text-muted-foreground mt-1">"{ref.remarks || "No specific remarks provided."}"</p>
                               </div>
                             </Card>
                           ))}
                        </div>
                      </section>
                    )}
                   </div>
                </TabsContent>
             </ScrollArea>
          </Tabs>

          <DialogFooter className="p-8 bg-muted/20 border-t flex flex-wrap gap-4 shrink-0 print:hidden">
             <Button variant="ghost" onClick={() => setSelectedUser(null)} className="flex-1 font-bold h-14 rounded-2xl min-w-[140px] hover:bg-white hover:text-primary focus:text-primary transition-all">Dismiss Auditor</Button>
             
             {selectedUser?.role === 'job_seeker' && (
               <div className="flex-[2] flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleViewPDF} 
                    className="flex-1 font-bold text-primary hover:text-primary active:text-primary h-14 px-6 rounded-xl border-primary/20 hover:bg-primary/5 transition-all gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Complete PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadPDF} 
                    className="flex-1 font-bold text-primary hover:text-primary active:text-primary h-14 px-6 rounded-xl border-primary/20 hover:bg-primary/5 transition-all gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Resume (PDF)
                  </Button>
               </div>
             )}

             {selectedUser?.status !== 'approved' && (
               <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-2xl shadow-xl min-w-[140px] active:scale-95 transition-all" onClick={() => setConfirmAction({ type: 'update', coll: 'Users', id: selectedUser.id, data: { status: 'approved' } })}>Approve User</Button>
             )}
             {selectedUser?.status !== 'suspended' && (
               <Button variant="destructive" className="flex-1 font-medium h-14 rounded-2xl shadow-lg min-w-[140px] active:scale-95 transition-all" onClick={() => setConfirmAction({ type: 'update', coll: 'Users', id: selectedUser.id, data: { status: 'suspended' } })}>Suspend Account</Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedJob} onOpenChange={o => !o && setSelectedJob(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[85vh]">
           <DialogHeader className={cn("p-8 text-white shrink-0", isEditingJob ? "bg-indigo-600" : "bg-primary")}>
             <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 overflow-hidden shadow-xl shrink-0">
                         {selectedJob?.companyLogoUrl ? <img src={selectedJob.companyLogoUrl} className="w-full h-full object-cover" alt="Company Logo" /> : <Building2 className="w-7 h-7 text-white/40" />}
                      </div>
                      <div>
                        {isEditingJob ? (
                          <div className="space-y-2">
                            <Label className="text-[10px] font-medium uppercase text-white/60">Intervention: Listing Title</Label>
                            <Input 
                              value={editedJob?.jobTitle} 
                              onChange={e => handleEditJobField('jobTitle', e.target.value)}
                              className="h-10 bg-white/10 border-white/20 text-white font-medium text-xl placeholder:text-white/40 focus-visible:ring-white/30"
                            />
                          </div>
                        ) : (
                          <>
                            <DialogTitle className="text-3xl font-medium tracking-tight">{selectedJob?.jobTitle}</DialogTitle>
                            <DialogDescription className="text-primary-foreground/80 font-bold uppercase text-xs tracking-widest flex items-center gap-2 mt-1">
                              <Building2 className="w-3.5 h-3.5" /> {selectedJob?.companyName} • Job Moderation
                            </DialogDescription>
                          </>
                        )}
                      </div>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-medium px-4 py-2 rounded-xl h-fit">
                      {selectedJob?.status?.toUpperCase()}
                   </Badge>
                   {isEditingJob && (
                     <Badge className="bg-yellow-400 text-yellow-900 border-none font-medium uppercase text-[8px] animate-pulse">Admin Edit Active</Badge>
                   )}
                </div>
             </div>
           </DialogHeader>

           <ScrollArea className="flex-1 p-8">
              <div className="grid grid-cols-1 gap-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-6">
                       <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Classification</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50">
                             <Label className="text-[9px] font-medium uppercase opacity-60">Category</Label>
                             {isEditingJob ? (
                               <Select value={editedJob?.category} onValueChange={v => handleEditJobField('category', v)}>
                                  <SelectTrigger className="h-8 text-xs font-bold border-none bg-white/50"><SelectValue /></SelectTrigger>
                                  <SelectContent className="font-bold"><SelectItem value="Technical">Staff</SelectItem><SelectItem value="Non-Technical">Worker</SelectItem></SelectContent>
                               </Select>
                             ) : <p className="font-bold text-sm">{selectedJob?.category}</p>}
                          </div>
                          <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50">
                             <Label className="text-[9px] font-medium uppercase opacity-60">Department</Label>
                             {isEditingJob ? (
                               <Select value={editedJob?.department} onValueChange={v => handleEditJobField('department', v)}>
                                  <SelectTrigger className="h-8 text-xs font-bold border-none bg-white/50"><SelectValue /></SelectTrigger>
                                  <SelectContent className="font-bold max-h-60">
                                    {(CLASSIFICATION[editedJob?.category as "Technical" | "Non-Technical"] || CLASSIFICATION.Technical).departments.map((d: any) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                               </Select>
                             ) : <p className="font-bold text-sm">{selectedJob?.department}</p>}
                          </div>
                          <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50 col-span-2">
                             <Label className="text-[9px] font-medium uppercase opacity-60">Designation</Label>
                             {isEditingJob ? (
                               <Select value={editedJob?.designation} onValueChange={v => handleEditJobField('designation', v)}>
                                  <SelectTrigger className="h-8 text-xs font-bold border-none bg-white/50"><SelectValue /></SelectTrigger>
                                  <SelectContent className="font-bold max-h-60">
                                    {editedDesignations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                               </Select>
                             ) : <p className="font-bold text-sm text-primary">{selectedJob?.designation}</p>}
                          </div>
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Economics & Quota</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50">
                            <Label className="text-[9px] font-medium uppercase opacity-60">Salary Range</Label>
                            {isEditingJob ? (
                              <div className="flex gap-1 items-center">
                                <Input value={editedJob?.salaryMin} onChange={e => handleEditJobField('salaryMin', e.target.value)} className="h-7 text-xs font-bold p-1 bg-white/50" />
                                <span>-</span>
                                <Input value={editedJob?.salaryMax} onChange={e => handleEditJobField('salaryMax', e.target.value)} className="h-7 text-xs font-bold p-1 bg-white/50" />
                              </div>
                            ) : (
                              <p className="font-medium text-sm">
                                {selectedJob?.salaryBasis === 'piece' ? 'Piece Rate' : `₹${selectedJob?.salaryMin?.toLocaleString()} - ${selectedJob?.salaryMax?.toLocaleString()}`}
                              </p>
                            )}
                          </div>
                          <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50">
                             <Label className="text-[9px] font-medium uppercase opacity-60">Salary Basis / Payout</Label>
                             {isEditingJob ? (
                               <div className="space-y-1">
                                 <Select value={editedJob?.salaryBasis} onValueChange={v => handleEditJobField('salaryBasis', v)}>
                                    <SelectTrigger className="h-7 text-[10px] font-bold border-none bg-white/50"><SelectValue /></SelectTrigger>
                                    <SelectContent className="font-bold"><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="shift">Per Shift</SelectItem><SelectItem value="piece">Piece Rate</SelectItem></SelectContent>
                                 </Select>
                                 <Input value={editedJob?.payoutSchedule} onChange={e => handleEditJobField('payoutSchedule', e.target.value)} className="h-7 text-[10px] font-bold p-1 bg-white/50" placeholder="Payout" />
                               </div>
                             ) : <p className="font-bold text-sm uppercase">{selectedJob?.salaryBasis} / {selectedJob?.payoutSchedule || "N/A"}</p>}
                          </div>
                          <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50">
                             <Label className="text-[9px] font-medium uppercase opacity-60">Openings</Label>
                             {isEditingJob ? (
                               <Input type="number" value={editedJob?.openings} onChange={e => handleEditJobField('openings', e.target.value)} className="h-8 text-sm font-bold bg-white/50" />
                             ) : <p className="font-bold text-sm">{selectedJob?.openings} Seats</p>}
                          </div>
                          <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-muted/50">
                             <Label className="text-[9px] font-medium uppercase opacity-60">Exp. Required</Label>
                             {isEditingJob ? (
                               <Input type="number" value={editedJob?.experienceRequired} onChange={e => handleEditJobField('experienceRequired', e.target.value)} className="h-8 text-sm font-bold bg-white/50" />
                             ) : <p className="font-bold text-sm">{selectedJob?.experienceRequired}+ Yrs</p>}
                          </div>
                       </div>
                    </section>
                 </div>

                 <section className="space-y-6">
                    <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Industrial Logistics & Scheduling</h4>
                    <div className="bg-muted/20 p-5 rounded-2xl space-y-4">
                       <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                             <Label className="text-[10px] font-medium uppercase opacity-60">Registered Address</Label>
                             {isEditingJob ? (
                               <Input value={editedJob?.location} onChange={e => handleEditJobField('location', e.target.value)} className="h-10 text-sm font-bold bg-white/50" />
                             ) : <p className="font-bold text-sm leading-relaxed">{selectedJob?.location}</p>}
                          </div>
                          {!isEditingJob && (
                            <Button variant="outline" size="sm" className="rounded-xl font-bold border-primary text-primary" onClick={() => window.open(`https://www.google.com/maps?q=${selectedJob?.latitude},${selectedJob?.longitude}`, '_blank')}>
                               <LocateFixed className="w-3.5 h-3.5 mr-1.5" /> View GPS
                            </Button>
                          )}
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                         <div className="space-y-1">
                            <Label className="text-[9px] font-medium uppercase opacity-60 flex items-center gap-1.5"><Clock className="w-3" /> Shift Pattern</Label>
                            {isEditingJob ? (
                              <Input value={editedJob?.shiftTiming} onChange={e => handleEditJobField('shiftTiming', e.target.value)} className="h-8 text-xs font-bold bg-white/50" />
                            ) : <p className="text-sm font-bold text-primary">{selectedJob?.salaryBasis === 'piece' ? 'N/A' : formatShiftTiming(selectedJob?.shiftTiming || selectedJob?.interviewTimings)}</p>}
                         </div>
                         {selectedJob?.interviewStartDate && (
                           <div className="space-y-1">
                              <Label className="text-[9px] font-medium uppercase opacity-60 flex items-center gap-1.5"><CalendarCheck className="w-3 h-3" /> Drive Window</Label>
                              <p className="text-sm font-bold">{format(new Date(selectedJob.interviewStartDate), "dd MMM")} {selectedJob.interviewEndDate ? `to ${format(new Date(selectedJob.interviewEndDate), "dd MMM yyyy")}` : ""}</p>
                           </div>
                         )}
                         {selectedJob?.autoCloseDate && (
                           <div className="space-y-1">
                              <Label className="text-[9px] font-medium uppercase opacity-60 flex items-center gap-1.5"><Timer className="w-3 h-3" /> Auto Expiry</Label>
                              <p className="text-sm font-bold text-amber-700">{format(new Date(selectedJob.autoCloseDate), "dd MMM yyyy")}</p>
                           </div>
                         )}
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /> Welfare & Benefits</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                       {[
                          { id: 'esi', label: 'ESI & EPF', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                          { id: 'attendance_incentive', label: 'Attendance', icon: <Timer className="w-3.5 h-3.5" /> },
                          { id: 'overtime_pay', label: 'Overtime Pay', icon: <Clock className="w-3.5 h-3.5" /> },
                          { id: 'production_incentive', label: 'Production', icon: <Zap className="w-3.5 h-3.5" /> },
                          { id: 'referral_bonus', label: 'Referral Bonus', icon: <Users className="w-3.5 h-3.5" /> },
                          { id: 'transport', label: 'Free Transport', icon: <Bus className="w-3.5 h-3.5" /> },
                          { id: 'bachelor_accommodation', label: 'Bachelor Host', icon: <Home className="w-3.5 h-3.5" /> },
                          { id: 'family_accommodation', label: 'Family Host', icon: <Home className="w-3.5 h-3.5" /> },
                          { id: 'food', label: 'Free Meals', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
                          { id: 'mobile_allowance', label: 'Mobile Allw.', icon: <Smartphone className="w-3.5 h-3.5" /> },
                          { id: 'petrol_allowance', label: 'Petrol Allw.', icon: <Navigation className="w-3.5 h-3.5" /> },
                          { id: 'skill_training', label: 'Skill Training', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                          { id: 'teaCash', label: 'Tea Cash', icon: <Coffee className="w-3.5 h-3.5" /> },
                          { id: 'bonusEnabled', label: 'Bonus / Gift', icon: <Gift className="w-3.5 h-3.5" /> },
                          { id: 'accommodation', label: 'Accommodation', icon: <Home className="w-3.5 h-3.5" /> },
                       ].map(benefit => {
                          const isActive = isEditingJob ? editedJob?.benefits?.[benefit.id] : selectedJob?.benefits?.[benefit.id];
                          const bData = isEditingJob ? editedJob?.benefits : selectedJob?.benefits;
                          
                          let displayLabel = benefit.label;
                          if (benefit.id === 'bonusEnabled' && bData?.bonusValue) {
                             displayLabel += ` (${bData.bonusType === 'percentage' ? `${bData.bonusValue}%` : `₹${bData.bonusValue}`})`;
                          }

                          return (
                            <div key={benefit.id} className={cn(
                              "flex items-center gap-2 p-3 rounded-xl border transition-all",
                              isActive 
                                ? "bg-primary/5 border-primary/20 text-primary shadow-sm" 
                                : "bg-muted/5 border-muted-foreground/10 text-muted-foreground/40 opacity-50 grayscale",
                              isEditingJob && "cursor-pointer hover:bg-primary/10"
                            )} onClick={() => isEditingJob && handleEditJobField('benefits', { ...editedJob.benefits, [benefit.id]: !editedJob.benefits?.[benefit.id] })}>
                               {benefit.icon}
                               <span className="font-medium text-[9px] uppercase tracking-tighter">{displayLabel}</span>
                            </div>
                          );
                       })}
                    </div>

                    {isEditingJob && editedJob?.benefits?.bonusEnabled && (
                      <div className="mt-4 p-4 bg-indigo-50/30 rounded-2xl border border-dashed border-indigo-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                         <p className="text-[10px] font-medium uppercase text-indigo-600 tracking-widest">Bonus Configuration (Optional)</p>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <Label className="text-[8px] font-medium uppercase opacity-60">Type</Label>
                               <Select 
                                  value={editedJob?.benefits?.bonusType || 'percentage'} 
                                  onValueChange={v => handleEditJobField('benefits', { ...editedJob.benefits, bonusType: v })}
                               >
                                  <SelectTrigger className="h-7 text-[10px] font-bold border-none bg-white/50"><SelectValue /></SelectTrigger>
                                  <SelectContent className="font-bold rounded-xl">
                                     <SelectItem value="percentage">Percentage (%)</SelectItem>
                                     <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-1">
                               <Label className="text-[8px] font-medium uppercase opacity-60">Value</Label>
                               <Input 
                                  value={editedJob?.benefits?.bonusValue || ''} 
                                  onChange={e => handleEditJobField('benefits', { ...editedJob.benefits, bonusValue: e.target.value })}
                                  className="h-7 text-[10px] font-bold p-1 bg-white/50"
                                  placeholder="e.g. 10"
                                />
                            </div>
                         </div>
                      </div>
                    )}

                    {!isEditingJob && selectedJob?.benefits?.bonusEnabled && selectedJob?.benefits?.bonusValue && (
                       <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-dashed border-primary/10">
                          <p className="text-[10px] font-medium uppercase text-primary tracking-widest mb-1">Bonus Configuration</p>
                          <p className="text-sm font-bold">
                             {selectedJob.benefits.bonusType === 'percentage' ? `${selectedJob.benefits.bonusValue}% Bonus` : `Fixed Bonus of ₹${selectedJob.benefits.bonusValue}`}
                          </p>
                       </div>
                    )}
                 </section>

                 <section className="space-y-6">
                    <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Requirements Description</h4>
                    {isEditingJob ? (
                      <Textarea 
                        value={editedJob?.description} 
                        onChange={e => handleEditJobField('description', e.target.value)}
                        className="min-h-[150px] rounded-2xl bg-white/50 font-medium"
                      />
                    ) : (
                      <div className="p-6 bg-muted/10 rounded-3xl border border-dashed border-muted/50 italic text-muted-foreground font-medium whitespace-pre-line leading-relaxed shadow-inner">
                         "{selectedJob?.description || "No detailed description provided."}"
                      </div>
                    )}
                 </section>
              </div>
           </ScrollArea>

           <DialogFooter className="p-8 bg-muted/20 border-t flex flex-wrap gap-4 shrink-0">
              {isEditingJob ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditingJob(false)} className="flex-1 font-bold h-14 rounded-2xl min-w-[140px] gap-2">
                    <Undo2 className="w-4 h-4" /> Cancel Edit
                  </Button>
                  <Button 
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-14 rounded-2xl shadow-xl min-w-[180px] active:scale-95 transition-all gap-2"
                    onClick={() => setConfirmAction({ 
                      type: 'update', 
                      coll: 'Jobs', 
                      id: selectedJob.id, 
                      data: { 
                        ...editedJob, 
                        status: 'approved',
                        adminAudit: {
                          editedBy: user?.uid,
                          editedAt: new Date().toISOString(),
                          originalData: { jobTitle: selectedJob.jobTitle, department: selectedJob.department, designation: selectedJob.designation }
                        }
                      } 
                    })}
                  >
                    <CheckCircle2 className="w-5 h-5" /> Finalize & Approve
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setSelectedJob(null)} className="flex-1 font-bold h-14 rounded-2xl min-w-[140px]">Dismiss Audit</Button>
                  
                  {selectedJob?.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline"
                        className="flex-1 border-indigo-200 text-indigo-600 font-bold h-14 rounded-2xl min-w-[140px] gap-2 hover:bg-indigo-50"
                        onClick={() => {
                          setEditedJob({ ...selectedJob });
                          setIsEditingJob(true);
                        }}
                      >
                        <Edit3 className="w-4 h-4" /> Edit & Approve
                      </Button>
                      <Button className="flex-[1.5] bg-green-600 hover:bg-green-700 text-white font-medium h-14 rounded-2xl shadow-xl min-w-[140px] active:scale-95 transition-all" onClick={() => setConfirmAction({ type: 'update', coll: 'Jobs', id: selectedJob.id, data: { status: 'approved' } })}>Approve Listing</Button>
                    </>
                  )}
                  
                  {selectedJob?.status !== 'rejected' && selectedJob?.status !== 'closed' && (
                     <Button variant="outline" className="flex-1 border-red-200 text-red-600 font-bold h-14 rounded-2xl min-w-[140px]" onClick={() => setConfirmAction({ type: 'update', coll: 'Jobs', id: selectedJob.id, data: { status: 'rejected' } })}>Reject</Button>
                  )}
                  <Button variant="destructive" className="flex-1 font-medium h-14 rounded-2xl shadow-lg min-w-[140px]" onClick={() => setConfirmAction({ type: 'delete', coll: 'Jobs', id: selectedJob.id })}>Force Removal</Button>
                </>
              )}
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedReportGroup} onOpenChange={o => !o && setSelectedReportGroup(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[85vh]">
          <DialogHeader className={cn("p-8 text-white shrink-0", selectedReportGroup?.targetType === 'user' ? "bg-amber-600" : "bg-red-600")}>
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                      {selectedReportGroup?.targetType === 'user' ? <UserX className="w-7 h-7 text-white" /> : <ShieldAlert className="w-7 h-7 text-white" />}
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-medium tracking-tight">{selectedReportGroup?.targetName}</DialogTitle>
                      <DialogDescription className="text-white/80 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> 
                        {selectedReportGroup?.targetType === 'user' ? 'Candidate Misconduct Audit' : 'Listing Incident Registry'} 
                        • {selectedReportGroup?.reports?.length} Reports
                      </DialogDescription>
                    </div>
                </div>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-medium px-4 py-2 rounded-xl">
                   {selectedReportGroup?.status?.toUpperCase()}
                </Badge>
             </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-8">
             <div className="space-y-8">
                {selectedReportGroup?.targetType === 'user' && (
                  <section className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-6">
                     <h4 className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-2 border-b pb-2">
                        <UserCircle className="w-4 h-4" /> Candidate Dossier
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(() => {
                          const targetUser = liveUsers.find(u => u.id === selectedReportGroup?.targetId);
                          return (
                            <>
                              <div className="bg-muted/10 p-5 rounded-2xl border border-dashed border-muted/50 space-y-1">
                                <Label className="text-[10px] font-medium uppercase opacity-60">Verified Mobile</Label>
                                <p className="font-medium text-xl text-primary">+91 {targetUser?.phone || "N/A"}</p>
                              </div>
                              <div className="bg-muted/10 p-5 rounded-2xl border border-dashed border-muted/50 space-y-1">
                                <Label className="text-[10px] font-medium uppercase opacity-60">Registered Identity</Label>
                                <p className="font-medium text-lg">{targetUser?.name || selectedReportGroup?.targetName}</p>
                              </div>
                              {targetUser && (
                                <div className="md:col-span-2 flex gap-4">
                                  <Button variant="outline" size="sm" className="rounded-xl font-bold border-primary text-primary" onClick={() => setSelectedUser(targetUser)}>
                                    <Eye className="w-4 h-4 mr-2" /> View Seeker Profile
                                  </Button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                     </div>
                  </section>
                )}

                <div className="space-y-4">
                   <h4 className="text-xs font-medium uppercase text-muted-foreground border-b pb-2 flex items-center gap-2">
                      <History className="w-4 h-4" /> Comprehensive Report History
                   </h4>
                   <div className="space-y-4">
                      {selectedReportGroup?.reports.map((report: any) => (
                        <Card key={report.id} className="border border-muted shadow-none bg-muted/5 rounded-2xl overflow-hidden">
                           <CardContent className="p-6 space-y-4">
                              <div className="flex justify-between items-start">
                                 <Badge className={cn(
                                   "font-medium text-[10px] uppercase border-none px-3 py-1",
                                   selectedReportGroup?.targetType === 'user' ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-700"
                                 )}>
                                    {report.reason}
                                 </Badge>
                                 <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                    {safeFormatDate(report.createdAt)}
                                 </span>
                              </div>
                              
                              <div className="space-y-4">
                                {report.description && (
                                   <div className="p-4 bg-white rounded-xl italic text-sm font-medium text-foreground leading-relaxed border shadow-inner">
                                      " {report.description} "
                                   </div>
                                )}

                                {report.jobTitle && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                     <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                                        <Briefcase className="w-4 h-4 text-primary" /> Applied For: {report.jobTitle}
                                     </div>
                                     <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                                        <Building className="w-4 h-4 text-primary" /> Reporter: {report.reportedByName}
                                     </div>
                                  </div>
                                )}

                                {report.evidenceUrl && (
                                  <div className="pt-4 border-t border-dashed">
                                     <Label className="text-[10px] font-medium uppercase text-muted-foreground block mb-2">Submitted Evidence</Label>
                                     <Button size="sm" variant="outline" className="rounded-xl font-bold gap-2" onClick={() => window.open(report.evidenceUrl, '_blank')}>
                                        <ImageIcon className="w-4 h-4" /> Download/View Evidence
                                     </Button>
                                  </div>
                                )}
                              </div>
                              
                              <div className="pt-4 border-t border-dashed border-muted/30 flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                    <User className="w-3 h-3" /> Reported By: {report.reportedByName || "Anonymous"} ({report.reportedByUserId?.slice(0, 8)})
                                 </div>
                                 <Badge variant="outline" className="text-[9px] font-bold">{report.status || 'open'}</Badge>
                              </div>
                           </CardContent>
                        </Card>
                      ))}
                   </div>
                </div>

                <section className="space-y-4 pt-6 border-t">
                  <h4 className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Administrative Intervention Notes
                  </h4>
                  <Textarea 
                    placeholder="Enter internal resolution notes or misconduct audit results..."
                    className="min-h-[100px] rounded-2xl bg-muted/20 font-medium"
                    defaultValue={selectedReportGroup?.reports[0]?.adminNotes}
                  />
                </section>
             </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-muted/20 border-t flex flex-wrap gap-4 shrink-0">
             <Button variant="ghost" onClick={() => setSelectedReportGroup(null)} className="flex-1 font-bold h-14 rounded-2xl">Dismiss Terminal</Button>
             
             <div className="flex-[2] flex gap-3">
               <Button 
                variant="outline" 
                className="flex-1 border-blue-200 text-blue-600 font-medium h-14 rounded-2xl hover:bg-blue-50 transition-all"
                onClick={async () => {
                  if (!selectedReportGroup) return;
                  setIsProcessing(true);
                  try {
                    const batch = writeBatch(db!);
                    selectedReportGroup.reports.forEach((r: any) => {
                      batch.update(doc(db!, "Reports", r.id), { status: "under_review", updatedAt: serverTimestamp() });
                    });
                    await batch.commit();
                    toast({ title: "Incident Set to Review" });
                    setSelectedReportGroup(null);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    window.location.reload();
                  } catch (e) {
                    setIsProcessing(false);
                  }
                }}
               >
                  Set to Review
               </Button>
               <Button 
                variant="outline" 
                className="flex-1 border-primary text-primary font-medium h-14 rounded-2xl active:scale-95 transition-all"
                onClick={() => { 
                    if (!selectedReportGroup) return;
                    setConfirmAction({ type: 'dismiss-group', reportGroupId: selectedReportGroup?.targetId }); 
                }}
               >
                  Resolve Incident
               </Button>
               <Button 
                variant="destructive" 
                className="flex-[1.5] font-medium h-14 rounded-2xl shadow-lg active:scale-95 transition-all"
                onClick={() => { 
                    if (!selectedReportGroup) return;
                    if (selectedReportGroup?.targetType === 'job' || selectedReportGroup?.targetType === 'company') {
                      setConfirmAction({ type: 'delete', coll: 'Jobs', id: selectedReportGroup?.targetId });
                    } else {
                      setConfirmAction({ type: 'update', coll: 'Users', id: selectedReportGroup?.targetOwnerId || selectedReportGroup?.targetId, data: { status: 'suspended' } });
                    }
                }}
               >
                  {selectedReportGroup?.targetType === 'user' ? 'Suspend Candidate' : 'Enforce Penalty'}
               </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedNameRequest} onOpenChange={o => !o && setSelectedNameRequest(null)}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col">
           <DialogHeader className="p-8 bg-indigo-600 text-white shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                    <Building2 className="w-7 h-7 text-white" />
                 </div>
                 <div className="space-y-1">
                    <DialogTitle className="text-2xl font-medium font-headline uppercase tracking-tight">Identity Override Audit</DialogTitle>
                    <DialogDescription className="text-white/80 font-medium">Review requested change for {selectedNameRequest?.employerName}</DialogDescription>
                 </div>
              </div>
           </DialogHeader>
           <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-5 bg-muted/20 rounded-2xl border border-dashed space-y-1">
                    <Label className="text-[10px] font-medium uppercase opacity-60">Current Brand</Label>
                    <p className="font-bold text-muted-foreground">{selectedNameRequest?.currentName}</p>
                 </div>
                 <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-1">
                    <Label className="text-[10px] font-medium uppercase text-indigo-600">Requested Brand</Label>
                    <p className="font-medium text-indigo-900">{selectedNameRequest?.requestedName}</p>
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Employer's Stated Reason</Label>
                 <div className="p-5 bg-muted/10 rounded-2xl italic text-sm font-medium border shadow-inner">
                    "{selectedNameRequest?.reason}"
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Internal Audit Remarks</Label>
                 <Textarea value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} placeholder="Enter audit results or reason for rejection..." className="min-h-[100px] rounded-2xl font-medium" />
              </div>
           </div>
           <DialogFooter className="p-8 bg-muted/20 border-t flex gap-4">
              <Button variant="ghost" className="flex-1 font-bold h-14 rounded-2xl">Cancel</Button>
              <div className="flex-[2] flex gap-3">
                 <Button variant="outline" className="flex-1 border-red-200 text-red-600 font-medium h-14 rounded-2xl" onClick={() => handleNameRequestAction('rejected')} disabled={isProcessing}>Reject</Button>
                 <Button className="flex-[1.5] bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-14 rounded-2xl shadow-xl" onClick={() => handleNameRequestAction('approved')} disabled={isProcessing}>Approve Override</Button>
              </div>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedRoleRequest} onOpenChange={o => !o && setSelectedRoleRequest(null)}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col">
           <DialogHeader className="p-8 bg-teal-600 text-white shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                    <Tag className="w-7 h-7 text-white" />
                 </div>
                 <div className="space-y-1">
                    <DialogTitle className="text-2xl font-medium font-headline uppercase tracking-tight">Role Override Audit</DialogTitle>
                    <DialogDescription className="text-white/80 font-medium">Review requested change for {selectedRoleRequest?.candidateName}</DialogDescription>
                 </div>
              </div>
           </DialogHeader>
           <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-5 bg-muted/20 rounded-2xl border border-dashed space-y-1">
                    <Label className="text-[10px] font-medium uppercase opacity-60">Current Designation</Label>
                    <p className="font-bold text-muted-foreground">{selectedRoleRequest?.currentDesignation}</p>
                 </div>
                 <div className="p-5 bg-teal-50 rounded-2xl border border-teal-200 space-y-1">
                    <Label className="text-[10px] font-medium uppercase text-teal-600">Requested Designation</Label>
                    <p className="font-medium text-teal-900">{selectedRoleRequest?.requestedDesignation}</p>
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Candidate's Reason</Label>
                 <div className="p-5 bg-muted/10 rounded-2xl italic text-sm font-medium border shadow-inner">
                    "{selectedRoleRequest?.reason}"
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Internal Audit Remarks</Label>
                 <Textarea value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} placeholder="Enter audit results or reason for rejection..." className="min-h-[100px] rounded-2xl font-medium" />
              </div>
           </div>
           <DialogFooter className="p-8 bg-muted/20 border-t flex gap-4">
              <Button variant="ghost" className="flex-1 font-bold h-14 rounded-2xl">Cancel</Button>
              <div className="flex-[2] flex gap-3">
                 <Button variant="outline" className="flex-1 border-red-200 text-red-600 font-medium h-14 rounded-2xl" onClick={() => handleRoleRequestAction('rejected')} disabled={isProcessing}>Reject</Button>
                 <Button className="flex-[1.5] bg-teal-600 hover:bg-teal-700 text-white font-medium h-14 rounded-2xl shadow-xl" onClick={() => handleRoleRequestAction('approved')} disabled={isProcessing}>Approve Override</Button>
              </div>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmAction} onOpenChange={o => !o && setConfirmAction(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-medium">Confirm Administrative Execution?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium leading-relaxed">
              You are about to modify a verified industrial record. This action will be logged in the permanent administrative audit trail and affects global platform visibility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="h-14 rounded-2xl font-bold flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-14 rounded-2xl bg-primary text-white font-medium flex-1 active:scale-95 transition-all" onClick={() => executeAction()}>Confirm & Apply</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingUser} onOpenChange={o => !o && setDeletingUser(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-medium">Delete Identity Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-foreground">"{deletingUser?.name || deletingUser?.companyName}"</span>? 
              This will remove their entire Firestore profile document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="h-14 rounded-2xl font-bold flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-14 rounded-2xl bg-destructive text-white font-medium flex-1 active:scale-95 transition-all" onClick={confirmDeleteUser}>Delete Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function safeFormatDate(dateVal: any) {
  if (!dateVal) return "N/A";
  try {
    const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    return isValid(date) ? format(date, "dd MMM yyyy HH:mm") : "N/A";
  } catch (e) {
    return "N/A";
  }
}


const safeFormatDateOnly = (dateVal: any) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    const { isValid, format } = require('date-fns');
    return isValid(d) ? format(d, "dd MMM yyyy") : "N/A";
  } catch {
    return "N/A";
  }
};

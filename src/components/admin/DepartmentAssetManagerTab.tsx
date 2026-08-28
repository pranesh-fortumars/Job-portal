"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { ProfileTab } from "@/components/admin/ProfileTab";
import { ManageAdminsTab } from "@/components/admin/ManageAdminsTab";
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

export function DepartmentAssetManagerTab({ db }: { db: any }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDept, setSelectedDept] = useState<{ category: string, name: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  // New Department Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<'Technical' | 'Non-Technical'>('Technical');
  const [newDeptName, setNewDeptName] = useState('');

  // Default departmental lists
  const DEFAULT_STAFF = useMemo(() => [
    "MERCHANDISING", "FABRIC", "PRINT & EMBROIDERY", "PRODUCTION", "QUALITY", 
    "HR & ADMIN", "ACCOUNTS & DOCS", "CAD & SAMPLING", "ERP/EDP", "STORE", "OTHERS"
  ], []);

  const DEFAULT_WORKER = useMemo(() => [
    "CUTTING", "STITCHING", "CHECKING", "IRONING & PACKING", "KNITTING", 
    "DYEING", "COMPACTING", "PRINT / EMBROIDERY", "OTHERS"
  ], []);

  // Load dynamic registry from Firestore
  const registryRef = useMemo(() => db ? doc(db, "Settings", "DepartmentRegistry") : null, [db]);
  const { data: registry } = useDoc<any>(registryRef);

  const staffDepts = useMemo(() => {
    const custom = (registry?.customStaffDepts || []) as string[];
    const removed = (registry?.removedStaffDepts || []) as string[];
    const all = Array.from(new Set([...DEFAULT_STAFF, ...custom]));
    return all.filter(d => !removed.includes(d));
  }, [registry, DEFAULT_STAFF]);

  const workerDepts = useMemo(() => {
    const custom = (registry?.customWorkerDepts || []) as string[];
    const removed = (registry?.removedWorkerDepts || []) as string[];
    const all = Array.from(new Set([...DEFAULT_WORKER, ...custom]));
    return all.filter(d => !removed.includes(d));
  }, [registry, DEFAULT_WORKER]);

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error("Image selection corrupted. Please try again."));
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDept || !db) return;

    setProcessing(true);
    const sanitizedDeptName = selectedDept.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    const assetId = `${selectedDept.category.toUpperCase()}_${sanitizedDeptName}`;
    const assetRef = doc(db, "DepartmentAssets", assetId);
    
    processImage(file).then(base64 => {
      setDoc(assetRef, {
        id: assetId,
        category: selectedDept.category,
        department: selectedDept.name,
        imageUrl: base64,
        updatedAt: serverTimestamp()
      }, { merge: true })
        .then(() => {
          toast({ title: "Asset Synchronized", description: `Logo for ${selectedDept.name} updated platform-wide.` });
          setSelectedDept(null);
        })
        .catch(async (serverError: any) => {
          toast({ variant: "destructive", title: "Sync Failed" });
        })
        .finally(() => setProcessing(false));
    }).catch(err => {
      toast({ variant: "destructive", title: "Process Error" });
      setProcessing(false);
    });
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim() || !db || !registryRef) return;
    const name = newDeptName.trim().toUpperCase();
    try {
      const field = addCategory === 'Technical' ? 'customStaffDepts' : 'customWorkerDepts';
      const removedField = addCategory === 'Technical' ? 'removedStaffDepts' : 'removedWorkerDepts';
      const currentCustom = (registry?.[field] || []) as string[];
      const currentRemoved = (registry?.[removedField] || []) as string[];
      
      await setDoc(registryRef, {
        [field]: Array.from(new Set([...currentCustom, name])),
        [removedField]: currentRemoved.filter((d: string) => d !== name),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "Department Added", description: `Added ${name} to ${addCategory === 'Technical' ? 'IT, Tech & Internships' : 'Skilled Trades & Wages'}.` });
      setNewDeptName('');
      setIsAddOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error adding department" });
    }
  };

  const handleRemoveDepartment = async (category: 'Technical' | 'Non-Technical', deptName: string) => {
    if (!db || !registryRef) return;
    try {
      const field = category === 'Technical' ? 'customStaffDepts' : 'customWorkerDepts';
      const removedField = category === 'Technical' ? 'removedStaffDepts' : 'removedWorkerDepts';
      const currentCustom = ((registry?.[field] || []) as string[]).filter((d: string) => d !== deptName);
      const currentRemoved = Array.from(new Set([...((registry?.[removedField] || []) as string[]), deptName]));
      
      await setDoc(registryRef, {
        [field]: currentCustom,
        [removedField]: currentRemoved,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "Department Removed", description: `Removed ${deptName}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error removing department" });
    }
  };

  const handleResetDefaults = async (category: 'Technical' | 'Non-Technical') => {
    if (!db || !registryRef) return;
    try {
      const field = category === 'Technical' ? 'customStaffDepts' : 'customWorkerDepts';
      const removedField = category === 'Technical' ? 'removedStaffDepts' : 'removedWorkerDepts';
      await setDoc(registryRef, {
        [field]: [],
        [removedField]: [],
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Defaults Restored", description: "Default departments restored." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error resetting" });
    }
  };

  return (
    <div className="space-y-10">
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleUpload} accept="image/*" />
      
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-muted/50">
        <div>
          <h4 className="font-semibold text-base text-foreground">Dynamic Department Configuration</h4>
          <p className="text-xs font-normal text-muted-foreground">Add or remove departments and customize brand icons in real-time across both tracks.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="rounded-xl font-medium text-sm gap-2">
          <Plus className="w-4 h-4" /> Add New Department
        </Button>
      </div>

      {/* IT, Tech & Internships Track */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold uppercase tracking-tight text-foreground">IT, Tech & Internships Departments</h3>
              <p className="text-xs font-normal text-muted-foreground">Merchandising, ERP/EDP, Software, Data, Design, Accounts & Corporate roles</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleResetDefaults('Technical')} className="text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffDepts.map(dept => (
            <Card key={dept} className="rounded-2xl border border-muted/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-card group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DepartmentLogo category="Technical" department={dept} className="w-12 h-12 rounded-xl border shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-foreground truncate max-w-[130px]">{dept}</p>
                    <p className="text-[10px] text-muted-foreground font-normal">IT & Corporate</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" title="Upload Logo" className="rounded-xl text-primary hover:bg-primary/5 h-8 w-8" onClick={() => { setSelectedDept({ category: 'Technical', name: dept }); setTimeout(() => fileInputRef.current?.click(), 10); }}>
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Remove Department" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-8 w-8" onClick={() => handleRemoveDepartment('Technical', dept)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Skilled Trades & Daily Wages Track */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-lg font-semibold uppercase tracking-tight text-foreground">Skilled Trades & Daily Wages Departments</h3>
              <p className="text-xs font-normal text-muted-foreground">Cutting, Stitching, Checking, Ironing, Packing, Dyeing, Knitting & Trades</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleResetDefaults('Non-Technical')} className="text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workerDepts.map(dept => (
            <Card key={dept} className="rounded-2xl border border-muted/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-card group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DepartmentLogo category="Non-Technical" department={dept} className="w-12 h-12 rounded-xl border shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-foreground truncate max-w-[130px]">{dept}</p>
                    <p className="text-[10px] text-muted-foreground font-normal">Skilled Trades</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" title="Upload Logo" className="rounded-xl text-accent hover:bg-accent/5 h-8 w-8" onClick={() => { setSelectedDept({ category: 'Non-Technical', name: dept }); setTimeout(() => fileInputRef.current?.click(), 10); }}>
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Remove Department" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-8 w-8" onClick={() => handleRemoveDepartment('Non-Technical', dept)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Add Department Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Custom Department</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new department dynamically. It will immediately appear in job forms and listings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Target Track</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant={addCategory === 'Technical' ? 'default' : 'outline'} 
                  className="rounded-xl text-xs font-medium h-11"
                  onClick={() => setAddCategory('Technical')}
                >
                  <Briefcase className="w-4 h-4 mr-1.5" /> IT, Tech & Interns
                </Button>
                <Button 
                  type="button" 
                  variant={addCategory === 'Non-Technical' ? 'default' : 'outline'} 
                  className="rounded-xl text-xs font-medium h-11"
                  onClick={() => setAddCategory('Non-Technical')}
                >
                  <Users className="w-4 h-4 mr-1.5" /> Skilled Trades
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Department Name</label>
              <input 
                type="text" 
                placeholder="e.g. DATA SCIENCE, PACKAGING" 
                value={newDeptName} 
                onChange={(e) => setNewDeptName(e.target.value)} 
                className="w-full h-12 px-4 rounded-xl border border-muted bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl font-medium">Cancel</Button>
            <Button onClick={handleAddDepartment} disabled={!newDeptName.trim()} className="rounded-xl font-medium">Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {processing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center">
           <Card className="p-8 rounded-[2.5rem] flex flex-col items-center gap-4 border-none shadow-2xl">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-medium uppercase tracking-widest text-xs">Propagating Asset...</p>
           </Card>
        </div>
      )}
    </div>
  );
}


const safeFormatDateOnly = (dateVal: any) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    return isValid(d) ? format(d, "dd MMM yyyy") : "N/A";
  } catch (e) { return "N/A"; }
};


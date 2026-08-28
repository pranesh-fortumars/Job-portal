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
export function BrandingHubTab({ db }: { db: any }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  const configRef = useMemo(() => (db) ? doc(db, "AppConfig", "GlobalBranding") : null, [db]);
  const { data: brandingConfig, loading: brandingLoading } = useDoc<any>(configRef);

  const logoMode = brandingConfig?.logoMode || 'global';
  const sectionLogos = brandingConfig?.sectionLogos || {};

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 600; 
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error("Image selection interrupted."));
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await processImage(file);
      setPreviewLogo(base64);
    } catch (err) {
      toast({ variant: "destructive", title: "Preview Failed" });
    }
  };

  const handleSaveLogo = async () => {
    if (!previewLogo || !db || !configRef) return;
    const updateData: any = { updatedAt: serverTimestamp() };
    if (selectedSection) {
      const newSectionLogos = { ...sectionLogos, [selectedSection]: previewLogo };
      updateData.sectionLogos = newSectionLogos;
      updateData.logoMode = 'custom';
    } else {
      updateData.applicationLogoUrl = previewLogo;
    }

    setProcessing(true);
    setDoc(configRef, updateData, { merge: true })
      .then(() => {
        toast({ 
          title: selectedSection ? "Section Logo Updated" : "Global Branding Propagated",
          description: "Visual assets synchronized across the platform."
        });
        setPreviewLogo(null);
        setSelectedSection(null);
      })
      .catch(async (serverError: any) => {
        const permissionError = new FirestorePermissionError({
          path: configRef!.path,
          operation: 'write',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
        
        toast({ 
          variant: "destructive", 
          title: "Branding Sync Failed", 
          description: "Insufficient permissions or payload size limit reached."
        });
      })
      .finally(() => {
        setProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  const handleToggleMode = async (mode: 'global' | 'custom') => {
    if (!db || !configRef) return;
    setDoc(configRef, { logoMode: mode, updatedAt: serverTimestamp() }, { merge: true })
      .then(() => {
        toast({ title: `Branding switched to ${mode.toUpperCase()} Mode` });
      })
      .catch(async (serverError: any) => {
        const permissionError = new FirestorePermissionError({
          path: configRef!.path,
          operation: 'write',
          requestResourceData: { logoMode: mode },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: "destructive", title: "Toggle Failed" });
      });
  };

  const handleResetSection = async (sectionId: string) => {
    if (!db || !configRef) return;
    const newSectionLogos = { ...sectionLogos };
    delete newSectionLogos[sectionId];
    
    setDoc(configRef, { sectionLogos: newSectionLogos, updatedAt: serverTimestamp() }, { merge: true })
      .then(() => {
        toast({ title: "Section Reset to Global Default" });
      })
      .catch(async (serverError: any) => {
        const permissionError = new FirestorePermissionError({
          path: configRef!.path,
          operation: 'write',
          requestResourceData: { sectionLogos: newSectionLogos },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: "destructive", title: "Reset Failed" });
      });
  };

  return (
    <div className="space-y-12">
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" />
      
      <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-medium uppercase tracking-tight text-primary flex items-center gap-2">
              <Settings2 className="w-6 h-6" /> Branding Logic Mode
            </h3>
            <p className="text-xs font-medium text-muted-foreground">Define how logos are distributed across the platform.</p>
          </div>
          <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-dashed border-primary/10">
             <button 
               onClick={() => handleToggleMode('global')}
               className={cn("px-6 py-2 rounded-xl text-xs font-medium uppercase transition-all", logoMode === 'global' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
             >
               Global Mode
             </button>
             <button 
               onClick={() => handleToggleMode('custom')}
               className={cn("px-6 py-2 rounded-xl text-xs font-medium uppercase transition-all", logoMode === 'custom' ? "bg-accent text-white shadow-lg" : "text-muted-foreground hover:bg-white")}
             >
               Custom Section Mode
             </button>
          </div>
        </div>
      </Card>

      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden group">
         <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 bg-primary p-10 text-white flex flex-col justify-between space-y-8">
               <div className="space-y-4">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-medium uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    <Star className="w-3 h-3 mr-2 fill-white" /> Hero Branding
                  </Badge>
                  <h3 className="text-3xl font-medium font-headline tracking-tight uppercase leading-tight">Landing Page Hero Logo</h3>
                  <p className="text-primary-foreground/70 text-sm font-medium leading-relaxed italic">
                    The single most important brand asset. This logo defines the first impression for every visitor.
                  </p>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-3 h-3 rounded-full", logoMode === 'custom' && sectionLogos['header'] ? "bg-accent animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.8)]" : "bg-white/20")} />
                     <p className="text-xs font-medium uppercase tracking-widest">{logoMode === 'custom' && sectionLogos['header'] ? "Custom Active" : "Global Sync"}</p>
                  </div>
                  <Button 
                    className="w-full h-12 rounded-xl font-medium bg-white text-primary hover:bg-primary-foreground transition-all shadow-xl active:scale-95"
                    onClick={() => { setSelectedSection('header'); fileInputRef.current?.click(); }}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Update Hero Asset
                  </Button>
               </div>
            </div>
            <div className="lg:col-span-8 p-10 md:p-16 flex flex-col items-center justify-center bg-muted/5 relative">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <AppLogo section="header" width={300} height={200} />
               </div>
               <div className="w-48 h-32 md:w-72 md:h-48 bg-white rounded-[2.5rem] flex items-center justify-center p-6 shadow-2xl animate-in zoom-in duration-700 overflow-hidden border-2 border-primary/5">
                  <AppLogo section="header" width={240} height={160} />
               </div>
               <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.3em] mt-8 text-center animate-pulse">1:1 Visual Parity Preview</p>
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="p-8 border-b bg-muted/10">
              <CardTitle className="text-xl font-medium uppercase tracking-tight text-primary">Logo Mapping Dashboard</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Discover and control usage across all zones.</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-8 font-medium uppercase text-[10px]">Section Name</TableHead>
                  <TableHead className="font-medium uppercase text-[10px] text-center">Active Logo</TableHead>
                  <TableHead className="font-medium uppercase text-[10px] text-center">Source</TableHead>
                  <TableHead className="pr-8 text-right font-medium uppercase text-[10px]">Edit Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LOGO_SECTIONS.map((section) => {
                  const hasCustom = sectionLogos[section.id];
                  return (
                    <TableRow key={section.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="pl-8 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm text-foreground">{section.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium line-clamp-1">{section.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="w-12 h-12 rounded-lg bg-muted/50 border flex items-center justify-center mx-auto overflow-hidden">
                          <AppLogo section={section.id as any} width={40} height={40} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                         <Badge className={cn(
                           "text-[9px] font-medium uppercase border-none",
                           (logoMode === 'custom' && hasCustom) ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                         )}>
                           {(logoMode === 'custom' && hasCustom) ? "Custom Override" : "Global Mode"}
                         </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right py-4">
                        <div className="flex justify-end gap-2">
                           <Button variant="outline" size="sm" className="h-8 rounded-lg text-primary border-primary/20 hover:bg-primary/5 font-bold" onClick={() => { setSelectedSection(section.id); fileInputRef.current?.click(); }}>
                             <Upload className="w-3.5 h-3.5 mr-1.5" /> Set Logo
                           </Button>
                           {hasCustom && (
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => handleResetSection(section.id)}>
                               <RefreshCcw className="w-3.5 h-3.5" />
                             </Button>
                           )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white space-y-6">
            <div className="flex items-center gap-3 border-b pb-3">
               <Globe className="w-6 h-6 text-primary" />
               <h3 className="text-lg font-medium uppercase tracking-tight text-primary">Master Brand Logo</h3>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-[2rem] border-2 border-dashed border-primary/10 min-h-[200px]">
               <AppLogo width={120} height={120} className="drop-shadow-xl" />
               <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-6">Active Platform Root</p>
            </div>
            <Button className="w-full h-12 rounded-xl font-medium bg-primary text-white active:scale-95 transition-all" onClick={() => { setSelectedSection(null); fileInputRef.current?.click(); }}>
               <Upload className="w-4 h-4 mr-2" /> Update Global Logo
            </Button>
          </Card>
        </div>
      </div>

      <Dialog open={!!previewLogo} onOpenChange={o => !o && setPreviewLogo(null)}>
        <DialogContent className="max-w-lg rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-medium uppercase tracking-tight">Preview Branding Change</DialogTitle>
            <DialogDescription className="text-white/80 font-medium">
              Target Zone: <span className="text-white font-medium">{selectedSection ? LOGO_SECTIONS.find(s => s.id === selectedSection)?.name : "Global Application"}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="p-10 flex flex-col items-center justify-center space-y-8 bg-muted/5">
             <div className="w-48 h-48 bg-white rounded-3xl shadow-xl border p-4 flex items-center justify-center animate-in zoom-in-95">
                {previewLogo && <img src={previewLogo} className="max-w-full max-h-full object-contain" alt="Preview" />}
             </div>
             <div className="text-center space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Visual Distribution</p>
                <p className="text-sm font-medium leading-relaxed">Once saved, this asset will propagate immediately to the {selectedSection || 'entire'} target zone.</p>
             </div>
          </div>
          <DialogFooter className="p-8 border-t bg-white flex gap-4">
            <Button variant="ghost" className="flex-1 font-bold h-12 rounded-xl" onClick={() => { setPreviewLogo(null); setSelectedSection(null); }}>Cancel</Button>
            <Button className="flex-[2] bg-primary text-white font-medium h-12 rounded-xl shadow-lg active:scale-95 transition-all" onClick={handleSaveLogo} disabled={processing}>
               {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
               Establish Brand Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


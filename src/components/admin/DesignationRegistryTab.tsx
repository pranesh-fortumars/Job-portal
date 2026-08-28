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

export function DesignationRegistryTab({ db }: { db: any }) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingDes, setEditingDes] = useState<any>(null);
  const [deletingDes, setDeletingDes] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const designationsQuery = useMemo(() => db ? query(collection(db, "Designations")) : null, [db]);
  const { data: designations, loading } = useCollection<any>(designationsQuery);

  const [form, setForm] = useState({
    name: "",
    nameTamil: "",
    nameHindi: "",
    category: "Technical" as 'Technical' | 'Non-Technical',
    department: "MERCHANDISING",
    status: "active" as 'active' | 'inactive'
  });

  useEffect(() => {
    if (editingDes) {
      setForm({
        name: editingDes.name,
        nameTamil: editingDes.nameTamil || "",
        nameHindi: editingDes.nameHindi || "",
        category: editingDes.category,
        department: editingDes.department,
        status: editingDes.status || 'active'
      });
    } else {
      setForm({
        name: "",
        nameTamil: "",
        nameHindi: "",
        category: "Technical",
        department: "MERCHANDISING",
        status: "active"
      });
    }
  }, [editingDes]);

  const departments = useMemo(() => {
    return (CLASSIFICATION as any)[form.category].departments;
  }, [form.category]);

  useEffect(() => {
    if (!departments.includes(form.department)) {
      setForm(f => ({ ...f, department: departments[0] }));
    }
  }, [departments]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !db) return;

    setIsProcessing(true);
    const sanitizedName = form.name.trim();
    const desId = editingDes?.id || `${form.category}_${form.department}_${sanitizedName.toUpperCase().replace(/\s+/g, '_')}`;
    
    const payload = {
      id: desId,
      name: sanitizedName,
      nameTamil: form.nameTamil.trim(),
      nameHindi: form.nameHindi.trim(),
      category: form.category,
      department: form.department,
      status: form.status,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || 'admin',
      ...(editingDes ? {
        createdBy: editingDes.createdBy || 'unknown',
        createdAt: editingDes.createdAt || serverTimestamp(),
      } : { 
        createdAt: serverTimestamp(),
        createdBy: user?.uid || 'admin'
      })
    };

    if (editingDes) {
      const isNameChanged = editingDes.name !== sanitizedName;
      const isDeptChanged = editingDes.department !== form.department;
      const isCatChanged = editingDes.category !== form.category;

      if (isNameChanged || isDeptChanged || isCatChanged) {
        const batch = writeBatch(db);
        batch.set(doc(db, "Designations", desId), payload, { merge: true });
        
        const jobsQ = query(collection(db, "Jobs"), where("designation", "==", editingDes.name));
        const usersQ = query(collection(db, "Users"), where("designation", "==", editingDes.name));
        const appsQ = query(collection(db, "Applications"), where("jobTitle", "==", editingDes.name));

        try {
          const [jobsSnap, usersSnap, appsSnap] = await Promise.all([
            getDocs(jobsQ), 
            getDocs(usersQ), 
            getDocs(appsQ)
          ]);

          jobsSnap.docs.forEach(jDoc => {
            const jData = jDoc.data();
            const updateObj: any = { 
              designation: sanitizedName, 
              department: form.department,
              category: form.category,
              updatedAt: serverTimestamp() 
            };
            if (jData.jobTitle === editingDes.name) updateObj.jobTitle = sanitizedName;
            batch.update(jDoc.ref, updateObj);
          });

          usersSnap.docs.forEach(uDoc => {
            batch.update(uDoc.ref, { 
              designation: sanitizedName, 
              department: form.department,
              category: form.category,
              updatedAt: serverTimestamp() 
            });
          });

          await batch.commit();
          toast({ title: "Designation & Linked Data Synchronized" });
          setIsDialogOpen(false);
          setEditingDes(null);
        } catch (err: any) {
          const logRef = doc(collection(db, "AuditLogs"));
          await setDoc(logRef, {
            type: "DESIGNATION_SYNC_ERROR",
            designationName: sanitizedName,
            department: form.department,
            category: form.category,
            performedBy: user?.uid || 'admin',
            timestamp: new Date().toISOString(),
            error: err.message || "Unknown error"
          });
          toast({ variant: "destructive", title: "Global Sync Failed", description: "Audit log recorded." });
        } finally {
          setIsProcessing(false);
        }
        return;
      }
    }

    setDoc(doc(db, "Designations", desId), payload, { merge: true })
      .then(() => {
        toast({ title: editingDes ? "Designation Synchronized" : "New Role Established" });
        setIsDialogOpen(false);
        setEditingDes(null);
      })
      .catch(async (serverError: any) => {
        const permissionError = new FirestorePermissionError({
          path: `Designations/${desId}`,
          operation: 'write',
          requestResourceData: payload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: "destructive", title: "Save Failed" });
      })
      .finally(() => setIsProcessing(false));
  };

  const confirmDelete = async () => {
    if (!deletingDes || !db || !user) return;
    setIsProcessing(true);

    try {
      // 1. Cross-Collection Integrity Audit
      const jobsQ = query(collection(db, "Jobs"), where("designation", "==", deletingDes.name));
      const usersQ = query(collection(db, "Users"), where("designation", "==", deletingDes.name));
      const appsQ = query(collection(db, "Applications"), where("jobTitle", "==", deletingDes.name));

      const [jobsSnap, usersSnap, appsSnap] = await Promise.all([
        getDocs(jobsQ),
        getDocs(usersQ),
        getDocs(appsQ)
      ]);

      const activeJobs = jobsSnap.docs.filter(j => j.data().status !== 'deleted');
      const activeUsers = usersSnap.docs.filter(u => u.data().status !== 'deleted');
      
      if (activeJobs.length > 0 || activeUsers.length > 0 || appsSnap.size > 0) {
        toast({ 
          variant: "destructive", 
          title: "Deletion Blocked", 
          description: `Cannot remove designation. It is active in: ${activeJobs.length} Jobs, ${activeUsers.length} Users, ${appsSnap.size} Applications.`
        });
        setIsProcessing(false);
        setDeletingDes(null);
        return;
      }

      // 2. Perform Removal with Audit Log
      const batch = writeBatch(db);
      const desRef = doc(db, "Designations", deletingDes.id);
      const logRef = doc(collection(db, "AuditLogs"));

      batch.delete(desRef);
      batch.set(logRef, {
        type: "DESIGNATION_DELETED",
        targetId: deletingDes.id,
        targetName: deletingDes.name,
        category: deletingDes.category,
        department: deletingDes.department,
        performedBy: user.uid,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      toast({ title: "Designation Removed Platforms-wide" });
      setDeletingDes(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Audit Verification Failed", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDesignations = useMemo(() => {
    if (!designations) return [];
    return designations.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [designations, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input placeholder="Filter registry..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm" />
           {searchQuery && (
             <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
               <X className="w-4 h-4" />
             </button>
           )}
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto h-11 px-8 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/20 active:scale-95 transition-all">
           <Plus className="w-5 h-5 mr-2" /> Add Designation
        </Button>
      </div>

      <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="pl-8 font-medium uppercase text-[10px]">Role Identity</TableHead>
              <TableHead className="font-medium uppercase text-[10px]">Industrial Chain</TableHead>
              <TableHead className="font-medium uppercase text-[10px]">Status</TableHead>
              <TableHead className="pr-8 text-right font-medium uppercase text-[10px]">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : filteredDesignations.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold italic">No custom designations defined.</TableCell></TableRow>
            ) : (
              filteredDesignations.map(d => (
                <TableRow key={d.id} className="hover:bg-primary/5 group transition-colors">
                  <TableCell className="pl-8 py-5">
                    <div className="space-y-1.5">
                       <p className="font-medium text-lg">{d.name}</p>
                       {(d.nameTamil || d.nameHindi) && (
                         <div className="flex flex-wrap gap-2">
                           {d.nameTamil && <Badge variant="secondary" className="bg-muted text-[10px] font-bold px-2 py-0 h-5 border-none">{d.nameTamil}</Badge>}
                           {d.nameHindi && <Badge variant="secondary" className="bg-muted text-[10px] font-bold px-2 py-0 h-5 border-none">{d.nameHindi}</Badge>}
                         </div>
                       )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       <Badge variant="outline" className="w-fit text-[9px] font-medium uppercase border-primary/20 text-primary">{d.category}</Badge>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{d.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-medium uppercase text-[9px] border-none",
                      d.status === 'inactive' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {d.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 rounded-lg transition-all" onClick={() => { setEditingDes(d); setIsDialogOpen(true); }}>
                         <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50 rounded-lg transition-all" onClick={() => setDeletingDes(d)}>
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

      <Dialog open={isDialogOpen} onOpenChange={o => { if(!o) { setIsDialogOpen(false); setEditingDes(null); } }}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
           <DialogHeader className="p-8 bg-primary text-white">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                   <Tag className="w-6 h-6 text-white" />
                 </div>
                 <DialogTitle className="text-2xl font-medium uppercase tracking-tight">{editingDes ? "Revise Designation" : "Establish New Role"}</DialogTitle>
              </div>
           </DialogHeader>
           <form onSubmit={handleSave} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Designation Name (English) *</Label>
                     <Input 
                       value={form.name} 
                       onChange={e => setForm({...form, name: e.target.value})} 
                       placeholder="e.g. Welfare Officer" 
                       className="h-12 rounded-xl font-medium text-lg border-primary/10 shadow-inner" 
                       required 
                     />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                       <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                         <Languages className="w-3 h-3 text-primary" /> Tamil Translation
                       </Label>
                       <Input 
                         value={form.nameTamil} 
                         onChange={e => setForm({...form, nameTamil: e.target.value})} 
                         placeholder="நல அலுவலர்" 
                         className="h-11 rounded-xl font-bold bg-muted/10 border-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                         <Languages className="w-3 h-3 text-primary" /> Hindi Translation
                       </Label>
                       <Input 
                         value={form.nameHindi} 
                         onChange={e => setForm({...form, nameHindi: e.target.value})} 
                         placeholder="कल्याण अधिकारी" 
                         className="h-11 rounded-xl font-bold bg-muted/10 border-none" 
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Global Category</Label>
                    <Select value={form.category} onValueChange={(v: any) => setForm({...form, category: v})}>
                       <SelectTrigger className="h-11 rounded-xl font-bold bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                       <SelectContent className="font-bold rounded-xl"><SelectItem value="Technical">Staff</SelectItem><SelectItem value="Non-Technical">Worker</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Department Chain</Label>
                    <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                       <SelectTrigger className="h-11 rounded-xl font-bold bg-muted/20 border-none"><SelectValue placeholder="Select Department" /></SelectTrigger>
                       <SelectContent className="font-bold rounded-xl max-h-[250px]">{departments.map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <Label className="font-medium text-xs uppercase text-muted-foreground tracking-widest ml-1">Operational Status</Label>
                    <div className="flex items-center gap-6 bg-muted/10 p-4 rounded-2xl">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" className="w-4 h-4 text-primary focus:ring-primary" checked={form.status === 'active'} onChange={() => setForm({...form, status: 'active'})} />
                          <span className={cn("text-sm font-medium uppercase transition-all", form.status === 'active' ? "text-green-600" : "text-muted-foreground opacity-40")}>Live</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" className="w-4 h-4 text-primary focus:ring-primary" checked={form.status === 'inactive'} onChange={() => setForm({...form, status: 'inactive'})} />
                          <span className={cn("text-sm font-medium uppercase transition-all", form.status === 'inactive' ? "text-red-600" : "text-muted-foreground opacity-40")}>Inactive</span>
                        </label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 flex gap-4">
                 <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-xl" onClick={() => { setIsDialogOpen(false); setEditingDes(null); }}>Discard</Button>
                 <Button disabled={isProcessing} className="flex-[2] bg-primary text-white font-medium h-12 rounded-xl shadow-lg active:scale-95 transition-all">
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-2" />} {editingDes ? "Update & Sync All" : "Synchronize Role"}
                 </Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingDes} onOpenChange={o => !o && setDeletingDes(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-medium">Confirm Role Deletion?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium leading-relaxed text-muted-foreground">
              You are about to remove <span className="text-foreground font-medium">"{deletingDes?.name}"</span> from the industrial registry. 
              This will immediately remove the role from all hiring filters and posting forms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="h-14 rounded-2xl font-bold flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="h-14 rounded-2xl bg-destructive text-white font-medium flex-1 active:scale-95 transition-all" 
              onClick={confirmDelete}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : "Delete Designation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


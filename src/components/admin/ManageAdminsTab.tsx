"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { ProfileTab } from "@/components/admin/ProfileTab";
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

const MOCK_ADMIN_EMAIL = 'iamnithyaprakash@gmail.com';

export function ManageAdminsTab({ db, liveUsers }: { db: any, liveUsers: any[] }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const admins = useMemo(() => liveUsers.filter(u => u.role === 'admin' && u.email !== MOCK_ADMIN_EMAIL), [liveUsers]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "male",
    department: "Tirupur Hub Operations",
    designation: "Administrator"
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Mismatch" });
      return;
    }
    if (form.password.length < 6) {
      toast({ variant: "destructive", title: "Key too short", description: "Minimum 6 characters." });
      return;
    }
    if (!form.email || !form.password || !form.phone || !form.name) {
      toast({ variant: "destructive", title: "Missing Fields" });
      return;
    }

    setLoading(true);
    let secondaryApp;
    try {
      const appName = `AdminCreator_${Date.now()}`;
      secondaryApp = initializeApp(firebaseConfig, appName);
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      const newUser = userCredential.user;

      const adminData = {
        uid: newUser.uid,
        name: form.name,
        email: form.email,
        phone: `+91${form.phone.replace(/\D/g, "")}`,
        gender: form.gender,
        dob: form.dob,
        role: 'admin',
        department: form.department,
        designation: form.designation,
        onboarded: true,
        status: 'approved',
        signupStatus: 'completed',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "Users", newUser.uid), adminData);
      
      toast({ title: "Administrator Created", description: `${form.name} is now registered in the industrial terminal.` });
      setIsDialogOpen(false);
      setForm({
        name: "", email: "", phone: "", password: "", confirmPassword: "", 
        dob: "", gender: "male", department: "Tirupur Hub Operations", designation: "Administrator"
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Authorization Refused", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-black uppercase tracking-tight">Administrative Governance</h2>
           <p className="text-sm font-semibold text-slate-700">Provisioning and monitoring privileged terminal access.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="h-12 px-10 rounded-xl bg-slate-900 text-white font-medium shadow-xl hover:bg-black active:scale-95 transition-all">
           <ShieldCheck className="w-5 h-5 mr-2" /> Provision Administrator
        </Button>
      </div>

      <Card className="rounded-[2.5rem] overflow-hidden border-2 border-slate-900 shadow-2xl bg-white">
        <Table>
           <TableHeader className="bg-slate-100/50 border-b-2 border-slate-900">
              <TableRow className="border-none hover:bg-transparent">
                 <TableHead className="pl-10 font-bold uppercase text-[10px] text-black">Administrative Identity</TableHead>
                 <TableHead className="font-bold uppercase text-[10px] text-black">Functional Chain</TableHead>
                 <TableHead className="font-bold uppercase text-[10px] text-black">Contact Terminal</TableHead>
                 <TableHead className="pr-10 text-right font-bold uppercase text-[10px] text-black">Audit Status</TableHead>
              </TableRow>
           </TableHeader>
           <TableBody>
              {admins.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-500 font-medium italic">No secondary administrators detected.</TableCell></TableRow>
              ) : (
                admins.map(a => (
                  <TableRow key={a.id} className="hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-none">
                    <TableCell className="pl-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-inner">
                             {a.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                          </div>
                          <div>
                             <p className="font-bold text-base text-black">{a.name}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {a.id.slice(0, 12)}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <p className="font-bold text-xs text-black">{a.designation}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{a.department}</p>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-0.5">
                          <p className="font-bold text-xs text-black flex items-center gap-2"><Smartphone className="w-3 h-3 text-slate-400" /> {a.phone}</p>
                          <p className="text-[10px] font-bold text-slate-600 flex items-center gap-2"><Mail className="w-3 h-3 text-slate-400" /> {a.email}</p>
                       </div>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                       <Badge className="bg-slate-900 text-white hover:bg-black border-none font-bold uppercase text-[9px] px-3 py-1">Verified</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
           </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 bg-primary text-white">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-3xl font-medium uppercase tracking-tight">Provision Administrator</DialogTitle>
                    <DialogDescription className="text-white/80 font-medium">Establish a new privileged identity with global terminal oversight.</DialogDescription>
                  </div>
               </div>
            </DialogHeader>
            <form onSubmit={handleCreate} className="p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="space-y-2">
                     <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Full Legal Name *</Label>
                     <Input required placeholder="Admin Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 rounded-xl font-bold bg-muted/20 border-none" />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Official Business Email *</Label>
                     <Input required type="email" placeholder="admin@nextirupur.in" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-12 rounded-xl font-bold bg-muted/20 border-none" />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Verified Mobile Number *</Label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground opacity-50">+91</span>
                        <Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} className="pl-12 h-12 rounded-xl font-bold bg-muted/20 border-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Date of Birth</Label>
                     <Input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="h-12 rounded-xl font-bold bg-muted/20 border-none" />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Gender</Label>
                     <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                        <SelectTrigger className="h-12 rounded-xl font-bold bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent className="font-bold rounded-xl">
                           <SelectItem value="male">Male Identity</SelectItem><SelectItem value="female">Female Identity</SelectItem><SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Assigned Department</Label>
                     <Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="h-12 rounded-xl font-bold bg-muted/20 border-none" />
                  </div>
                  <div className="space-y-2">
                     <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Operational Designation</Label>
                     <Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="h-12 rounded-xl font-bold bg-muted/20 border-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Access Key *</Label>
                        <Input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="h-12 rounded-xl font-bold bg-muted/20 border-none" />
                     </div>
                     <div className="space-y-2">
                        <Label className="font-medium text-[10px] uppercase text-muted-foreground tracking-widest ml-1">Confirm Key *</Label>
                        <Input required type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className="h-12 rounded-xl font-bold bg-muted/20 border-none" />
                     </div>
                  </div>
               </div>
               <DialogFooter className="pt-6 flex gap-6">
                  <Button type="button" variant="ghost" className="flex-1 font-bold h-14 rounded-2xl hover:bg-muted/10" onClick={() => setIsDialogOpen(false)}>Discard</Button>
                  <Button disabled={loading} className="flex-[2] bg-primary text-white font-medium h-14 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
                     {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <ShieldCheck className="w-6 h-6 mr-2" />} Establish Administrative Identity
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}


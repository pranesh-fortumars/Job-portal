"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, ShieldCheck, Loader2, LocateFixed, Lock, GraduationCap, Plus, Trash2, Camera, Upload, Zap, X, Users, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Textarea } from "@/components/ui/textarea";
import { cn, translateLocation } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, query, getDoc, where, getDocs, writeBatch } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import Image from "next/image";
import { BRANDING } from "@/lib/branding";
import { AppLogo } from "@/components/shared/AppLogo";

import { CLASSIFICATION } from "@/lib/constants";

export default function SeekerOnboarding() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const masterDesignationsQuery = useMemo(() => db ? query(collection(db, "Designations")) : null, [db]);
  const { data: masterDesignations } = useCollection<any>(masterDesignationsQuery);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "avinashi",
    gender: "",
    category: "Non-Technical" as 'Technical' | 'Non-Technical',
    department: "",
    designation: "",
    experience: "0",
    phone: "",
    photo: "",
    buyersHandled: "",
    auditExperience: "",
    certifications: "",
    coreSkills: [] as string[],
    declarationAccepted: false,
    latitude: null as number | null,
    longitude: null as number | null,
    academic: [] as any[]
  });

  const [recentCompany, setRecentCompany] = useState([
    { name: "", position: "", startDate: "", endDate: "", remarks: "" }
  ]);
  const [references, setReferences] = useState([
    { name: "", designation: "", company: "", contact: "", email: "", relationship: "", remarks: "" }
  ]);

  const [initialData, setInitialData] = useState<any>(null);
  const [newSkill, setNewSkill] = useState("");
  const hasResumed = useRef(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const savedCategory = localStorage.getItem('sim_job_seeker_category') as 'Technical' | 'Non-Technical';
    if (savedCategory) {
      setFormData(prev => ({ 
        ...prev, 
        category: savedCategory,
        academic: savedCategory === 'Technical' ? [{ education: "", degree: "", institute: "", year: "" }] : []
      }));
    }
    if (auth?.currentUser && db && !hasResumed.current) {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setInitialData(data);
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            gender: data.gender || prev.gender,
            phone: data.phone?.replace("+91", "") || prev.phone,
            location: translateLocation(data.location || prev.location, t),
            photo: data.photo || prev.photo,
            category: data.category || prev.category,
            department: data.department || prev.department,
            designation: data.designation || prev.designation,
            experience: data.experience || prev.experience,
            buyersHandled: data.digitalResume?.professional?.buyersHandled || prev.buyersHandled,
            auditExperience: data.digitalResume?.professional?.auditExperience || prev.auditExperience,
            certifications: data.digitalResume?.professional?.certifications || prev.certifications,
            coreSkills: data.digitalResume?.professional?.coreSkills || prev.coreSkills,
            academic: data.digitalResume?.academic || (data.category === 'Technical' ? [{ education: "", degree: "", institute: "", year: "" }] : [])
          }));
          if (data.digitalResume) {
            if (data.digitalResume.recentCompany) setRecentCompany(data.digitalResume.recentCompany);
            if (data.digitalResume.references) setReferences(data.digitalResume.references);
          }
          hasResumed.current = true;
        }
      });
    }
  }, [auth?.currentUser, db, t]);

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = () => reject(new Error("Image decoding failed"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const base64Data = await processImage(file);
      setFormData(prev => ({ ...prev, photo: base64Data }));
      toast({ title: "Photo Captured" });
    } catch (error: any) {
      console.error("Image processing error:", error);
      toast({ variant: "destructive", title: "Process Failed", description: error.message });
    } finally {
      setProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const designations = useMemo(() => {
    if (!formData.department || !formData.category) return [];
    const std = (CLASSIFICATION as any)[formData.category]?.designations[formData.department] || [];
    const masters = (masterDesignations || [])
      .filter((d: any) => d.category === formData.category && d.department === formData.department)
      .map((d: any) => d.name);
    return Array.from(new Set([...std, ...masters]));
  }, [formData.category, formData.department, masterDesignations]);

  const updateAcademicField = (index: number, field: string, value: string) => {
    const newAcademic = [...formData.academic];
    newAcademic[index] = { ...newAcademic[index], [field]: value };
    setFormData({ ...formData, academic: newAcademic });
  };

  const addAcademicRow = () => {
    setFormData({
      ...formData,
      academic: [...formData.academic, { education: "", degree: "", institute: "", year: "" }]
    });
  };

  const removeAcademicRow = (index: number) => {
    if (formData.academic.length <= 1) {
      toast({ variant: "destructive", title: "Minimum One Record Required" });
      return;
    }
    setFormData({
      ...formData,
      academic: formData.academic.filter((_, i) => i !== index)
    });
  };

  const updateTenure = (idx: number, field: string, val: string) => {
    const updated = [...recentCompany];
    updated[idx] = { ...updated[idx], [field]: val };
    setRecentCompany(updated);
  };
  const addTenure = () => setRecentCompany([...recentCompany, { name: "", position: "", startDate: "", endDate: "", remarks: "" }]);
  const removeTenure = (idx: number) => {
    if (recentCompany.length > 1) setRecentCompany(recentCompany.filter((_, i) => i !== idx));
  };

  const updateReference = (idx: number, field: string, val: string) => {
    const updated = [...references];
    updated[idx] = { ...updated[idx], [field]: val };
    setReferences(updated);
  };
  const addReference = () => setReferences([...references, { name: "", designation: "", company: "", contact: "", email: "", relationship: "", remarks: "" }]);
  const removeReference = (idx: number) => {
    if (references.length > 1) setReferences(references.filter((_, i) => i !== idx));
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = newSkill.trim().replace(',', '');
      if (skill) {
        const current = formData.coreSkills || [];
        if (!current.includes(skill)) {
          setFormData({ ...formData, coreSkills: [...current, skill] });
        }
        setNewSkill("");
      }
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, coreSkills: (formData.coreSkills || []).filter(s => s !== skill) });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name) return toast({ variant: "destructive", title: "Name Required" });
      if (!formData.gender) return toast({ variant: "destructive", title: "Gender Required" });
    }
    
    if (step === 2 && formData.category === 'Technical') {
      const hasCompleteEdu = formData.academic.every(edu => edu.education && edu.degree && edu.institute && edu.year);
      if (!hasCompleteEdu) return toast({ variant: "destructive", title: "Education Details Required", description: "Staff profiles must include institution, degree, and passing year." });
    }

    setStep(step + 1);
  };

  const handleFinish = async () => {
    if (!formData.declarationAccepted) return toast({ variant: "destructive", title: "Declaration Required" });
    if (!formData.department || !formData.designation) return toast({ variant: "destructive", title: "Classification Required" });

    setLoading(true);
    const user = auth?.currentUser;
    if (!user || !db) return;

    const userRef = doc(db, "Users", user.uid);
    
    const sanitizedPhone = formData.phone.replace(/\D/g, "").slice(-10);
    const phoneWithPrefix = `+91${sanitizedPhone}`;

    const updatePayload = {
      ...formData,
      phone: phoneWithPrefix,
      onboarded: true,
      updatedAt: serverTimestamp(),
      digitalResume: formData.category === 'Technical' ? {
        academic: formData.academic,
        recentCompany,
        references,
        professional: { 
          totalExperience: formData.experience, 
          buyersHandled: formData.buyersHandled,
          auditExperience: formData.auditExperience,
          certifications: formData.certifications,
          coreSkills: formData.coreSkills || []
        }
      } : null
    };

    const appsQuery = query(collection(db, "Applications"), where("jobSeekerId", "==", user.uid));

    getDocs(appsQuery)
      .then(appsSnap => {
        const batch = writeBatch(db);
        batch.set(userRef, updatePayload, { merge: true });
        
        appsSnap.docs.forEach(aDoc => {
          const appUpdate: Record<string, any> = {};
          if (formData.gender !== undefined) appUpdate.gender = formData.gender;
          if (formData.name !== undefined) appUpdate.seekerName = formData.name;
          if (formData.location !== undefined) appUpdate.location = formData.location;
          if (phoneWithPrefix !== undefined) appUpdate.phone = phoneWithPrefix;
          if (formData.experience !== undefined && formData.experience !== null) {
            appUpdate.experience = Number(formData.experience) || 0;
          }

          if (Object.keys(appUpdate).length > 0) {
            batch.update(aDoc.ref, appUpdate);
          }
        });
        
        return batch.commit();
      })
      .then(() => {
        localStorage.setItem('sim_seeker_onboarded', 'true');
        toast({ title: "Setup Complete & Synchronized!" });
        router.push("/");
      })
      .catch(err => {
        const permissionError = new FirestorePermissionError({ 
          path: userRef.path, 
          operation: 'write', 
          requestResourceData: updatePayload 
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setIsLocating(false);
        toast({ title: "Location Captured" });
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const isRoleLocked = !!initialData?.onboarded;
  const totalSteps = formData.category === 'Technical' ? 4 : 3;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:py-12 flex justify-center items-start">
        <Card className="w-full max-w-4xl shadow-2xl border-primary/10 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center space-y-4 border-b bg-muted/20 pb-8">
            <div className="flex justify-center gap-4 mb-4">
               <div className="w-16 h-16 rounded-2xl bg-white p-2 overflow-hidden shadow-sm flex items-center justify-center">
                 <AppLogo width={48} height={48} />
               </div>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= i + 1 ? 'bg-primary scale-110' : 'bg-muted'}`} />
              ))}
            </div>
            <CardTitle className="text-3xl font-extrabold font-headline text-primary uppercase tracking-tight">
              {step === 1 ? t.personalInfo : 
               (step === 2 && formData.category === 'Technical') ? "Academic Excellence" : 
               (step === (formData.category === 'Technical' ? 3 : 2)) ? t.jobPrefs : "Final Confirmation"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-8 px-6 md:px-12 max-h-[70vh] overflow-y-auto scrollbar-hide">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center gap-6 pb-4">
                   <div 
                     className="w-32 h-32 rounded-full border-4 border-primary/20 bg-muted flex items-center justify-center overflow-hidden cursor-pointer group relative shadow-xl"
                     onClick={() => !processing && fileInputRef.current?.click()}
                   >
                     <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoSelect} />
                     {processing ? (
                       <Loader2 className="w-8 h-8 animate-spin text-primary" />
                     ) : formData.photo ? (
                       <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <div className="text-center p-4">
                          <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs font-bold text-muted-foreground uppercase text-[10px]">Tap to Capture Profile Photo</p>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                     </div>
                   </div>
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic text-[10px]">A professional photo builds trust with factory owners.</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground tracking-widest"><User className="w-4 h-4 text-primary" /> {t.fullNameLabel}</Label>
                  <Input placeholder={t.fullNamePlaceholder} className="h-12 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                      <SelectTrigger className="h-12 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent className="font-bold rounded-xl">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer Not to Say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest">{t.mobileLabel}</Label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} className="h-12 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20" placeholder="10 digit number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest">{t.residingArea}</Label>
                    <Button type="button" variant="ghost" className="h-6 px-2 text-[10px] text-primary font-black uppercase gap-1" onClick={handleGetLocation} disabled={isLocating}>
                        {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />} Detect GPS
                    </Button>
                  </div>
                  <Input 
                    placeholder={t.locationPlaceholder} 
                    className="h-12 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                  />
                </div>
              </div>
            )}

            {step === 2 && formData.category === 'Technical' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b pb-2">
                   <h3 className="text-xl font-black text-primary flex items-center gap-2">
                     <GraduationCap className="w-6 h-6" /> Professional Education
                   </h3>
                   <Button variant="outline" size="sm" onClick={addAcademicRow} className="rounded-xl border-primary text-primary font-black uppercase text-[10px] tracking-widest">
                     <Plus className="w-4 h-4 mr-1" /> Add Degree
                   </Button>
                </div>
                <div className="space-y-6">
                  {formData.academic.map((edu, idx) => (
                    <div key={idx} className="bg-muted/10 p-6 rounded-3xl border border-dashed border-muted/50 relative group">
                      <Button variant="ghost" size="icon" onClick={() => removeAcademicRow(idx)} className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-muted-foreground">Qualification Level</Label>
                           <Select value={edu.education} onValueChange={v => updateAcademicField(idx, 'education', v)}>
                             <SelectTrigger className="h-10 rounded-xl font-bold bg-white"><SelectValue placeholder="e.g. Graduate" /></SelectTrigger>
                             <SelectContent className="font-bold rounded-xl">
                               <SelectItem value="SSLC">SSLC / 10th</SelectItem>
                               <SelectItem value="HSC">HSC / 12th</SelectItem>
                               <SelectItem value="Diploma">Diploma / ITI</SelectItem>
                               <SelectItem value="UG">Graduate (UG)</SelectItem>
                               <SelectItem value="PG">Post Graduate (PG)</SelectItem>
                               <SelectItem value="Doctorate">Doctorate / Ph.D</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-muted-foreground">Degree / Specialization</Label>
                           <Input value={edu.degree} onChange={e => updateAcademicField(idx, 'degree', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="e.g. B.Tech / Textiles" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-muted-foreground">Institution / College</Label>
                           <Input value={edu.institute} onChange={e => updateAcademicField(idx, 'institute', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="Name of College or Board" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-muted-foreground">Passing Year</Label>
                           <Input value={edu.year} onChange={e => updateAcademicField(idx, 'year', e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-10 rounded-xl font-bold bg-white" placeholder="YYYY" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === (formData.category === 'Technical' ? 3 : 2) && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-dashed border-primary/20 relative mb-6">
                   <Badge className="absolute -top-3 left-8 bg-primary text-white border-none font-black uppercase text-[10px] tracking-widest gap-1.5 px-4 py-1.5 shadow-lg">
                     <Lock className="w-3 h-3" /> Industrial Identity
                   </Badge>
                   <p className="text-[11px] text-muted-foreground font-black uppercase tracking-wider mb-6 italic text-center px-4 text-[10px]">
                     Important: Role classification is permanent once locked.
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest ml-1">Account Category</Label>
                      <Select disabled={isRoleLocked} value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v, department: "", designation: ""})}>
                        <SelectTrigger className="h-12 rounded-xl font-black bg-white border-none shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="font-bold rounded-xl"><SelectItem value="Technical">{t.staff}</SelectItem><SelectItem value="Non-Technical">{t.worker}</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.departmentLabel}</Label>
                      <Select disabled={isRoleLocked} value={formData.department} onValueChange={v => setFormData({...formData, department: v, designation: ""})}>
                        <SelectTrigger className="h-12 rounded-xl font-black bg-white border-none shadow-sm"><SelectValue placeholder="Select Department" /></SelectTrigger>
                        <SelectContent className="font-bold rounded-xl max-h-[300px]">{CLASSIFICATION[formData.category].departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.designationLabel}</Label>
                      <Select disabled={isRoleLocked} value={formData.designation} onValueChange={v => setFormData({...formData, designation: v})}>
                        <SelectTrigger className="h-12 rounded-xl font-black bg-white border-none shadow-sm"><SelectValue placeholder="Select Designation" /></SelectTrigger>
                        <SelectContent className="font-bold rounded-xl max-h-[300px]">{designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest">{t.totalExpLabel}</Label>
                    <Input type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="h-12 rounded-xl font-black border-primary/10" />
                  </div>
                </div>

                {formData.category === 'Technical' && (
                  <div className="space-y-8 pt-6 border-t-2 border-dashed border-primary/10">
                    <h3 className="text-xl font-black text-primary flex items-center gap-2">
                      <Zap className="w-6 h-6" /> Core Assets & Skills
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2 p-6 bg-muted/20 rounded-3xl border border-dashed border-primary/10">
                        <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.buyersHandledLabel}</Label>
                        <Input 
                          placeholder={t.previousBrandsPlaceholder} 
                          className="h-12 rounded-xl font-bold border-primary/10 bg-white mt-2" 
                          value={formData.buyersHandled} 
                          onChange={e => setFormData({...formData, buyersHandled: e.target.value})} 
                        />
                      </div>

                      <div className="space-y-2 p-6 bg-primary/5 rounded-3xl border border-dashed border-primary/20">
                        <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.auditExperienceLabel}</Label>
                        <Textarea 
                          placeholder="e.g. BSCI, SEDEX, WRAP, ISO, GOTS, OCS..." 
                          className="min-h-[100px] rounded-xl font-bold border-primary/10 bg-white mt-2" 
                          value={formData.auditExperience} 
                          onChange={e => setFormData({...formData, auditExperience: e.target.value})} 
                        />
                      </div>

                      <div className="space-y-2 p-6 bg-blue-50 rounded-3xl border border-dashed border-blue-200">
                        <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.certificationsLabel}</Label>
                        <Textarea 
                          placeholder={t.certificationsPlaceholder} 
                          className="min-h-[100px] rounded-xl font-bold bg-white border-blue-100 mt-2" 
                          value={formData.certifications} 
                          onChange={e => setFormData({...formData, certifications: e.target.value})} 
                        />
                      </div>

                      <div className="space-y-2 p-6 bg-accent/5 rounded-3xl border border-dashed border-accent/20">
                        <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.skillsLabel}</Label>
                        <div className="mt-4 space-y-4">
                          <div className="flex gap-2">
                            <Input 
                              value={newSkill}
                              onChange={e => setNewSkill(e.target.value)}
                              onKeyDown={handleAddSkill}
                              placeholder={t.skillsPlaceholder}
                              className="h-11 rounded-xl font-bold bg-white border-accent/10"
                            />
                            <Button 
                              type="button" 
                              onClick={() => {
                                const skill = newSkill.trim();
                                if (skill) {
                                  const current = formData.coreSkills || [];
                                  if (!current.includes(skill)) {
                                    setFormData({ ...formData, coreSkills: [...current, skill] });
                                  }
                                  setNewSkill("");
                                }
                              }}
                              className="bg-accent text-white rounded-xl h-11 px-4"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(formData.coreSkills || []).map((skill: string) => (
                              <Badge key={skill} className="bg-accent text-white py-1.5 pl-3 pr-2 rounded-lg font-bold flex items-center gap-2">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-red-200 transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t-2 border-dashed border-primary/10">
                      <div className="flex justify-between items-center border-b pb-2">
                         <h3 className="text-xl font-black text-primary flex items-center gap-2">
                           <History className="w-6 h-6" /> Employment History
                         </h3>
                         <Button type="button" variant="outline" size="sm" onClick={addTenure} className="rounded-xl border-primary text-primary font-black uppercase text-[10px] tracking-widest"><Plus className="w-4 h-4 mr-1" /> Add Tenure</Button>
                      </div>
                      <div className="space-y-6">
                        {recentCompany.map((job, i) => (
                          <div key={i} className="bg-muted/10 p-6 rounded-3xl border border-primary/10 relative group transition-all hover:bg-muted/20">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTenure(i)} className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                            <div className="grid grid-cols-1 gap-6">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Company Name</Label>
                                    <Input value={job.name} onChange={e => updateTenure(i, 'name', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Position Held</Label>
                                    <Input value={job.position} onChange={e => updateTenure(i, 'position', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                 </div>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Start Period</Label>
                                    <Input placeholder="e.g. June 2020" value={job.startDate} onChange={e => updateTenure(i, 'startDate', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">End Period</Label>
                                    <Input placeholder="e.g. Present" value={job.endDate} onChange={e => updateTenure(i, 'endDate', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                 </div>
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Notes / Responsibilities / Achievements / Remarks</Label>
                                  <Textarea placeholder="Describe your role..." value={job.remarks} onChange={e => updateTenure(i, 'remarks', e.target.value)} className="min-h-[100px] rounded-xl font-bold bg-white border-primary/10" />
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t-2 border-dashed border-primary/10">
                      <div className="flex justify-between items-center border-b pb-2">
                         <h3 className="text-xl font-black text-primary flex items-center gap-2">
                           <Users className="w-6 h-6" /> Professional References
                         </h3>
                         <Button type="button" variant="outline" size="sm" onClick={addReference} className="rounded-xl border-primary text-primary hover:text-primary font-black uppercase text-[10px] tracking-widest"><Plus className="w-4 h-4 mr-1" /> Add Reference</Button>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground leading-relaxed italic bg-primary/5 p-4 rounded-xl border border-dashed border-primary/10">
                        Mention references who hold a responsible position in your present or past employment.
                      </p>
                      <div className="space-y-6">
                        {references.map((ref, i) => (
                          <div key={i} className="bg-muted/10 p-6 rounded-3xl border border-primary/10 relative group transition-all hover:bg-muted/20">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeReference(i)} className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                            <div className="grid grid-cols-1 gap-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                     <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Contact Name</Label>
                                     <Input value={ref.name} onChange={e => updateReference(i, 'name', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                  </div>
                                  <div className="space-y-2">
                                     <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Company</Label>
                                     <Input value={ref.company} onChange={e => updateReference(i, 'company', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                  </div>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                     <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Designation</Label>
                                     <Input value={ref.designation} onChange={e => updateReference(i, 'designation', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                  </div>
                                  <div className="space-y-2">
                                     <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Mobile Number</Label>
                                     <Input value={ref.contact} onChange={e => updateReference(i, 'contact', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                  </div>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                     <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Email Address</Label>
                                     <Input value={ref.email} onChange={e => updateReference(i, 'email', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="name@example.com" />
                                  </div>
                                  <div className="space-y-2">
                                     <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Relationship</Label>
                                     <Input value={ref.relationship} onChange={e => updateReference(i, 'relationship', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="e.g. Reporting Manager" />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Context / Remarks</Label>
                                  <Textarea value={ref.remarks} onChange={e => updateReference(i, 'remarks', e.target.value)} placeholder="How do they know your work?" className="min-h-[80px] rounded-xl font-bold bg-white border-primary/10" />
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === totalSteps && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6 pt-6 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Final Declaration</h3>
                  <div className={cn(
                    "flex items-start gap-4 p-10 rounded-[2.5rem] border-2 border-dashed transition-all text-left group cursor-pointer",
                    formData.declarationAccepted ? "bg-primary/5 border-primary/40 shadow-inner" : "bg-muted/30 border-muted/50"
                  )} onClick={() => setFormData({...formData, declarationAccepted: !formData.declarationAccepted})}>
                    <Checkbox 
                      id="declaration" 
                      checked={formData.declarationAccepted} 
                      onCheckedChange={(v) => setFormData({...formData, declarationAccepted: !!v})}
                      className="mt-1 h-7 w-7 rounded-xl border-2 border-primary"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="declaration" className="font-black text-base md:text-lg cursor-pointer leading-relaxed text-foreground">
                        I hereby declare that all details furnished above are 100% accurate.
                      </Label>
                      <p className="text-xs font-bold text-muted-foreground italic text-[10px]">Incorrect information may lead to permanent account suspension.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-4 p-8 border-t bg-muted/10">
            {step > 1 && <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-muted-foreground" onClick={() => setStep(step - 1)} disabled={loading}>Back</Button>}
            <Button className="flex-[2] h-14 font-black bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 text-lg uppercase tracking-tight active:scale-95 transition-transform" onClick={step === totalSteps ? handleFinish : handleNext} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (step === totalSteps ? "Establish Identity" : "Next Milestone")}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

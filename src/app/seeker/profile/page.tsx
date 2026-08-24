"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Save, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Loader2, 
  Info, 
  History, 
  Users, 
  Lock, 
  Tag, 
  GraduationCap, 
  Camera,
  Upload,
  Download,
  Zap,
  X,
  LocateFixed,
  RefreshCcw,
  Clock,
  Mail
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn, translateLocation } from "@/lib/utils";
import { useAuth, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, addDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppLogo } from "@/components/shared/AppLogo";
import { format, isValid } from "date-fns";
import { DatePickerDropdown } from "@/components/ui/date-picker-dropdown";

import { CLASSIFICATION } from "@/lib/constants";

/**
 * Standardized date formatting helper for industrial records.
 */
const safeFormatDateOnly = (dateVal: any) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    return isValid(d) ? format(d, "dd MMM yyyy") : "N/A";
  } catch (e) {
    return "N/A";
  }
};

const PrintResume = ({ userData, formData, resumeData, t }: any) => {
  if (!formData) return null;

  return (
    <div className="print-area w-full text-black bg-white p-0 m-0">
      <div className="resume-document-frame">
        <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">{formData.name}</h1>
            <p className="text-lg font-bold text-gray-700 uppercase tracking-wide">{formData.designation} • {formData.department}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm font-medium">
              <span className="flex items-center gap-1">Mobile: +91 {formData.phone}</span>
              {formData.email && <span className="flex items-center gap-1">Email: {formData.email}</span>}
              <span className="flex items-center gap-1">Location: {formData.location}</span>
            </div>
          </div>
          {formData.photo && (
            <div className="w-24 h-24 border-2 border-black rounded-lg overflow-hidden shrink-0 ml-6">
              <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-black uppercase border-b-2 border-black mb-3">Industrial Profile</h2>
          <table className="print-table">
            <tbody>
              <tr>
                <th>Global Category</th><td>{formData.category}</td>
                <th>Total Experience</th><td>{formData.experience} Years</td>
              </tr>
              <tr>
                <th>Residing Area</th><td>{formData.location}</td>
                <th>Date of Birth</th><td>{safeFormatDateOnly(formData.dob)}</td>
              </tr>
              <tr>
                <th>Gender</th><td>{formData.gender || "Not Specified"}</td>
                <th>Verified Identity</th><td>{userData?.onboarded ? "Yes" : "No"}</td>
              </tr>
              {formData.category === 'Technical' && (
                <>
                  <tr>
                    <th>Buyers Handled</th><td colSpan={3}>{resumeData.professional.buyersHandled || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Audit Experience</th><td colSpan={3}>{resumeData.professional.auditExperience || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Computer & Software Skills</th><td colSpan={3}>{resumeData.professional.certifications || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Core Skills</th><td colSpan={3}>{(resumeData.professional.coreSkills || []).join(', ') || "N/A"}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </section>

        {formData.category === 'Technical' && resumeData.academic?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-black uppercase border-b-2 border-black mb-3">Academic Records</h2>
            <table className="print-grid-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Degree / Specialization</th>
                  <th>Institution / College</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {resumeData.academic.map((edu: any, i: number) => (
                  <tr key={i}>
                    <td className="font-bold">{edu.education}</td>
                    <td>{edu.degree}</td>
                    <td>{edu.institute}</td>
                    <td className="text-center">{edu.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {formData.category === 'Technical' && resumeData.recentCompany?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-black uppercase border-b-2 border-black mb-3">Employment History</h2>
            <table className="print-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Company & Role</th>
                  <th style={{ width: '25%' }}>Tenure</th>
                  <th style={{ width: '45%' }}>Notes / Responsibilities / Remarks</th>
                </tr>
              </thead>
              <tbody>
                {resumeData.recentCompany.map((job: any, i: number) => (
                  <tr key={i}>
                    <td>
                      <div className="font-bold">{job.name}</div>
                      <div className="text-xs italic">{job.position}</div>
                    </td>
                    <td className="text-center font-medium">{job.startDate} - {job.endDate}</td>
                    <td className="text-[8pt] leading-relaxed">{job.remarks || "No specific details provided."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {formData.category === 'Technical' && resumeData.references?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-black uppercase border-b-2 border-black mb-3">Professional References</h2>
            <table className="print-grid-table">
              <thead>
                <tr>
                  <th>Reference Name</th>
                  <th>Designation & Firm</th>
                  <th>Contact Information</th>
                  <th>Relationship</th>
                  <th>Remarks / Context</th>
                </tr>
              </thead>
              <tbody>
                {resumeData.references.map((ref: any, i: number) => (
                  <tr key={i}>
                    <td className="font-bold">{ref.name}</td>
                    <td>{ref.designation} • {ref.company}</td>
                    <td>
                      <div className="font-medium">+91 {ref.contact}</div>
                      {ref.email && <div className="text-[7pt] text-gray-600">{ref.email}</div>}
                    </td>
                    <td className="text-center italic">{ref.relationship || "N/A"}</td>
                    <td className="text-[8pt]">{ref.remarks || "Professional reference."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <div className="mt-10 pt-4 border-t border-dotted border-gray-400 text-center">
          <p className="text-[7pt] text-gray-500 uppercase tracking-widest">
            Verified Industrial Profile • Generated via NexTirupur.in • {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SeekerProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const userRef = useMemo(() => (auth?.currentUser && db) ? doc(db, "Users", auth.currentUser.uid) : null, [db, auth?.currentUser]);
  const { data: userData, loading: userLoading } = useDoc<any>(userRef);

  const masterDesignationsQuery = useMemo(() => db ? query(collection(db, "Designations")) : null, [db]);
  const { data: masterDesignations } = useCollection<any>(masterDesignationsQuery);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    gender: "",
    category: "Non-Technical" as 'Technical' | 'Non-Technical',
    department: "",
    designation: "",
    experience: "0",
    phone: "",
    email: "",
    photo: "",
    declarationAccepted: false,
    dob: ""
  });

  const [resumeData, setResumeData] = useState<any>({
    academic: [{ education: "", degree: "", institute: "", year: "" }],
    recentCompany: [{ name: "", position: "", startDate: "", endDate: "", remarks: "" }],
    references: [{ name: "", designation: "", company: "", contact: "", email: "", relationship: "", remarks: "" }],
    professional: { coreSkills: [], expectedSalary: "", buyersHandled: "", auditExperience: "", certifications: "" }
  });

  const [newSkill, setNewSkill] = useState("");

  const [isRoleRequestModalOpen, setIsRoleRequestModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [roleRequestData, setRoleRequestData] = useState({
    requestedDepartment: "",
    requestedDesignation: "",
    reason: ""
  });

  const pendingRoleRequestQuery = useMemo(() => (auth?.currentUser && db) ? query(collection(db, "DesignationChangeRequests"), where("uid", "==", auth.currentUser.uid), where("status", "==", "pending")) : null, [db, auth?.currentUser]);
  const { data: pendingRoleRequests } = useCollection<any>(pendingRoleRequestQuery);
  const hasPendingRoleRequest = useMemo(() => (pendingRoleRequests || []).length > 0, [pendingRoleRequests]);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        location: translateLocation(userData.location || "", t),
        gender: userData.gender || "",
        category: userData.category || "Non-Technical",
        department: userData.department || "",
        designation: userData.designation || "",
        experience: userData.experience || "0",
        phone: userData.phone?.replace("+91", "") || "",
        email: (userData.email && !userData.email.endsWith('@nextirupur.internal')) ? userData.email : "",
        photo: userData.photo || "",
        declarationAccepted: userData.declarationAccepted || false,
        dob: userData.dob || ""
      });
      if (userData.digitalResume) {
        setResumeData({
          ...resumeData,
          ...userData.digitalResume,
          academic: userData.digitalResume.academic || [{ education: "", degree: "", institute: "", year: "" }],
          recentCompany: userData.digitalResume.recentCompany || [{ name: "", position: "", startDate: "", endDate: "", remarks: "" }],
          references: userData.digitalResume.references || [{ name: "", designation: "", company: "", contact: "", email: "", relationship: "", remarks: "" }],
          professional: {
            ...resumeData.professional,
            ...(userData.digitalResume.professional || {}),
            coreSkills: userData.digitalResume.professional?.coreSkills || []
          }
        });
      }
    }
  }, [userData, t]);

  const isProfileLocked = !!userData?.onboarded;

  const designations = useMemo(() => {
    if (!formData.department || !formData.category) return [];
    const std = (CLASSIFICATION as any)[formData.category]?.designations[formData.department] || [];
    const masters = (masterDesignations || [])
      .filter((d: any) => d.category === formData.category && d.department === formData.department)
      .map((d: any) => d.name);
    return Array.from(new Set([...std, ...masters]));
  }, [formData.category, formData.department, masterDesignations]);

  const requestDesignations = useMemo(() => {
    if (!roleRequestData.requestedDepartment || !formData.category) return [];
    const std = (CLASSIFICATION as any)[formData.category]?.designations[roleRequestData.requestedDepartment] || [];
    const masters = (masterDesignations || [])
      .filter((d: any) => d.category === formData.category && d.department === roleRequestData.requestedDepartment)
      .map((d: any) => d.name);
    return Array.from(new Set([...std, ...masters]));
  }, [formData.category, roleRequestData.requestedDepartment, masterDesignations]);

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
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
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
      toast({ title: "Photo Updated", description: "Save profile to persist changes." });
    } catch (error: any) {
      console.error("Image processing error:", error);
      toast({ variant: "destructive", title: "Process Failed", description: error.message });
    } finally {
      setProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Geolocation not supported" });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          const data = await res.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, location: data.display_name }));
            toast({ title: "Exact Location Captured" });
          }
        } catch (e) {
          toast({ title: "Coordinates Saved" });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast({ variant: "destructive", title: "Location Error" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!formData.declarationAccepted) return toast({ variant: "destructive", title: "Declaration Required" });
    if (!auth?.currentUser || !userRef || !db) return;

    if (formData.category === 'Technical') {
      const hasCompleteEdu = resumeData.academic.every((edu: any) => edu.education && edu.degree && edu.institute && edu.year);
      if (!hasCompleteEdu) {
        return toast({ 
          variant: "destructive", 
          title: "Incomplete Academic Records", 
          description: "All education fields are mandatory for Staff roles." 
        });
      }
    }

    setLoading(true);

    const sanitizedPhone = formData.phone.replace(/\D/g, "").slice(-10);
    const phoneWithPrefix = `+91${sanitizedPhone}`;

    const cleaned = { 
      name: formData.name,
      location: formData.location,
      gender: formData.gender,
      phone: phoneWithPrefix,
      email: formData.email,
      photo: formData.photo,
      declarationAccepted: formData.declarationAccepted,
      digitalResume: formData.category === 'Technical' ? resumeData : null,
      category: formData.category,
      department: formData.department,
      designation: formData.designation,
      dob: formData.dob,
      updatedAt: serverTimestamp() 
    };

    const appsQuery = query(collection(db, "Applications"), where("jobSeekerId", "==", auth.currentUser.uid));
    
    getDocs(appsQuery)
      .then(appsSnap => {
        const batch = writeBatch(db);
        batch.set(userRef, cleaned, { merge: true });
        
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
        toast({ title: "Profile Synchronized" });
        router.push("/seeker/dashboard");
      })
      .catch(err => {
        const permissionError = new FirestorePermissionError({ 
          path: userRef.path, 
          operation: 'write', 
          requestResourceData: cleaned 
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };

  const submitRoleRequest = async () => {
    if (!roleRequestData.requestedDepartment || !roleRequestData.requestedDesignation || !roleRequestData.reason.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please select new role and provide justification." });
      return;
    }

    setIsRequesting(true);
    try {
      const requestPayload = {
        uid: auth?.currentUser?.uid,
        candidateName: userData?.name,
        phone: userData?.phone,
        currentDepartment: userData?.department,
        currentDesignation: userData?.designation,
        requestedDepartment: roleRequestData.requestedDepartment,
        requestedDesignation: roleRequestData.requestedDesignation,
        reason: roleRequestData.reason.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const requestRef = doc(collection(db!, "DesignationChangeRequests"));
      await setDoc(requestRef, { ...requestPayload, id: requestRef.id });

      await addDoc(collection(db!, "AdminNotifications"), {
        type: "designation_change",
        title: "Role Change Requested",
        message: `${userData?.name} has requested a designation update to ${roleRequestData.requestedDesignation}.`,
        targetId: auth?.currentUser?.uid,
        status: "unread",
        createdAt: serverTimestamp()
      });

      toast({ title: "Request Submitted", description: "Administrative audit will be completed within 24 hours." });
      setIsRoleRequestModalOpen(false);
      setRoleRequestData({ requestedDepartment: "", requestedDesignation: "", reason: "" });
    } catch (err) {
      toast({ variant: "destructive", title: "Request Failed" });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const updateResumeField = (section: string, index: number, field: string, value: any) => {
    const newData = { ...resumeData };
    if (section === 'professional') {
      newData.professional[field] = value;
    } else {
      newData[section][index][field] = value;
    }
    setResumeData(newData);
  };

  const addResumeRow = (section: string) => {
    const newData = { ...resumeData };
    const templates: any = {
      academic: { education: "", degree: "", institute: "", year: "" },
      recentCompany: { name: "", position: "", startDate: "", endDate: "", remarks: "" },
      references: { name: "", designation: "", company: "", contact: "", email: "", relationship: "", remarks: "" }
    };
    newData[section] = [...newData[section], templates[section]];
    setResumeData(newData);
  };

  const removeResumeRow = (section: string, index: number) => {
    if (section === 'academic' && resumeData.academic.length <= 1) {
       toast({ variant: "destructive", title: "Minimum One Record Required" });
       return;
    }
    const newData = { ...resumeData };
    newData[section] = newData[section].filter((_: any, i: number) => i !== index);
    setResumeData(newData);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = newSkill.trim().replace(',', '');
      if (skill) {
        const current = resumeData.professional.coreSkills || [];
        if (!current.includes(skill)) {
          updateResumeField('professional', 0, 'coreSkills', [...current, skill]);
        }
        setNewSkill("");
      }
    }
  };

  const removeSkill = (skill: string) => {
    const current = resumeData.professional.coreSkills || [];
    updateResumeField('professional', 0, 'coreSkills', current.filter((s: string) => s !== skill));
  };

  if (userLoading) return <div className="p-20 text-center font-bold">Syncing Records...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:py-12 flex justify-center items-start">
        <div className="w-full max-w-5xl space-y-8">
          
          <div className="print:hidden space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/seeker/dashboard')} className="font-bold text-primary hover:text-primary gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> {t.backToPrev}
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={handleDownload} 
                  className="flex-1 sm:flex-none font-bold text-primary hover:text-primary focus:text-primary active:text-primary gap-2 h-11 px-6 rounded-xl border-primary/20 hover:bg-primary/5 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download Profile (PDF)
                </Button>
                <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none bg-primary text-white font-black px-8 rounded-xl shadow-lg h-11 gap-2 active:scale-95 transition-transform">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
                </Button>
              </div>
            </div>

            <Card className="rounded-[2.5rem] overflow-hidden shadow-2xl border-none">
              <CardHeader className="bg-primary text-white p-8 md:p-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                   <div className="space-y-4 flex-1">
                     <CardTitle className="text-3xl md:text-5xl font-black font-headline tracking-tight">{formData.name || "Seeker Profile"}</CardTitle>
                     <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="bg-white/20 text-white border-none font-black uppercase text-[10px] tracking-widest gap-1.5 px-3 py-1 shadow-sm">
                          <Lock className="w-3 h-3" /> Identity Locked
                        </Badge>
                        <Badge className="bg-accent text-white border-none font-black px-3 py-1 rounded-lg shadow-md">{formData.category}</Badge>
                     </div>
                   </div>
                   
                   <div className="relative group shrink-0">
                      <div 
                        className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/20 flex items-center justify-center overflow-hidden cursor-pointer shadow-2xl transition-transform hover:scale-105"
                        onClick={() => !processing && fileInputRef.current?.click()}
                      >
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoSelect} />
                        {processing ? (
                          <Loader2 className="w-8 h-8 animate-spin text-white" />
                        ) : formData.photo ? (
                          <img src={formData.photo} alt="Profile" className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-center p-2">
                             <Camera className="w-8 h-8 text-white/40 mx-auto mb-1" />
                             <p className="text-[8px] font-black uppercase text-white/60">Upload Photo</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                   </div>
                 </div>
              </CardHeader>

              <CardContent className="p-8 md:p-12 space-y-12">
                 <div className="space-y-8">
                   <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                     <User className="w-6 h-6" /> Personal Details
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="space-y-2 lg:col-span-2"><Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.fullNameLabel}</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20" /></div>
                     <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.mobileLabel}</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-11 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20" /></div>
                     <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">Email Address (Optional)</Label><Input value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="h-11 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20" placeholder="yourname@example.com" /></div>
                     <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">Gender</Label>
                        <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                          <SelectTrigger className="h-11 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20">
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
                       <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.dobLabel}</Label>
                       <DatePickerDropdown 
                         value={formData.dob} 
                         onChange={(v) => setFormData({...formData, dob: v || ""})} 
                         maxYear={new Date().getFullYear() - 18}
                       />
                     </div>
                     <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.residingArea}</Label>
                         <Button type="button" variant="ghost" className="h-6 px-2 text-[10px] text-primary font-black uppercase gap-1" onClick={handleGetLocation} disabled={isLocating}>
                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />} Detect GPS
                         </Button>
                       </div>
                       <Input 
                         value={formData.location} 
                         onChange={e => setFormData({...formData, location: e.target.value})} 
                         className="h-11 rounded-xl font-bold border-primary/10 focus-visible:ring-primary/20" 
                         placeholder={t.locationPlaceholder}
                       />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-8 bg-muted/5 p-8 rounded-[2.5rem] border-2 border-dashed border-primary/10 relative">
                   <div className="flex justify-between items-center border-b-2 border-primary/10 pb-2">
                      <h3 className="text-xl font-black text-primary flex items-center gap-2">
                        <Tag className="w-6 h-6" /> Industrial Identity
                      </h3>
                      {isProfileLocked && (
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl border-primary text-primary font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-primary/5"
                          onClick={() => setIsRoleRequestModalOpen(true)}
                          disabled={hasPendingRoleRequest}
                        >
                          <RefreshCcw className={cn("w-3.5 h-3.5", hasPendingRoleRequest && "animate-spin")} />
                          {hasPendingRoleRequest ? "Audit in Progress" : "Request Role Change"}
                        </Button>
                      )}
                   </div>

                   {hasPendingRoleRequest && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 animate-pulse">
                        <Clock className="w-5 h-5 shrink-0" />
                        <p className="text-xs font-bold">A role override request is currently pending administrative audit.</p>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground tracking-widest">
                          <span>Main Category</span>
                          {isProfileLocked && <Lock className="w-3 h-3" />}
                        </Label>
                        <Select 
                          disabled={isProfileLocked} 
                          value={formData.category} 
                          onValueChange={(v: any) => setFormData({...formData, category: v, department: "", designation: ""})}
                        >
                          <SelectTrigger className={cn("h-11 rounded-xl font-black", isProfileLocked ? "bg-white/50 opacity-60" : "bg-white shadow-sm")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="font-bold rounded-xl">
                            <SelectItem value="Technical">{t.staff}</SelectItem>
                            <SelectItem value="Non-Technical">{t.worker}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground tracking-widest">
                          <span>Department</span>
                          {isProfileLocked && <Lock className="w-3 h-3" />}
                        </Label>
                        <Select 
                          disabled={isProfileLocked} 
                          value={formData.department} 
                          onValueChange={v => setFormData({...formData, department: v, designation: ""})}
                        >
                          <SelectTrigger className={cn("h-11 rounded-xl font-black", isProfileLocked ? "bg-white/50 opacity-60" : "bg-white shadow-sm")}>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent className="font-bold rounded-xl max-h-[300px]">
                             {CLASSIFICATION[formData.category].departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground tracking-widest">
                          <span>Designation</span>
                          {isProfileLocked && <Lock className="w-3 h-3" />}
                        </Label>
                        <Select 
                          disabled={isProfileLocked} 
                          value={formData.designation} 
                          onValueChange={v => setFormData({...formData, designation: v})}
                        >
                          <SelectTrigger className={cn("h-11 rounded-xl font-black", isProfileLocked ? "bg-white/50 opacity-60" : "bg-white shadow-sm")}>
                            <SelectValue placeholder="Select Designation" />
                          </SelectTrigger>
                          <SelectContent className="font-bold rounded-xl max-h-[300px]">
                             {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                 </div>

                 {formData.category === 'Technical' && (
                   <>
                     <div className="space-y-8 resume-document-frame m-4">
                       <div className="flex justify-between items-center border-b-2 border-primary/10 pb-2">
                          <h3 className="text-xl font-black text-primary flex items-center gap-2">
                            <Zap className="w-6 h-6" /> Core Assets & Skills
                          </h3>
                       </div>
                       <div className="grid grid-cols-1 gap-6">
                          <div className="bg-muted/10 p-8 rounded-[2rem] border border-dashed border-primary/10">
                            <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.buyersHandledLabel}</Label>
                            <Input 
                              value={resumeData.professional.buyersHandled || ""} 
                              onChange={e => updateResumeField('professional', 0, 'buyersHandled', e.target.value)} 
                              className="h-11 rounded-xl font-bold bg-white border-primary/10 mt-2" 
                              placeholder="e.g. H&M, Zara, Primark" 
                            />
                          </div>

                          <div className="bg-primary/5 p-8 rounded-[2rem] border border-dashed border-primary/20">
                            <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">{t.auditExperienceLabel}</Label>
                            <Textarea 
                              value={resumeData.professional.auditExperience || ""} 
                              onChange={e => updateResumeField('professional', 0, 'auditExperience', e.target.value)} 
                              className="min-h-[100px] rounded-xl font-bold bg-white border-primary/10 mt-2" 
                              placeholder="e.g. BSCI, SEDEX, WRAP, ISO, GOTS, OCS..." 
                            />
                          </div>

                          <div className="bg-blue-50 p-8 rounded-[2rem] border border-dashed border-blue-200">
                            <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">Computer Skills And Software Skills</Label>
                            <Textarea 
                              value={resumeData.professional.certifications || ""} 
                              onChange={e => updateResumeField('professional', 0, 'certifications', e.target.value)} 
                              className="min-h-[100px] rounded-xl font-bold bg-white border-blue-100 mt-2" 
                              placeholder={t.certificationsPlaceholder}
                            />
                          </div>

                          <div className="bg-accent/5 p-8 rounded-[2rem] border border-dashed border-accent/20">
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
                                      const current = resumeData.professional.coreSkills || [];
                                      if (!current.includes(skill)) {
                                        updateResumeField('professional', 0, 'coreSkills', [...current, skill]);
                                      }
                                      setNewSkill("");
                                    }
                                  }}
                                  className="bg-accent text-white rounded-xl h-11 px-4"
                                >
                                  Add
                                </Button>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed px-1">
                                Examples: Communication, Problem Solving, Negotiation, T&A Management, Team Leadership, Time Management, Decision Making, Customer Handling, Production Planning, Quality Control, etc.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(resumeData.professional.coreSkills || []).map((skill: string) => (
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
                     </div>

                     <div className="space-y-8 resume-document-frame m-4">
                       <div className="flex justify-between items-center border-b-2 border-primary/10 pb-2">
                          <h3 className="text-xl font-black text-primary flex items-center gap-2">
                            <GraduationCap className="w-6 h-6" /> Academic Qualifications
                          </h3>
                          <Button variant="outline" size="sm" onClick={() => addResumeRow('academic')} className="rounded-xl border-primary text-primary hover:text-primary font-black uppercase text-[10px] tracking-widest">
                            <Plus className="w-4 h-4 mr-1" /> Add Education
                          </Button>
                       </div>
                       <div className="grid grid-cols-1 gap-6">
                          {resumeData.academic.map((edu: any, i: number) => (
                            <div key={i} className="bg-muted/10 p-8 rounded-[2rem] border relative group transition-all hover:bg-muted/20">
                              <Button variant="ghost" size="icon" onClick={() => removeResumeRow('academic', i)} className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                              <div className="grid grid-cols-1 gap-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-2">
                                      <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Qualification Level</Label>
                                      <Select value={edu.education} onValueChange={v => updateResumeField('academic', i, 'education', v)}>
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
                                      <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Degree / Course</Label>
                                      <Input value={edu.degree} onChange={e => updateResumeField('academic', i, 'degree', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="e.g. B.A Economics" />
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Institution Name</Label>
                                    <Input value={edu.institute} onChange={e => updateResumeField('academic', i, 'institute', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="University or Board Name" />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Year of Passing</Label>
                                    <Input value={edu.year} onChange={e => updateResumeField('academic', i, 'year', e.target.value.replace(/\D/g, ""))} className="h-10 rounded-xl font-bold bg-white" placeholder="YYYY" />
                                 </div>
                              </div>
                            </div>
                          ))}
                       </div>
                     </div>

                     <div className="space-y-8 resume-document-frame m-4">
                       <div className="flex justify-between items-center border-b-2 border-primary/10 pb-2">
                          <h3 className="text-xl font-black text-primary flex items-center gap-2">
                            <History className="w-6 h-6" /> Employment History
                          </h3>
                          <Button variant="outline" size="sm" onClick={() => addResumeRow('recentCompany')} className="rounded-xl border-primary text-primary hover:text-primary font-black uppercase text-[10px] tracking-widest"><Plus className="w-4 h-4 mr-1" /> Add Tenure</Button>
                       </div>
                       <div className="space-y-6">
                          {resumeData.recentCompany.map((job: any, i: number) => (
                            <div key={i} className="bg-muted/10 p-6 rounded-3xl border border-primary/10 relative group transition-all hover:bg-muted/20">
                              <Button variant="ghost" size="icon" onClick={() => removeResumeRow('recentCompany', i)} className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                              <div className="grid grid-cols-1 gap-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-2">
                                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Company Name</Label>
                                      <Input value={job.name} onChange={e => updateResumeField('recentCompany', i, 'name', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                   </div>
                                   <div className="space-y-2">
                                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Position Held</Label>
                                      <Input value={job.position} onChange={e => updateResumeField('recentCompany', i, 'position', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                   </div>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-2">
                                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Start Period</Label>
                                      <Input placeholder="e.g. June 2020" value={job.startDate} onChange={e => updateResumeField('recentCompany', i, 'startDate', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                   </div>
                                   <div className="space-y-2">
                                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">End Period</Label>
                                      <Input placeholder="e.g. Present" value={job.endDate} onChange={e => updateResumeField('recentCompany', i, 'endDate', e.target.value)} className="h-10 rounded-xl font-bold bg-white border-primary/10" />
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Notes / Responsibilities / Achievements / Remarks</Label>
                                    <Textarea 
                                      placeholder={t.remarksPlaceholder} 
                                      value={job.remarks || ""} 
                                      onChange={e => updateResumeField('recentCompany', i, 'remarks', e.target.value)} 
                                      className="min-h-[120px] rounded-xl font-bold bg-white border-primary/10" 
                                    />
                                 </div>
                              </div>
                            </div>
                          ))}
                       </div>
                     </div>

                     <div className="space-y-8 resume-document-frame m-4">
                       <div className="flex justify-between items-center border-b-2 border-primary/10 pb-2">
                          <h3 className="text-xl font-black text-primary flex items-center gap-2">
                            <Users className="w-6 h-6" /> Professional References
                          </h3>
                          <Button variant="outline" size="sm" onClick={() => addResumeRow('references')} className="rounded-xl border-primary text-primary hover:text-primary font-black uppercase text-[10px] tracking-widest"><Plus className="w-4 h-4 mr-1" /> Add Reference</Button>
                       </div>
                       <p className="text-xs font-bold text-muted-foreground leading-relaxed italic bg-primary/5 p-4 rounded-xl border border-dashed border-primary/10 mb-6 text-[10px]">
                         {t.referenceSub}
                       </p>
                       <div className="grid grid-cols-1 gap-6">
                          {resumeData.references.map((ref: any, i: number) => (
                            <div key={i} className="bg-muted/10 p-8 rounded-[2rem] border border-primary/10 relative group transition-all hover:bg-muted/20">
                              <Button variant="ghost" size="icon" onClick={() => removeResumeRow('references', i)} className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                              <div className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                       <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Contact Name</Label>
                                       <Input value={ref.name} onChange={e => updateResumeField('references', i, 'name', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                       <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Company</Label>
                                       <Input value={ref.company} onChange={e => updateResumeField('references', i, 'company', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                       <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Designation</Label>
                                       <Input value={ref.designation} onChange={e => updateResumeField('references', i, 'designation', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                       <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Mobile Number</Label>
                                       <Input value={ref.contact} onChange={e => updateResumeField('references', i, 'contact', e.target.value)} className="h-10 rounded-xl font-bold bg-white" />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                       <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Email Address</Label>
                                       <Input value={ref.email} onChange={e => updateResumeField('references', i, 'email', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="name@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                       <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Relationship</Label>
                                       <Input value={ref.relationship} onChange={e => updateResumeField('references', i, 'relationship', e.target.value)} className="h-10 rounded-xl font-bold bg-white" placeholder="e.g. Reporting Manager" />
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.referenceRemarksLabel}</Label>
                                    <Textarea 
                                      value={ref.remarks || ""} 
                                      onChange={e => updateResumeField('references', i, 'remarks', e.target.value)} 
                                      placeholder={t.referenceRemarksPlaceholder}
                                      className="min-h-[100px] rounded-xl font-bold bg-white border-primary/10" 
                                    />
                                 </div>
                              </div>
                            </div>
                          ))}
                       </div>
                     </div>
                   </>
                 )}

                 <div className="space-y-8">
                   <h3 className="text-xl font-black text-primary flex items-center gap-3 border-b-2 border-primary/10 pb-2">
                     <ShieldCheck className="w-6 h-6" /> Platform Declaration
                   </h3>
                   <div className={cn("flex items-start gap-4 p-10 rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer", formData.declarationAccepted ? "bg-primary/5 border-primary/40 shadow-inner" : "bg-muted/30 border-muted")} onClick={() => setFormData({...formData, declarationAccepted: !formData.declarationAccepted})}>
                      <Checkbox id="declaration" checked={formData.declarationAccepted} onCheckedChange={v => setFormData({...formData, declarationAccepted: !!v})} className="mt-1 h-7 w-7 rounded-xl border-2 border-primary" />
                      <div className="space-y-1">
                        <Label htmlFor="declaration" className="font-black text-base md:text-lg cursor-pointer leading-relaxed text-foreground">
                          I hereby declare that all profile information and academic records are accurate.
                        </Label>
                        <p className="text-xs font-bold text-muted-foreground italic text-[10px]">Your professional identity is verified and locked to prevent fraud.</p>
                      </div>
                   </div>
                 </div>
              </CardContent>
              <CardFooter className="p-8 md:p-12 border-t bg-muted/10">
                 <Button onClick={handleSave} disabled={loading} className="w-full h-16 font-black bg-primary text-white rounded-2xl text-xl shadow-xl shadow-primary/20 uppercase tracking-tight active:scale-95 transition-transform">
                   {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : "Establish Verified Identity"}
                 </Button>
              </CardFooter>
            </Card>
          </div>

          <PrintResume 
            userData={userData} 
            formData={formData} 
            resumeData={resumeData} 
            t={t} 
          />
        </div>
      </main>

      <Dialog open={isRoleRequestModalOpen} onOpenChange={setIsRoleRequestModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-white">
            <div className="flex items-center gap-3">
              <RefreshCcw className="w-8 h-8" />
              <div>
                <DialogTitle className="text-2xl font-black">Role Override Request</DialogTitle>
                <DialogDescription className="text-white/80 font-bold uppercase text-xs tracking-widest">Professional Identity Audit Required</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs font-bold text-primary">
              Note: Requesting a role change will submit your profile for a formal administrative audit. Your current verified designation will remain active until approved.
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-muted/20 rounded-xl border border-dashed space-y-1">
                  <Label className="text-[10px] font-black uppercase opacity-60">Current Department</Label>
                  <p className="font-bold text-muted-foreground">{formData.department}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-xl border border-dashed space-y-1">
                  <Label className="text-[10px] font-black uppercase opacity-60">Current Designation</Label>
                  <p className="font-bold text-muted-foreground">{formData.designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest ml-1">Requested Department</Label>
                  <Select value={roleRequestData.requestedDepartment} onValueChange={v => setRoleRequestData({...roleRequestData, requestedDepartment: v, requestedDesignation: ""})}>
                    <SelectTrigger className="h-12 rounded-xl font-bold bg-white border-primary/10 shadow-sm"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                    <SelectContent className="font-bold rounded-xl max-h-[250px]">
                      {CLASSIFICATION[formData.category].departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest ml-1">Requested Designation</Label>
                  <Select value={roleRequestData.requestedDesignation} onValueChange={v => setRoleRequestData({...roleRequestData, requestedDesignation: v})}>
                    <SelectTrigger className="h-12 rounded-xl font-bold bg-white border-primary/10 shadow-sm"><SelectValue placeholder="Select Role" /></SelectTrigger>
                    <SelectContent className="font-bold rounded-xl max-h-[300px]">
                      {requestDesignations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest ml-1">Reason for Change</Label>
                <Textarea 
                  value={roleRequestData.reason}
                  onChange={e => setRoleRequestData({...roleRequestData, reason: e.target.value})}
                  placeholder="Explain why you are updating your professional classification..."
                  className="min-h-[100px] rounded-xl font-medium"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/20 border-t flex gap-4">
            <Button variant="ghost" className="flex-1 font-bold h-14 rounded-2xl" onClick={() => setIsRoleRequestModalOpen(false)}>Cancel</Button>
            <Button 
              disabled={isRequesting || !roleRequestData.requestedDesignation || !roleRequestData.reason}
              onClick={submitRoleRequest}
              className="flex-[2] bg-primary text-white font-black h-14 rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Role Override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

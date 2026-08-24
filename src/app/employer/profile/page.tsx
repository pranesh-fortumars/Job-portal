"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Edit3,
  LocateFixed,
  Image as ImageIcon,
  Check,
  Lock,
  RefreshCcw,
  Navigation,
  Clock,
  Smartphone,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { cn, translateLocation } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function EmployerProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const userRef = useMemo(() => (auth?.currentUser && db) ? doc(db, "Users", auth.currentUser.uid) : null, [db, auth?.currentUser]);
  const { data: userData, loading: userLoading } = useDoc<any>(userRef);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isNamingRequesting, setIsNameRequesting] = useState(false);
  const [isEditingGst, setIsEditingGst] = useState(false);
  
  const gateFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    companyName: "", 
    location: "avinashi",
    gst: "",
    photo: "", 
    companyLogoUrl: "", 
    status: 'pending',
    establishedYear: "",
    fullAddress: "",
    area: "",
    contactPersonName: "",
    designation: "",
    phone: "",
    emailId: "",
    latitude: null as number | null,
    longitude: null as number | null
  });

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    fullAddress: "",
    area: "",
    latitude: null as number | null,
    longitude: null as number | null,
    reason: ""
  });

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameRequestData, setNameRequestData] = useState({
    requestedName: "",
    reason: ""
  });

  const isLocationLocked = useMemo(() => userData?.status === 'approved', [userData]);

  useEffect(() => {
    if (!userLoading && userData && userData.role !== 'employer' && userData.role !== 'admin') {
      router.push('/');
    }
  }, [userData, userLoading, router]);

  useEffect(() => {
    if (userData) {
      setProfileData({
        companyName: userData.companyName || "", 
        location: userData.location || "avinashi",
        gst: userData.gst || "",
        photo: userData.photo || "",
        companyLogoUrl: userData.companyLogoUrl || "",
        status: userData.status || 'pending',
        establishedYear: userData.establishedYear || "",
        fullAddress: userData.fullAddress || "",
        area: userData.area || "",
        contactPersonName: userData.contactPersonName || userData.name || "", 
        designation: userData.designation || "",
        phone: userData.phone?.replace("+91", "") || "",
        emailId: userData.emailId || userData.email || "",
        latitude: userData.latitude || null,
        longitude: userData.longitude || null
      });
    }
  }, [userData]);

  const handleGetLocation = (isForRequest = false) => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Geolocation not supported" });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (isForRequest) {
          setRequestData(prev => ({ ...prev, latitude, longitude }));
        } else {
          setProfileData(prev => ({ ...prev, latitude, longitude }));
        }
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          const data = await res.json();
          if (data && data.display_name) {
            const address = data.display_name;
            if (isForRequest) {
              setRequestData(prev => ({ ...prev, fullAddress: address }));
            } else {
              setProfileData(prev => ({ ...prev, fullAddress: address }));
            }
            toast({ title: "Exact Location Captured" });
          }
        } catch (e) {
          toast({ title: "Coordinates Locked" });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Could not detect location.";
        if (error.code === 1) msg = "Location permission denied.";
        else if (error.code === 3) msg = "Location request timed out.";
        toast({ variant: "destructive", title: "Location Error", description: msg });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; 
          const MAX_HEIGHT = 600;
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
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth?.currentUser) return;

    setProcessing(true);
    try {
      const base64 = await processImage(file);
      setProfileData(prev => ({ ...prev, companyLogoUrl: base64 }));
      toast({ title: "Logo Processed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Processing Failed" });
    } finally {
      setProcessing(false);
    }
  };

  const handleGatePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const base64Data = await processImage(file);
      setProfileData(prev => ({ ...prev, photo: base64Data }));
      toast({ title: "Gate Photo Captured" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Process Failed" });
    } finally {
      setProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRef || !auth?.currentUser || !db) return;

    if (!profileData.phone || profileData.phone.trim().length !== 10) {
      toast({ 
        variant: "destructive", 
        title: "Phone Number Required", 
        description: "A 10-digit contact number is mandatory for industrial factory verification." 
      });
      return;
    }

    if (!profileData.photo) {
      toast({ variant: "destructive", title: "Gate Photo Required", description: "Verification requires a photo of your factory entrance." });
      return;
    }

    setLoading(true);
    
    const sanitizedPhone = profileData.phone.replace(/\D/g, "").slice(-10);
    const phoneWithPrefix = `+91${sanitizedPhone}`;

    // Construct a surgical payload to avoid system field permission errors
    const finalUpdateData: any = {
      photo: profileData.photo,
      companyLogoUrl: profileData.companyLogoUrl,
      contactPersonName: profileData.contactPersonName,
      designation: profileData.designation,
      phone: phoneWithPrefix,
      emailId: profileData.emailId,
      establishedYear: profileData.establishedYear,
      onboarded: true,
      updatedAt: serverTimestamp()
    };

    // Only update sensitive identity fields if not verified yet OR Correction Flow
    if (!isLocationLocked) {
      finalUpdateData.companyName = profileData.companyName;
      finalUpdateData.gst = profileData.gst;
      finalUpdateData.fullAddress = profileData.fullAddress;
      finalUpdateData.area = profileData.area;
      finalUpdateData.latitude = profileData.latitude;
      finalUpdateData.longitude = profileData.longitude;
      finalUpdateData.location = profileData.location;
      finalUpdateData.status = 'pending';
    } else if (isEditingGst) {
      finalUpdateData.gst = profileData.gst;
    }

    const entranceProfileRef = doc(db, "CompanyEntranceProfile", auth.currentUser.uid);
    const logoSourceRef = doc(db, "CompanyLogos", auth.currentUser.uid);

    try {
      await updateDoc(userRef, finalUpdateData);
      
      await setDoc(entranceProfileRef, {
        uid: auth.currentUser.uid,
        photoUrl: profileData.photo,
        logoUrl: profileData.companyLogoUrl,
        companyName: profileData.companyName,
        gst: profileData.gst,
        status: userData?.status || 'pending',
        createdAt: serverTimestamp()
      }, { merge: true });

      if (profileData.companyLogoUrl) {
        await setDoc(logoSourceRef, {
          uid: auth.currentUser.uid,
          logoData: profileData.companyLogoUrl,
          updatedAt: serverTimestamp()
        }, { merge: true });

        const jobsQuery = query(collection(db, "Jobs"), where("employerId", "==", auth.currentUser.uid));
        const jobsSnap = await getDocs(jobsQuery);
        if (!jobsSnap.empty) {
          const batch = writeBatch(db);
          jobsSnap.docs.forEach(jDoc => {
            batch.update(jDoc.ref, { companyLogoUrl: profileData.companyLogoUrl });
          });
          await batch.commit();
        }
      }

      await addDoc(collection(db, "AdminNotifications"), {
        type: "new_employer",
        title: "Factory Profile Updated",
        message: `${profileData.companyName || 'A factory'} updated their profile.`,
        targetId: auth.currentUser.uid,
        status: "unread",
        createdAt: serverTimestamp()
      });

      toast({ title: "Profile Saved" });
      setIsEditingGst(false);
      router.push("/employer/dashboard");
    } catch (error: any) {
      console.error("Profile save error:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'write',
        requestResourceData: finalUpdateData,
      } satisfies SecurityRuleContext));
    } finally {
      setLoading(false);
    }
  };

  const submitLocationRequest = async () => {
    if (!requestData.latitude || !requestData.fullAddress || !requestData.reason) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please capture new location and provide a reason." });
      return;
    }

    setIsRequesting(true);
    try {
      const requestPayload = {
        ...requestData,
        uid: auth?.currentUser?.uid,
        employerName: userData?.companyName,
        phone: userData?.phone,
        currentAddress: userData?.fullAddress,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await updateDoc(userRef!, {
        pendingLocationChange: requestPayload,
        locationRequestStatus: 'change_requested'
      });

      await addDoc(collection(db!, "AdminNotifications"), {
        type: "location_change",
        title: "Location Change Requested",
        message: `${userData?.companyName} has requested a location update.`,
        targetId: auth?.currentUser?.uid,
        status: "unread",
        createdAt: serverTimestamp()
      });

      toast({ title: "Request Submitted", description: "Admin will review your request within 24 hours." });
      setIsRequestModalOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Request Failed" });
    } finally {
      setIsRequesting(false);
    }
  };

  const submitNameChangeRequest = async () => {
    if (!nameRequestData.requestedName.trim() || !nameRequestData.reason.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please enter new company name and justification." });
      return;
    }

    setIsNameRequesting(true);
    try {
      const requestPayload = {
        uid: auth?.currentUser?.uid,
        currentName: userData?.companyName,
        requestedName: nameRequestData.requestedName.trim(),
        reason: nameRequestData.reason.trim(),
        employerName: userData?.companyName,
        phone: userData?.phone,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const requestRef = doc(collection(db!, "CompanyNameChangeRequests"));
      await setDoc(requestRef, { ...requestPayload, id: requestRef.id });

      await updateDoc(userRef!, {
        nameRequestStatus: 'change_requested',
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db!, "AdminNotifications"), {
        type: "name_change",
        title: "Name Change Requested",
        message: `${userData?.companyName} wants to re-brand as ${nameRequestData.requestedName}.`,
        targetId: auth?.currentUser?.uid,
        status: "unread",
        createdAt: serverTimestamp()
      });

      toast({ title: "Identity Override Submitted", description: "Our audit team will review your re-branding request." });
      setIsNameModalOpen(false);
      setNameRequestData({ requestedName: "", reason: "" });
    } catch (err) {
      toast({ variant: "destructive", title: "Request Failed" });
    } finally {
      setIsNameRequesting(false);
    }
  };

  if (userLoading) return <div className="p-20 text-center font-bold flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /> Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-12 max-w-5xl mx-auto w-full space-y-8">
        <button type="button" onClick={() => router.push('/employer/dashboard')} className="flex items-center text-primary font-bold hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t.backToPrev}
        </button>

        <form onSubmit={handleSave} className="space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-white p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <CardTitle className="text-3xl md:text-5xl font-extrabold font-headline">{profileData.companyName || "Factory Dossier"}</CardTitle>
                  <CardDescription className="text-primary-foreground/80 font-medium">Verify your industrial footprint in the Tirupur hub.</CardDescription>
                </div>
                <div 
                  className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border-4 border-white/20 flex items-center justify-center overflow-hidden cursor-pointer group relative shadow-2xl shrink-0"
                  onClick={() => !processing && logoFileInputRef.current?.click()}
                >
                  <input type="file" accept="image/*" className="hidden" ref={logoFileInputRef} onChange={handleLogoUpload} />
                  {processing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-2">
                      <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    </div>
                  ) : profileData.companyLogoUrl ? (
                    <img src={profileData.companyLogoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-1" />
                      <p className="text-[8px] font-black uppercase tracking-tighter text-white/60 leading-none">Upload Brand Logo</p>
                    </div>
                  )}
                  {!processing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Upload className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 md:p-12 space-y-12">
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b-2 border-primary/10 pb-2">
                  <h3 className="text-xl font-black text-primary flex items-center gap-2">
                    <Building2 className="w-6 h-6" /> Firm Credentials
                  </h3>
                  <div className="flex gap-2">
                    {isLocationLocked && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl border-primary text-primary font-black gap-2 hover:bg-primary/5"
                        onClick={() => setIsNameModalOpen(true)}
                      >
                        <Edit3 className="w-4 h-4" />
                        Rename Unit
                      </Button>
                    )}
                    {isLocationLocked && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl border-amber-500 text-amber-600 font-black gap-2 hover:bg-amber-50"
                        onClick={() => setIsRequestModalOpen(true)}
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Move Unit
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {userData?.locationRequestStatus === 'change_requested' && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 animate-pulse">
                      <Clock className="w-5 h-5 shrink-0" />
                      <p className="text-xs font-bold">A location change request is currently pending admin approval.</p>
                    </div>
                  )}
                  {userData?.nameRequestStatus === 'change_requested' && (
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center gap-3 text-primary animate-pulse">
                      <Clock className="w-5 h-5 shrink-0" />
                      <p className="text-xs font-bold">A company name update request is being audited.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground">
                      <span>{t.companyName}</span>
                      {isLocationLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </Label>
                    <Input 
                      disabled={isLocationLocked}
                      value={profileData.companyName} 
                      onChange={e => setProfileData({...profileData, companyName: e.target.value})} 
                      className={cn("h-12 rounded-xl font-bold", isLocationLocked && "bg-muted/50")} 
                      placeholder="e.g. Royal Garments" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground">
                      <span>{(t as any).gstLabel || "GST Identification Number (GSTIN)"}</span>
                      {isLocationLocked && !isEditingGst && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </Label>
                    <div className="relative">
                      <Input 
                        disabled={isLocationLocked && !isEditingGst}
                        value={profileData.gst} 
                        onChange={e => setProfileData({...profileData, gst: e.target.value.toUpperCase()})} 
                        className={cn("h-12 rounded-xl font-bold font-mono pr-12", isLocationLocked && !isEditingGst && "bg-muted/50")} 
                        placeholder="33OQPPS2202M1Z9" 
                        required 
                      />
                      {isLocationLocked && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsEditingGst(!isEditingGst)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:bg-primary/5"
                        >
                          {isEditingGst ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center font-bold text-xs uppercase text-muted-foreground">
                      <span>{t.establishedYear}</span>
                    </Label>
                    <Input value={profileData.establishedYear} onChange={e => setProfileData({...profileData, establishedYear: e.target.value.replace(/\D/g, "").slice(0, 4)})} className="h-12 rounded-xl font-bold" placeholder="e.g. 1995" />
                  </div>
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center gap-2 font-bold text-xs uppercase text-muted-foreground">
                      <span>{t.area}</span>
                      {isLocationLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </Label>
                    <Input disabled={isLocationLocked} value={profileData.area} onChange={e => setProfileData({...profileData, area: e.target.value})} className={cn("h-12 rounded-xl font-bold", isLocationLocked && "bg-muted/50")} placeholder="e.g. Avinashi Road" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <Label className="flex items-center gap-3 font-bold text-xs uppercase text-muted-foreground">
                        <span>{t.fullAddress}</span>
                        {isLocationLocked && <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase"><Lock className="w-2.5 h-2.5 mr-1" /> Locked by Admin</Badge>}
                      </Label>
                      {!isLocationLocked && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="h-6 px-2 text-[10px] text-primary font-black uppercase gap-1" 
                          onClick={() => handleGetLocation(false)} 
                          disabled={isLocating}
                        >
                          {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />} Capture GPS
                        </Button>
                      )}
                    </div>
                    <Input 
                      readOnly
                      disabled={isLocationLocked} 
                      value={profileData.fullAddress} 
                      className={cn("h-12 rounded-xl font-bold", isLocationLocked && "bg-muted/50")} 
                      placeholder="Plant building number and street" 
                    />
                    {isLocationLocked && (
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-muted-foreground px-1">
                        <Navigation className="w-3 h-3" /> GPS: {profileData.latitude?.toFixed(4)}, {profileData.longitude?.toFixed(4)} (Verified)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xl font-black text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
                  <User className="w-6 h-6" /> Management Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center font-bold text-xs uppercase text-muted-foreground">{t.contactPersonName}</Label>
                    <Input value={profileData.contactPersonName} onChange={e => setProfileData({...profileData, contactPersonName: e.target.value})} className="h-12 rounded-xl font-bold" placeholder="HOD / Owner Name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center font-bold text-xs uppercase text-muted-foreground">{t.designationLabel}</Label>
                    <Input value={profileData.designation} onChange={e => setProfileData({...profileData, designation: e.target.value})} className="h-12 rounded-xl font-bold" placeholder="e.g. Factory Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center font-bold text-xs uppercase text-muted-foreground flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-primary" /> {t.mobileLabel} <span className="text-red-500 font-black">*</span>
                    </Label>
                    <Input 
                      required 
                      value={profileData.phone} 
                      onChange={e => setProfileData({...profileData, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} 
                      className="h-12 rounded-xl font-black border-primary/20 bg-primary/5 focus-visible:ring-primary/30" 
                      placeholder="10 digit mobile number (Mandatory)" 
                    />
                    <p className="text-[10px] text-muted-foreground font-bold uppercase px-1">This number is used for industrial verification audits.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="min-h-[1.25rem] flex items-center font-bold text-xs uppercase text-muted-foreground">{t.emailId}</Label>
                    <Input type="email" value={profileData.emailId} onChange={e => setProfileData({...profileData, emailId: e.target.value})} className="h-12 rounded-xl font-bold" placeholder="name@company.com" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2 border-b pb-2"><Camera className="w-6 h-6" /> Factory Entrance Proof</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div 
                    className="relative aspect-video rounded-3xl overflow-hidden border-4 border-muted shadow-lg bg-muted flex items-center justify-center cursor-pointer group"
                    onClick={() => !processing && gateFileInputRef.current?.click()}
                  >
                    <input type="file" accept="image/*" className="hidden" ref={gateFileInputRef} onChange={handleGatePhotoSelect} />
                    {processing ? (
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    ) : profileData.photo ? (
                      <>
                        <img src={profileData.photo} alt="Gate Proof" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">Replace Proof</div>
                      </>
                    ) : (
                      <div className="text-center p-8 space-y-2">
                        <Upload className="w-8 h-8 text-primary mx-auto" />
                        <p className="font-bold text-primary">Tap to Upload Gate Photo</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                    <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Verification Tips</h4>
                    <ul className="text-xs text-amber-800/80 space-y-2 font-medium">
                      <li>• Include the factory name board in the gate photo.</li>
                      <li>• Brand logo should be a clean file for job listings.</li>
                      <li>• Accurate GPS coordinates speed up approval by 24h.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-8 md:p-12 bg-muted/10 border-t flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-3 text-primary font-bold">
                 <CheckCircle2 className="w-6 h-6" />
                 <p className="text-sm">Information will be verified within 1 industrial day.</p>
               </div>
               <Button type="submit" disabled={loading || processing} className="w-full md:w-auto h-14 px-12 bg-primary text-white font-bold rounded-2xl text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
                 {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Finalizing...</> : "Submit Verified Profile"}
               </Button>
            </CardFooter>
          </Card>
        </form>
      </main>

      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-amber-500 text-white">
            <div className="flex items-center gap-3">
              <RefreshCcw className="w-8 h-8" />
              <div>
                <DialogTitle className="text-2xl font-black">Location Change Request</DialogTitle>
                <DialogDescription className="text-white/80 font-bold uppercase text-xs tracking-widest">Administrative Approval Required</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs font-bold text-amber-800">
              Note: Changing your location affects seeker distance filtering. Your current approved location will remain active until Admin verifies this new request.
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="min-h-[1.25rem] flex items-center font-black text-xs uppercase text-muted-foreground">New Industrial Location</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl font-bold border-amber-500 text-amber-600 gap-2"
                  onClick={() => handleGetLocation(true)}
                  disabled={isLocating}
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                  Capture New GPS
                </Button>
              </div>
              
              <Input 
                readOnly
                value={requestData.fullAddress} 
                placeholder="Full address of the new unit..."
                className="h-12 rounded-xl font-bold"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="min-h-[1.25rem] flex items-center font-black text-[10px] uppercase text-muted-foreground">Area / Landmark</Label>
                  <Input value={requestData.area} onChange={e => setRequestData({...requestData, area: e.target.value})} className="h-10 rounded-xl font-bold" />
                </div>
                <div className="space-y-2">
                   <Label className="min-h-[1.25rem] flex items-center font-black text-[10px] uppercase text-muted-foreground">GPS Status</Label>
                   <div className={cn("h-10 rounded-xl flex items-center px-4 font-black text-xs border", requestData.latitude ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground")}>
                      {requestData.latitude ? "Coordinates Locked" : "Waiting for GPS..."}
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="min-h-[1.25rem] flex items-center font-black text-xs uppercase text-muted-foreground">Reason for Relocation</Label>
                <Textarea 
                  value={requestData.reason}
                  onChange={e => setRequestData({...requestData, reason: e.target.value})}
                  placeholder="Explain why you are moving the industrial unit..."
                  className="min-h-[100px] rounded-xl font-medium"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/20 border-t flex gap-4">
            <Button variant="ghost" className="flex-1 font-bold h-14 rounded-2xl" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
            <Button 
              disabled={isRequesting || !requestData.latitude || !requestData.reason}
              onClick={submitLocationRequest}
              className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white font-black h-14 rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-white">
            <div className="flex items-center gap-3">
              <RefreshCcw className="w-8 h-8" />
              <div>
                <DialogTitle className="text-2xl font-black">Company Name Change Request</DialogTitle>
                <DialogDescription className="text-white/80 font-bold uppercase text-xs tracking-widest">Identity Override Required</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs font-bold text-primary">
              Note: Changing your business name requires an administrative audit. Your current verified name will remain active in all job posts until the request is approved.
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="min-h-[1.25rem] flex items-center font-black text-xs uppercase text-muted-foreground">New Company Name</Label>
                <Input 
                  value={nameRequestData.requestedName} 
                  onChange={e => setNameRequestData({...nameRequestData, requestedName: e.target.value})}
                  placeholder="e.g. Royal Garments Private Limited"
                  className="h-12 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="min-h-[1.25rem] flex items-center font-black text-xs uppercase text-muted-foreground">Reason for Re-branding</Label>
                <Textarea 
                  value={nameRequestData.reason}
                  onChange={e => setNameRequestData({...nameRequestData, reason: e.target.value})}
                  placeholder="Explain why you are changing the verified business name..."
                  className="min-h-[100px] rounded-xl font-medium"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/20 border-t flex gap-4">
            <Button variant="ghost" className="flex-1 font-bold h-14 rounded-2xl" onClick={() => setIsNameModalOpen(false)}>Cancel</Button>
            <Button 
              disabled={isNamingRequesting || !nameRequestData.requestedName.trim() || !nameRequestData.reason.trim()}
              onClick={submitNameChangeRequest}
              className="flex-[2] bg-primary text-white font-black h-14 rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              {isNamingRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Identity Override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

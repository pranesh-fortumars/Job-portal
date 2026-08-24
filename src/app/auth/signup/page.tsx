"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  UserCircle, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Users, 
  Phone, 
  ShieldAlert, 
  Loader2, 
  X, 
  RefreshCw, 
  KeyRound,
  Smartphone,
  Edit3,
  History,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { 
  createUserWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  linkWithPhoneNumber,
  ConfirmationResult,
  deleteUser,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
  updateEmail
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, addDoc, getDoc, updateDoc, query, where, getDocs, limit, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import { DatePickerDropdown } from "@/components/ui/date-picker-dropdown";
import { AppLogo } from "@/components/shared/AppLogo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"role-select" | "details" | "verify-otp" | "email-completion">("role-select");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Technical' | 'Non-Technical' | null>(null);

  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const hasResumed = useRef(false);
  const isSubmittingRef = useRef(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [completionEmail, setCompletionEmail] = useState("");
  const [completionPassword, setCompletionPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: null as string | null,
    gender: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && step === "verify-otp" && confirmationResult) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step, confirmationResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (mounted && auth.currentUser && db && !hasResumed.current && !isSubmittingRef.current) {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email && !data.email.endsWith('@nextirupur.internal') ? data.email : prev.email,
            phone: data.phone?.replace("+91", "") || prev.phone,
            gender: data.gender || prev.gender,
            dob: data.dob || prev.dob,
          }));

          if (data.role) {
            setSelectedRole(data.role);
            setSelectedCategory(data.category);
          }

          if (data.role && data.signupStatus === 'completed') {
            completeLogin(data);
            return;
          }

          if (data.signupStatus === 'phone_verified') {
            if (data.role) {
               updateDoc(userRef, { signupStatus: 'completed' }).then(() => completeLogin({...data, signupStatus: 'completed'}));
            } else {
               setStep("role-select");
            }
          } else if (data.signupStatus === 'details_completed') {
            setStep("verify-otp");
          } else if (!data.role) {
            setStep("role-select");
          }
          hasResumed.current = true;
        }
      });
    }
  }, [auth.currentUser, db, mounted]);

  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;
    
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { 
          size: 'invisible'
        });
        recaptchaVerifierRef.current = verifier;
      } catch (e) {
        console.warn("reCAPTCHA Initialization Trace:", e);
      }
    }
    
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (e) {}
      }
    };
  }, [auth, mounted]);

  const handleRoleSelection = (role: Exclude<UserRole, 'admin'>, category?: 'Technical' | 'Non-Technical') => {
    setSelectedRole(role);
    setSelectedCategory(category || null);
    setStep("details");
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.dob || !formData.gender || !formData.password) {
      toast({ variant: "destructive", title: "Missing Fields", description: "All fields marked * are required." });
      return;
    }

    if (selectedRole === 'employer' && !formData.email) {
      toast({ variant: "destructive", title: "Email Required", description: "Employers must provide an official business email." });
      return;
    }

    const sanitizedPhone = formData.phone.replace(/\D/g, "").slice(-10);
    if (sanitizedPhone.length === 10) {
      // Validate unique mobile before proceeding
      setLoading(true);
      const formattedPhone = `+91${sanitizedPhone}`;
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("phone", "==", formattedPhone), limit(1));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        toast({
          variant: "destructive",
          title: "Account Exists",
          description: "An account already exists with this mobile number. Please login instead."
        });
        setLoading(false);
        return;
      }
      setLoading(false);
    } else {
      toast({ variant: "destructive", title: "Invalid Mobile", description: "Enter 10-digit number." });
      return;
    }
    
    const age = differenceInYears(new Date(), new Date(formData.dob));
    if (age < 18) {
      toast({ variant: "destructive", title: "Age Restriction", description: "Minimum 18 years required." });
      return;
    }

    if (formData.password.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "Please ensure password confirmation matches." });
      return;
    }

    await processRegistration();
  };

  const processRegistration = async () => {
    setLoading(true);
    isSubmittingRef.current = true;
    let activeUser = auth.currentUser;

    try {
      const sanitizedPhone = formData.phone.replace(/\D/g, "").slice(-10);
      const formattedPhone = `+91${sanitizedPhone}`;

      // Duplicate check (Pre-Auth)
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("phone", "==", formattedPhone), limit(1));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        toast({
          variant: "destructive",
          title: "Account Exists",
          description: "An account already exists with this mobile number. Please login instead."
        });
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      const appVerifier = recaptchaVerifierRef.current;
      
      if (!appVerifier) {
        throw new Error("Security terminal not ready. Please refresh the page.");
      }
      
      let authEmail = (formData.email || `${sanitizedPhone}@nextirupur.internal`).toLowerCase().trim();

      if (!activeUser) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, authEmail, formData.password);
          activeUser = userCred.user;
          
          await setDoc(doc(db, "Users", activeUser.uid), {
            uid: activeUser.uid,
            name: formData.name,
            email: authEmail,
            phone: formattedPhone,
            gender: formData.gender,
            dob: formData.dob,
            role: selectedRole,
            category: selectedCategory,
            onboarded: false,
            signupStatus: 'details_completed',
            createdAt: serverTimestamp()
          });

          await activeUser.getIdToken(true);
          const result = await linkWithPhoneNumber(activeUser, formattedPhone, appVerifier);
          setConfirmationResult(result);
          setStep("verify-otp");
          setTimer(120);
          setCanResend(false);
          toast({ title: t.loginTitleOtp, description: "Verification code sent to your mobile." });
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            toast({ variant: "destructive", title: "Account Exists", description: "This number or email is already registered. Please login." });
            setLoading(false);
            isSubmittingRef.current = false;
            return;
          }
          throw authError;
        }
      } else {
        const userRef = doc(db, "Users", activeUser.uid);
        const snap = await getDoc(userRef);
        const existingData = snap.data();

        await updateDoc(userRef, {
          name: formData.name,
          email: authEmail,
          phone: formattedPhone,
          gender: formData.gender,
          dob: formData.dob,
          role: selectedRole,
          category: selectedCategory,
          signupStatus: 'details_completed',
          updatedAt: serverTimestamp()
        });

        const emailCred = EmailAuthProvider.credential(authEmail, formData.password);
        
        try {
          await linkWithCredential(activeUser, emailCred);
        } catch (linkError: any) {
          if (linkError.code === 'auth/provider-already-linked' || linkError.code === 'auth/email-already-in-use') {
             await updatePassword(activeUser, formData.password).catch(e => console.debug("Auth password sync skipped:", e.message));
             await updateEmail(activeUser, authEmail).catch(e => console.debug("Auth email sync skipped:", e.message));
          }
        }

        const isAlreadyPhoneLinked = activeUser.providerData.some(p => p.providerId === 'phone');
        if (existingData?.phone !== formattedPhone || !isAlreadyPhoneLinked) {
          await activeUser.getIdToken(true);
          const result = await linkWithPhoneNumber(activeUser, formattedPhone, appVerifier);
          setConfirmationResult(result);
          setTimer(120);
          setCanResend(false);
        }
        
        setStep("verify-otp");
        toast({ title: "Details Revised", description: "Identity records updated. Please verify mobile." });
      }
    } catch (error: any) {
      console.error("[Signup Fault]", error);
      toast({ variant: "destructive", title: "Registration Interrupted", description: error.message });
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResendOtp = async () => {
    if (!auth.currentUser || loading) return;
    setLoading(true);
    try {
      const sanitizedPhone = formData.phone.replace(/\D/g, "").slice(-10);
      const formattedPhone = `+91${sanitizedPhone}`;
      const appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) throw new Error("Security terminal not ready.");

      await auth.currentUser.getIdToken(true); 
      const result = await linkWithPhoneNumber(auth.currentUser, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setTimer(120);
      setCanResend(false);
      setOtp("");
      toast({ title: "OTP Resent", description: "A new verification code has been dispatched." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Resend Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || otp.length !== 6) return;

    if (timer === 0) {
      toast({ variant: "destructive", title: "OTP Expired", description: "Please request a new code." });
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const sanitizedPhone = formData.phone.replace(/\D/g, "").slice(-10);
        const internalEmail = (formData.email || `${sanitizedPhone}@nextirupur.internal`).toLowerCase().trim();
        
        await setDoc(userRef, {
          uid: user.uid,
          name: formData.name,
          phone: user.phoneNumber,
          email: internalEmail,
          gender: formData.gender,
          dob: formData.dob,
          role: selectedRole,
          category: selectedCategory,
          onboarded: false,
          signupStatus: 'completed',
          createdAt: serverTimestamp()
        });
        completeLogin({ 
          role: selectedRole, 
          status: selectedRole === 'employer' ? 'pending' : 'approved',
          signupStatus: 'completed'
        });
      } else {
        const data = userSnap.data();
        await updateDoc(userRef, { signupStatus: 'completed' });
        completeLogin({ ...data, signupStatus: 'completed' });
      }

      toast({ title: "Identity Verified" });
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      let errorMessage = error.message || "Verification failed. Code may have expired.";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Incorrect code. Please check and try again.";
      }
      toast({ variant: "destructive", title: "Verification Failed", description: errorMessage });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !completionEmail || !completionPassword) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(completionEmail.trim().toLowerCase(), completionPassword);
      await linkWithCredential(auth.currentUser, credential);
      
      const userRef = doc(db, "Users", auth.currentUser.uid);
      const snap = await getDoc(userRef);
      const data = snap.data() || {};

      await updateDoc(userRef, {
        email: completionEmail.trim().toLowerCase(),
        signupStatus: 'completed',
        updatedAt: serverTimestamp()
      });

      completeLogin({ ...data, email: completionEmail, signupStatus: 'completed' });
      toast({ title: "Business Identity Linked" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Identity Conflict", description: "This email might already be linked to another profile." });
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data: any) => {
    localStorage.setItem('sim_is_logged_in', 'true');
    localStorage.setItem('sim_user_role', data.role);
    
    if (data.role === 'admin') router.push("/admin/dashboard");
    else if (data.role === 'employer') {
       const status = data.status || 'pending';
       router.push(status === 'approved' ? "/employer/dashboard" : "/employer/profile");
    }
    else {
       if (data.onboarded) router.push("/seeker/dashboard");
       else router.push("/seeker/onboarding");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div ref={recaptchaContainerRef}></div>
        
        <Card className="w-full max-w-lg shadow-2xl border-primary/10 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-2 text-center bg-muted/20 pb-8 pt-10">
            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary shadow-inner">
              {step === "role-select" ? <AppLogo section="auth" width={36} height={36} /> : step === "email-completion" ? <Mail className="w-8 h-8" /> : step === "verify-otp" ? <Smartphone className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-semibold font-headline text-primary uppercase tracking-tight">
              {step === "role-select" ? "Select Your Path" : step === "details" ? "Create Account" : step === "verify-otp" ? "Verify Mobile" : "Business Email"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {step === "role-select" ? (
              <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-primary/10 hover:border-primary hover:bg-primary/5 rounded-[2rem] transition-all p-4 text-center group" onClick={() => handleRoleSelection('job_seeker', 'Technical')} disabled={loading}>
                    <Briefcase className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">IT, Tech & Internships</p>
                      <p className="text-[11px] text-muted-foreground font-normal">Developers, Interns, Corporate</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-primary/10 hover:border-primary hover:bg-primary/5 rounded-[2rem] transition-all p-4 text-center group" onClick={() => handleRoleSelection('job_seeker', 'Non-Technical')} disabled={loading}>
                    <UserCircle className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Skilled Trades & Wages</p>
                      <p className="text-[11px] text-muted-foreground font-normal">Stitching, Cutting, Daily Wages</p>
                    </div>
                  </Button>
                </div>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-1 border-2 border-accent/20 hover:border-accent hover:bg-accent/5 rounded-[2rem] transition-all group" onClick={() => handleRoleSelection('employer')} disabled={loading}>
                  <Building2 className="w-7 h-7 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-base text-accent">Company / Employer</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Post Jobs, Hire Interns & Skilled Talent</span>
                </Button>
              </div>
            ) : step === "details" ? (
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Full Name *</Label>
                  <Input placeholder="Industrial identity name" className="h-12 rounded-xl font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                
                <div className={cn("grid grid-cols-1 gap-4", selectedRole === 'employer' ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Mobile Number *</Label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground opacity-50">+91</span>
                       <Input type="tel" placeholder="9876543210" className="pl-10 h-12 rounded-xl font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} required />
                    </div>
                  </div>
                  {selectedRole === 'employer' && (
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Business Email *</Label>
                      <Input type="email" placeholder="official@factory.com" className="h-12 rounded-xl font-bold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground tracking-widest ml-1">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                      <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="font-bold rounded-xl">
                        <SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Date of Birth *</Label>
                    <DatePickerDropdown value={formData.dob} onChange={d => setFormData({ ...formData, dob: d })} maxYear={new Date().getFullYear() - 18} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed pt-6 mt-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground ml-1 flex items-center gap-1.5"><KeyRound className="w-3 h-3" /> Secure Password *</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="h-12 rounded-xl font-bold pr-10" 
                        value={formData.password} 
                        onChange={e => setFormData({ ...formData, password: e.target.value })} 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Confirm Password *</Label>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="h-12 rounded-xl font-bold pr-10" 
                        value={formData.confirmPassword} 
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setStep("role-select")} disabled={loading}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-[2] h-14 bg-primary text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Continue"} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            ) : step === "verify-otp" ? (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-4 text-center">
                  <Label className="font-bold text-base">Enter 6-Digit Code</Label>
                  <Input type="text" maxLength={6} placeholder="000000" className="h-14 text-center text-3xl tracking-[1rem] font-black rounded-xl border-primary/20 bg-muted/30" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus />
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-medium text-muted-foreground">Sent to +91 {formData.phone.replace(/\D/g, "").slice(-10)}</p>
                    {timer > 0 ? (
                      <p className="text-xs font-black text-primary uppercase tracking-widest">Code Expires in: {formatTime(timer)}</p>
                    ) : (
                      <p className="text-xs font-black text-destructive uppercase tracking-widest animate-pulse">OTP Expired</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl" disabled={otp.length !== 6 || loading || timer === 0}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Confirm & Proceed"}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-12 rounded-xl font-bold border-primary/20 text-primary gap-2" 
                      onClick={() => { setStep("details"); setConfirmationResult(null); }}
                      disabled={loading}
                    >
                      <Edit3 className="w-4 h-4" /> Edit Details
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className={cn("h-12 rounded-xl font-bold gap-2", canResend ? "border-primary text-primary" : "opacity-50 cursor-not-allowed")}
                      onClick={handleResendOtp}
                      disabled={!canResend || loading}
                    >
                      <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Resend OTP
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEmailCompletion} className="space-y-6">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-800">
                  Business accounts (Employer) require a verified official email linked to their industrial mobile identity.
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Official Business Email</Label>
                  <Input type="email" placeholder="admin@factory.com" className="h-12 rounded-xl font-bold" value={completionEmail} onChange={e => setCompletionEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="h-12 rounded-xl font-bold pr-10" 
                      value={completionPassword} 
                      onChange={e => setCompletionPassword(e.target.value)} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Link Business Account"}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 text-center pb-12 pt-0 px-8">
            <p className="text-sm font-medium text-muted-foreground">Already have an account? <Link href="/auth/login" className="text-primary font-medium hover:underline">Login here</Link></p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

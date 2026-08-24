"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone as PhoneIcon, ArrowRight, ShieldCheck, User, Building2, Briefcase, Mail, AlertTriangle, RefreshCw, Lock, Loader2, KeyRound, Eye, EyeOff, Sparkles, Shield, Scissors } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  linkWithCredential
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, updateDoc, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/shared/AppLogo";
import { loginAsDemoUser, DemoRoleKey } from "@/lib/demo-auth";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [step, setStep] = useState<"phone" | "otp" | "reconcile" | "role-select">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [reconcileData, setReconcileData] = useState<{ email: string; phoneCredential?: any } | null>(null);

  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && auth.currentUser && db) {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.role && data.signupStatus === 'completed') {
            completeLogin(data);
          }
        }
      });
    }
  }, [auth.currentUser, db, mounted]);

  const handleDemoLoginTrigger = async (roleKey: DemoRoleKey) => {
    setDemoLoading(roleKey);
    try {
      toast({
        title: "⚡ Initializing Demo Mode",
        description: `Authenticating Demo ${roleKey.toUpperCase()} & seeding Tirupur mock data...`,
      });
      const result = await loginAsDemoUser(roleKey, auth, db);
      if (result.success) {
        toast({
          title: "✅ Demo Login Successful",
          description: `Welcome to Demo ${roleKey.toUpperCase()} mode!`,
        });
        router.push(result.redirectUrl);
      }
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        variant: "destructive",
        title: "Demo Login Failed",
        description: error.message || "Failed to initialize demo mode.",
      });
    } finally {
      setDemoLoading(null);
    }
  };

  // Stable reCAPTCHA initialization
  useEffect(() => {
    if (!mounted || !auth) return;

    const initRecaptcha = () => {
      try {
        const container = document.getElementById('recaptcha-container');
        if (container && !recaptchaVerifier.current) {
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
          recaptchaVerifier.current = verifier;
        }
      } catch (e) {
        console.warn("Recaptcha Initialization Trace:", e);
      }
    };

    initRecaptcha();

    return () => {
      if (recaptchaVerifier.current) {
        try {
          recaptchaVerifier.current.clear();
          recaptchaVerifier.current = null;
        } catch (e) {}
      }
    };
  }, [auth, mounted]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = phone.replace(/\D/g, "").slice(-10);
    if (sanitized.length === 10) {
      setLoading(true);
      try {
        const formattedPhone = `+91${sanitized}`;

        // Validate if user exists before sending OTP
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("phone", "==", formattedPhone), limit(1));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
          toast({
            variant: "destructive",
            title: "Account Not Found",
            description: "No account found with this mobile number. Please create an account first."
          });
          setLoading(false);
          return;
        }
        
        // Re-initialize if for some reason the verifier was lost
        if (!recaptchaVerifier.current) {
          recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        }
        
        const appVerifier = recaptchaVerifier.current;
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(result);
        setStep("otp");
        toast({ title: "OTP Sent", description: "Verification code dispatched to your mobile." });
      } catch (error: any) {
        console.error("OTP Dispatch Error:", error);
        let errorMessage = error.message || "Failed to send verification code.";
        if (error.code === 'auth/captcha-check-failed') {
          errorMessage = `Security Error: reCAPTCHA check failed. Please refresh.`;
          if (recaptchaVerifier.current) {
            recaptchaVerifier.current.clear();
            recaptchaVerifier.current = null;
          }
        }
        toast({ variant: "destructive", title: "Dispatch Failure", description: errorMessage });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedPhone = phone.replace(/\D/g, "").slice(-10); 
    if (sanitizedPhone.length !== 10 || !password) return;

    setLoading(true);

    // MOCK LOGIN TERMINAL (Testing Only)
    if (password === '123456' || password === 'demo123password') {
      let testEmail = "";
      if (sanitizedPhone === '7092988131') testEmail = 'iamnithyaprakash@gmail.com';
      if (sanitizedPhone === '9042321200') testEmail = 'gary@gmail.com';
      if (sanitizedPhone === '9095331071') testEmail = 'john@gmail.com';
      if (sanitizedPhone === '9000000001') testEmail = 'admin@nextirupur.demo';
      if (sanitizedPhone === '9000000002') testEmail = 'employer@nextirupur.demo';
      if (sanitizedPhone === '9000000003') testEmail = 'worker@nextirupur.demo';
      if (sanitizedPhone === '9000000004') testEmail = 'staff@nextirupur.demo';

      if (testEmail) {
        try {
          await signInWithEmailAndPassword(auth, testEmail.toLowerCase().trim(), password);
          const userCredential = auth.currentUser;
          if (userCredential) {
            const userSnap = await getDoc(doc(db, "Users", userCredential.uid));
            if (userSnap.exists()) {
              completeLogin(userSnap.data());
              return; 
            }
          }
        } catch (testError: any) {
          console.error("[Test Login Audit Fault]", testError);
        }
      }
    }

    try {
      const formattedPhone = `+91${sanitizedPhone}`;
      
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("phone", "==", formattedPhone), limit(1));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "Identity Error", description: "Mobile number not found in our industrial registry." });
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data();
      // Ensure character-perfect email matching with trim and lowercase
      const authEmail = (userData.email || `${sanitizedPhone}@nextirupur.internal`).toLowerCase().trim();

      console.log("[Auth Audit] Attempting password login:", { authEmail, phone: sanitizedPhone });

      await signInWithEmailAndPassword(auth, authEmail, password);
      
      if (userData.role) {
        completeLogin(userData);
      } else {
        setStep("role-select");
      }
    } catch (error: any) {
      console.error("Password Auth Error:", error);
      let errorMessage = "Incorrect mobile number or password. Please verify and try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = "Incorrect mobile number or password. Please verify and try again.";
      }
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 && confirmationResult) {
      setLoading(true);
      try {
        const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
        const result = await confirmationResult.confirm(otp);
        const user = result.user;
        
        const userDocRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role && data.signupStatus === 'completed') {
            completeLogin(data);
          } else {
            setStep("role-select");
          }
        } else {
          const authPhone = user.phoneNumber || `+91${phone.replace(/\D/g, "").slice(-10)}`;
          const tenDigitPhone = authPhone.slice(-10);
          const q = query(collection(db, "Users"), where("phone", "==", authPhone), limit(1));
          const snap = await getDocs(q);
          
          if (!snap.empty) {
            const existingUser = snap.docs[0].data();
            const existingEmail = (existingUser.email || `${tenDigitPhone}@nextirupur.internal`).toLowerCase().trim();
            
            setReconcileData({ email: existingEmail, phoneCredential: credential });
            setStep("reconcile");
            toast({ title: t.reportAlert, description: "Verify password to unify your mobile identity." });
          } else {
            setStep("role-select");
          }
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Invalid OTP", description: "Code mismatch or expired." });
        setOtp("");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileData) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, reconcileData.email.toLowerCase().trim(), password);
      const user = userCredential.user;
      if (reconcileData.phoneCredential) {
        await linkWithCredential(user, reconcileData.phoneCredential);
        toast({ title: "Identity Reconciled" });
      }
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role && data.signupStatus === 'completed') completeLogin(data);
        else setStep("role-select");
      } else {
        setStep("role-select");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Authentication Failed", description: "Incorrect password for this account." });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (role: Exclude<UserRole, 'admin'>, category?: 'Staff' | 'Worker') => {
    const user = auth.currentUser;
    if (!user || !db) return;

    setLoading(true);
    try {
      const updateData = {
        role: role,
        category: category || null,
        status: role === 'employer' ? 'pending' : 'approved',
        signupStatus: 'completed',
        onboarded: false,
        updatedAt: serverTimestamp()
      };
      
      const userRef = doc(db, "Users", user.uid);
      await setDoc(userRef, updateData, { merge: true });
      
      const finalSnap = await getDoc(userRef);
      completeLogin(finalSnap.data());
      toast({ title: "Industrial Identity Established" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Assignment Failed" });
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data: any) => {
    localStorage.setItem('sim_is_logged_in', 'true');
    localStorage.setItem('sim_user_role', data.role);
    
    if (!data.role) {
      router.push("/auth/signup");
      return;
    }

    if (data.role === 'admin') router.push("/admin/dashboard");
    else if (data.role === 'employer') {
       if (data.onboarded) router.push("/employer/dashboard");
       else router.push("/employer/profile");
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
      <main className="flex-grow flex items-center justify-center p-4 py-8">
        <div id="recaptcha-container"></div>
        
        <Card className="w-full max-w-md shadow-2xl border-primary/10 rounded-[2rem] overflow-hidden">
          <CardHeader className="space-y-1 text-center bg-muted/20 pb-6 pt-10">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary shadow-inner">
              {step === "reconcile" ? <RefreshCw className="w-7 h-7" /> : step === "role-select" ? <AppLogo section="auth" width={28} height={28} /> : loginMethod === 'password' ? <KeyRound className="w-7 h-7" /> : <PhoneIcon className="w-7 h-7" />}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-extrabold font-headline text-primary">
              {step === "reconcile" ? "Identity Recovery" : step === "role-select" ? t.loginTitleRole : t.login}
            </CardTitle>
            <CardTitle className="text-sm md:text-base font-medium px-4">
              {step === "reconcile" ? `Reconciling mobile identity for account` : step === "phone" ? "Access your industrial dashboard" : step === "otp" ? `${t.loginDescOtp} +91 ${phone.replace(/\D/g, "").slice(-10)}` : "Complete your profile identity"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            {step === "phone" && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border border-primary/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-primary">Instant Demo Login</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Explore All Roles</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">One-click login with pre-loaded Tirupur mock data:</p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || !!demoLoading}
                    onClick={() => handleDemoLoginTrigger('admin')}
                    className="h-auto py-2.5 px-3 flex flex-col items-start gap-1 border-primary/20 hover:border-primary hover:bg-primary/10 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs text-primary flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Admin
                      </span>
                      {demoLoading === 'admin' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">Super Admin Panel</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || !!demoLoading}
                    onClick={() => handleDemoLoginTrigger('employer')}
                    className="h-auto py-2.5 px-3 flex flex-col items-start gap-1 border-accent/30 hover:border-accent hover:bg-accent/10 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs text-accent flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Employer
                      </span>
                      {demoLoading === 'employer' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" /> : <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">Mill Owner (Royal Exports)</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || !!demoLoading}
                    onClick={() => handleDemoLoginTrigger('staff')}
                    className="h-auto py-2.5 px-3 flex flex-col items-start gap-1 border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> IT & Interns
                      </span>
                      {demoLoading === 'staff' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">Software Engineer / College Intern</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || !!demoLoading}
                    onClick={() => handleDemoLoginTrigger('worker')}
                    className="h-auto py-2.5 px-3 flex flex-col items-start gap-1 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5" /> Skilled Trades
                      </span>
                      {demoLoading === 'worker' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">Stitching / Machine Operator</span>
                  </Button>
                </div>
              </div>
            )}

            {step === "phone" && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-wider">
                  <span className="bg-background px-3 text-muted-foreground">Or sign in with mobile / password</span>
                </div>
              </div>
            )}

            {step === "reconcile" ? (
              <form onSubmit={handleReconcile} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-medium text-xs uppercase text-muted-foreground ml-1">Account Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter password" 
                      className="pl-10 pr-10 h-12 rounded-xl font-medium border-primary/20" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
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
                <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white font-medium rounded-xl shadow-lg">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Unify"}
                </Button>
                <button type="button" onClick={() => setStep("phone")} className="w-full text-xs font-medium text-muted-foreground hover:underline">Cancel</button>
              </form>
            ) : step === "role-select" ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="h-28 flex flex-col items-center justify-center gap-1.5 border-2 hover:border-primary hover:bg-primary/5 rounded-2xl transition-all p-3 text-center" onClick={() => handleRoleSelection('job_seeker', 'Staff')} disabled={loading}>
                    <Briefcase className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-sm">IT, Tech & Internships</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Developers, College Interns, Office</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col items-center justify-center gap-1.5 border-2 hover:border-primary hover:bg-primary/5 rounded-2xl transition-all p-3 text-center" onClick={() => handleRoleSelection('job_seeker', 'Worker')} disabled={loading}>
                    <Scissors className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-sm">Skilled Trades & Wages</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Stitching, Cutting, Machine Operators</span>
                  </Button>
                </div>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-1 border-2 border-accent hover:border-accent hover:bg-accent/5 rounded-2xl transition-all" onClick={() => handleRoleSelection('employer')} disabled={loading}>
                  <Building2 className="w-6 h-6 text-accent" /><span className="font-semibold">Employer / Company Owner</span>
                </Button>
              </div>
            ) : step === "otp" ? (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-4 text-center">
                  <Label className="font-medium text-base">Enter 6-Digit Code</Label>
                  <Input type="text" maxLength={6} placeholder="000000" className="h-14 text-center text-3xl tracking-[1rem] font-semibold rounded-xl border-primary/20 bg-muted/30" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus />
                </div>
                <Button type="submit" className="w-full h-12 bg-primary text-white font-medium rounded-xl" disabled={otp.length !== 6 || loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <button type="button" onClick={() => setStep("phone")} className="w-full text-xs font-medium text-muted-foreground hover:underline">Back to Mobile</button>
              </form>
            ) : (
              <Tabs value={loginMethod} onValueChange={(v: any) => setLoginMethod(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/40 rounded-xl p-1 mb-8">
                  <TabsTrigger value="otp" className="rounded-lg font-semibold text-xs uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Via OTP</TabsTrigger>
                  <TabsTrigger value="password" className="rounded-lg font-semibold text-xs uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Via Password</TabsTrigger>
                </TabsList>
                
                <TabsContent value="otp" className="space-y-5 m-0 animate-in fade-in slide-in-from-left-2 duration-300">
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="font-medium text-xs uppercase text-muted-foreground ml-1">Mobile Number</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground border-r pr-3">+91</span>
                        <Input type="tel" placeholder="9876543210" className="pl-16 h-12 text-lg tracking-wider font-semibold rounded-xl border-primary/20" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary text-white font-medium rounded-xl shadow-lg" disabled={phone.replace(/\D/g, "").slice(-10).length !== 10 || loading}>
                      {loading ? "Requesting..." : "Send OTP Verification"} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="space-y-5 m-0 animate-in fade-in slide-in-from-right-2 duration-300">
                  <form onSubmit={handlePasswordLogin} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium text-xs uppercase text-muted-foreground ml-1">Mobile Number</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground border-r pr-3">+91</span>
                          <Input type="tel" placeholder="9876543210" className="pl-16 h-12 text-lg tracking-wider font-semibold rounded-xl border-primary/20" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium text-xs uppercase text-muted-foreground ml-1">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="pl-10 pr-10 h-12 rounded-xl font-medium border-primary/20" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
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
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary text-white font-medium rounded-xl shadow-lg" disabled={phone.replace(/\D/g, "").slice(-10).length !== 10 || !password || loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Secure Login"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center pb-8 pt-0">
            <p className="text-xs font-medium text-muted-foreground">Don't have an account? <Link href="/auth/signup" className="text-primary font-medium hover:underline">Create an account</Link></p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

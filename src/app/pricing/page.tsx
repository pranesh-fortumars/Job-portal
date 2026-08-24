"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Building2, 
  Rocket, 
  Star, 
  Loader2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageSquare,
  Headphones,
  Globe,
  Monitor,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCcw,
  Check,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  IndianRupee,
  Clock,
  Navigation,
  AlertCircle,
  Users,
  Timer
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth, useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, increment, serverTimestamp, arrayUnion, addDoc, collection } from "firebase/firestore";
import { addDays } from "date-fns";
import Script from "next/script";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const EMPLOYER_PLANS = [
  { 
    id: "single", 
    name: "Single Pack", 
    posts: 1, 
    priceLabel: "₹400 + 18% GST",
    priceValue: 400,
    savings: null,
    description: "Perfect for a quick, urgent hire",
    features: ["One-Time Post", "Includes All Premium Features"],
    icon: <Zap className="w-6 h-6 text-blue-500" /> 
  },
  { 
    id: "starter", 
    name: "Starter Pack", 
    posts: 3, 
    priceLabel: "₹999 + 18% GST",
    priceValue: 999,
    savings: "Save ₹201 (Most Popular)",
    description: "Best for Growing Units",
    features: ["Includes All Premium Features", "Never Expire Credits"],
    popular: true, 
    icon: <Star className="w-6 h-6 text-primary" /> 
  },
  { 
    id: "growth", 
    name: "Growth Pack", 
    posts: 5, 
    priceLabel: "₹1,499 + 18% GST",
    priceValue: 1499,
    savings: "Save ₹501 (Hot Deal)",
    description: "Bulk Hiring Special",
    features: ["Includes All Premium Features", "Never Expire Credits"],
    icon: <Rocket className="w-6 h-6 text-accent" /> 
  },
  { 
    id: "volume", 
    name: "Volume Pack", 
    posts: 10, 
    priceLabel: "₹2,499 + 18% GST",
    priceValue: 2499,
    savings: "Save ₹1,501 (Best Value)",
    description: "Wholesale Pricing",
    features: ["Includes All Premium Features", "Never Expire Credits"],
    icon: <Building2 className="w-6 h-6 text-amber-600" /> 
  }
];

export default function PricingPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [lastAttemptedPlanId, setLastAttemptedPlanId] = useState<string | null>(null);
  const [showBackupTerminal, setShowBackupTerminal] = useState(false);
  const [summaryPlan, setSummaryPlan] = useState<any>(null);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const backupScriptRef = useRef<HTMLDivElement>(null);

  const userRef = useMemo(() => (auth?.currentUser && db) ? doc(db, "Users", auth.currentUser.uid) : null, [db, auth?.currentUser?.uid]);
  const { data: userData, loading: userLoading } = useDoc<any>(userRef);

  const activeBackupPlan = useMemo(() => {
    const targetId = loadingPlan || lastAttemptedPlanId;
    if (!targetId) return null;
    return EMPLOYER_PLANS.find(p => p.id === targetId) || null;
  }, [loadingPlan, lastAttemptedPlanId]);

  const handleSelectPlan = (plan: any) => {
    if (!auth?.currentUser) { 
      router.push("/auth/login"); 
      return; 
    }
    setSummaryPlan({ ...plan });
  };

  const handleConfirmBackup = () => {
    setLastAttemptedPlanId(loadingPlan || lastAttemptedPlanId);
    setSummaryPlan(null);
    setLoadingPlan(null);
    setBackupConfirmed(true);
  };

  useEffect(() => {
    if (backupConfirmed && backupScriptRef.current && backupScriptRef.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.setAttribute("data-payment_button_id", "pl_T4wYLB6tZ5wGHm");
      script.async = true;
      backupScriptRef.current.appendChild(script);
    }
  }, [backupConfirmed]);

  const initiateRazorpayPayment = async (plan: any) => {
    if (!plan?.id || !auth.currentUser) return;
    
    console.log(`[Pricing Terminal] Initiating Live Checkout sequence for: ${plan.name} (${plan.id})`);
    setLoadingPlan(plan.id);
    setLastAttemptedPlanId(plan.id);
    setSummaryPlan(null);

    try {
      const public_key = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim().replace(/['"]/g, "");
      if (!public_key) {
        console.error("[Pricing Terminal] NEXT_PUBLIC_RAZORPAY_KEY_ID is missing.");
        throw new Error('Configuration Mismatch');
      }

      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errorData.error || `Gateway Error`);
      }

      const orderData = await orderResponse.json();

      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK load error');
      }

      const options = {
        key: public_key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NexTirupur.in",
        description: `Hiring Pack: ${plan.name}`,
        image: "/nextiruppur.png",
        order_id: orderData.order_id,
        // INDUSTRIAL METADATA: Essential for Webhook Reconciliation
        notes: {
          userId: auth.currentUser.uid,
          userEmail: userData?.email || auth.currentUser.email,
          userPhone: userData?.phone || auth.currentUser.phoneNumber,
          planId: plan.id
        },
        handler: async function (response: any) {
          console.log(`[Pricing Terminal] Payment Capture:`, response.razorpay_payment_id);
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              uid: auth.currentUser?.uid
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.status === 'success') {
            toast({ title: "Industrial Credits Synchronized", description: `${plan.posts} Posts added.` });
            router.push("/employer/dashboard");
          } else {
            toast({ variant: "destructive", title: "Payment verification failed." });
            setLoadingPlan(null);
          }
        },
        prefill: {
          name: userData?.contactPersonName || userData?.name || "",
          email: userData?.email || userData?.emailId || "",
          contact: userData?.phone || userData?.contactNumber || "",
        },
        theme: { color: "#0F52BA" },
        modal: { 
          ondismiss: () => {
            setLoadingPlan(null); 
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('[Pricing Terminal] Exception:', err.message);
      toast({ 
        variant: "destructive", 
        title: "Live Gateway Response Interrupted", 
        description: "Engaging industrial fallback authorization terminal..." 
      });
      setLoadingPlan(null);
      setShowBackupTerminal(true);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 font-black uppercase text-[10px] text-muted-foreground tracking-[0.3em] animate-pulse">
          Synchronizing Pricing Hub...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <main className="flex-grow py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex justify-between items-center">
             <Button variant="ghost" onClick={() => router.back()} className="text-primary font-bold hover:bg-primary/5 gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> {t.backToPrev}
             </Button>
          </div>

          <div className="text-center space-y-4 max-w-4xl mx-auto mb-16">
            <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight tracking-tighter">
              {t.pricingTagline}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              {t.pricingSubTagline}
            </p>
            <p className="text-sm font-bold text-amber-600 bg-amber-50 inline-block px-6 py-2 rounded-full border border-amber-100 shadow-sm">
              All prices are exclusive of 18% GST. GST will be added during checkout.
            </p>
          </div>

          <Card className="rounded-[3rem] border-none shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden bg-white mb-12">
             <div className="p-10 md:p-16 space-y-12">
                <div className="text-center space-y-2">
                   <h2 className="text-lg md:text-xl font-black text-primary uppercase tracking-tight">{t.allPlansInclude}</h2>
                   <p className="text-sm md:text-base text-muted-foreground font-medium">Get full access to Tirupur's most powerful hiring tools.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12">
                   {[
                     { title: t.benefit1Title, icon: Globe, desc: t.benefit1Desc },
                     { title: t.benefit2Title, icon: Monitor, desc: t.benefit2Desc },
                     { title: t.benefit3Title, icon: SlidersHorizontal, desc: t.benefit3Desc },
                     { title: t.benefit4Title, icon: Lock, desc: t.benefit4Desc },
                     { title: t.benefit5Title, icon: MessageSquare, desc: t.benefit5Desc },
                     { title: t.benefit6Title, icon: Headphones, desc: t.benefit6Desc }
                   ].map((feat, i) => (
                     <div key={i} className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                           <feat.icon className="w-7 h-7 text-primary" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-lg font-black text-primary leading-tight">{feat.title}</h3>
                           <p className="text-sm text-muted-foreground font-medium leading-relaxed">{feat.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto pt-4 mb-20">
            {EMPLOYER_PLANS.map((plan) => (
              <Card key={plan.id} className={cn("relative flex flex-col rounded-[2.5rem] border-none shadow-xl bg-white transition-all hover:scale-105 hover:shadow-2xl", plan.popular && "ring-4 ring-primary")}>
                {plan.popular && (
                  <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white border-none font-black px-6 py-2 rounded-full shadow-lg">
                    {t.mostPopular}
                  </Badge>
                )}
                <CardHeader className="text-center space-y-3 pt-12">
                  <div className="mx-auto bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">{plan.icon}</div>
                  <CardTitle className="text-2xl font-black tracking-tight">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-primary">{plan.posts} {plan.posts > 1 ? t.postsCount : t.postCount}</p>
                    <p className="text-2xl font-black">{plan.priceLabel}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow px-8 text-center space-y-6">
                  {plan.savings && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-none font-black px-4 py-1.5 rounded-lg">
                      {plan.savings}
                    </Badge>
                  )}
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">{plan.description}</p>
                    <div className="space-y-2 text-left pt-4 border-t border-dashed">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-8 pb-10">
                  <Button disabled={!!loadingPlan} className="w-full h-14 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl active:scale-95 transition-all" onClick={() => handleSelectPlan(plan)}>
                    {loadingPlan === plan.id ? <Loader2 className="animate-spin" /> : t.getStarted}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {showBackupTerminal && (
            <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {!activeBackupPlan ? (
                 <div className="bg-white rounded-[2rem] border-2 border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Loading Authorization Details...</p>
                 </div>
               ) : (
                 <Card className="rounded-[3rem] p-0 overflow-hidden border-none shadow-[0_30px_90px_rgba(0,0,0,0.1)] bg-[#FFFBF0]">
                    <div className="p-8 md:p-10 bg-[#78350F] text-white">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                             <AlertTriangle className="w-8 h-8 text-white" />
                          </div>
                          <div className="space-y-1 text-left">
                             <h3 className="text-2xl font-black uppercase tracking-tight">Backup Authorization Terminal</h3>
                             <p className="text-white/80 font-medium text-sm">Industrial Failsafe Gateway</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-8 md:p-10 space-y-8">
                       <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-8">
                             <Badge className="bg-[#D2691E] text-white border-none font-black text-lg px-6 py-2 rounded-2xl shadow-lg">₹{(activeBackupPlan.priceValue * 1.18).toFixed(2)}</Badge>
                          </div>
                          <CardHeader className="p-8 md:p-10 pb-0 text-left">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#92400E]/40 mb-1">Authorization Target</p>
                             <h3 className="text-4xl font-black text-[#78350F] font-headline">{activeBackupPlan.name}</h3>
                             <div className="w-full h-0.5 bg-[#FEF3C7] mt-6" />
                          </CardHeader>
                          <CardContent className="p-8 md:p-10 space-y-10">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center text-[#B45309]"><Check className="w-5 h-5 stroke-[4]" /></div>
                                   <div><p className="text-[10px] font-black uppercase text-[#92400E]/50">Base Price</p><p className="font-black text-[#78350F]">₹{activeBackupPlan.priceValue.toFixed(2)}</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center text-[#B45309]"><RefreshCcw className="w-5 h-5" /></div>
                                   <div><p className="text-[10px] font-black uppercase text-[#92400E]/50">GST (18%)</p><p className="font-black text-[#78350F]">₹{(activeBackupPlan.priceValue * 0.18).toFixed(2)}</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center text-[#B45309]"><Layers className="w-5 h-5" /></div>
                                   <div><p className="text-[10px] font-black uppercase text-[#92400E]/50">Job Posts</p><p className="font-black text-[#78350F]">{activeBackupPlan.posts} Included</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center text-[#B45309]"><ShieldCheck className="w-5 h-5" /></div>
                                   <div><p className="text-[10px] font-black uppercase text-[#92400E]/50">Plan Validity</p><p className="font-black text-[#78350F]">Lifetime</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center text-[#B45309]"><Users className="w-5 h-5" /></div>
                                   <div><p className="text-[10px] font-black uppercase text-[#92400E]/50">Applicable For</p><p className="font-black text-[#78350F]">Worker & Staff Jobs</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center text-[#B45309]"><Timer className="w-5 h-5" /></div>
                                   <div><p className="text-[10px] font-black uppercase text-[#92400E]/50">Post Validity</p><p className="font-black text-[#78350F]">15 Days</p></div>
                                </div>
                             </div>

                             <div className="space-y-4 pt-6 border-t border-[#FEF3C7]">
                                <p className="text-[10px] font-black uppercase text-[#92400E]/40 tracking-widest">Included Premium Benefits</p>
                                <div className="flex flex-wrap gap-2">
                                   {["Job Posting Credits", "Employer Dashboard", "Applicant Management", "Privacy Shield", "WhatsApp Alerts"].map(b => (
                                     <span key={b} className="bg-[#FFF9EA] text-[#B45309] px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-[#FEF3C7] shadow-sm">{b}</span>
                                   ))}
                                </div>
                             </div>
                          </CardContent>
                          <CardFooter className="p-0 border-t border-[#FEF3C7]">
                             <div className="w-full bg-white/50 p-8 flex flex-col items-center gap-6 justify-center">
                                {!backupConfirmed ? (
                                  <Button 
                                    onClick={handleConfirmBackup}
                                    className="h-14 px-12 bg-[#78350F] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-lg"
                                  >
                                    Initialize Backup Authorization
                                  </Button>
                                ) : (
                                  <div ref={backupScriptRef} className="flex items-center justify-center min-h-[60px]" />
                                )}
                                <p className="text-[10px] font-black text-[#92400E]/40 uppercase tracking-widest italic text-center max-w-xs">
                                   "Successful payments via backup terminal will be automatically reconciled to your account within 5-10 minutes."
                                </p>
                             </div>
                          </CardFooter>
                       </Card>
                    </div>
                 </Card>
               )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!summaryPlan} onOpenChange={(o) => { if(!o) { setSummaryPlan(null); } }}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-0.5 text-left">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Order Summary</DialogTitle>
                <DialogDescription className="text-white/80 font-medium">Verify your industrial hiring pack.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground uppercase">Plan Name</span>
                  <span className="text-sm font-black text-foreground">{summaryPlan?.name}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground uppercase">Job Posts</span>
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black">{summaryPlan?.posts} Included</Badge>
               </div>
               <Separator className="bg-muted/50" />
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground uppercase">Base Price</span>
                  <span className="text-sm font-black text-foreground">₹{summaryPlan?.priceValue?.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground uppercase">GST (18%)</span>
                  <span className="text-sm font-black text-foreground">₹{(summaryPlan?.priceValue * 0.18).toFixed(2)}</span>
               </div>
               <Separator className="bg-primary/20 h-0.5" />
               <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-primary uppercase">Total Payable</span>
                  <span className="text-2xl font-black text-primary">₹{(summaryPlan?.priceValue * 1.18).toFixed(2)}</span>
               </div>
            </div>
            <div className="p-4 bg-muted/20 rounded-2xl border border-dashed flex gap-3 items-start">
               <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
               <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic text-center">
                  All prices are exclusive of 18% GST. GST will be added during checkout. Job credits are valid for lifetime.
               </p>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/10 border-t flex gap-4">
            <Button variant="ghost" className="flex-1 font-bold h-12 rounded-xl" onClick={() => { setSummaryPlan(null); }}>Cancel</Button>
            <Button className="flex-[2] bg-primary text-white font-black h-12 rounded-xl shadow-lg active:scale-95 transition-all" onClick={() => initiateRazorpayPayment(summaryPlan)}>
               Proceed to Checkout <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

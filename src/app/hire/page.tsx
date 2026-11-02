"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PhoneCall, 
  Clock, 
  Users, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Smartphone, 
  Check, 
  Building2, 
  Headphones, 
  Bike, 
  Briefcase, 
  Compass, 
  MapPin, 
  HelpCircle,
  ChevronDown,
  Quote,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Categories tailored for local & frontline hiring (mirroring Job Hai)
const TOP_CATEGORIES = [
  { name: "Telecaller / BPO", icon: Headphones, count: "12,400+ Candidates", roles: "Outbound, Inbound, Support" },
  { name: "Field Sales & BD", icon: Briefcase, count: "18,200+ Candidates", roles: "B2B Sales, Loan Officer, Promoter" },
  { name: "Delivery Executive", icon: Bike, count: "24,500+ Candidates", roles: "Food Delivery, Courier, E-commerce" },
  { name: "Back Office & Data Entry", icon: Building2, count: "15,800+ Candidates", roles: "MIS Exec, Computer Operator, Admin" },
  { name: "Security & Facility", icon: ShieldCheck, count: "8,900+ Candidates", roles: "Security Guard, Supervisor, Housekeeping" },
  { name: "Drivers & Transport", icon: Compass, count: "9,100+ Candidates", roles: "Car Driver, Commercial, Fleet" },
];

const TOP_CITIES = [
  "Delhi NCR", "Mumbai", "Bengaluru", "Hyderabad", "Pune", 
  "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Indore"
];

const TESTIMONIALS = [
  {
    quote: "I started receiving candidate applications as soon as my job went live. Most of the applications were extremely relevant to our frontline requirements. We closed 6 positions within 36 hours!",
    name: "Nand Kumar",
    company: "Club Oxygen Services",
    location: "Delhi NCR",
    hires: "14 Staff Hired",
    rating: 5
  },
  {
    quote: "We were looking for bulk hiring in customer support. Direct phone calls from candidates saved us days of chasing resumes. The direct calling window kept calls strictly within work hours.",
    name: "Nidhi Sharma",
    company: "Jiva Health Solutions",
    location: "Bengaluru",
    hires: "32 Telecallers Hired",
    rating: 5
  },
  {
    quote: "The Turnaround Time was as promised. We hired 8 field delivery boys in Noida within 2 days. The mobile app experience makes candidate tracking effortless.",
    name: "Chetna Rastogi",
    company: "Silaris Logistics",
    location: "Noida / Greater Noida",
    hires: "21 Field Staff Hired",
    rating: 5
  }
];

const FAQS = [
  {
    q: "Can I post a job for free?",
    a: "Yes! Every employer can post free jobs on our portal. Your job listing goes live instantly after a quick automated review, and candidates in your city can start contacting you immediately."
  },
  {
    q: "How does the 'Hire in 48 Hours' process work?",
    a: "Our smart matching engine alerts active job seekers living within your micro-locality or city the moment you publish your vacancy. Candidates with matching experience and assets (e.g., bike, smartphone) apply or call you directly."
  },
  {
    q: "How do candidate direct phone calls work?",
    a: "When posting a job, you can toggle 'Allow Direct Calls' and set your preferred Calling Window (e.g. 10:00 AM to 06:00 PM). Qualified job seekers will be allowed to call your verified phone number only during those hours, protecting your privacy outside work."
  },
  {
    q: "What types of staff can I hire here?",
    a: "You can hire across 40+ categories including Telecallers, Customer Support, Field Sales, Delivery Executives, Back Office Operators, Drivers, Technicians, Security Guards, and Retail Associates."
  },
  {
    q: "Is candidate phone number and profile verified?",
    a: "Yes. Every job seeker registers with an OTP-verified mobile number, and their digital resume captures verified educational background, vehicle ownership, and past experience."
  }
];

export default function EmployerHireLandingPage() {
  const { toast } = useToast();
  const [phoneForApp, setPhoneForApp] = useState("");
  const [appSent, setAppSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleSendAppLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneForApp || phoneForApp.trim().length !== 10 || !/^\d{10}$/.test(phoneForApp.trim())) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
      return;
    }

    setAppSent(true);
    toast({
      title: "App Link Sent! 📲",
      description: `A download link has been sent to +91 ${phoneForApp}. You can start hiring on mobile 45% faster!`
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-background to-background pt-12 pb-20 border-b border-border/40">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Trusted by 50,000+ Employers across India
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
                Looking to hire staff <br />
                <span className="text-blue-600 underline decoration-blue-300 decoration-wavy underline-offset-8">
                  in your city?
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                Post a job for <strong className="text-foreground font-bold">FREE</strong> and hire verified local candidates in <strong className="text-blue-600 font-bold">less than 48 hours</strong>. Direct calls, zero middlemen.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/employer/post-job" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all">
                    Post a Job for FREE
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/login?role=employer" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-xl border-gray-300 hover:bg-muted">
                    Recruiter Login
                  </Button>
                </Link>
              </div>

              {/* Badges / Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Job Postings
                  </div>
                  <p className="text-xs text-muted-foreground">No credit card required</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                    <Zap className="w-4 h-4 text-amber-500" /> Hire in 48 Hours
                  </div>
                  <p className="text-xs text-muted-foreground">Rapid applicant matching</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                    <PhoneCall className="w-4 h-4 text-blue-600" /> Direct Inbound Calls
                  </div>
                  <p className="text-xs text-muted-foreground">Controlled calling hours</p>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5">
              <Card className="rounded-2xl border-2 border-blue-100 shadow-2xl bg-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider">
                  Fast-Track Hiring
                </div>

                <div className="space-y-5 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                      🏢
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">Post in Under 1 Minute</h2>
                      <p className="text-xs text-muted-foreground">Tell us who you need, role, and salary</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/60 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground">Role Category:</span>
                      <span className="font-bold text-foreground">Telecaller / Telesales</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground">Expected Salary:</span>
                      <span className="font-bold text-emerald-600">₹18,000 - ₹25,000 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground">Direct Calls Allowed:</span>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px]">
                        Active (10 AM - 6 PM)
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground">Required Assets:</span>
                      <span className="text-xs font-medium text-foreground">Smartphone, Good Hindi/English</span>
                    </div>
                  </div>

                  {/* Candidate Match Highlight */}
                  <div className="p-3 bg-muted/40 rounded-xl flex items-center gap-3 border border-border/50">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      98%
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">Candidate Matches Found</p>
                      <p className="text-[11px] text-muted-foreground">18 verified applicants ready to interview nearby</p>
                    </div>
                    <Link href="/employer/post-job">
                      <Button size="sm" className="h-8 bg-blue-600 text-xs font-bold hover:bg-blue-700">
                        Post Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* 3-Step Visual Process Section */}
      <section className="py-20 bg-muted/20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              How to hire in less than 48 hours
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              A frictionless 3-step recruitment process designed for busy employers and managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <Card className="rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all space-y-4 bg-background">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground">Post a free job in &lt; 1 minute</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Specify job title, salary range, shift timings, and mandatory assets (bike, smartphone, DL). Your job goes live instantly.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all space-y-4 bg-background">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground">Get direct phone calls & leads</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Relevant verified candidates call you directly during your designated calling window, or submit instant digital resumes.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all space-y-4 bg-background">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground">Interview and hire the right staff</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect via phone or WhatsApp, schedule an interview with 1-click, and close your opening in 48 hours.
              </p>
            </Card>
          </div>

          <div className="text-center pt-4">
            <Link href="/employer/post-job">
              <Button size="lg" className="h-12 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                Start Hiring Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Hiring Categories */}
      <section className="py-20 bg-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Frontline & Desk Talent</span>
              <h2 className="text-3xl font-black text-foreground tracking-tight mt-1">
                Top Hiring Categories
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Hire qualified freshers and experienced professionals ready to start immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOP_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-blue-500/50 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-base text-foreground group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{cat.roles}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600">{cat.count}</span>
                      <Link href="/employer/post-job" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        Hire <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* City Coverage */}
          <div className="mt-8 pt-8 border-t border-border/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hiring Across Top Indian Cities:
            </h4>
            <div className="flex flex-wrap gap-2">
              {TOP_CITIES.map((city) => (
                <Link key={city} href={`/employer/post-job?city=${encodeURIComponent(city)}`}>
                  <Badge variant="outline" className="px-3 py-1 text-xs hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-colors">
                    <MapPin className="w-3 h-3 mr-1 text-muted-foreground" /> {city}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Testimonials */}
      <section className="py-20 bg-muted/10 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              Our Happy Recruiters 🎉
            </h2>
            <p className="text-sm text-muted-foreground">
              Hear from HR leaders and business owners who filled their vacancies in record time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, index) => (
              <Card key={index} className="rounded-2xl p-6 border shadow-sm flex flex-col justify-between space-y-6 bg-background">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-200" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                    <p className="text-[11px] text-muted-foreground">{t.location}</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold">
                    {t.hires}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Download SMS Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-xs font-semibold">
                📱 Mobile Recruiter Portal
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
                Hiring is <span className="underline decoration-amber-300">45% faster</span> on the Mobile App
              </h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                Get push notifications the second a verified candidate applies. Call and chat via WhatsApp with 1 tap.
              </p>

              {/* Input Form */}
              <form onSubmit={handleSendAppLink} className="pt-2 flex flex-col sm:flex-row items-stretch gap-3 max-w-md">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    +91
                  </span>
                  <Input
                    type="tel"
                    maxLength={10}
                    value={phoneForApp}
                    onChange={(e) => setPhoneForApp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit mobile number"
                    className="h-12 pl-12 bg-white text-gray-900 font-semibold rounded-xl border-none focus-visible:ring-2 focus-visible:ring-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={appSent}
                  className="h-12 px-6 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md shrink-0"
                >
                  {appSent ? "Link Sent! ✓" : "Get App Link"}
                </Button>
              </form>
              <p className="text-xs text-blue-200">
                Over 10,000+ employers are already using the recruiter portal.
              </p>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 max-w-sm w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold">
                    📲
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Instant Candidate Calling</h3>
                    <p className="text-xs text-blue-200">Integrated dialer & call logging</p>
                  </div>
                </div>
                <div className="p-3 bg-white/10 rounded-xl text-xs space-y-1.5 border border-white/10">
                  <div className="flex justify-between">
                    <span>Direct Call Privacy:</span>
                    <span className="font-bold text-emerald-300">Protected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Calling Hours:</span>
                    <span className="font-bold text-white">10 AM - 6 PM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Recruiter FAQs */}
      <section className="py-20 bg-background border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about hiring staff through our platform.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="border rounded-2xl overflow-hidden bg-card transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-foreground text-sm sm:text-base hover:bg-muted/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Help Banner */}
          <div className="p-6 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-foreground">Need help posting a job?</h3>
              <p className="text-xs text-muted-foreground">Our recruiter support team is available Mon-Sat, 9:30 AM to 6:30 PM.</p>
            </div>
            <Link href="/support">
              <Button variant="outline" className="font-semibold text-xs rounded-xl">
                Contact Recruiter Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Sticky-style CTA Bar */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black">Hire faster, hire better!</h2>
            <p className="text-sm text-slate-400">The fastest way to hire entry-level, field, and desk staff in your city.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/employer/post-job">
              <Button size="lg" className="h-12 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg">
                Post a Job Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

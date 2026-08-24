"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ArrowLeft,
  Headphones,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SupportPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast({
        title: t.messageSent,
        description: t.messageSentDesc,
      });
    }, 1500);
  };

  const contactMethods = [
    {
      title: t.chatOnWhatsapp,
      desc: t.supportChatDesc,
      icon: <MessageCircle className="w-10 h-10 text-green-500" />,
      action: t.chatNow,
      link: "https://wa.me/917305505311",
      color: "bg-green-50"
    },
    {
      title: t.callUsNow,
      desc: t.supportCallDesc,
      icon: <Phone className="w-10 h-10 text-blue-500" />,
      action: "9025404014",
      link: "tel:+919025404014",
      color: "bg-blue-100"
    },
    {
      title: t.emailUs,
      desc: t.supportEmailDesc,
      icon: <Mail className="w-8 h-8 text-amber-600" />,
      action: "support@nextindia.in",
      link: "mailto:support@nextindia.in",
      color: "bg-amber-100"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5 uppercase font-bold text-xs">
            {t.verifiedSupportTitle}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-primary">
            {t.supportPageTitle}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            {t.supportSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((c, i) => (
            <Card key={i} className="rounded-3xl border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
              <CardHeader className="space-y-4">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner", c.color)}>
                  {c.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{c.title}</CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed">{c.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <a href={c.link} target={c.link.startsWith('http') ? "_blank" : undefined} rel="noopener noreferrer">
                  <Button className="w-full h-12 rounded-2xl font-bold gap-2 text-base shadow-md">
                    {c.action}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
          <Card className="rounded-3xl border-primary/10 shadow-xl p-6 md:p-8">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-2xl font-bold font-headline">{t.contactFormTitle}</CardTitle>
              <CardDescription className="text-sm font-medium">{t.contactFormSub}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {sent ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-2xl font-bold">{t.messageSent}</h3>
                  <Button variant="outline" onClick={() => setSent(false)}>Send Another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t.fullNameLabel}</label>
                    <Input placeholder={t.fullNamePlaceholder} className="h-12 rounded-xl font-medium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t.mobileLabel}</label>
                      <Input placeholder="9876543210" className="h-12 rounded-xl font-medium" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                      <Input type="email" placeholder="you@company.com" className="h-12 rounded-xl font-medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t.subjectLabel}</label>
                    <Input placeholder="e.g. Plan Upgrade, Profile Verification" className="h-12 rounded-xl font-medium" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t.messageLabel}</label>
                    <Textarea placeholder="Tell us how we can help you..." className="rounded-xl min-h-[120px] font-medium" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-base shadow-lg" disabled={sending}>
                    {sending ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</> : <><Send className="w-5 h-5 mr-2" /> {t.sendMessage}</>}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-headline text-primary">Office & Service Hours</h2>
              <div className="grid gap-6">
                <div className="flex gap-4 p-6 bg-muted/30 rounded-2xl border border-dashed border-primary/20">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-primary/10">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{t.officeAddress}</h4>
                    <p className="text-muted-foreground font-medium mt-1 leading-relaxed">
                      Unified Portal Support Hub,<br />
                      Main Business District,<br />
                      Tamil Nadu, India
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 bg-muted/30 rounded-2xl border border-dashed border-primary/20">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{t.officeHours}</h4>
                    <p className="text-muted-foreground font-medium mt-1">{t.officeHoursVal}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-muted-foreground/30 text-[10px] uppercase tracking-widest font-bold pt-8">
          © {new Date().getFullYear()} NextIndia.in. All rights reserved.
        </div>
      </main>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { AppLogo } from "@/components/shared/AppLogo";
import { 
  Facebook, 
  Instagram, 
  Send, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePathname } from "next/navigation";

export function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (pathname !== '/') return null;

  return (
    <footer className="bg-muted/30 border-t pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto w-full space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Identity */}
          <div className="space-y-6">
            <AppLogo width={160} height={60} />
            <p className="text-sm font-normal text-muted-foreground leading-relaxed">
              India's trusted unified job & internship platform. Connecting companies, IT firms, and industrial enterprises with top talent, interns, and skilled workforce.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Industrial & IT Hub */}
          <div className="space-y-6">
            <h4 className="font-semibold uppercase text-[11px] tracking-widest text-primary">Job & Career Hub</h4>
            <ul className="space-y-4">
              <li><Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.findJobs}</Link></li>
              <li><Link href="/communities" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.whatsappCommunity}</Link></li>
              <li><Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.plans}</Link></li>
              <li><Link href="/cancellation-refund" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.cancellationPolicy}</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-semibold uppercase text-[11px] tracking-widest text-primary">{t.explore}</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.termsOfService}</Link></li>
              <li><Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.privacyPolicy}</Link></li>
              <li><Link href="/support" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.contactSupport}</Link></li>
              <li><Link href="/safety" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {t.safetyPageTitle}</Link></li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-6">
            <h4 className="font-semibold uppercase text-[11px] tracking-widest text-primary">Support & Connect</h4>
            <div className="space-y-4">
              <a href="tel:+919025404014" className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">{t.callUsNow}</p>
                  <p className="text-sm font-semibold">+91 90254 04014</p>
                </div>
              </a>
              <a href="https://wa.me/917305505311" className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">{t.chatOnWhatsapp}</p>
                  <p className="text-sm font-semibold">+91 73055 05311</p>
                </div>
              </a>
              <a href="mailto:support@nextindia.in" className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">{t.emailUs}</p>
                  <p className="text-sm font-semibold">support@nextindia.in</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-muted-foreground/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.1em]">
            © {new Date().getFullYear()} NextIndia.in — Unified Job & Internship Platform.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-primary uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> {t.msmeRegistered}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-primary uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> {t.gstCompliant}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

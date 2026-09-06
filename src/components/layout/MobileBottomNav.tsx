"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Clapperboard, FileText, UserCircle, Building2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('job_seeker');

  useEffect(() => {
    const savedRole = localStorage.getItem('sim_user_role');
    if (savedRole) setUserRole(savedRole);
  }, [pathname]);

  const dashboardLink = userRole === 'employer' ? '/employer/dashboard' : '/seeker/dashboard';
  const profileLink = userRole === 'employer' ? '/employer/profile' : '/seeker/profile';

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Jobs",
      href: "/jobs",
      icon: Search,
    },
    {
      label: "Reels",
      href: "/seeker/swipe",
      icon: Clapperboard,
      highlight: true,
    },
    {
      label: "Dashboard",
      href: dashboardLink,
      icon: FileText,
    },
    {
      label: "Profile",
      href: profileLink,
      icon: userRole === 'employer' ? Building2 : UserCircle,
    },
  ];

  return (
    <div className="md:hidden print:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 px-2 py-1.5 shadow-[0_-8px_30px_rgb(0,0,0,0.05)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className="flex flex-col items-center justify-center py-0.5 px-2 relative group"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm",
                  isActive
                    ? "bg-gradient-to-tr from-amber-500 via-orange-500 to-primary text-white shadow-primary/30 ring-2 ring-primary/20 scale-105"
                    : "bg-gradient-to-tr from-primary/10 to-amber-500/10 text-primary shadow-primary/10 group-hover:scale-105 border border-primary/10"
                )}>
                  <Icon className="w-5 h-5 stroke-[2.2px]" />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-tight mt-0.5 transition-colors",
                  isActive ? "text-primary font-black" : "text-slate-600 font-bold group-hover:text-primary"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 group relative",
                isActive ? "text-primary" : "text-slate-700 hover:text-primary"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-all duration-200",
                isActive ? "bg-primary/15 scale-105 border border-primary/30 shadow-sm" : "group-hover:bg-primary/5"
              )}>
                <Icon className={cn("w-5 h-5 transition-all", isActive ? "stroke-[2.75px] drop-shadow-md" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[9px] tracking-tight transition-colors mt-1",
                isActive ? "text-primary font-black" : "text-slate-600 font-bold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-3 h-0.5 bg-primary rounded-full transition-all" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

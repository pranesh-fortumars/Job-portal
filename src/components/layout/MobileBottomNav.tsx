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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-8px_30px_rgb(0,0,0,0.4)]">
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
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 shadow-md",
                  isActive
                    ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-rose-500/40 ring-2 ring-rose-500/30 scale-105"
                    : "bg-gradient-to-tr from-accent/90 to-amber-500 text-slate-950 shadow-amber-500/20 group-hover:scale-105"
                )}>
                  <Icon className="w-5 h-5 stroke-[2.2px]" />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-tight mt-0.5 transition-colors",
                  isActive ? "text-amber-400 font-black" : "text-amber-300/80 group-hover:text-amber-300"
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
                isActive ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-all duration-200",
                isActive ? "bg-amber-400/10 scale-105" : "group-hover:bg-white/5"
              )}>
                <Icon className={cn("w-5 h-5 transition-transform", isActive ? "stroke-[2.5px]" : "stroke-[1.75px]")} />
              </div>
              <span className={cn(
                "text-[9px] font-bold tracking-tight transition-colors mt-0.5",
                isActive ? "text-amber-400 font-black" : "text-slate-400"
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-3 h-0.5 bg-amber-400 rounded-full transition-all" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  UserCircle, 
  Menu, 
  Languages, 
  ChevronDown, 
  LayoutDashboard, 
  Search, 
  Home, 
  PlusCircle, 
  CreditCard, 
  LogOut, 
  Settings, 
  User, 
  Loader2, 
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  Phone
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LanguageKey } from "@/lib/translations";
import { UserRole } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth, useFirestore, useDoc } from "@/firebase";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";
import { BRANDING } from "@/lib/branding";
import { AppLogo } from "@/components/shared/AppLogo";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const userProfileRef = useMemo(() => user ? doc(db, "Users", user.uid) : null, [db, user]);
  const { data: userProfile, loading: profileLoading } = useDoc<any>(userProfileRef);

  const [userRole, setUserRole] = useState<UserRole>('job_seeker');

  useEffect(() => {
    const savedRole = localStorage.getItem('sim_user_role') as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
    } else {
      if (pathname.includes('/admin/')) setUserRole('admin');
      else if (pathname.includes('/employer/')) setUserRole('employer');
      else setUserRole('job_seeker');
    }
  }, [pathname, user]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('sim_is_logged_in');
      localStorage.removeItem('sim_user_role');
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin/dashboard';
    if (userRole === 'employer') return '/employer/dashboard';
    return '/seeker/dashboard';
  };

  const getProfileLink = () => {
    if (userRole === 'employer') return '/employer/profile';
    if (userRole === 'job_seeker') return '/seeker/profile';
    if (userRole === 'admin') return '/admin/dashboard?tab=my-profile';
    return getDashboardLink();
  };

  // Determine login state based on presence of user and completed registration
  // Dashboard/Profile only visible when signupStatus is 'completed'
  const isLoggedIn = !!user && (userProfile?.signupStatus === 'completed' || userProfile?.role === 'admin' || (!!userProfile?.role && !userProfile?.signupStatus && userProfile?.onboarded));
  const showEmployerOptions = isLoggedIn && userRole === 'employer';

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = pathname === href;
    return (
      <SheetClose asChild>
        <Link 
          href={href} 
          className={cn(
            "flex items-center gap-3 p-4 rounded-2xl font-bold transition-all border",
            isActive 
              ? "bg-primary/5 border-primary/10 text-primary shadow-sm" 
              : "bg-transparent border-transparent text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/10"
          )}
        >
          <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-primary/60")} /> 
          {label}
        </Link>
      </SheetClose>
    );
  };

  const profileImage = useMemo(() => {
    if (!userProfile) return null;
    if (userRole === 'employer') {
      return userProfile.companyLogoUrl || userProfile.photo;
    }
    return userProfile.photo;
  }, [userProfile, userRole]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center justify-between max-w-7xl mx-auto px-2 sm:px-4 md:px-8 w-full overflow-hidden">
        {/* Left Side: Logo and Mobile Lang Switcher */}
        <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="w-24 xs:w-28 sm:w-32 md:w-40 h-11 md:h-14 rounded-xl flex items-center justify-center overflow-hidden bg-primary/5 px-1 sm:px-2 transition-all">
              <AppLogo 
                width={120} 
                height={48} 
                className="max-w-[80px] xs:max-w-[100px] md:max-w-full h-auto" 
                priority 
                section="header"
              />
            </div>
          </Link>

          {/* Mobile Language Selector */}
          <div className="flex md:hidden gap-0.5 bg-muted p-0.5 rounded-lg border border-primary/10 shrink-0">
            {(['English', 'Tamil', 'Hindi'] as LanguageKey[]).map((lang) => (
              <button 
                key={lang}
                className={cn(
                  "text-[8px] xs:text-[9px] px-1.5 py-1 font-black rounded transition-all",
                  language === lang ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-primary'
                )}
                onClick={() => setLanguage(lang)}
              >
                {lang === 'English' ? 'EN' : lang === 'Tamil' ? 'தமிழ்' : 'HI'}
              </button>
            ))}
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold ml-6">
            <Link href="/jobs" className={cn("transition-colors hover:text-primary", pathname === '/jobs' ? "text-primary" : "")}>{t.findJobs}</Link>
            {showEmployerOptions && (
              <>
                <Link href="/employer/post-job" className={cn("transition-colors hover:text-primary", pathname === '/employer/post-job' ? "text-primary" : "")}>{t.hireTalent}</Link>
                <Link href="/pricing" className={cn("transition-colors hover:text-primary", pathname === '/pricing' ? "text-primary" : "")}>{t.plans}</Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Side: Desktop Actions and Mobile Terminal */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0 ml-1">
          <Link href="/communities" className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all active:scale-95" title={t.whatsappCommunity}>
            <MessageCircle className="w-6 h-6" />
          </Link>

          {/* Desktop Lang Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 font-bold text-muted-foreground hover:text-primary transition-colors">
                <Languages className="w-4 h-4" />
                {language === 'Tamil' ? 'தமிழ்' : language === 'Hindi' ? 'हिन्दी' : language}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1 font-bold">
              <DropdownMenuItem className="rounded-lg cursor-pointer hover:text-primary" onClick={() => setLanguage('English')}>English</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer hover:text-primary" onClick={() => setLanguage('Tamil')}>தமிழ் (Tamil)</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer hover:text-primary" onClick={() => setLanguage('Hindi')}>हिन्दी (Hindi)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href={getDashboardLink()}>
                <Button size="sm" className="hidden sm:flex items-center gap-2 font-bold rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm border-none">
                  <LayoutDashboard className="w-4 h-4" /> {t.dashboard}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-primary/5">
                    {profileLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
                    ) : profileImage ? (
                      <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl font-bold">
                  <div className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    {userRole === 'admin' ? t.superAdmin : userRole === 'employer' ? t.factoryOwner : t.worker}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(getDashboardLink())} className="rounded-lg cursor-pointer hover:text-primary">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> {t.dashboard}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(getProfileLink())} className="rounded-lg cursor-pointer hover:text-primary">
                    <User className="w-4 h-4 mr-2" /> {t.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-lg cursor-pointer hover:text-primary">
                    <Settings className="w-4 h-4 mr-2" /> {t.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg text-destructive cursor-pointer" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> {t.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/auth/login" className="hidden sm:block">
                <Button variant="ghost" className="font-bold text-primary hover:text-primary hover:bg-primary/5">{t.login}</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary text-white hover:bg-primary/90 hover:text-white font-black px-2 sm:px-6 h-8 sm:h-10 text-[10px] sm:text-sm rounded-lg sm:rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {t.signUp}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Terminal Icons */}
          <div className="flex md:hidden items-center gap-1">
            <a href="tel:+919025404014" className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all active:scale-95 shadow-sm">
              <Phone className="w-4 h-4" />
            </a>
            <Link href="/communities" className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all active:scale-95 shadow-sm">
              <MessageCircle className="w-4 h-4" />
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 xs:h-9 xs:w-9 hover:bg-primary/5 rounded-lg border border-primary/5">
                  <Menu className="h-5 w-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:max-w-sm p-0 border-none">
                <div className="flex flex-col h-full bg-background">
                  <SheetHeader className="p-6 border-b text-left">
                    <SheetTitle className="font-headline text-xl text-primary flex items-center gap-3">
                      <div className="w-28 h-12 rounded-xl overflow-hidden bg-primary/5 px-2">
                        <AppLogo width={100} height={44} priority section="header" />
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-grow overflow-y-auto py-6 px-4">
                    <div className="grid gap-2 mb-8">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">{t.home}</p>
                      <NavItem href="/" icon={Home} label={t.home} />
                      {isLoggedIn && <NavItem href={getDashboardLink()} icon={LayoutDashboard} label={t.dashboard} />}
                      {isLoggedIn && <NavItem href={getProfileLink()} icon={User} label={t.profile} />}
                      <NavItem href="/jobs" icon={Search} label={t.findJobs} />
                      <NavItem href="/communities" icon={MessageCircle} label={t.whatsappCommunity} />
                      {showEmployerOptions && (
                        <>
                          <NavItem href="/employer/post-job" icon={PlusCircle} label={t.hireTalent} />
                          <NavItem href="/pricing" icon={CreditCard} label={t.plans} />
                        </>
                      )}
                      {isLoggedIn && <NavItem href="/settings" icon={Settings} label={t.settings} />}
                    </div>

                    <div className="px-2 mb-8">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">{t.languagesKnown}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['English', 'Tamil', 'Hindi'] as LanguageKey[]).map((lang) => (
                          <Button 
                            key={lang}
                            variant={language === lang ? 'default' : 'outline'} 
                            size="sm" 
                            className="rounded-xl h-12 font-bold"
                            onClick={() => setLanguage(lang)}
                          >
                            {lang === 'Tamil' ? 'தமிழ்' : lang === 'Hindi' ? 'हिन्दी' : lang}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Social Connections */}
                    <div className="px-2 mb-8">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">{t.exploreMore}</p>
                      <div className="grid grid-cols-4 gap-3">
                         <a href="https://www.facebook.com/nextirupur" target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-white border flex items-center justify-center text-primary shadow-sm"><Facebook className="w-5 h-5" /></a>
                         <a href="https://www.instagram.com/nextirupur" target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-white border flex items-center justify-center text-primary shadow-sm"><Instagram className="w-5 h-5" /></a>
                         <a href="https://t.me/nextirupur" target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-white border flex items-center justify-center text-primary shadow-sm"><Send className="w-5 h-5" /></a>
                         <a href="tel:+919025404014" className="h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm"><Phone className="w-5 h-5" /></a>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t mt-auto bg-muted/30">
                    {!isLoggedIn ? (
                      <div className="grid gap-3">
                        <SheetClose asChild>
                          <Link href="/auth/signup">
                            <Button className="w-full bg-primary hover:bg-primary/90 hover:text-white font-bold h-14 rounded-2xl text-lg shadow-lg shadow-primary/20">
                              {t.login} / {t.signUp}
                            </Button>
                          </Link>
                        </SheetClose>
                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">{t.freeForSeekers}</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <Button 
                          variant="ghost" 
                          className="w-full text-destructive font-bold h-12 hover:bg-destructive/5 rounded-xl flex items-center justify-center gap-2" 
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" /> {t.logout}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

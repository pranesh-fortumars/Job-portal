"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Eye, TrendingUp, Calendar, ArrowLeft, Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, subDays, isAfter } from "date-fns";

export default function ProfileViewsPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const viewsQuery = useMemo(() => {
    if (!auth?.currentUser || !db) return null;
    return query(
      collection(db, "ProfileViews"), 
      where("viewedId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc")
    );
  }, [auth?.currentUser, db]);

  const { data: views, loading } = useCollection<any>(viewsQuery);

  const stats = useMemo(() => {
    if (!views) return { total: 0, last7Days: 0 };
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    
    return {
      total: views.length,
      last7Days: views.filter((v: any) => {
        if (!v.timestamp) return false;
        const d = v.timestamp.toDate ? v.timestamp.toDate() : new Date(v.timestamp);
        return isAfter(d, sevenDaysAgo);
      }).length
    };
  }, [views]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 shrink-0 border border-slate-200 bg-white">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-primary flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-500" />
              Who Viewed Your Profile
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">
              See how many employers are discovering your profile in the Resdex.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <Eye className="w-24 h-24 text-primary" />
              </div>
              <CardContent className="p-8">
                 <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Total Profile Views</p>
                 <p className="text-5xl font-black text-slate-800">{stats.total}</p>
                 <p className="text-sm font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                    Lifetime views from verified employers
                 </p>
              </CardContent>
           </Card>
           
           <Card className="border-none shadow-sm rounded-3xl bg-blue-500 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                 <TrendingUp className="w-24 h-24 text-white" />
              </div>
              <CardContent className="p-8">
                 <p className="text-xs font-black uppercase text-blue-200 tracking-widest mb-2">Last 7 Days</p>
                 <div className="flex items-end gap-3">
                    <p className="text-5xl font-black text-white">+{stats.last7Days}</p>
                    <span className="text-sm font-bold text-blue-100 mb-2">New Views</span>
                 </div>
                 <p className="text-sm font-semibold text-blue-100 mt-2 flex items-center gap-1.5">
                    Your profile is gaining traction!
                 </p>
              </CardContent>
           </Card>
        </div>

        {/* View History */}
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
           <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-primary" /> Recent Views
              </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              {loading ? (
                 <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 </div>
              ) : !views || views.length === 0 ? (
                 <div className="text-center p-12">
                    <Eye className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No one has viewed your profile yet. Apply for jobs to get noticed!</p>
                 </div>
              ) : (
                 <div className="divide-y divide-slate-100">
                    {views.slice(0, 50).map((view: any, i: number) => {
                       const timeAgo = view.timestamp 
                          ? formatDistanceToNow(view.timestamp.toDate ? view.timestamp.toDate() : new Date(view.timestamp), { addSuffix: true })
                          : "Recently";
                          
                       return (
                          <div key={view.id || i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                   <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800">A Verified Employer</p>
                                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Industrial Hub</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                                   {timeAgo}
                                </span>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              )}
           </CardContent>
        </Card>

      </main>
    </div>
  );
}

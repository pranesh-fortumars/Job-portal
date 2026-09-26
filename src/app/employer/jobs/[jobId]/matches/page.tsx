"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Star, MapPin, Briefcase, CheckCircle2, UserCircle, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore, useDoc, useCollection } from "@/firebase";
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from "@/lib/utils"; // Assuming we have a distance utility

export default function CandidateMatchesPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [seekers, setSeekers] = useState<any[]>([]);
  const [scoring, setScoring] = useState(true);
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const jobRef = useMemo(() => db && params.jobId ? doc(db, "Jobs", params.jobId) : null, [db, params.jobId]);
  const { data: jobData, loading: jobLoading } = useDoc<any>(jobRef);

  useEffect(() => {
    const fetchAndScoreSeekers = async () => {
      if (!db || !jobData) return;
      
      setScoring(true);
      try {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("role", "==", "job_seeker"), where("visibility", "==", "public"));
        const snapshot = await getDocs(q);
        
        let scoredCandidates: any[] = [];

        snapshot.forEach((docSnap) => {
          const seeker = docSnap.data();
          let score = 0;
          let matchReasons = [];

          // 1. Department Match (50 points)
          if (seeker.category === jobData.category) {
            if (seeker.department === jobData.department) {
              score += 50;
              matchReasons.push("Exact Department Match");
            } else {
              score += 20; // Partial category match
            }
          }

          // 2. Experience Match (20 points)
          const jobExp = parseInt(jobData.experienceRequired) || 0;
          const seekerExp = parseInt(seeker.experience) || 0;
          if (seekerExp >= jobExp) {
            score += 20;
            matchReasons.push("Experience Meets Requirements");
          } else if (seekerExp >= jobExp - 1) {
            score += 10;
          }

          // 3. Location Proximity (30 points)
          // Simple string match fallback if lat/lng is missing
          if (jobData.latitude && jobData.longitude && seeker.latitude && seeker.longitude) {
            // Very rough distance estimation logic
            const latDiff = Math.abs(jobData.latitude - seeker.latitude);
            const lngDiff = Math.abs(jobData.longitude - seeker.longitude);
            // Rough approximation: 0.05 degrees is ~5.5km
            if (latDiff < 0.05 && lngDiff < 0.05) {
              score += 30;
              matchReasons.push("Within 5km Radius");
            } else if (latDiff < 0.15 && lngDiff < 0.15) {
              score += 15;
            }
          } else if (seeker.location && jobData.location) {
            if (jobData.location.toLowerCase().includes(seeker.location.toLowerCase()) || 
                seeker.location.toLowerCase().includes(jobData.location.toLowerCase())) {
              score += 25;
              matchReasons.push("Location Match");
            }
          }

          if (score > 30) {
             scoredCandidates.push({
                id: docSnap.id,
                ...seeker,
                matchScore: score,
                matchReasons
             });
          }
        });

        // Sort descending by score
        scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
        
        // Take top 20 matches
        setSeekers(scoredCandidates.slice(0, 20));

      } catch (error) {
        console.error("Error matching candidates:", error);
      } finally {
        setScoring(false);
      }
    };

    if (jobData && !jobLoading) {
      fetchAndScoreSeekers();
    }
  }, [jobData, jobLoading, db]);


  const handleInvite = async (seeker: any) => {
    if (!db || !auth?.currentUser || !jobData) return;
    try {
       await addDoc(collection(db, "UserNotifications"), {
          userId: seeker.id,
          type: 'employer_invite',
          title: 'You have been invited to apply!',
          message: `${jobData.companyName} thinks you are a great match for their ${jobData.designation} role.`,
          jobId: params.jobId,
          employerId: auth.currentUser.uid,
          status: 'unread',
          createdAt: serverTimestamp()
       });
       
       setInvited(prev => ({ ...prev, [seeker.id]: true }));
       toast({ title: "Invitation Sent!" });
    } catch (e) {
       toast({ variant: "destructive", title: "Failed to send invitation" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Button variant="ghost" onClick={() => router.push('/employer/dashboard')} className="font-bold text-slate-500 mb-2 -ml-3">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-black font-headline text-primary flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
              Top Candidate Matches
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">
              We've instantly scanned our database for the best candidates for: 
              <strong className="text-primary ml-1">{jobData?.designation || "your new job"}</strong>
            </p>
          </div>
        </div>

        {jobLoading || scoring ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-bold text-muted-foreground animate-pulse">Running Industrial Matching Algorithm...</p>
          </div>
        ) : seekers.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none rounded-[2rem] bg-transparent">
             <CardContent className="flex flex-col items-center justify-center p-20 text-center">
                <Users className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-600 mb-2">No Immediate Matches Found</h3>
                <p className="text-slate-500 max-w-md">
                   We couldn't find public profiles that strictly match your requirements right now. Your job is live and seekers will be able to apply normally!
                </p>
                <Button onClick={() => router.push('/employer/dashboard')} className="mt-6 rounded-xl font-bold">
                   Go to Dashboard
                </Button>
             </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {seekers.map((seeker) => (
              <Card key={seeker.id} className="border-none shadow-md hover:shadow-lg transition-all rounded-[1.5rem] overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    
                    {/* Score Ring */}
                    <div className="relative shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 border-4 border-amber-400 shadow-inner">
                       <span className="text-2xl font-black text-amber-600">{seeker.matchScore}</span>
                       <span className="absolute -bottom-2 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                         Score
                       </span>
                    </div>

                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xl text-primary">{seeker.name || "Anonymous Seeker"}</h3>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0">
                             {seeker.experience || 0} Yrs Exp
                          </Badge>
                       </div>
                       
                       <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> {seeker.department || "General Worker"}
                       </p>
                       <p className="text-sm text-slate-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {seeker.location || "Tirupur"}
                       </p>

                       <div className="flex flex-wrap gap-2 pt-2">
                          {seeker.matchReasons.map((reason: string, i: number) => (
                             <span key={i} className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                               <CheckCircle2 className="w-3 h-3" /> {reason}
                             </span>
                          ))}
                       </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                       <Button 
                         disabled={invited[seeker.id]} 
                         onClick={() => handleInvite(seeker)}
                         className="w-full md:w-40 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white h-12 shadow-md"
                       >
                         {invited[seeker.id] ? "Invited!" : "Invite to Apply"}
                       </Button>
                       <Link href={`/resdex/${seeker.id}`} className="w-full">
                         <Button variant="outline" className="w-full md:w-40 rounded-xl font-bold border-primary/20 text-primary h-10">
                           View Profile
                         </Button>
                       </Link>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

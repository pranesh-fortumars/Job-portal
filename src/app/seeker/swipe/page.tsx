"use client";

import { useState, useMemo, useEffect } from "react";
import { SwipeJobCard } from "@/components/jobs/SwipeJobCard";
import { JobListing } from "@/lib/types";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { DEMO_JOBS_LIST } from "@/lib/mock-data";
import { Loader2, Sparkles, Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SeekerSwipePage() {
  const db = useFirestore();
  const router = useRouter();

  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const jobsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "Jobs"),
      where("status", "==", "approved"),
      limit(20)
    );
  }, [db]);

  const { data: rawJobs, loading } = useCollection<any>(jobsQuery);

  const jobsList: JobListing[] = useMemo(() => {
    if (rawJobs && rawJobs.length > 0) {
      return rawJobs as JobListing[];
    }
    return DEMO_JOBS_LIST as JobListing[];
  }, [rawJobs]);

  const filteredJobs = useMemo(() => {
    if (activeCategory === 'all') return jobsList;
    return jobsList.filter(j => j.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [jobsList, activeCategory]);

  // Generate continuous infinite loop array so reels swiping never stops
  const loopedJobs = useMemo(() => {
    if (!filteredJobs || filteredJobs.length === 0) return [];
    const REPEAT_COUNT = 20; // 20 repetitions for endless seamless swiping
    const list: { job: JobListing; originalIndex: number; uniqueKey: string }[] = [];
    for (let r = 0; r < REPEAT_COUNT; r++) {
      filteredJobs.forEach((job, i) => {
        list.push({
          job,
          originalIndex: i,
          uniqueKey: `${job.jobId || (job as any).id || i}-loop-${r}`,
        });
      });
    }
    return list;
  }, [filteredJobs]);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      {/* Top Controls Header - Back Button Only */}
      <div className="shrink-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-white/10 px-3 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="h-8 w-8 text-white hover:bg-white/10 rounded-full active:scale-95"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <h1 className="font-semibold text-xs text-white">Job Reels</h1>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['all', 'Non-Technical', 'Technical'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? "bg-amber-400 text-slate-950 font-semibold" 
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Full-Screen Reels Feed Container - Infinite Continuous Loop */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-0 overflow-hidden">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-white/60">
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            <p className="text-xs font-normal">Loading Reels...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-6">
            <Briefcase className="w-10 h-10 text-white/20" />
            <h3 className="text-sm font-semibold text-white">No Jobs Found</h3>
            <p className="text-xs text-white/60 max-w-xs font-normal">Try switching categories or viewing all jobs.</p>
            <Button onClick={() => setActiveCategory('all')} className="bg-amber-400 text-slate-950 font-semibold rounded-lg h-8 text-xs">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="w-full max-w-md h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scrollbar-hide rounded-none md:rounded-2xl shadow-xl"
          >
            {loopedJobs.map((item) => (
              <SwipeJobCard 
                key={item.uniqueKey}
                job={item.job}
                index={item.originalIndex}
                total={filteredJobs.length}
                onOpenDetails={(j) => setSelectedJob(j)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Job Details Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="rounded-2xl max-w-sm w-[92%] bg-slate-900 text-white border-white/10 p-5 shadow-xl font-sans">
          {selectedJob && (
            <div className="space-y-4">
              <DialogHeader>
                <Badge className="w-fit bg-amber-400/20 text-amber-300 border-amber-400/30 font-medium text-[9px] mb-1">
                  {selectedJob.category} • {selectedJob.department}
                </Badge>
                <DialogTitle className="text-lg font-semibold text-white leading-snug">
                  {selectedJob.jobTitle}
                </DialogTitle>
                <DialogDescription className="text-white/70 font-normal text-xs">
                  {selectedJob.companyName} • {selectedJob.location || "India"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-normal">
                <div>
                  <span className="text-white/50 text-[9px] uppercase font-medium block">Salary</span>
                  <span className="font-semibold text-emerald-400">
                    ₹{selectedJob.salaryMin?.toLocaleString()} - ₹{selectedJob.salaryMax?.toLocaleString()} / mo
                  </span>
                </div>
                <div>
                  <span className="text-white/50 text-[9px] uppercase font-medium block">Experience</span>
                  <span className="font-semibold text-white">{selectedJob.experienceRequired || 0}+ Years</span>
                </div>
                <div>
                  <span className="text-white/50 text-[9px] uppercase font-medium block">Openings</span>
                  <span className="font-semibold text-white">{selectedJob.openings || 1} Positions</span>
                </div>
                <div>
                  <span className="text-white/50 text-[9px] uppercase font-medium block">Work Type</span>
                  <span className="font-semibold text-white">{selectedJob.workType || "Full-time"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-white/70">Job Description</h4>
                <p className="text-xs text-white/80 leading-relaxed max-h-28 overflow-y-auto font-normal">
                  {selectedJob.description || "Exciting opportunity with career progression and market-leading benefits."}
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Link href={`/jobs/${selectedJob.jobId || (selectedJob as any).id}`} className="flex-1">
                  <Button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl h-10 text-xs shadow-md">
                    View Full Page Details
                  </Button>
                </Link>
                <Button 
                  type="button" 
                  onClick={() => setSelectedJob(null)} 
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold rounded-xl h-10 text-xs px-4"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

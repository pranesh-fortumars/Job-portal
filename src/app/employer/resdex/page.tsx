"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Search, UserCircle, MapPin, Briefcase, ChevronLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import { translateLocation } from "@/lib/utils";

export default function ResdexPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const db = useFirestore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    location: "all",
    gender: "any",
    minExperience: 0,
  });

  // Query to fetch all public job seekers
  const seekersQuery = useMemo(() => {
    if (!db) return null;
    // For simplicity, assuming all approved job seekers are visible
    return query(
      collection(db, "Users"),
      where("role", "==", "job_seeker")
    );
  }, [db]);

  const { data: seekers, loading } = useCollection<any>(seekersQuery);

  const filteredSeekers = useMemo(() => {
    if (!seekers) return [];
    const queryLower = searchQuery.toLowerCase().trim();

    return seekers.filter(seeker => {
      // Ensure seeker is onboarded/completed
      if (!seeker.onboarded) return false;

      const textToSearch = [
        seeker.name,
        seeker.category,
        seeker.department,
        seeker.designation,
        seeker.location,
        seeker.skills?.join(" ")
      ].join(" ").toLowerCase();

      const matchesSearch = queryLower === "" || textToSearch.includes(queryLower);
      const matchesCategory = filters.category === "all" || seeker.category === filters.category;
      
      const seekerLoc = seeker.location?.toLowerCase() || "";
      const filterLoc = filters.location === "all" ? "" : (t.locations as any)[filters.location]?.toLowerCase() || filters.location;
      const matchesLocation = filters.location === "all" || seekerLoc.includes(filterLoc);
      
      const matchesGender = filters.gender === "any" || seeker.gender === filters.gender;
      
      const seekerExp = parseInt(seeker.experience) || 0;
      const matchesExperience = seekerExp >= filters.minExperience;

      return matchesSearch && matchesCategory && matchesLocation && matchesGender && matchesExperience;
    });
  }, [seekers, searchQuery, filters, t]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pb-8">
        <div className="relative z-30 bg-primary py-8 shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10 mb-4 px-0 flex items-center gap-2 font-bold h-8">
               <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-semibold font-headline mb-6 text-white">Candidate Database (Resdex)</h1>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search by candidate name, skills, or role..." 
                  className="pl-12 h-14 bg-white border-none shadow-lg rounded-2xl text-base md:text-lg font-medium" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Advanced Filters Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-sm p-6 border-none">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed">
                <h3 className="font-black text-lg text-primary uppercase tracking-tight">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setFilters({ category: 'all', location: 'all', gender: 'any', minExperience: 0 })} className="text-muted-foreground hover:text-primary text-xs font-bold h-8">Clear All</Button>
              </div>
              
              <Accordion type="multiple" defaultValue={["category", "experience", "gender"]} className="w-full">
                
                <AccordionItem value="category" className="border-b border-dashed mb-2 pb-2">
                  <AccordionTrigger className="hover:no-underline py-2"><span className="font-bold text-sm text-foreground">Candidate Category</span></AccordionTrigger>
                  <AccordionContent className="pt-2 pb-2">
                     <Select value={filters.category} onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}>
                        <SelectTrigger className="w-full bg-muted/20 border-none font-bold">
                           <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all" className="font-bold">All Categories</SelectItem>
                           <SelectItem value="Technical" className="font-bold">Technical / Staff</SelectItem>
                           <SelectItem value="Non-Technical" className="font-bold">Non-Technical / Worker</SelectItem>
                        </SelectContent>
                     </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="experience" className="border-b border-dashed mb-2 pb-2">
                  <AccordionTrigger className="hover:no-underline py-2"><span className="font-bold text-sm text-foreground">Minimum Experience</span></AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2 px-1">
                    <Slider 
                      value={[filters.minExperience]} 
                      min={0} 
                      max={20} 
                      step={1} 
                      onValueChange={([v]) => setFilters(prev => ({...prev, minExperience: v}))} 
                    />
                    <div className="mt-3 text-xs font-black text-primary text-right bg-primary/5 py-1 px-2 rounded-md inline-block float-right">{filters.minExperience === 0 ? 'Any' : `${filters.minExperience}+ yrs`}</div>
                    <div className="clear-both"></div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="gender" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2"><span className="font-bold text-sm text-foreground">Gender</span></AccordionTrigger>
                  <AccordionContent className="pt-2 pb-2">
                     <Select value={filters.gender} onValueChange={(val) => setFilters(prev => ({ ...prev, gender: val }))}>
                        <SelectTrigger className="w-full bg-muted/20 border-none font-bold">
                           <SelectValue placeholder="Any Gender" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="any" className="font-bold">Any Gender</SelectItem>
                           <SelectItem value="Male" className="font-bold">Male</SelectItem>
                           <SelectItem value="Female" className="font-bold">Female</SelectItem>
                        </SelectContent>
                     </Select>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </aside>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-primary uppercase tracking-tight hidden lg:block">Top Candidates <span className="text-muted-foreground text-sm font-bold ml-2">({filteredSeekers.length})</span></h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                 <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : filteredSeekers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSeekers.map((seeker) => (
                  <Card key={seeker.id} className="rounded-[2rem] border-none shadow-md hover:shadow-lg transition-all p-6 bg-white overflow-hidden relative">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center shrink-0 border border-muted-foreground/10 overflow-hidden">
                        {seeker.photo ? <img src={seeker.photo} alt="Profile" className="w-full h-full object-cover" /> : <UserCircle className="w-8 h-8 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-lg text-primary truncate">{seeker.name || "Verified Candidate"}</h3>
                            <p className="text-sm font-bold text-slate-700 truncate">{seeker.designation || seeker.jobTitle || "Industrial Role"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{translateLocation(seeker.location, t)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <Briefcase className="w-3.5 h-3.5 shrink-0" />
                          <span>{seeker.experience || '0'} Yrs Exp</span>
                        </div>
                      </div>
                    </div>
                    
                    {seeker.skills && seeker.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                         {seeker.skills.slice(0, 4).map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[9px] font-bold uppercase">{skill}</Badge>
                         ))}
                         {seeker.skills.length > 4 && <Badge variant="secondary" className="text-[9px] font-bold uppercase">+{seeker.skills.length - 4}</Badge>}
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-dashed">
                      <Button className="w-full h-10 font-bold rounded-xl" onClick={() => {
                        window.open(`https://wa.me/91${seeker.phone?.replace(/\D/g, "")}?text=Hi ${seeker.name}, we are interested in your profile on NexIndia.`, '_blank');
                      }}>
                        Contact Candidate
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-muted-foreground shadow-sm">
                   <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">No Candidates Found</h3>
                  <p className="text-muted-foreground font-normal max-w-sm mx-auto">Try adjusting your filters to see more results.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Printer, Plus, Trash2, Download, Briefcase, GraduationCap, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function ResumeBuilderPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [personal, setPersonal] = useState({ name: "", email: "", phone: "", location: "", summary: "" });
  const [experience, setExperience] = useState([{ company: "", role: "", duration: "", description: "" }]);
  const [education, setEducation] = useState([{ institution: "", degree: "", year: "" }]);
  const [skills, setSkills] = useState("");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* EDITOR SECTION */}
          <div className="flex-1 space-y-6 print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/seeker/dashboard" className="text-sm font-medium text-muted-foreground flex items-center hover:text-primary mb-2">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Resume Builder</h1>
                <p className="text-muted-foreground">Generate a professional, ATS-friendly resume.</p>
              </div>
              <Button onClick={handlePrint} className="bg-primary text-white shadow-lg h-12 rounded-xl">
                <Printer className="w-4 h-4 mr-2" /> Export to PDF
              </Button>
            </div>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={personal.name} onChange={e => setPersonal({...personal, name: e.target.value})} placeholder="John Doe" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} placeholder="john@example.com" /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} placeholder="+91 9876543210" /></div>
                  <div className="space-y-2"><Label>Location</Label><Input value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} placeholder="Bangalore, India" /></div>
                </div>
                <div className="space-y-2"><Label>Professional Summary</Label><Textarea rows={3} value={personal.summary} onChange={e => setPersonal({...personal, summary: e.target.value})} placeholder="Experienced professional with a proven track record..." /></div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Experience</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setExperience([...experience, { company: "", role: "", duration: "", description: "" }])}>
                  <Plus className="w-4 h-4 mr-1" /> Add Role
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {experience.map((exp, i) => (
                  <div key={i} className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-4 relative group">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500" onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Company</Label><Input value={exp.company} onChange={e => { const n = [...experience]; n[i].company = e.target.value; setExperience(n); }} placeholder="Acme Corp" /></div>
                      <div className="space-y-2"><Label>Job Title</Label><Input value={exp.role} onChange={e => { const n = [...experience]; n[i].role = e.target.value; setExperience(n); }} placeholder="Senior Operator" /></div>
                      <div className="space-y-2"><Label>Duration</Label><Input value={exp.duration} onChange={e => { const n = [...experience]; n[i].duration = e.target.value; setExperience(n); }} placeholder="2020 - Present" /></div>
                    </div>
                    <div className="space-y-2"><Label>Description (Bulleted points recommended)</Label><Textarea rows={2} value={exp.description} onChange={e => { const n = [...experience]; n[i].description = e.target.value; setExperience(n); }} placeholder="- Managed a team of 5..." /></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2"><Label>Core Skills (Comma separated)</Label><Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, Project Management, Quality Control" /></div>
              </CardContent>
            </Card>
          </div>

          {/* LIVE PREVIEW SECTION */}
          <div className="flex-1 sticky top-24 h-max print:w-full print:absolute print:inset-0 print:p-0 print:m-0">
            <div className="mb-4 print:hidden flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Preview</span>
            </div>
            
            <div className="bg-white border border-slate-200 shadow-xl print:shadow-none print:border-none p-10 min-h-[1056px] w-full max-w-[816px] mx-auto box-border" style={{ aspectRatio: '8.5/11' }}>
              
              <div className="border-b-2 border-slate-800 pb-6 mb-6">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">{personal.name || "YOUR NAME"}</h1>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                  {personal.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personal.email}</span>}
                  {personal.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personal.phone}</span>}
                  {personal.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {personal.location}</span>}
                </div>
              </div>

              {personal.summary && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1 mb-3">Professional Summary</h2>
                  <p className="text-sm text-slate-700 leading-relaxed">{personal.summary}</p>
                </div>
              )}

              {experience.some(e => e.company || e.role) && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1 mb-3">Experience</h2>
                  <div className="space-y-5">
                    {experience.filter(e => e.company || e.role).map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                          <span className="text-xs font-semibold text-slate-500">{exp.duration}</span>
                        </div>
                        <div className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> {exp.company}</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1 mb-3">Core Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.split(",").map((skill, i) => skill.trim() && (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md border border-slate-200">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:absolute, .print\\:absolute * { visibility: visible; }
          .print\\:absolute { position: absolute; left: 0; top: 0; }
          @page { size: auto; margin: 0mm; }
        }
      `}} />
    </div>
  );
}

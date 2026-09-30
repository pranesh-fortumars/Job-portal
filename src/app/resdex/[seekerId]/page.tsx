import { adminDb } from '@/lib/firebase-admin';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCircle, MapPin, Briefcase, Calendar, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Force dynamic so the profile view is logged every time
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { seekerId: string } }) {
  const userDoc = await adminDb.collection('Users').doc(params.seekerId).get();
  const userData = userDoc.exists ? userDoc.data() : null;
  
  if (!userData) {
    return { title: 'Candidate Not Found' };
  }

  return {
    title: `${userData.name || 'Candidate Profile'} - NexIndia Resdex`,
    description: `View the professional profile of ${userData.name}.`,
  };
}

export default async function SeekerProfilePage({ params }: { params: { seekerId: string } }) {
  const { seekerId } = params;

  // 1. Fetch Seeker Data
  const userDoc = await adminDb.collection('Users').doc(seekerId).get();
  
  if (!userDoc.exists) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
           <Card className="max-w-md w-full text-center p-8 rounded-3xl border-dashed shadow-sm">
             <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-slate-700">Candidate Not Found</h2>
             <p className="text-slate-500 mt-2">This candidate profile does not exist or has been made private.</p>
             <Link href="/employer/resdex" className="mt-6 inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90">
               Back to Resdex
             </Link>
           </Card>
        </main>
      </div>
    );
  }

  const seeker = userDoc.data()!;

  // 2. Log the Profile View (Phase 4.2 Analytics)
  // To avoid spam, we could check cookies or IP, but for now we just log it.
  try {
    // Only log view if it's a valid job_seeker profile
    if (seeker.role === 'job_seeker') {
      await adminDb.collection('ProfileViews').add({
        viewedId: seekerId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        // Note: Getting the viewer's ID securely requires session tokens.
        // We log "employer" broadly since only employers should be accessing this route.
        viewerRole: 'employer' 
      });
    }
  } catch (err) {
    console.error("Failed to log profile view", err);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
             <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-50 rounded-full p-1 shrink-0 border-4 border-slate-100 shadow-inner overflow-hidden flex items-center justify-center">
               {seeker.photo ? (
                 <img src={seeker.photo} alt={seeker.name} className="w-full h-full object-cover rounded-full" />
               ) : (
                 <UserCircle className="w-24 h-24 text-slate-300" />
               )}
             </div>

             <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                   <div>
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                         {seeker.name || "Anonymous Candidate"}
                         {seeker.onboarded && (
                           <span title="Verified Profile">
                             <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-100" />
                           </span>
                         )}
                      </h1>
                      <p className="text-xl font-bold text-primary mt-1">
                         {seeker.designation || seeker.jobTitle || "Industrial Role"}
                      </p>
                   </div>
                   <div className="flex flex-col items-end gap-2 shrink-0">
                      <Button asChild className="w-full md:w-auto font-bold rounded-xl bg-green-500 hover:bg-green-600 text-white">
                         <a href={`https://wa.me/91${seeker.phone?.replace(/\D/g, "")}?text=Hi ${seeker.name}, we are interested in your profile on NexIndia.`} target="_blank" rel="noopener noreferrer">
                           Contact via WhatsApp
                         </a>
                      </Button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Location</p>
                      <p className="font-semibold text-slate-700">{seeker.location || "India"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Experience</p>
                      <p className="font-semibold text-slate-700">{seeker.experience || "0"} Years</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Category</p>
                      <p className="font-semibold text-slate-700">{seeker.category || "General"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5"><Mail className="w-3 h-3" /> Contact</p>
                      <p className="font-semibold text-slate-700">{seeker.email || "Private"}</p>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        {seeker.skills && seeker.skills.length > 0 && (
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
             <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <CheckCircle2 className="w-5 h-5 text-primary" /> Verified Skills
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                   {seeker.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold uppercase tracking-wider text-xs rounded-xl">
                         {skill}
                      </Badge>
                   ))}
                </div>
             </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}

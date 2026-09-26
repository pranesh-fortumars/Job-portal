import { adminDb } from '@/lib/firebase-admin';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Briefcase, Star, Users, CheckCircle2, Factory, Calendar, Quote, Navigation, Info } from 'lucide-react';
import Link from 'next/link';

// Enable SSR dynamically
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { employerId: string } }) {
  const companyDoc = await adminDb.collection('Users').doc(params.employerId).get();
  const companyData = companyDoc.exists ? companyDoc.data() : null;
  
  if (!companyData) {
    return { title: 'Company Not Found' };
  }

  return {
    title: `${companyData.companyName || 'Company Profile'} - NexTirupur Jobs`,
    description: companyData.aboutUs || `View verified jobs and company profile for ${companyData.companyName} on NexTirupur.`,
    openGraph: {
      images: [companyData.companyLogoUrl || ''],
    },
  };
}

export default async function CompanyProfilePage({ params }: { params: { employerId: string } }) {
  const { employerId } = params;

  // 1. Fetch Company Data
  const companyDoc = await adminDb.collection('Users').doc(employerId).get();
  
  if (!companyDoc.exists) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
           <Card className="max-w-md w-full text-center p-8 rounded-3xl border-dashed shadow-sm">
             <Factory className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-slate-700">Company Not Found</h2>
             <p className="text-slate-500 mt-2">The employer profile you are looking for does not exist or has been removed.</p>
             <Link href="/jobs" className="mt-6 inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90">
               Browse All Jobs
             </Link>
           </Card>
        </main>
      </div>
    );
  }

  const company = companyDoc.data()!;

  // 2. Fetch Active Jobs for this company
  const jobsSnapshot = await adminDb
    .collection('Jobs')
    .where('employerId', '==', employerId)
    .where('status', 'in', ['pending', 'approved'])
    .orderBy('createdAt', 'desc')
    .get();

  const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 3. Fetch Reviews (Mocking a subcollection fetch for now, since it might not exist yet)
  const reviewsSnapshot = await adminDb
    .collection('Users')
    .doc(employerId)
    .collection('Reviews')
    .orderBy('createdAt', 'desc')
    .get();
    
  const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Calculate aggregate rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr: any) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1)
    : "New";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      {/* Cover Image & Header Banner */}
      <div className="w-full h-48 md:h-64 bg-slate-900 relative">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 opacity-90" />
         {company.coverImageUrl && (
           <img src={company.coverImageUrl} alt="Cover" className="w-full h-full object-cover mix-blend-overlay" />
         )}
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 pb-12 space-y-8 z-10 relative">
        
        {/* Main Identity Card */}
        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
             <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[1.5rem] p-2 shrink-0 border border-slate-100 shadow-md">
               {company.companyLogoUrl ? (
                 <img src={company.companyLogoUrl} alt={company.companyName} className="w-full h-full object-contain rounded-xl" />
               ) : (
                 <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-xl">
                   <Building2 className="w-12 h-12 text-slate-300" />
                 </div>
               )}
             </div>

             <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                   <div>
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                         {company.companyName || "Verified Factory"}
                         {company.status === 'approved' && (
                           <span title="Verified Employer">
                             <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-100" />
                           </span>
                         )}
                      </h1>
                      <p className="text-muted-foreground font-medium flex items-center gap-2 mt-2">
                         <MapPin className="w-4 h-4" /> {company.fullAddress || company.area || company.location || "Tirupur, Tamil Nadu"}
                      </p>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1.5 text-sm font-bold flex items-center gap-1.5 rounded-lg shadow-sm">
                         <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {avgRating} {reviews.length > 0 && <span className="opacity-60 text-xs">({reviews.length})</span>}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{jobs.length} Active Jobs</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Industry</p>
                      <p className="font-semibold text-slate-700">{company.industry || "Textiles & Garments"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Company Size</p>
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {company.employeeCount || "50-200"} Emp.</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Founded</p>
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {company.foundedYear || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registration</p>
                      <p className="font-semibold text-slate-700">{company.gstNumber || company.registrationNumber ? "Verified GST" : "Pending"}</p>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Main Content Column */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* About Us */}
              <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                 <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                       <Info className="w-5 h-5 text-primary" /> About the Company
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <p className="text-slate-600 leading-relaxed font-medium">
                       {company.aboutUs || "This employer has not provided a detailed description yet. They are a verified participant in the Tirupur industrial hub, actively hiring for various roles."}
                    </p>
                 </CardContent>
              </Card>

              {/* Active Jobs List */}
              <div className="space-y-4">
                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" /> Open Positions ({jobs.length})
                 </h3>
                 
                 {jobs.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                       <p className="text-slate-500 font-medium">No open positions available at the moment.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 gap-4">
                       {jobs.map((job: any) => (
                          <Link href={`/jobs/${job.id}`} key={job.id}>
                             <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl cursor-pointer group hover:border-primary/30">
                                <CardContent className="p-5 flex justify-between items-center">
                                   <div>
                                      <h4 className="font-bold text-lg text-primary group-hover:text-primary/80">{job.designation}</h4>
                                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                                         <MapPin className="w-3.5 h-3.5" /> {job.location || company.area || "Tirupur"}
                                      </p>
                                   </div>
                                   <div className="text-right">
                                      <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">
                                         ₹{job.salaryMin || 0} - ₹{job.salaryMax || "N/A"}
                                      </Badge>
                                      <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">{job.workType}</p>
                                   </div>
                                </CardContent>
                             </Card>
                          </Link>
                       ))}
                    </div>
                 )}
              </div>

              {/* Verified Employee Reviews */}
              <div className="space-y-4">
                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Quote className="w-6 h-6 text-accent" /> Verified Employee Reviews
                 </h3>
                 
                 {reviews.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                       <p className="text-slate-500 font-medium">No reviews have been posted for this company yet.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {reviews.map((review: any) => (
                          <Card key={review.id} className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                             <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                   <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                         <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 0) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                                      ))}
                                   </div>
                                   <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(review.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <h5 className="font-bold text-slate-800 text-sm">"{review.title}"</h5>
                                <p className="text-xs text-slate-600 font-medium line-clamp-3">{review.body}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/50">
                                   - {review.authorRole || "Former Employee"}
                                </p>
                             </CardContent>
                          </Card>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Sidebar */}
           <div className="space-y-6">
              {/* Factory Benefits & Amenities */}
              <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                 <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                       <Building2 className="w-4 h-4" /> Facilities & Amenities
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-5">
                    {company.benefits && Object.keys(company.benefits).filter(k => company.benefits[k] === true).length > 0 ? (
                       <div className="flex flex-wrap gap-2">
                          {Object.keys(company.benefits).filter(k => company.benefits[k] === true).map(key => (
                             <Badge key={key} variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold uppercase text-[9px] tracking-widest px-2 py-1">
                                {key.replace(/_/g, ' ')}
                             </Badge>
                          ))}
                       </div>
                    ) : (
                       <p className="text-xs text-slate-500 font-medium">Benefits data is not publicly displayed.</p>
                    )}
                 </CardContent>
              </Card>

              {/* Location Map Placeholder */}
              <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                 <div className="w-full h-40 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                    {/* Placeholder for map */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} />
                    <Button variant="secondary" className="font-bold shadow-lg gap-2 z-10" asChild>
                       <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.fullAddress || company.area || company.location || company.companyName || "Tirupur")}`} target="_blank" rel="noopener noreferrer">
                          <Navigation className="w-4 h-4" /> Open Maps
                       </a>
                    </Button>
                 </div>
                 <CardContent className="p-4 bg-slate-50">
                    <p className="text-xs font-bold text-slate-600 flex items-start gap-2">
                       <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                       {company.fullAddress || company.area || "Location not specified"}
                    </p>
                 </CardContent>
              </Card>

           </div>
        </div>

      </main>
    </div>
  );
}

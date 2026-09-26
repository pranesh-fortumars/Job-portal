"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, BellRing, Trash2, PlusCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function JobAlertsPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [department, setDepartment] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const alertsQuery = useMemo(() => {
    if (!auth?.currentUser || !db) return null;
    return query(collection(db, "JobAlerts"), where("userId", "==", auth.currentUser.uid));
  }, [auth?.currentUser, db]);

  const { data: alerts, loading } = useCollection<any>(alertsQuery);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !db) return;
    if (!department) {
      toast({ variant: "destructive", title: "Missing criteria", description: "Please select at least a department." });
      return;
    }

    setCreating(true);
    try {
      await addDoc(collection(db, "JobAlerts"), {
        userId: auth.currentUser.uid,
        userPhone: auth.currentUser.phoneNumber || "",
        department,
        minSalary: minSalary ? parseInt(minSalary) : 0,
        location: location || "Anywhere",
        createdAt: serverTimestamp(),
        active: true
      });
      toast({ title: "Job Alert Created", description: "You will be notified when matching jobs are posted!" });
      setDepartment("");
      setMinSalary("");
      setLocation("");
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create alert." });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "JobAlerts", id));
      toast({ title: "Alert Deleted" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete alert." });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 shrink-0 border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-primary flex items-center gap-3">
              <BellRing className="w-8 h-8 text-amber-500" />
              Custom Job Alerts
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">
              Set your preferences and we'll notify you automatically when new jobs match.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlusCircle className="w-5 h-5 text-primary" /> Create New Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateAlert} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Department / Role *</label>
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="E.g. Merchandising" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Merchandising">Merchandising</SelectItem>
                      <SelectItem value="Quality Control">Quality Control</SelectItem>
                      <SelectItem value="Stitching">Stitching</SelectItem>
                      <SelectItem value="Knitting">Knitting</SelectItem>
                      <SelectItem value="Dyeing">Dyeing</SelectItem>
                      <SelectItem value="Printing">Printing</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Minimum Salary (₹)</label>
                  <Input 
                    type="number" 
                    placeholder="E.g. 20000" 
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Preferred Area</label>
                  <Input 
                    type="text" 
                    placeholder="E.g. PN Road, Tirupur" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={creating} className="w-full md:w-auto px-8 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
                {creating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bell className="w-5 h-5 mr-2" />}
                Save Job Alert
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Your Active Alerts
          </h2>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !alerts || alerts.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-[2rem] border border-dashed border-slate-300">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">You haven't set up any job alerts yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map(alert => (
                <Card key={alert.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl">
                  <CardContent className="p-5 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-primary">{alert.department}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {alert.minSalary > 0 && (
                          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-200">
                            &gt; ₹{alert.minSalary}/mo
                          </span>
                        )}
                        {alert.location !== "Anywhere" && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200">
                            📍 {alert.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

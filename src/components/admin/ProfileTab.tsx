"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, User, Mail, Calendar, Loader2, Save, Edit3 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";

interface ProfileTabProps {
  db: any;
  profile: any;
}

export function ProfileTab({ db, profile }: ProfileTabProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dob: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        dob: profile.dob || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.id || !db) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "Users", profile.id), {
        name: form.name,
        dob: form.dob,
      });
      toast({ title: "Profile updated successfully" });
      setIsEditing(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-10 text-white relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 fill-white/80" /> System Administrator
              </Badge>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white/95">{profile?.name || "Super Admin"}</h2>
                <p className="text-white/70 font-medium text-sm mt-1">Manage your personal credentials and identity</p>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-white text-primary hover:bg-primary-foreground font-medium px-8 h-12 rounded-xl shadow-xl transition-all active:scale-95 shrink-0">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3 shrink-0">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-white hover:bg-white/10 font-bold px-6">Discard</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-accent text-white hover:bg-accent/90 font-medium px-8 h-12 rounded-xl shadow-xl transition-all active:scale-95">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-10 space-y-8 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 group">
              <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-widest flex items-center gap-2 group-focus-within:text-primary transition-colors"><User className="w-4 h-4" /> Legal Name</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={!isEditing} 
                className="h-14 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-2xl font-semibold text-lg px-5 shadow-sm transition-all" 
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-3 group">
              <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-widest flex items-center gap-2 group-focus-within:text-primary transition-colors"><Mail className="w-4 h-4" /> Primary Email</Label>
              <Input 
                value={profile?.email || ""} 
                disabled 
                className="h-14 bg-slate-100 border-none rounded-2xl font-semibold text-lg px-5 text-muted-foreground shadow-inner" 
              />
            </div>
            <div className="space-y-3 group">
              <Label className="text-xs font-bold uppercase text-muted-foreground/80 tracking-widest flex items-center gap-2 group-focus-within:text-primary transition-colors"><Calendar className="w-4 h-4" /> Date of Birth</Label>
              <Input 
                type="date"
                value={form.dob} 
                onChange={e => setForm({ ...form, dob: e.target.value })}
                disabled={!isEditing} 
                className="h-14 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-2xl font-semibold text-lg px-5 shadow-sm transition-all" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

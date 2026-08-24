"use client";

import { useState, useEffect } from "react";
import { HeroBanner, fetchAllBanners, createBanner, updateBanner, deleteBanner } from "@/lib/slider-service";
import { useFirestore } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MousePointerClick, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  BarChart3,
  Edit3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function HeroSliderManager() {
  const db = useFirestore();
  const { toast } = useToast();

  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Banner Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [actionText, setActionText] = useState("Explore Now");
  const [active, setActive] = useState(true);

  const loadBanners = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const data = await fetchAllBanners(db);
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [db]);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !targetUrl || !db) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Title, Image URL, and Target Link are required." });
      return;
    }

    setSaving(true);
    try {
      await createBanner(db, {
        title,
        subtitle,
        imageUrl,
        targetUrl,
        actionText,
        active,
        order: banners.length + 1
      });
      toast({ title: "Banner Created! ⚡", description: "New Hero Slider banner is live." });
      setTitle("");
      setSubtitle("");
      setImageUrl("");
      setTargetUrl("");
      setActionText("Explore Now");
      loadBanners();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Creation Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    if (!banner.id || !db) return;
    try {
      await updateBanner(db, banner.id, { active: !banner.active });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, active: !b.active } : b));
      toast({ title: "Status Updated", description: `Banner is now ${!banner.active ? 'Active' : 'Inactive'}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!db) return;
    try {
      await deleteBanner(db, bannerId);
      setBanners(prev => prev.filter(b => b.id !== bannerId));
      toast({ title: "Banner Deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: err.message });
    }
  };

  const totalViews = banners.reduce((acc, b) => acc + (b.views || 0), 0);
  const totalClicks = banners.reduce((acc, b) => acc + (b.clicks || 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-wider">Total Slider Views</p>
              <h3 className="text-2xl font-black text-primary mt-1">{totalViews.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Eye className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/30 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-accent-foreground uppercase tracking-wider">Total Banner Clicks</p>
              <h3 className="text-2xl font-black text-accent-foreground mt-1">{totalClicks.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent-foreground">
              <MousePointerClick className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Click Through Rate (CTR)</p>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{ctr}%</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Hero Slider Banner */}
      <Card className="rounded-[2.5rem] shadow-xl border-primary/10 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6 pt-8 px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-headline font-black text-primary">Add Hero Banner</CardTitle>
              <CardDescription className="text-xs font-medium">Create custom hero sliders for MNCs, Retail, or Special Promotional Campaigns.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleCreateBanner} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-extrabold text-xs uppercase text-muted-foreground">Banner Title *</Label>
                <Input 
                  placeholder="e.g. MNC & Software Jobs Drive 2026" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  className="h-12 rounded-xl font-bold border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-extrabold text-xs uppercase text-muted-foreground">Subtitle / Tagline</Label>
                <Input 
                  placeholder="e.g. 5,000+ Opening Across Bangalore, Chennai, Mumbai" 
                  value={subtitle} 
                  onChange={e => setSubtitle(e.target.value)} 
                  className="h-12 rounded-xl font-bold border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-extrabold text-xs uppercase text-muted-foreground">Image URL *</Label>
                <Input 
                  placeholder="https://images.unsplash.com/..." 
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)} 
                  required 
                  className="h-12 rounded-xl font-bold border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-extrabold text-xs uppercase text-muted-foreground">Target Link URL *</Label>
                <Input 
                  placeholder="/jobs?category=mnc" 
                  value={targetUrl} 
                  onChange={e => setTargetUrl(e.target.value)} 
                  required 
                  className="h-12 rounded-xl font-bold border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-extrabold text-xs uppercase text-muted-foreground">Action Button Text</Label>
                <Input 
                  placeholder="Explore MNC Jobs" 
                  value={actionText} 
                  onChange={e => setActionText(e.target.value)} 
                  className="h-12 rounded-xl font-bold border-primary/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-7">
                <Switch checked={active} onCheckedChange={setActive} id="banner-active" />
                <Label htmlFor="banner-active" className="font-extrabold text-sm cursor-pointer">
                  Publish Immediately (Active)
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={saving} 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-sm rounded-xl shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create & Publish Banner
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Banners Management List */}
      <Card className="rounded-[2.5rem] shadow-xl border-primary/10 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6 pt-8 px-8">
          <CardTitle className="text-xl font-headline font-black text-primary">Manage Hero Banners</CardTitle>
          <CardDescription className="text-xs font-medium">Toggle visibility, monitor real-time impressions, and track click counts.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-xs font-bold text-muted-foreground">Loading Banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm">No Hero Banners Found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {banners.map((b) => (
                <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 h-14 rounded-xl overflow-hidden bg-muted shrink-0 border shadow-sm">
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-extrabold text-sm text-foreground truncate flex items-center gap-2">
                        {b.title}
                        {b.active && <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[9px] font-black uppercase">Active</Badge>}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{b.subtitle || b.targetUrl}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    {/* View & Click Stats */}
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-muted-foreground" title="Total Impressions">
                        <Eye className="w-4 h-4 text-primary" />
                        <span>{(b.views || 0).toLocaleString()} Views</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground" title="Total Clicks">
                        <MousePointerClick className="w-4 h-4 text-accent" />
                        <span>{(b.clicks || 0).toLocaleString()} Clicks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={b.active !== false} 
                        onCheckedChange={() => handleToggleActive(b)} 
                        aria-label="Toggle banner active state" 
                      />

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => b.id && handleDelete(b.id)} 
                        className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

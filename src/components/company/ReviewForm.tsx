"use client";

import React, { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function ReviewForm({ employerId }: { employerId: string }) {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser) {
      toast({ variant: "destructive", title: "Login Required", description: "You must be logged in to leave a review." });
      return;
    }
    if (rating === 0) {
      toast({ variant: "destructive", title: "Rating Required", description: "Please provide a star rating." });
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast({ variant: "destructive", title: "Fields Required", description: "Please provide a title and review text." });
      return;
    }

    setSubmitting(true);
    try {
      if (!db) throw new Error("Firestore not initialized");
      
      const reviewRef = collection(db, "Users", employerId, "Reviews");
      await addDoc(reviewRef, {
        rating,
        title,
        body,
        authorId: auth.currentUser.uid,
        authorRole: "Verified Worker",
        createdAt: serverTimestamp()
      });

      toast({ title: "Review Submitted! 🎉", description: "Your feedback helps other job seekers." });
      setRating(0);
      setTitle("");
      setBody("");
      
      // Refresh server component data
      router.refresh();
      
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to submit review." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth?.currentUser) {
    return (
      <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center">
        <h4 className="font-bold text-slate-800 mb-2">Leave a Review</h4>
        <p className="text-sm text-slate-500 mb-4">You must be logged in to share your experience.</p>
        <Button onClick={() => router.push('/auth/login')} variant="outline" className="font-bold text-primary border-primary hover:bg-primary hover:text-white transition-colors">
          Login to Review
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-4">
      <h4 className="font-bold text-lg text-slate-900 mb-2">Write a Review</h4>
      
      <div className="space-y-2">
        <Label className="text-xs uppercase font-bold text-slate-500">Overall Rating</Label>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"}`}
              onMouseEnter={() => setHoverRating(star)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase font-bold text-slate-500">Review Title</Label>
        <Input 
          placeholder="e.g., Great work environment but long hours" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="bg-slate-50"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase font-bold text-slate-500">Your Experience</Label>
        <Textarea 
          placeholder="Share details about management, salary, facilities, and culture..." 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          rows={4}
          className="bg-slate-50"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg h-12 rounded-xl">
        {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
        Submit Review
      </Button>
    </form>
  );
}

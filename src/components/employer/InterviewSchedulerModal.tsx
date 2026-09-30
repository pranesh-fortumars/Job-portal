"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function InterviewSchedulerModal({
  isOpen,
  onClose,
  candidateName,
  jobTitle,
  onSchedule,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  jobTitle: string;
  onSchedule: (details: { date: string; time: string; location: string; notes: string }) => void;
}) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"in-person" | "video">("in-person");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSchedule = () => {
    if (!date || !time) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please select a date and time." });
      return;
    }
    onSchedule({ date, time, location: type === "video" ? "Video Call (Link to follow)" : location, notes });
    toast({ title: "Interview Scheduled", description: `Invitation prepared for ${candidateName}.` });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" /> Schedule Interview
          </DialogTitle>
          <DialogDescription>
            Propose a time to interview <strong>{candidateName}</strong> for the <strong>{jobTitle}</strong> position.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs uppercase text-muted-foreground font-bold">Interview Type</Label>
            <div className="flex gap-2">
              <Button
                variant={type === "in-person" ? "default" : "outline"}
                className={type === "in-person" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                onClick={() => setType("in-person")}
              >
                <MapPin className="w-4 h-4 mr-2" /> In-Person
              </Button>
              <Button
                variant={type === "video" ? "default" : "outline"}
                className={type === "video" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                onClick={() => setType("video")}
              >
                <Video className="w-4 h-4 mr-2" /> Video Call
              </Button>
            </div>
          </div>

          {type === "in-person" && (
            <div className="grid gap-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Location / Address</Label>
              <Input placeholder="e.g., Office Room 4B" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          )}

          <div className="grid gap-2">
            <Label className="text-xs uppercase text-muted-foreground font-bold">Message to Candidate</Label>
            <Textarea placeholder="Please bring a copy of your ID..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Send className="w-4 h-4 mr-2" /> Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

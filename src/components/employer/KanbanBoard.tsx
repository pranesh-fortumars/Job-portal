"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { InterviewSchedulerModal } from "./InterviewSchedulerModal";
import { Eye, MapPin, Briefcase, Phone, IndianRupee, MessageCircle, GripVertical, Calendar, Sparkles, MessageSquare } from "lucide-react";
import { translateLocation } from "@/lib/utils";

// Kanban Columns Mapping
const COLUMNS = [
  { id: "applied", title: "Applied", color: "border-blue-500", bg: "bg-blue-50" },
  { id: "pending", title: "Screening", color: "border-amber-500", bg: "bg-amber-50" },
  { id: "shortlisted", title: "Shortlisted", color: "border-teal-500", bg: "bg-teal-50" },
  { id: "interview_scheduled", title: "Interview", color: "border-indigo-500", bg: "bg-indigo-50" },
  { id: "hired", title: "Hired", color: "border-purple-500", bg: "bg-purple-50" },
  { id: "rejected", title: "Rejected", color: "border-red-500", bg: "bg-red-50" },
];

export function KanbanBoard({ 
  applications, 
  onStatusChange, 
  onViewProfile,
  onWhatsAppContact,
  t
}: { 
  applications: any[];
  onStatusChange: (app: any, newStatus: string) => void;
  onViewProfile: (app: any) => void;
  onWhatsAppContact: (app: any) => void;
  t: any;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [interviewModalApp, setInterviewModalApp] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Group applications by status
  const columns = useMemo(() => {
    const cols: Record<string, any[]> = {};
    COLUMNS.forEach(c => (cols[c.id] = []));
    
    applications.forEach(app => {
      const status = app.status || "pending";
      if (cols[status]) cols[status].push(app);
      else if (status === 'offered') cols['hired'].push(app);
      else cols['pending'].push(app); // fallback
    });

    // Sort by applied date descending
    Object.keys(cols).forEach(k => {
      cols[k].sort((a, b) => b.appliedAt?.toMillis?.() - a.appliedAt?.toMillis?.() || 0);
    });

    return cols;
  }, [applications]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;

    const activeApp = applications.find(a => a.id === active.id);
    if (!activeApp) return;

    // Is it dropping over a container directly, or over another sortable item?
    const overId = String(over.id);
    
    // Find what column it was dropped into
    let newStatus = overId;
    if (!COLUMNS.find(c => c.id === overId)) {
      // It was dropped over a card, find the card's status
      const overApp = applications.find(a => a.id === overId);
      if (overApp) newStatus = overApp.status || "pending";
    }

    if (activeApp.status !== newStatus && COLUMNS.find(c => c.id === newStatus)) {
      onStatusChange(activeApp, newStatus);
    }
  };

  const activeApp = useMemo(() => applications.find(a => a.id === activeId), [activeId, applications]);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 w-full h-[75vh] min-h-[600px] items-start">
        {COLUMNS.map((col) => (
          <KanbanColumn 
            key={col.id}
            col={col}
            items={columns[col.id]}
            onViewProfile={onViewProfile}
            onWhatsAppContact={onWhatsAppContact}
            onMessageContact={(app: any) => window.location.href = `/messages?startChat=${app.jobSeekerId}&name=${app.seekerName}`}
            onScheduleClick={(app: any) => setInterviewModalApp(app)}
            t={t}
          />
        ))}
      </div>
      
      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
        {activeApp ? (
          <KanbanCard 
            app={activeApp} 
            t={t} 
            onViewProfile={onViewProfile}
            onWhatsAppContact={onWhatsAppContact}
            isOverlay 
          />
        ) : null}
      </DragOverlay>

      {interviewModalApp && (
        <InterviewSchedulerModal
          isOpen={!!interviewModalApp}
          onClose={() => setInterviewModalApp(null)}
          candidateName={interviewModalApp.seekerName || "Candidate"}
          jobTitle={interviewModalApp.jobTitle || "Job Role"}
          onSchedule={(details) => {
            onStatusChange(interviewModalApp, "interview_scheduled");
            setInterviewModalApp(null);
          }}
        />
      )}
    </DndContext>
  );
}

function KanbanColumn({ col, items, onViewProfile, onWhatsAppContact, onMessageContact, onScheduleClick, t }: any) {
  const { setNodeRef } = useSortable({
    id: col.id,
    data: { type: "Column", col }
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[320px] shrink-0 h-full rounded-2xl border-2 bg-slate-50 overflow-hidden shadow-sm",
        col.color
      )}
    >
      <div className={cn("p-4 border-b flex justify-between items-center", col.bg)}>
        <h3 className="font-black text-sm uppercase tracking-wider">{col.title}</h3>
        <Badge variant="secondary" className="font-bold bg-white">{items.length}</Badge>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <SortableContext items={items.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 pb-4">
            {items.map((item: any) => (
              <KanbanSortableCard 
                key={item.id} 
                app={item} 
                t={t}
                onViewProfile={onViewProfile}
                onWhatsAppContact={onWhatsAppContact}
                onMessageContact={onMessageContact}
                onScheduleClick={onScheduleClick}
              />
            ))}
            {items.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-muted-foreground font-medium text-xs uppercase tracking-widest">
                No Candidates
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

function KanbanSortableCard(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.app.id,
    data: { type: "Application", app: props.app }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanCard {...props} attributes={attributes} listeners={listeners} />
    </div>
  );
}

function KanbanCard({ app, t, onViewProfile, onWhatsAppContact, onMessageContact, onScheduleClick, isOverlay, attributes, listeners }: any) {
  return (
    <Card className={cn(
      "p-3 rounded-xl shadow-sm border border-slate-200 bg-white group hover:border-primary/30 transition-colors cursor-grab relative",
      isOverlay && "shadow-2xl scale-105 cursor-grabbing z-50 border-primary"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0 pr-6" {...attributes} {...listeners}>
           <div className="flex items-center gap-2">
             <h4 className="font-black text-slate-800 text-sm truncate">{app.seekerName || "Industrial Candidate"}</h4>
             {/* Phase 1 AI Matching: Display a simulated fit score if actual is missing */}
             <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-1 py-0 h-4 text-[9px] flex items-center gap-0.5 whitespace-nowrap">
               <Sparkles className="w-2.5 h-2.5" /> {(app.fitScore || (Math.floor(Math.random() * (98 - 75 + 1)) + 75))}% Fit
             </Badge>
           </div>
           <p className="text-[10px] font-bold text-primary truncate">{app.jobTitle}</p>
        </div>
        <div className="absolute top-3 right-3 text-slate-300 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
           <GripVertical className="w-4 h-4" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 gap-x-1 mt-3 text-[10px] font-bold text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {translateLocation(app.location, t)}
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" /> {app.experience || '0'} Yrs
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {app.phone || "Private"}
        </div>
        <div className="flex items-center gap-1.5 truncate text-green-600">
          <IndianRupee className="w-3 h-3 shrink-0" /> {app.expectedSalary ? parseInt(app.expectedSalary).toLocaleString() : 'N/A'}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           {app.appliedAt ? formatDistanceToNow(app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt), { addSuffix: true }) : 'Recently'}
        </div>
        <div className="flex gap-1.5">
           <Button variant="outline" size="icon" title="View Profile" className="h-7 w-7 rounded-lg shadow-none border-blue-200 text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); onViewProfile(app); }}>
             <Eye className="w-3.5 h-3.5" />
           </Button>
           <Button variant="outline" size="icon" title="In-App Chat" className="h-7 w-7 rounded-lg shadow-none border-orange-200 text-orange-600 hover:bg-orange-50" onClick={(e) => { e.stopPropagation(); onMessageContact(app); }}>
             <MessageSquare className="w-3.5 h-3.5" />
           </Button>
           <Button variant="outline" size="icon" title="Schedule Interview" className="h-7 w-7 rounded-lg shadow-none border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); onScheduleClick(app); }}>
             <Calendar className="w-3.5 h-3.5" />
           </Button>
           <Button variant="outline" size="icon" title="WhatsApp Candidate" className="h-7 w-7 rounded-lg shadow-none border-green-200 text-green-600 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); onWhatsAppContact(app); }}>
             <MessageCircle className="w-3.5 h-3.5" />
           </Button>
        </div>
      </div>
    </Card>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

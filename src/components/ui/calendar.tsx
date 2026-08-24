"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants, Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const isRange = (props as any).mode === "range";
  const selectedRange = (props as any).selected;

  return (
    <div className={cn("flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-primary/5", className)}>
      {/* Range Summary Side Panel (Only for range mode) */}
      {isRange && (
        <div className="w-full md:w-64 bg-primary p-8 text-white flex flex-col justify-between shrink-0">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Start Date</p>
              <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="font-bold text-lg">{selectedRange?.from ? React.isValidElement(selectedRange.from) ? "..." : selectedRange.from.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "Pick date"}</span>
                <CalendarIcon className="w-5 h-5 text-white/40" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">End Date</p>
              <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="font-bold text-lg">{selectedRange?.to ? React.isValidElement(selectedRange.to) ? "..." : selectedRange.to.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "Pick date"}</span>
                {selectedRange?.to ? <X className="w-5 h-5 text-white/40 cursor-pointer hover:text-white" /> : <CalendarIcon className="w-5 h-5 text-white/40" />}
              </div>
            </div>
          </div>
          <div className="pt-8">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest p-0 h-auto" onClick={() => (props as any).onSelect?.(undefined)}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 flex flex-col">
        <DayPicker
          showOutsideDays={showOutsideDays}
          className="p-0"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-8 sm:space-x-8 sm:space-y-0",
            month: "space-y-6",
            caption: "flex justify-center pt-1 relative items-center gap-1",
            caption_label: cn("text-sm font-black uppercase tracking-widest text-primary", props.captionLayout && props.captionLayout !== "label" && "hidden"),
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity border-primary/10 rounded-xl"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "grid grid-cols-7 mb-4",
            head_cell: "text-muted-foreground font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center h-10 w-10",
            row: "grid grid-cols-7 mt-2",
            cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex items-center justify-center",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-10 w-10 p-0 font-bold aria-selected:opacity-100 hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
            ),
            day_range_end: "day-range-end",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg shadow-primary/20",
            day_today: "bg-accent text-accent-foreground font-black border-2 border-accent",
            day_outside: "day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
            day_disabled: "text-muted-foreground opacity-20",
            day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-primary rounded-none",
            day_hidden: "invisible",
            caption_dropdowns: "flex justify-center gap-2 items-center",
            dropdown: "h-9 rounded-xl border border-primary/10 bg-background px-3 py-1 text-[11px] font-black uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer hover:bg-primary/5 transition-all appearance-none",
            dropdown_month: "flex-1",
            dropdown_year: "w-24",
            vhidden: "sr-only",
            ...classNames,
          }}
          components={{
            IconLeft: ({ className, ...props }: any) => (
              <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
            ),
            IconRight: ({ className, ...props }: any) => (
              <ChevronRight className={cn("h-4 w-4", className)} {...props} />
            ),
          } as any}
          {...(props as any)}
        />
        <div className="mt-8 pt-6 border-t border-primary/5 flex justify-between items-center">
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary hover:bg-primary/5" onClick={() => (props as any).onSelect?.(new Date())}>Today</Button>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-accent" /> Selected Window
          </div>
        </div>
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
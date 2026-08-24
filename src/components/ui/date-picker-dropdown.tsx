"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getDaysInMonth, isValid, isBefore, startOfDay, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerDropdownProps {
  value?: string | null;
  onChange: (val: string | null) => void;
  minYear?: number;
  maxYear?: number;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export function DatePickerDropdown({ 
  value, 
  onChange, 
  minYear = 1950, 
  maxYear = new Date().getFullYear() + 10,
  minDate = null,
  maxDate = null
}: DatePickerDropdownProps) {
  const dateValue = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return isValid(d) ? d : null;
  }, [value]);

  const defaultDate = useMemo(() => {
    const now = new Date();
    let d = now;
    if (minDate && isBefore(d, minDate)) d = new Date(minDate);
    if (maxDate && isAfter(d, maxDate)) d = new Date(maxDate);
    if (d.getFullYear() < minYear) d = new Date(minYear, d.getMonth(), d.getDate());
    if (d.getFullYear() > maxYear) d = new Date(maxYear, d.getMonth(), d.getDate());
    return d;
  }, [minDate, maxDate, minYear, maxYear]);

  const [day, setDay] = useState<string>(dateValue ? dateValue.getDate().toString() : "");
  const [month, setMonth] = useState<string>(dateValue ? (dateValue.getMonth() + 1).toString() : (defaultDate.getMonth() + 1).toString());
  const [year, setYear] = useState<string>(dateValue ? dateValue.getFullYear().toString() : defaultDate.getFullYear().toString());

  const [currentDecadeStart, setCurrentDecadeStart] = useState<number>(
    dateValue ? Math.floor(dateValue.getFullYear() / 12) * 12 : Math.floor(defaultDate.getFullYear() / 12) * 12
  );

  useEffect(() => {
    if (dateValue) {
      setDay(dateValue.getDate().toString());
      setMonth((dateValue.getMonth() + 1).toString());
      setYear(dateValue.getFullYear().toString());
    } else {
      setDay("");
      setMonth((defaultDate.getMonth() + 1).toString());
      setYear(defaultDate.getFullYear().toString());
    }
  }, [dateValue, defaultDate]);

  const months = [
    { val: "1", label: "Jan" }, { val: "2", label: "Feb" }, { val: "3", label: "Mar" },
    { val: "4", label: "Apr" }, { val: "5", label: "May" }, { val: "6", label: "Jun" },
    { val: "7", label: "Jul" }, { val: "8", label: "Aug" }, { val: "9", label: "Sep" },
    { val: "10", label: "Oct" }, { val: "11", label: "Nov" }, { val: "12", label: "Dec" },
  ];

  const daysCount = useMemo(() => {
    const y = year ? parseInt(year) : defaultDate.getFullYear();
    const m = month ? parseInt(month) - 1 : defaultDate.getMonth();
    return getDaysInMonth(new Date(y, m));
  }, [year, month, defaultDate]);

  const handleTriggerChange = (newD: string, newM: string, newY: string) => {
    if (newD && newM && newY) {
      const d = parseInt(newD);
      const m = parseInt(newM) - 1;
      const y = parseInt(newY);
      const built = new Date(y, m, d);
      if (isValid(built)) {
        onChange(built.toISOString());
      }
    } else {
      onChange(null);
    }
  };

  const currentYearInt = parseInt(year);

  return (
    <div className="grid grid-cols-3 gap-1.5 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-11 justify-between rounded-xl font-bold border-primary/10 bg-white hover:bg-primary/5 transition-all text-[11px] px-2">
            <span className={cn(!day && "text-muted-foreground")}>{day || "Day"}</span>
            <ChevronRight className="w-2.5 h-2.5 rotate-90 opacity-40 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4 rounded-[1.5rem] shadow-2xl border-none z-50" align="start">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysCount }, (_, i) => (i + 1).toString()).map((d) => {
              const dInt = parseInt(d);
              const mInt = month ? parseInt(month) - 1 : 0;
              const yInt = year ? parseInt(year) : new Date().getFullYear();
              const dayDate = new Date(yInt, mInt, dInt);
              const isDateDisabled = Boolean((minDate && isBefore(startOfDay(dayDate), startOfDay(minDate))) || (maxDate && isAfter(startOfDay(dayDate), startOfDay(maxDate))));
              return (
                <Button key={d} variant="ghost" disabled={isDateDisabled} className={cn("h-9 w-9 p-0 font-bold rounded-lg text-xs", day === d ? "bg-primary text-white hover:bg-primary hover:text-white" : "hover:bg-primary/10", isDateDisabled && "opacity-20 cursor-not-allowed")} onClick={() => { setDay(d); handleTriggerChange(d, month, year); }}>{d}</Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Select value={month} onValueChange={(val) => { setMonth(val); handleTriggerChange(day, val, year); }}>
        <SelectTrigger className="h-11 rounded-xl font-bold bg-white border-primary/10 hover:bg-primary/5 transition-all text-[11px] px-2">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="max-h-[250px] rounded-xl font-bold z-50">
          {months.map(m => {
            const mInt = parseInt(m.val) - 1;
            const yInt = year ? parseInt(year) : new Date().getFullYear();
            const firstDayOfMonth = new Date(yInt, mInt, 1);
            const lastDayOfMonth = new Date(yInt, mInt + 1, 0);
            const isMonthDisabled = Boolean((minDate && isBefore(startOfDay(lastDayOfMonth), startOfDay(minDate))) || (maxDate && isAfter(startOfDay(firstDayOfMonth), startOfDay(maxDate))));
            return (<SelectItem key={m.val} value={m.val} disabled={isMonthDisabled} className="font-bold">{m.label}</SelectItem>);
          })}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-11 justify-between rounded-xl font-bold border-primary/10 bg-white hover:bg-primary/5 transition-all text-[11px] px-2">
            <span className={cn(!year && "text-muted-foreground")}>{year || "Year"}</span>
            <ChevronRight className="w-2.5 h-2.5 rotate-90 opacity-40 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4 rounded-[1.5rem] shadow-2xl border-none z-50" align="end">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDecadeStart(prev => prev - 12)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{currentDecadeStart} - {currentDecadeStart + 11}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDecadeStart(prev => prev + 12)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => (currentDecadeStart + i)).map((y) => {
              const isYearInPast = Boolean(minDate && y < minDate.getFullYear());
              const isYearInFuture = Boolean(maxDate && y > maxDate.getFullYear());
              const isYearDisabled = Boolean(y < minYear || y > maxYear || isYearInPast || isYearInFuture);
              return (
                <Button key={y} variant="ghost" disabled={isYearDisabled} className={cn("h-10 font-bold rounded-xl text-xs", currentYearInt === y ? "bg-primary text-white hover:bg-primary hover:text-white" : "hover:bg-primary/10", isYearDisabled && "opacity-20 cursor-not-allowed")} onClick={() => { const yStr = y.toString(); setYear(yStr); handleTriggerChange(day, month, yStr); }}>{y}</Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

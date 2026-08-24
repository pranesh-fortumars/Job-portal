
"use client";

import React, { useMemo } from "react";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { Building2, Users, Briefcase, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartmentLogoProps {
  category: "Technical" | "Non-Technical" | string;
  department: string;
  className?: string;
  fallbackIconClassName?: string;
}

/**
 * High-Fidelity Department Asset Terminal.
 * Fetches the admin-managed logo from Firestore and provides a fallback icon system.
 */
export function DepartmentLogo({ 
  category, 
  department, 
  className, 
  fallbackIconClassName 
}: DepartmentLogoProps) {
  const db = useFirestore();
  
  // Create a predictable key: CATEGORY_DEPARTMENT (e.g., STAFF_FABRIC)
  // Sanitized to prevent forward slashes which break Firebase doc paths
  const assetId = useMemo(() => {
    if (!category || !department) return null;
    const sanitizedDeptName = department.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    return `${category.toUpperCase()}_${sanitizedDeptName}`;
  }, [category, department]);

  const assetRef = useMemo(() => (db && assetId) ? doc(db, "DepartmentAssets", assetId) : null, [db, assetId]);
  const { data: asset, loading } = useDoc<any>(assetRef);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/20 animate-pulse", className)}>
        <Loader2 className="w-1/2 h-1/2 text-primary/20 animate-spin" />
      </div>
    );
  }

  if (asset?.imageUrl) {
    return (
      <div className={cn("overflow-hidden flex items-center justify-center bg-white shadow-inner", className)}>
        <img src={asset.imageUrl} alt={department} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Fallback Icon System if no custom logo is uploaded
  const FallbackIcon = category === 'Technical' ? Briefcase : Users;

  return (
    <div className={cn("flex items-center justify-center bg-muted/30", className)}>
      <FallbackIcon className={cn("w-1/2 h-1/2 text-muted-foreground/40", fallbackIconClassName)} />
    </div>
  );
}

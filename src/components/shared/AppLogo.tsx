
'use client';

import React, { useMemo } from "react";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { BRANDING } from "@/lib/branding";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  section?: 'header' | 'footer' | 'auth' | 'dashboard' | 'admin' | 'splash' | 'pdf';
}

/**
 * Reusable Global Application Logo component.
 * Fetches the dynamic logo from Firestore (AppConfig/GlobalBranding).
 * Supports specialized section branding overrides with resilient fallbacks.
 */
export function AppLogo({ 
  width = 48, 
  height = 48, 
  className, 
  priority = false,
  section
}: AppLogoProps) {
  const db = useFirestore();
  
  const configRef = useMemo(() => (db) ? doc(db, "AppConfig", "GlobalBranding") : null, [db]);
  const { data: config } = useDoc<any>(configRef);

  // Derive final image source with dynamic section-aware override
  const logoSrc = useMemo(() => {
    if (!config) return BRANDING.logoUrl;

    // Check if Custom Section Mode is active and a specialized logo exists for this zone
    if (section && config.logoMode === 'custom' && config.sectionLogos && config.sectionLogos[section]) {
      return config.sectionLogos[section];
    }

    // Default to the central Application Logo
    if (config.applicationLogoUrl) return config.applicationLogoUrl;

    // Static Asset Fallback
    return BRANDING.logoUrl;
  }, [config, section]);

  return (
    <div className={cn("relative flex items-center justify-center shrink-0", className)}>
      <img 
        src={logoSrc} 
        width={width} 
        height={height} 
        alt={BRANDING.siteName} 
        className="object-contain" 
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{ 
          width: width ? `${width}px` : 'auto', 
          height: height ? `${height}px` : 'auto',
          maxWidth: '100%'
        }}
      />
    </div>
  );
}

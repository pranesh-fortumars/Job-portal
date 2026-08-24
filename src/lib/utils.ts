import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TRANSLATIONS } from "./translations"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats numbers into compact Indian/International notation
 */
export function formatCompactNumber(number: number) {
  if (number === undefined || number === null) return "0";
  
  return Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

/**
 * Calculates the Haversine distance between two points in km.
 * Includes a 1.5x adjustment factor for better real-world road travel accuracy.
 */
export function calculateDistance(lat1: any, lon1: any, lat2: any, lon2: any) {
  const pLat1 = parseFloat(lat1);
  const pLon1 = parseFloat(lon1);
  const pLat2 = parseFloat(lat2);
  const pLon2 = parseFloat(lon2);

  if (isNaN(pLat1) || isNaN(pLon1) || isNaN(pLat2) || isNaN(pLon2)) return null;
  
  const R = 6371;
  const dLat = deg2rad(pLat2 - pLat1);
  const dLon = deg2rad(pLon2 - pLon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pLat1)) * Math.cos(deg2rad(pLat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  
  // Apply 1.5x adjustment factor for real-world road travel accuracy
  return d * 1.5;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

/**
 * Translates a location string using the provided translations object.
 */
export function translateLocation(location: string | undefined, t: any) {
  if (!location || !t || !t.locations) return location || "";
  
  const locLower = location.toLowerCase().trim();

  if (t.locations[location]) return t.locations[location];
  if (t.locations[locLower]) return t.locations[locLower];

  const isJustCity = locLower === "tirupur" || locLower === "tiruppur" || locLower === "all tirupur" || locLower === "all tiruppur";
  if (isJustCity) return t.locations.all || location;

  let result = location;

  if (t.locations.all) {
    const tirupurLabel = t.locations.all.replace(/All|முழுவதும்|पूরা/gi, "").trim();
    if (tirupurLabel) {
      result = result.replace(/\bTiruppur\b/gi, tirupurLabel).replace(/\bTirupur\b/gi, tirupurLabel);
    }
  }

  const locationSource = TRANSLATIONS.English.locations;
  const currentLangLocations = t.locations;

  const placeKeys = Object.keys(locationSource)
    .filter(k => !['all', 'others'].includes(k))
    .sort((a, b) => locationSource[b as keyof typeof locationSource].length - locationSource[a as keyof typeof locationSource].length);

  placeKeys.forEach(key => {
    const englishName = locationSource[key as keyof typeof locationSource];
    const translatedName = currentLangLocations[key as keyof typeof currentLangLocations];
    
    if (translatedName && englishName !== translatedName) {
      const escaped = englishName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      result = result.replace(regex, translatedName);
    }
  });

  return result;
}

/**
 * Localizes a designation name using DB master list and static translations.
 * Falls back to English if no translation is available.
 */
export function getLocalizedDesignation(name: string | undefined, masterDesignations: any[] | null, language: string, t: any) {
  if (!name) return "";
  
  // 1. If English, just return the name (assuming stored identifier is English)
  if (language === 'English') return name;

  // 2. Check Dynamic Master List (Database Records)
  if (masterDesignations) {
    // Robust case-insensitive lookup to ensure matching across industrial records
    const dbMatch = masterDesignations.find((d: any) => 
      d.name?.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (dbMatch) {
      if (language === 'Tamil' && dbMatch.nameTamil) return dbMatch.nameTamil;
      if (language === 'Hindi' && dbMatch.nameHindi) return dbMatch.nameHindi;
    }
  }

  // 3. Fallback to Static Translations (built-in list in translations.ts)
  return (t.designations as any)[name] || name;
}

/**
 * Formats a shift timing string into a user-friendly AM/PM format.
 */
export function formatShiftTiming(timing: string | undefined | null): string {
  if (!timing) return "General Shift";
  const normalized = timing.trim();
  if (!/\d/.test(normalized)) return timing;

  const parts = normalized.split(/[-–]| to /i).map(s => s.trim());
  if (parts.length !== 2) return timing;

  const parse = (str: string) => {
    const m = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!m) return null;
    return {
      h: parseInt(m[1]),
      m: m[2] ? parseInt(m[2]) : 0,
      p: m[3]?.toLowerCase()
    };
  };

  const start = parse(parts[0]);
  const end = parse(parts[1]);

  if (!start || !end) return timing;

  let sH = start.h;
  let eH = end.h;

  if (start.p === 'pm' && sH < 12) sH += 12;
  if (start.p === 'am' && sH === 12) sH = 0;
  if (end.p === 'pm' && eH < 12) eH += 12;
  if (end.p === 'am' && eH === 12) eH = 0;

  if (!start.p && !end.p) {
    if (sH >= 7 && sH <= 12) {
      if (eH < sH && eH !== 0) eH += 12;
    } 
    else if (sH >= 1 && sH <= 6) {
      sH += 12;
      if (eH < sH && eH !== 0) eH += 12;
    }
  }

  const formatPart = (h: number, m: number) => {
    const hh = h % 24;
    const period = hh >= 12 ? "PM" : "AM";
    const displayH = hh % 12 || 12;
    const displayM = m.toString().padStart(2, "0");
    return `${displayH}:${displayM} ${period}`;
  };

  return `${formatPart(sH, start.m)} to ${formatPart(eH, end.m)}`;
}

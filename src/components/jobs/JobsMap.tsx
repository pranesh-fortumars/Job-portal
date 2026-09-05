"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { JobListing } from '@/lib/types';
import { JobCard } from './JobCard';
import { Button } from '../ui/button';
import { Navigation } from 'lucide-react';
import { calculateDistance } from '@/lib/utils';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom pulsing marker for user location
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="width: 20px; height: 20px; background-color: #4f46e5; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); animation: pulse 2s infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const jobIcon = L.divIcon({
  className: 'custom-job-marker',
  html: `<div style="width: 32px; height: 32px; background-color: #2563eb; color: white; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(37,99,235,0.4); display: flex; align-items: center; justify-content: center; transform: translateY(-50%);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg></div><div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563eb;"></div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

// Component to handle auto-centering when userCoords changes
function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function JobsMap({
  jobs,
  userCoords,
  appliedJobIds,
  masterDesignations
}: {
  jobs: JobListing[];
  userCoords: { lat: number; lng: number } | null;
  appliedJobIds: Set<string>;
  masterDesignations: any[];
}) {
  // Default to Tirupur center if no user coords
  const defaultCenter = { lat: 11.1085, lng: 77.3411 };
  const center = userCoords || defaultCenter;

  return (
    <div className="w-full h-[400px] md:h-[600px] rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative z-0">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
        .leaflet-container { z-index: 10; font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; padding: 0; overflow: hidden; }
        .leaflet-popup-content { margin: 0; width: 320px !important; }
        .leaflet-popup-close-button { z-index: 50; top: 10px !important; right: 10px !important; color: white !important; }
      `}} />
      
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={userCoords ? 13 : 11} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <RecenterAutomatically lat={center.lat} lng={center.lng} />

        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
            <Popup>
              <div className="p-3 text-center font-bold text-primary">Your Location</div>
            </Popup>
          </Marker>
        )}

        {jobs.filter(job => job.latitude && job.longitude).map((job) => (
          <Marker 
            key={job.jobId} 
            position={[parseFloat(job.latitude as any), parseFloat(job.longitude as any)]}
            icon={jobIcon}
          >
            <Popup>
              <div className="max-w-[320px]">
                <JobCard 
                  job={job} 
                  isApplied={appliedJobIds.has(job.jobId!)} 
                  userCoords={userCoords} 
                  masterDesignations={masterDesignations} 
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

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
    <div className="w-full h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative z-0">
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

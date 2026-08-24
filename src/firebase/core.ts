
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Module-level singletons to ensure stability across Next.js dev reloads
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

/**
 * Initializes and returns the Firebase app and its core services.
 * Implements a strict singleton pattern to ensure Firestore is configured correctly
 * with connectivity settings optimized for port-forwarded workstation environments.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
} {
  // Determine execution environment
  const isServer = typeof window === 'undefined';

  if (!app) {
    const currentConfig = { ...firebaseConfig };
    
    // Origin Reconciliation: Adjust authDomain to match the current origin on the client.
    // This ensures that the Firebase Auth SDK operates on the same origin as the
    // app, preventing cross-origin security violations during internal SDK redirects.
    // CRITICAL: This requires whitelisting the domain in Firebase Console.
    if (!isServer) {
      const currentHost = window.location.hostname;
      if (
        currentHost.includes('cloudworkstations.dev') || 
        currentHost.includes('localhost') || 
        currentHost.includes('webstation') ||
        currentHost.includes('gitpod.io')
      ) {
        currentConfig.authDomain = currentHost;
        console.log(`[Firebase Auth] Origin Reconciliation: Using ${currentHost} as authDomain. Ensure this is whitelisted in Firebase Console.`);
      }
    }

    const apps = getApps();
    // In dev mode, initializeApp can be called multiple times. We force reconciliation for workstations.
    if (apps.length > 0) {
      const existingApp = getApp();
      // If the existing app's authDomain doesn't match our reconciled domain, we use the reconciled config
      app = existingApp;
    } else {
      app = initializeApp(currentConfig);
    }
    
    auth = getAuth(app);
    storage = getStorage(app);

    if (isServer) {
      // Standard initialization for server-side pre-rendering
      db = getFirestore(app);
    } else {
      // High-Fidelity client initialization with optimized connectivity settings
      try {
        db = initializeFirestore(app, {
          // Force long-polling to bypass potential WebSocket blocks in workstation environments
          experimentalForceLongPolling: true,
          // Enable auto-detection for faster fallback in restricted networks
          experimentalAutoDetectLongPolling: true,
          // Prevents errors when saving objects with undefined properties to industrial records
          ignoreUndefinedProperties: true,
        });
      } catch (e) {
        // Retrieve existing instance if already initialized (common during HMR reloads)
        db = getFirestore(app);
      }
    }
  }

  return { 
    firebaseApp: app!, 
    auth: auth!, 
    firestore: db!, 
    storage: storage! 
  };
}

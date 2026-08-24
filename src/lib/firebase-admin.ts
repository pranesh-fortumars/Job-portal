import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

/**
 * Initializes the Firebase Admin SDK for server-side fulfillment tasks.
 * Uses the Project ID from the shared configuration for consistent targeting.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export { admin };

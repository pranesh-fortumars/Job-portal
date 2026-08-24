'use server';
/**
 * @fileOverview Authkey.io WhatsApp API Integration Service.
 * Provides server-side terminal for sending automated candidate and employer notifications.
 * 
 * - HIGH-FIDELITY IDENTITY RECONCILIATION: Traces Application -> Job -> Employer.
 * - NEW TEMPLATES: Updated to staff_shortlisted (39512), staff_rejected (39517), job_post_live (39519), verified_employer (39508), offfermessage (39643), worker_applicant (39528), and staff_new_applicants (39522).
 * - MEDIA SPECIFICATION: Follows Authkey API for media templates using headerValues.headerData.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Server-side safe Firestore initialization helper
function getDb() {
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

export type AuthkeyEventType = 'shortlisted' | 'rejected' | 'submitted' | 'approved' | 'verification_approved' | 'registration_offer' | 'worker_application_received' | 'staff_application_received';

export interface AuthkeyNotificationInput {
  candidateName?: string;
  candidateLocation?: string;
  candidateMobile?: string;
  designation?: string; 
  companyName?: string; 
  company?: string;      // Fallback key from some dashboard calls
  department?: string;   // Fallback key from dashboard status update calls
  phone: string;
  eventType: AuthkeyEventType;
}

export interface AuthkeyResult {
  success: boolean;
  mobile: string;
  wid: string;
  templateName: string;
  eventType: AuthkeyEventType;
  status: 'success' | 'failed' | 'error';
  data?: any;
  error?: string;
  bodyValues?: Record<string, string>;
  headerValues?: any;
  endpoint?: string;
  mediaUrl?: string;
  finalPayload?: any;
  templateType: 'text' | 'media';
}

/**
 * Sends a templated WhatsApp message via Authkey.io REST API.
 */
export async function sendAuthkeyNotification(input: AuthkeyNotificationInput): Promise<AuthkeyResult> {
  console.log(`[WhatsApp Automatic Sending Disabled] Skipping sequence: ${input.eventType.toUpperCase()}`);
  return {
    success: false,
    mobile: input.phone ? input.phone.replace(/\D/g, '').slice(-10) : "",
    wid: "",
    templateName: "",
    eventType: input.eventType,
    status: 'failed',
    error: 'Automatic WhatsApp notifications disabled',
    templateType: 'text'
  };
}


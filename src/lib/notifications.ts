'use server';
/**
 * @fileOverview WhatsApp Notification Service for Shortlisted Candidates.
 * This service connects to the WhatsApp Cloud API to send automated alerts.
 */

export interface ShortlistNotificationInput {
  candidateName: string;
  phone: string; // international format e.g. "919025404014"
  jobTitle: string;
  companyName: string;
}

export interface WhatsAppResponse {
  success: boolean;
  data?: any;
  errorType?: 'sandbox_restriction' | 'api_error' | 'critical_failure';
  details?: string;
}

/**
 * Sends a shortlist notification via WhatsApp Cloud API using the requested template.
 */
export async function sendShortlistWhatsApp(input: ShortlistNotificationInput): Promise<WhatsAppResponse> {
  console.log("[WhatsApp Automatic Sending Disabled] Skipping shortlist notification.");
  return {
    success: false,
    errorType: 'api_error',
    details: 'Automatic WhatsApp notifications disabled'
  };
}

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const { jobId, jobData } = await request.json();

    if (!jobId || !jobData || !jobData.department) {
      return NextResponse.json({ error: 'Missing required job data' }, { status: 400 });
    }

    // 1. Query JobAlerts that match the department
    const alertsSnapshot = await adminDb
      .collection('JobAlerts')
      .where('department', '==', jobData.department)
      .where('active', '==', true)
      .get();

    if (alertsSnapshot.empty) {
      return NextResponse.json({ message: 'No matching alerts found', count: 0 });
    }

    let matchCount = 0;
    const batch = adminDb.batch();

    // 2. Iterate through alerts and create notifications
    alertsSnapshot.docs.forEach((docSnap) => {
      const alert = docSnap.data();
      
      // Filter by minimum salary if specified
      if (alert.minSalary && jobData.salaryMin) {
        if (jobData.salaryMin < alert.minSalary) {
          return; // Skip this alert, salary is too low
        }
      }

      // Filter by location (simple inclusion check) if specified
      if (alert.location && alert.location !== "Anywhere" && jobData.location) {
        if (!jobData.location.toLowerCase().includes(alert.location.toLowerCase())) {
          return; // Skip if location doesn't match
        }
      }

      // 3. Create a notification for the seeker
      const notificationRef = adminDb.collection('UserNotifications').doc();
      batch.set(notificationRef, {
        userId: alert.userId,
        type: 'job_alert',
        title: 'New Match: ' + jobData.jobTitle,
        message: `${jobData.companyName} just posted a ${jobData.designation} role in ${jobData.location}. Tap to apply!`,
        jobId: jobId,
        status: 'unread',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      matchCount++;
      
      // Note: Here we would also call sendAuthkeyNotification(alert.userPhone, 'job_alert_template', ...)
      // Since WhatsApp is currently disconnected, we only do in-app notifications.
    });

    // Commit all notifications
    if (matchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Triggered ${matchCount} job alerts`,
      count: matchCount 
    });

  } catch (error: any) {
    console.error('Error processing job alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

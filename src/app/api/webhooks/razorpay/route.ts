import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { fulfillSubscription } from '@/lib/payment-fulfillment';

/**
 * Razorpay Webhook Terminal: Autonomous Reconciliation Handler.
 * Processes events directly from Razorpay servers using the Admin SDK for reliable fulfillment.
 */
export async function POST(request: Request) {
  const webhookSignature = request.headers.get('x-razorpay-signature');
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[Razorpay Webhook][${requestId}] Incoming event received.`);

  try {
    const rawBody = await request.text();
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

    if (!secret) {
      console.error(`[Razorpay Webhook][${requestId}] Configuration Error: Webhook Secret missing.`);
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. SIGNATURE VERIFICATION (SECURITY)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.warn(`[Razorpay Webhook][${requestId}] Signature Mismatch.`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload.payment.entity;
    const paymentId = payment.id;

    console.log(`[Razorpay Webhook][${requestId}] Event: ${event}, Payment ID: ${paymentId}`);

    // ONLY process successful capture events
    if (event !== 'payment.captured' && event !== 'order.paid') {
      return NextResponse.json({ status: 'ignored' });
    }

    // 2. INDUSTRIAL IDENTITY RESOLUTION
    let uid = payment.notes?.userId || payment.notes?.uid;
    const userEmail = payment.email;
    const userPhone = payment.contact;

    if (!uid) {
      console.log(`[Razorpay Webhook][${requestId}] Resolving Identity via verified contact.`);
      const usersRef = adminDb.collection('Users');
      
      if (userEmail) {
        const snap = await usersRef.where('email', '==', userEmail).limit(1).get();
        if (!snap.empty) uid = snap.docs[0].id;
      }
      
      if (!uid && userPhone) {
        const cleanPhone = userPhone.replace(/\D/g, '').slice(-10);
        const snap = await usersRef.where('phone', 'in', [cleanPhone, `+91${cleanPhone}`]).limit(1).get();
        if (!snap.empty) uid = snap.docs[0].id;
      }
    }

    if (!uid) {
      console.warn(`[Razorpay Webhook][${requestId}] Identity Resolution Failed.`);
      return NextResponse.json({ status: 'orphaned', message: 'User not found' });
    }

    // 3. EXECUTE ADMIN FULFILLMENT
    await fulfillSubscription({
      paymentId,
      orderId: payment.order_id,
      planId: payment.notes?.planId || 'custom',
      uid,
      source: 'Webhook Reconciliation Terminal'
    });

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    console.error(`[Razorpay Webhook][${requestId}] Runtime Error:`, err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

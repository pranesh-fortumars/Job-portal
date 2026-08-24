import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fulfillSubscription } from '@/lib/payment-fulfillment';

/**
 * Manual Payment Verification Endpoint.
 * Executes signature verification and triggers the Admin fulfillment flow.
 */
export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Payment Verification][${requestId}] Sequence started.`);

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, uid } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required validation components' }, { status: 400 });
    }

    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/['"]/g, "");
    if (!secret) {
      console.error(`[Payment Verification][${requestId}] Server configuration error: Secret missing.`);
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. CRYPTOGRAPHIC HANDSHAKE
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.warn(`[Payment Verification][${requestId}] Signature Mismatch.`);
      return NextResponse.json({ status: 'failure', error: 'Signature mismatch' }, { status: 400 });
    }

    // 2. ADMIN FULFILLMENT (Bypasses security rules)
    try {
      const result = await fulfillSubscription({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        planId,
        uid,
        source: 'Manual Terminal Verification'
      });

      return NextResponse.json({ status: 'success', alreadyProcessed: result.alreadyProcessed });
    } catch (fulfillmentError: any) {
      console.error(`[Payment Verification][${requestId}] Fulfillment Failure:`, fulfillmentError.message);
      return NextResponse.json({ error: 'Database Synchronization Failed', details: fulfillmentError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error(`[Payment Verification][${requestId}] Critical Failure:`, error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

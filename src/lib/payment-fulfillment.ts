import { adminDb, admin } from './firebase-admin';

// Plan metadata source of truth for fulfillment
const PLANS: Record<string, { posts: number; price: number }> = {
  'single': { posts: 1, price: 400 },
  'starter': { posts: 3, price: 999 },
  'growth': { posts: 5, price: 1499 },
  'volume': { posts: 10, price: 2499 }
};

export interface FulfillmentInput {
  paymentId: string;
  orderId: string;
  planId: string;
  uid: string;
  source: string;
}

/**
 * Executes idempotent subscription activation and credit injection.
 * Bypasses Security Rules using the Admin SDK.
 */
export async function fulfillSubscription(input: FulfillmentInput) {
  const { paymentId, orderId, planId, uid, source } = input;
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[Fulfillment][${requestId}] Starting process for Payment: ${paymentId}, User: ${uid}`);

  const plan = PLANS[planId.toLowerCase()];
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const paymentRef = adminDb.collection('Payments').doc(paymentId);
  const userRef = adminDb.collection('Users').doc(uid);

  // 1. IDEMPOTENCY GUARD
  const paymentSnap = await paymentRef.get();
  if (paymentSnap.exists && paymentSnap.data()?.status === 'paid') {
    console.log(`[Fulfillment][${requestId}] Idempotency Trigger: Already processed.`);
    return { success: true, alreadyProcessed: true };
  }

  // 2. DATA ACQUISITION
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    throw new Error(`User ${uid} not found in industrial registry.`);
  }
  const userData = userSnap.data() || {};

  const baseAmount = plan.price;
  const totalAmountPaid = Math.round(baseAmount * 1.18);

  // 3. ATOMIC FULFILLMENT
  const batch = adminDb.batch();

  const updatePayload = {
    postCredits: admin.firestore.FieldValue.increment(plan.posts),
    totalPurchased: admin.firestore.FieldValue.increment(plan.posts),
    "subscription.activePlanId": planId,
    "subscription.price": totalAmountPaid,
    "subscription.expiryDate": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    "subscription.planHistory": admin.firestore.FieldValue.arrayUnion({
      planId,
      date: new Date().toISOString(),
      posts: plan.posts,
      paymentId: paymentId,
      amount: totalAmountPaid,
      source
    }),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  batch.update(userRef, updatePayload);

  batch.set(paymentRef, {
    id: paymentId,
    employerId: uid,
    employerName: userData.companyName || userData.name || "Verified Unit",
    planId,
    baseAmount,
    gstAmount: totalAmountPaid - baseAmount,
    totalAmountPaid,
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId,
    status: 'paid',
    verificationStatus: 'verified',
    source,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`[Fulfillment][${requestId}] Dispatching atomic batch...`);
  await batch.commit();
  console.log(`[Fulfillment][${requestId}] Success: Records synchronized.`);

  return { success: true };
}

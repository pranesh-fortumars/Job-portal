import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Backend Source of Truth for Plan Prices (GST Exclusive)
const PLAN_PRICES: Record<string, number> = {
  'single': 400,
  'starter': 999,
  'growth': 1499,
  'volume': 2499
};

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Razorpay API][${requestId}] Order creation sequence started.`);

  try {
    // RESOLUTION: Robust credential loading with cross-variable fallback and sanitization
    const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim().replace(/['"]/g, "");
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/['"]/g, "");

    // Diagnostic Audit (Masked for Security)
    console.log(`[Razorpay API][${requestId}] Runtime Credentials Check:`);
    console.log(` - Key ID: ${key_id ? `${key_id.substring(0, 12)}... (${key_id.startsWith('rzp_live_') ? 'LIVE' : 'TEST'})` : 'MISSING'}`);
    console.log(` - Secret: ${key_secret ? 'PRESENT (Masked)' : 'MISSING'}`);

    if (!key_id || !key_secret) {
      console.error(`[Razorpay API][${requestId}] Configuration Error: Missing credentials in environment.`);
      return NextResponse.json(
        { 
          error: 'Razorpay credentials not configured correctly on server.', 
          details: 'Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in environment variables.',
          requestId 
        },
        { status: 401 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const body = await request.json().catch(() => null);
    if (!body || !body.planId) {
      console.error(`[Razorpay API][${requestId}] Validation Error: planId is missing.`);
      return NextResponse.json(
        { error: 'Plan ID is mandatory for order creation', requestId },
        { status: 400 }
      );
    }

    const { planId } = body;
    const basePrice = PLAN_PRICES[planId?.toLowerCase()];
    if (basePrice === undefined) {
      console.error(`[Razorpay API][${requestId}] Logic Error: Invalid planId: ${planId}`);
      return NextResponse.json({ error: 'Invalid plan selection', requestId }, { status: 400 });
    }

    // Industrial Calculation: Recalculate 18% GST and convert to Integer Paise
    const gstAmount = basePrice * 0.18;
    const totalPayable = basePrice + gstAmount;
    const amountInPaise = Math.round(totalPayable * 100);

    // GATEWAY REQUIREMENT: Minimum 100 paise (₹1)
    if (amountInPaise < 100) {
      console.error(`[Razorpay API][${requestId}] Validation Error: Amount ${amountInPaise} is below gateway minimum.`);
      return NextResponse.json({ error: 'Amount below minimum requirement', requestId }, { status: 400 });
    }

    console.log(`[Razorpay API][${requestId}] Pricing Audit: Base=₹${basePrice}, GST=₹${gstAmount.toFixed(2)}, Total=₹${totalPayable.toFixed(2)} (${amountInPaise} paise)`);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${planId.slice(0, 5)}_${requestId}`,
    };

    console.log(`[Razorpay API][${requestId}] Dispatching request to Razorpay Gateway...`);
    
    try {
      const order = await razorpay.orders.create(options);
      console.log(`[Razorpay API][${requestId}] Gateway Success: Order ${order.id} generated.`);
      return NextResponse.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        requestId
      });
    } catch (rzpError: any) {
      console.error(`[Razorpay API][${requestId}] Gateway Rejection Detail:`, rzpError);
      
      // Explicitly pick properties to avoid empty object serialization {}
      const errorMsg = rzpError.description || rzpError.message || 'Razorpay gateway rejected order creation';
      const errorCode = rzpError.code || (rzpError.error && rzpError.error.code) || 'GATEWAY_ERROR';

      return NextResponse.json(
        { 
          error: errorMsg,
          code: errorCode,
          details: rzpError || { message: rzpError.message },
          requestId
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`[Razorpay API][${requestId}] Critical System Exception:`, error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message || 'An unexpected error occurred',
      requestId 
    }, { status: 500 });
  }
}

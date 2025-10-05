import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      

      const userId = session.metadata?.userId;
      const paymentIntentId = session.payment_intent;

      if (!userId) {
        console.error('No userId in session metadata');
        return NextResponse.json({ error: 'No user ID' }, { status: 400 });
      }

      // Update user to pro tier
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          subscription_tier: 'pro',
          stripe_payment_id: paymentIntentId as string,
          upgraded_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user:', updateError);
        throw updateError;
      }

    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
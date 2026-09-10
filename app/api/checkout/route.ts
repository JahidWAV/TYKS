import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const { eventId, quantity, unitPrice, includeSupport } = await req.json();

    const { data: event, error } = await supabaseServer
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    const totalAmountCents = Math.round((unitPrice * quantity) * 100);

    if (totalAmountCents === 0) {
      return NextResponse.json({ 
        success: true, 
        free: true,
        url: `/events/success?slug=${event.slug}` 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId: event.id,
        quantity: quantity.toString(),
        includeSupport: includeSupport ? 'true' : 'false',
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Erreur PaymentIntent:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

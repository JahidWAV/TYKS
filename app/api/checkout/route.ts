import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-27.acacia' as any,
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

    const unitAmountCents = Math.round(unitPrice * 100);

    if (unitAmountCents === 0) {
      return NextResponse.json({ 
        success: true, 
        url: `/events/success?slug=${event.slug}` 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: event.title,
              description: `Billet(s) pour ${event.title}`,
            },
            unit_amount: unitAmountCents,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/success?session_id={CHECKOUT_SESSION_ID}&slug=${event.slug}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.slug}`,
      metadata: {
        eventId: event.id,
        quantity: quantity.toString(),
        includeSupport: includeSupport ? 'true' : 'false',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Erreur Checkout Stripe:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    // 1. Prix total des billets pour l'organisateur
    const baseAmount = unitPrice * quantity;
    
    if (baseAmount === 0) {
      return NextResponse.json({ 
        success: true, 
        free: true,
        url: `/events/success?slug=${event.slug}` 
      });
    }

    // 2. Tes frais de service de plateforme (ex: 0,90 € par billet)
    const platformFeePerTicket = 0.90;
    const totalPlatformFee = platformFeePerTicket * quantity;

    // 3. Estimation des frais Stripe (en France, les cartes européennes coûtent généralement environ 1,5% + 0,25 € par transaction)
    // On calcule ces frais sur le montant total provisoire (billets + ta com) pour que Stripe ne rogne pas sur ta marge.
    const provisionalTotal = baseAmount + totalPlatformFee;
    const estimatedStripeFees = (provisionalTotal * 0.015) + 0.25;

    // 4. Montant final total payé par l'acheteur
    const finalTotalAmount = provisionalTotal + estimatedStripeFees;
    const totalAmountCents = Math.round(finalTotalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId: event.id,
        quantity: quantity.toString(),
        includeSupport: includeSupport ? 'true' : 'false',
        organizerRevenue: baseAmount.toFixed(2),
        platformFee: totalPlatformFee.toFixed(2),
        estimatedStripeFees: estimatedStripeFees.toFixed(2),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Erreur PaymentIntent:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    // 1. Ce que touche l'organisateur (ex: 10.00€ par billet)
    const organizerBaseAmount = unitPrice * quantity;
    
    if (organizerBaseAmount === 0) {
      return NextResponse.json({ 
        success: true, 
        free: true,
        url: `/events/success?slug=${event.slug}` 
      });
    }

    // 2. Tes frais de service plateforme (ex: 0.90€ par billet) qui s'ajoutent pour l'acheteur
    const platformFeePerTicket = 0.90;
    const totalPlatformFee = platformFeePerTicket * quantity;

    // 3. Sous-total avant frais bancaires Stripe (Organisateur + Plateforme)
    const subtotal = organizerBaseAmount + totalPlatformFee;

    // 4. Calcul des frais Stripe réels estimés sur le total payé par l'acheteur (~1.5% + 0.25€ en Europe)
    // Formule mathématique pour que les frais Stripe soient entièrement à la charge de l'acheteur sans mordre sur ta com ou celle de l'org.
    const stripePercentage = 0.015;
    const stripeFixed = 0.25;
    const estimatedStripeFees = (subtotal + stripeFixed) / (1 - stripePercentage) - subtotal;

    // 5. Total final exact facturé à l'acheteur (Prix billet + Tes frais + Frais Stripe)
    const finalTotalAmount = subtotal + estimatedStripeFees;
    const totalAmountCents = Math.round(finalTotalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId: event.id,
        quantity: quantity.toString(),
        includeSupport: includeSupport ? 'true' : 'false',
        organizerRevenue: organizerBaseAmount.toFixed(2),
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

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // Initialisation sécurisée à l'intérieur de la fonction (exécutée uniquement lors d'une vraie requête HTTP, pas au build)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Configuration Stripe manquante' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      typescript: true,
    });

    const { eventId, quantity, unitPrice, includeSupport } = await req.json();

    const { data: event, error } = await supabaseServer
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    // 1. Ce que touche l'organisateur
    const organizerBaseAmount = unitPrice * quantity;
    
    if (organizerBaseAmount === 0) {
      return NextResponse.json({ 
        success: true, 
        free: true,
        url: `/events/success?slug=${event.slug}` 
      });
    }

    // 2. Frais de service plateforme
    const platformFeePerTicket = 0.90;
    const totalPlatformFee = platformFeePerTicket * quantity;

    // 3. Sous-total avant frais bancaires Stripe
    const subtotal = organizerBaseAmount + totalPlatformFee;

    // 4. Calcul des frais Stripe réels estimés
    const stripePercentage = 0.015;
    const stripeFixed = 0.25;
    const estimatedStripeFees = (subtotal + stripeFixed) / (1 - stripePercentage) - subtotal;

    // 5. Total final exact facturé à l'acheteur
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

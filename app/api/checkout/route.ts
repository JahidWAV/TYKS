import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import Stripe from 'stripe';

// Route de création du PaymentIntent (celle appelée par AppConfig.paymentIntentURL).
// Le webhook Stripe (route-20, inchangé) crée les billets après paiement grâce aux metadata
// eventId / buyerId / quantity posées ici.

const MAX_TICKETS_PER_ORDER = 10; // adapte selon tes besoins

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Configuration Stripe manquante' }, { status: 500 });
    }

    // 1. Authentification : on identifie l'acheteur via le token Supabase envoyé par l'app iOS
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const { data: authData, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }
    const user = authData.user;

    const stripe = new Stripe(stripeKey, {
      typescript: true,
    });

    // 2. Entrées : on ignore volontairement unitPrice envoyé par le client
    const { eventId, quantity: rawQuantity, includeSupport } = await req.json();

    const quantity = Number(rawQuantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TICKETS_PER_ORDER) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 });
    }

    const { data: event, error } = await supabaseServer
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    // 3. Prix recalculé côté serveur (source de vérité : la table events)
    const unitPrice = Number(event.price ?? 0);
    const organizerBaseAmount = unitPrice * quantity;

    // 4. Événement gratuit : aucun paiement Stripe, donc aucun webhook -> on crée les billets ici
    if (organizerBaseAmount === 0) {
      const rows = Array.from({ length: quantity }, () => ({
        event_id: event.id,
        user_id: user.id,
        status: 'valid',
      }));
      const { error: insertError } = await supabaseServer.from('tickets').insert(rows);
      if (insertError) {
        console.error('Erreur création billets gratuits:', insertError);
        return NextResponse.json({ error: 'Erreur création billets' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        free: true,
        url: `/events/success?slug=${event.slug}`,
      });
    }

    // 5. Frais de service plateforme
    const platformFeePerTicket = 0.9;
    const totalPlatformFee = platformFeePerTicket * quantity;

    // 6. Sous-total avant frais bancaires Stripe
    const subtotal = organizerBaseAmount + totalPlatformFee;

    // 7. Frais Stripe estimés
    const stripePercentage = 0.015;
    const stripeFixed = 0.25;
    const estimatedStripeFees = (subtotal + stripeFixed) / (1 - stripePercentage) - subtotal;

    // 8. Total final facturé à l'acheteur
    const finalTotalAmount = subtotal + estimatedStripeFees;
    const totalAmountCents = Math.round(finalTotalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId: event.id,
        buyerId: user.id, // <- requis par le webhook pour créer les billets
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

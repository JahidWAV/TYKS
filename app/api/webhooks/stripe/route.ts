import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import Stripe from 'stripe';

// Place ce fichier à app/api/webhooks/stripe/route.ts
// (adapte AppConfig / le dashboard Stripe si tu préfères un autre chemin)

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Configuration Stripe manquante' }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { typescript: true });

  // Stripe signe le corps brut : ne surtout pas le parser en JSON avant vérification.
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Signature webhook invalide:', err.message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { eventId, buyerId, quantity } = intent.metadata as {
      eventId?: string;
      buyerId?: string;
      quantity?: string;
    };

    if (!eventId || !buyerId || !quantity) {
      console.error('Métadonnées manquantes sur le PaymentIntent', intent.id);
      // On répond 200 quand même : renvoyer une erreur ferait retenter Stripe indéfiniment
      // pour un paiement qu'on ne pourra de toute façon jamais rattacher à un billet.
      return NextResponse.json({ received: true });
    }

    // Idempotence : si Stripe renvoie cet événement une deuxième fois (retry réseau, etc.),
    // on ne veut pas créer les billets en double. On vérifie via l'id du PaymentIntent.
    const { data: existing } = await supabaseServer
      .from('tickets')
      .select('id')
      .eq('stripe_payment_intent_id', intent.id)
      .limit(1);

    if (!existing || existing.length === 0) {
      const rows = Array.from({ length: Number(quantity) }, () => ({
        event_id: eventId,
        user_id: buyerId,
        status: 'valid',
        stripe_payment_intent_id: intent.id,
      }));
      const { error } = await supabaseServer.from('tickets').insert(rows);
      if (error) {
        console.error('Erreur création billets après paiement:', error);
        // 500 ici est volontaire : Stripe retentera l'envoi de l'événement plus tard.
        return NextResponse.json({ error: 'Erreur création billets' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

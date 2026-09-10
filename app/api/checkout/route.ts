import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { eventId, quantity, unitPrice, includeSupport } = await req.json();

    // 1. Vérifier l'événement en base avec le client admin sécurisé
    const { data: event, error } = await supabaseServer
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    const totalAmount = unitPrice * quantity;

    // 2. Si l'événement est gratuit (0€)
    if (totalAmount === 0) {
      // Optionnel : Enregistrer directement le billet gratuit dans une table `tickets` si elle existe
      return NextResponse.json({ success: true, message: 'Réservation validée (gratuit)' });
    }

    // 3. Si payant : Intégration Stripe (ou autre passerelle)
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-08-16' });
    // const session = await stripe.checkout.sessions.create({ ... });
    // return NextResponse.json({ url: session.url });

    // En mode simulation pour valider le flux UI immédiatement :
    return NextResponse.json({ 
      success: true, 
      url: `/events/success?event=${event.slug}&qty=${quantity}` 
    });

  } catch (err: any) {
    console.error('Erreur API Checkout:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

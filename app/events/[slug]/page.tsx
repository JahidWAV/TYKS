import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'headers';

interface EventPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicEventPage({ params }: EventPageProps) {
  const { slug } = params;
  const supabase = createServerComponentClient({ cookies });

  // Récupération de l'événement par son slug dans Supabase
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* En-tête de l'événement */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">{event.title}</h1>
          <p className="text-neutral-400 text-lg">
            {new Date(event.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Description */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">À propos de l'événement</h2>
          <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
            {event.description || "Aucune description fournie pour le moment."}
          </p>
        </div>

        {/* Section Billetterie / Achat */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Réservez votre place</h3>
            <p className="text-sm text-neutral-400">Sécurisé via Stripe</p>
          </div>
          {/* Remplace ce bouton par ton composant de paiement ou ton formulaire de billetterie */}
          <button className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-neutral-200 transition-colors">
            Acheter un billet
          </button>
        </div>
      </div>
    </main>
  );
}

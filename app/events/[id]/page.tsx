import { notFound } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser'; // ou ton client serveur si tu préfères
import Link from 'next/link';
import { Calendar, MapPin, ArrowLeft, Ticket } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export default async function PublicEventPage({ params }: PageProps) {
  const { id } = params;

  // Récupération de l'événement depuis Supabase
  const { data: event, error } = await supabaseBrowser
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event || event.status !== 'published') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-onyx bg-night-glow text-bone pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs text-bone-faint hover:text-bone transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux événements</span>
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-bone-faint">
              {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-bone">
            {event.title}
          </h1>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-bone-muted">
              <MapPin className="w-4 h-4 text-bone-faint" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="space-y-6">
            <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">
                À propos de l'événement
              </h2>
              <p className="text-sm leading-relaxed text-bone-muted whitespace-pre-line">
                {event.description || "Aucune description fournie."}
              </p>
            </div>
          </div>

          {/* Bloc de billetterie / Achat */}
          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-6 sticky top-8">
            <div>
              <p className="font-mono text-xs text-bone-faint">tarif</p>
              <p className="font-display text-3xl font-bold text-bone mt-1">
                {event.price && Number(event.price) > 0 ? `${event.price} €` : 'Gratuit'}
              </p>
            </div>

            <button
              onClick={() => alert("Redirection vers la billetterie / paiement")}
              className="w-full inline-flex items-center justify-center gap-2 bg-bone hover:bg-white text-onyx font-semibold px-6 py-3.5 rounded-full transition-colors text-sm"
            >
              <Ticket className="w-4 h-4" />
              <span>Réserver ma place</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

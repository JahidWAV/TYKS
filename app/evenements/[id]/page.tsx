import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, ArrowLeft } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase-server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicEventPage({ params }: Props) {
  const { id } = await params;

  // Récupération publique de l'événement
  const { data: event, error } = await supabaseServer
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  // Si l'événement n'existe pas ou n'est pas encore publié
  if (error || !event || event.status !== 'published') {
    notFound();
  }

  const formattedDate = new Date(event.starts_at).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-onyx text-bone pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-bone-faint hover:text-bone transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voir tous les événements</span>
        </Link>

        {/* Hero / Visual Header */}
        <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-onyx-line bg-onyx-raised mb-8">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-bone-faint text-sm">
              Affiche à venir
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-mono text-bone-faint uppercase tracking-wider">
                {event.tag || 'Événement'}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-bone mt-1">
                {event.title}
              </h1>
            </div>

            <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-3">
              <h2 className="text-sm font-semibold text-bone">À propos</h2>
              <p className="text-sm text-bone-muted leading-relaxed whitespace-pre-line">
                {event.description || 'Aucune description disponible pour cet événement.'}
              </p>
            </div>
          </div>

          {/* Sidebar d'achat du Pass */}
          <div className="space-y-6">
            <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-6 sticky top-24">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-bone-faint shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-bone-faint">Date & Heure</p>
                    <p className="text-sm font-medium text-bone capitalize">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-bone-faint shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-bone-faint">Lieu</p>
                    <p className="text-sm font-medium text-bone">{event.location}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-onyx-line pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-bone-faint">Prix</p>
                  <p className="text-xl font-bold text-bone">
                    {event.price && parseFloat(event.price) > 0
                      ? `${parseFloat(event.price).toFixed(2)} €`
                      : 'Gratuit'}
                  </p>
                </div>

                <button
                  className="inline-flex items-center gap-2 bg-bone hover:bg-white text-onyx font-semibold px-6 py-3 rounded-full text-sm transition-colors"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Obtenir mon pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

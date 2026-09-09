import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin } from 'lucide-react';

export default async function EventsPage() {
  const { data: events, error } = await supabaseServer
    .from('events')
    .select('*, organizations(name)')
    .eq('status', 'published')
    .order('starts_at', { ascending: true });

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-20">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* En-tête de la page */}
        <div className="space-y-4 max-w-2xl">
          <span className="inline-block text-xs font-mono uppercase tracking-widest pb-1 border-b border-[#111110]/20 text-[#111110]/50">
            Agenda officiel — Édition 2026
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Tous les événements.
          </h1>
          <p className="text-base text-[#111110]/70 font-light">
            Découvrez la programmation indépendante, réservez vos places en un geste et soutenez directement les salles et collectifs.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-sm font-mono">
            Erreur lors du chargement des événements.
          </div>
        )}

        {!events || events.length === 0 ? (
          <div className="py-24 text-center border-t border-[#111110]/10">
            <p className="text-sm font-mono text-[#111110]/50 uppercase tracking-widest">
              Aucun événement publié pour le moment.
            </p>
          </div>
        ) : (
          /* Grille au format vertical élégant inspirée de la DA */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-[#111110]/10 pt-12">
            {events.map((event) => {
              const formattedDate = event.starts_at
                ? new Date(event.starts_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                : '';

              const priceFormatted =
                Number(event.price) === 0 ? 'Gratuit' : `${event.price} €`;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group flex flex-col justify-between p-8 bg-white border border-[#111110]/10 rounded-2xl hover:border-[#111110]/40 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="space-y-6">
                    {/* Top card metadata */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono px-3 py-1 rounded-full border border-[#111110]/15 text-[#111110]/70">
                        {event.organizations?.name || 'Indépendant'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#111110]/60">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Titre & Lieu */}
                    <div className="space-y-2">
                      <h2 className="font-display text-2xl font-bold tracking-tight group-hover:italic transition-all">
                        {event.title}
                      </h2>
                      {event.location && (
                        <p className="flex items-center gap-1.5 text-xs text-[#111110]/50 font-mono">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </p>
                      )}
                    </div>

                    {/* Description courte */}
                    {event.description && (
                      <p className="text-sm text-[#111110]/70 font-light line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Footer de la carte : Prix + Flèche */}
                  <div className="mt-10 pt-4 border-t border-[#111110]/10 flex items-center justify-between">
                    <span className="text-sm font-mono font-bold">
                      {priceFormatted}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold group-hover:underline">
                      Réserver <ArrowUpRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

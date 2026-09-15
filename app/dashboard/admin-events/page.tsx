import { supabaseServer } from '@/lib/supabase-server';
import { Calendar, MapPin, ArrowUpRight, Ticket, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  // Récupération de tous les événements pour les administrateurs
  const { data: events, error } = await supabaseServer
    .from('events')
    .select('*, organizations(name)')
    .order('starts_at', { ascending: true });

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white px-6 md:px-12 py-12 space-y-8 font-grotesque uppercase">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-neutral-900 text-white font-bold border border-white/15 shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5" /> ADMINISTRATION GLOBALE
            </span>
            <h1 className="text-3xl lg:text-4xl font-normal tracking-tight text-white">TOUS LES ÉVÉNEMENTS</h1>
          </div>
          <span className="text-xs text-white/60 font-bold">
            {events?.length || 0} ÉVÉNEMENT(S) ENREGISTRÉ(S)
          </span>
        </div>

        {/* Grille ou Liste */}
        {!events || events.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-16 text-center text-xs text-white/60 shadow-xs">
            AUCUN ÉVÉNEMENT TROUVÉ DANS LA BASE DE DONNÉES.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any) => {
              const startDate = event.starts_at ? new Date(event.starts_at) : null;
              const formattedDate = startDate
                ? startDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).toUpperCase()
                : 'DATE NON DÉFINIE';

              const priceFormatted = Number(event.price) === 0 ? 'GRATUIT' : `${event.price} €`;

              return (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-4 shadow-xs flex flex-col justify-between hover:border-white transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-white/50 font-bold">
                      <span>{formattedDate}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 border border-white/15 text-white text-[10px]">
                        {event.status?.toUpperCase() || 'ACTIF'}
                      </span>
                    </div>

                    <h3 className="text-xl font-normal text-white leading-snug">
                      {event.title}
                    </h3>

                    <p className="text-xs text-white/60 font-bold">
                      {event.organizations?.name || 'ORGANISATEUR INDÉPENDANT'}
                    </p>

                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-white/70 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs font-bold text-white">
                      {priceFormatted}
                    </span>
                    <Link
                      href={`/events/${event.slug || event.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition shadow-xs"
                    >
                      <span>VOIR</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

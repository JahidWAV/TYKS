import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, MapPin, Settings } from 'lucide-react';

export default async function AdminEventsPage() {
  const { data: events, error } = await supabaseServer
    .from('events')
    .select('*, organizations(name)')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-20">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* En-tête du Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#111110]/10">
          <div className="space-y-2">
            <span className="inline-block text-xs font-mono uppercase tracking-widest text-[#111110]/50">
              Espace Organisateur
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Gestion des événements.
            </h1>
          </div>

          {/* Correction ici : href="/new" au lieu de "/dashboard/new" */}
          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-6 py-3 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un événement</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-sm font-mono">
            Erreur lors du chargement de vos événements.
          </div>
        )}

        {!events || events.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#111110]/20 rounded-3xl">
            <p className="text-sm font-mono text-[#111110]/50 uppercase tracking-widest mb-4">
              Vous n'avez créé aucun événement.
            </p>
            <Link
              href="/new"
              className="inline-flex items-center gap-2 text-xs font-semibold underline"
            >
              Créer votre premier événement
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const formattedDate = event.starts_at
                ? new Date(event.starts_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'Date non définie';

              const priceFormatted =
                Number(event.price) === 0 ? 'Gratuit' : `${event.price} €`;

              return (
                <div
                  key={event.id}
                  className="group flex flex-col justify-between p-8 bg-white border border-[#111110]/10 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider ${
                        event.status === 'published' 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                      }`}>
                        {event.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#111110]/60">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-display text-2xl font-bold tracking-tight">
                        {event.title}
                      </h2>
                      {event.location && (
                        <p className="flex items-center gap-1.5 text-xs text-[#111110]/50 font-mono">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </p>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-[#111110]/70 font-light line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-10 pt-4 border-t border-[#111110]/10 flex items-center justify-between">
                    <span className="text-sm font-mono font-bold">
                      {priceFormatted}
                    </span>
                    <Link
                      href={`/admin-events/${event.slug}/edit`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#111110]/5 hover:bg-[#111110] hover:text-white px-4 py-2 rounded-full transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Modifier</span>
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

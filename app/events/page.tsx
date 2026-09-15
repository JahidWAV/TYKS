import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { ArrowUpRight } from 'lucide-react';

export default async function EventsPage() {
  const { data: events, error } = await supabaseServer
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('ERREUR LORS DU CHARGEMENT DES ÉVÉNEMENTS :', error);
  }

  return (
    <div className="flex-1 flex flex-col bg-white text-black font-grotesque uppercase">
      <main className="mx-auto max-w-7xl px-6 md:px-12 py-24 w-full flex-1">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-black/15 pb-12">
          <div>
            <span className="text-xs font-bold tracking-widest text-black/50">
              AGENDA — ÉDITION 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mt-3">
              TOUS LES ÉVÉNEMENTS.
            </h1>
          </div>
          <p className="text-sm font-normal text-black/60 max-w-sm normal-case">
            LA CULTURE INDÉPENDANTE SANS ARTIFICE. RÉSERVEZ DIRECTEMENT AUPRÈS DES SALLES ET DES COLLECTIFS.
          </p>
        </div>
        
        {!events || events.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-black/25 rounded-3xl bg-neutral-50">
            <p className="text-xs font-bold text-black/50 uppercase tracking-wider">AUCUN ÉVÉNEMENT PROGRAMMÉ</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12">
            {events.map((event: any) => {
              const formattedDate = event.starts_at 
                ? new Date(event.starts_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '';

              return (
                <Link 
                  key={event.id} 
                  href={`/events/${event.slug}`} 
                  className="group flex flex-col space-y-4 cursor-pointer"
                >
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-neutral-100 border border-black/15 relative">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale contrast-125 opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-black/30 uppercase tracking-widest">
                        TYKS — VISUEL BRUT
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white text-black border border-black/20 shadow-xs">
                        {event.tag || 'CLUB / LIVE'}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-black text-white border border-black/20 shadow-xs">
                        {event.price ? `${event.price} €` : 'SUR PLACE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-xs font-bold text-black/50">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="uppercase">{event.location}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:underline transition-all">
                        {event.title}
                      </h2>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

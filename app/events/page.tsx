import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { ArrowUpRight } from 'lucide-react';

export default async function EventsPage() {
  const { data: events, error } = await supabaseServer
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Erreur lors du chargement des événements :', error);
  }

  return (
    <div className="flex-1 flex flex-col bg-[#111110] text-[#F7F5F0]">
      <main className="mx-auto max-w-7xl px-6 md:px-12 py-24 w-full flex-1">
        
        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[#F7F5F0]/10 pb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/50">
              Agenda — Édition 2026
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mt-3">
              Tous les événements.
            </h1>
          </div>
          <p className="text-sm font-light text-[#F7F5F0]/60 max-w-sm">
            La culture indépendante sans artifice. Réservez directement auprès des salles et des collectifs.
          </p>
        </div>
        
        {/* Grille des événements avec affiches 16/9 */}
        {!events || events.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-[#F7F5F0]/15 rounded-3xl">
            <p className="text-sm font-mono text-[#F7F5F0]/40 uppercase tracking-wider">Aucun événement programmé</p>
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
                  {/* Container Image 16/9 */}
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 relative">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#F7F5F0]/30 uppercase tracking-widest">
                        TYKS — Visuel brut
                      </div>
                    )}
                    
                    {/* Badge Tag / Genre */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#111110]/80 backdrop-blur-md text-[#F7F5F0] border border-[#F7F5F0]/20">
                        {event.tag || 'Club / Live'}
                      </span>
                    </div>

                    {/* Badge Prix */}
                    <div className="absolute bottom-4 right-4">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#111110]/90 backdrop-blur-md text-[#F7F5F0] border border-[#F7F5F0]/20">
                        {event.price ? `${event.price} €` : 'Sur place'}
                      </span>
                    </div>
                  </div>

                  {/* Infos de l'événement */}
                  <div className="flex items-start justify-between gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-xs font-mono text-[#F7F5F0]/50">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="uppercase">{event.location}</span>
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight group-hover:italic transition-all">
                        {event.title}
                      </h2>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-[#F7F5F0]/20 flex items-center justify-center shrink-0 group-hover:bg-[#F7F5F0] group-hover:text-[#111110] transition-colors">
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

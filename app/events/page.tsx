import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { ArrowUpRight, Calendar, MapPin } from 'lucide-react';

export default async function EventsPage() {
  const { data: events, error } = await supabaseServer
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Erreur lors du chargement des événements :', error);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4 border-b pb-8 border-[#111110]/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest opacity-50">Exploration</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mt-2">Tous les événements</h1>
        </div>
        <p className="text-sm opacity-60 max-w-xs font-light">
          La culture indépendante près de chez vous. Sans frais cachés, au plus près des artistes.
        </p>
      </div>
      
      {!events || events.length === 0 ? (
        <div className="py-20 text-center border rounded-3xl border-dashed border-[#111110]/20">
          <p className="text-sm opacity-60 font-mono">Aucun événement publié pour le moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any) => {
            const formattedDate = event.starts_at 
              ? new Date(event.starts_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
              : '';

            return (
              <Link 
                key={event.id} 
                href={`/events/${event.slug}`} 
                className="group p-8 border rounded-3xl flex flex-col justify-between hover:border-black transition-all bg-white/40 shadow-sm hover:shadow-md"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-3 py-1 rounded-full border border-[#111110]/20 opacity-70">
                      {event.tag || 'Concert / Club'}
                    </span>
                    <span className="text-xs font-mono opacity-50 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-2xl font-bold tracking-tight group-hover:italic transition-all">
                      {event.title}
                    </h2>
                    <p className="text-xs opacity-60 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t border-[#111110]/10 flex items-center justify-between">
                  <span className="text-sm font-mono font-semibold">
                    {event.price ? `${event.price} €` : 'Sur place'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#111110] text-[#F7F5F0] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

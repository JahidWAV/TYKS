import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';

export default async function EventsPage() {
  // Récupère tous les événements sans filtre strict, ou filtre selon ton schéma exact
  const { data: events, error } = await supabaseServer
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Erreur lors du chargement des événements :', error);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight mb-12">Tous les événements</h1>
      
      {!events || events.length === 0 ? (
        <p className="text-sm opacity-60">Aucun événement publié pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="p-6 border rounded-2xl block hover:border-black transition-colors">
              <h2 className="font-bold text-xl">{event.title}</h2>
              <p className="text-sm opacity-60 mt-1">{event.venue}</p>
              <span className="inline-block mt-4 text-xs font-mono opacity-40">Slug: {event.slug}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

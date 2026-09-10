import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';

export default async function EventsPage() {
  const supabase = createClient();
  const { data: events } = await supabase.from('events').select('*').order('date', { ascending: true });

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight mb-12">Tous les événements</h1>
      
      {!events || events.length === 0 ? (
        <p className="text-sm opacity-60">Aucun événement publié pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="p-6 border rounded-2xl block hover:border-black transition-colors">
              <h2 className="font-bold text-xl">{event.title}</h2>
              <p className="text-sm opacity-60 mt-1">{event.venue}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

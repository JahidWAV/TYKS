import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function EventsPage() {
  const supabase = await createClient();
  
  // Récupération de la liste des événements publics
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Événements à venir</h1>

        {error && (
          <p className="text-red-500 mb-4">Erreur lors du chargement des événements.</p>
        )}

        {!events || events.length === 0 ? (
          <p className="text-gray-400">Aucun événement disponible pour le moment.</p>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Link 
                key={event.id} 
                href={`/events/${event.id}`}
                className="block p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
              >
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-gray-400 text-sm">{event.description || "Pas de description"}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

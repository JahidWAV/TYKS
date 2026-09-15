'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowUpRight, Ticket, ShieldAlert, Edit3, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .order('starts_at', { ascending: true });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (err) {
      console.error('ERREUR LORS DU CHARGEMENT DES ÉVÉNEMENTS :', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("ATTENTION : VOULEZ-VOUS VRAIMENT SUPPRIMER CET ÉVÉNEMENT ?")) return;

    try {
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('ERREUR LORS DE LA SUPPRESSION :', err);
      alert("IMPOSSIBLE DE SUPPRIMER CET ÉVÉNEMENT.");
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 lg:px-12 py-8 bg-[#0f0f0f] min-h-full flex items-center justify-center font-grotesque text-xs text-white/60 uppercase">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> CHARGEMENT...
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-8 space-y-8 font-grotesque text-white bg-[#0f0f0f] min-h-full uppercase">
      {/* Conteneur plein écran sans limitation de largeur max */}
      <div className="w-full space-y-8">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-neutral-900 text-white font-bold border border-white/15 shadow-xs w-fit">
              <ShieldAlert className="w-3.5 h-3.5" /> ADMINISTRATION GLOBALE
            </span>
            <h1 className="text-3xl lg:text-4xl font-normal tracking-tight leading-none text-white pt-2">TOUS LES ÉVÉNEMENTS</h1>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/15 text-white w-fit shadow-xs">
            {events.length} ÉVÉNEMENT(S)
          </span>
        </div>

        {/* Grille pleine largeur */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-16 text-center text-xs text-white/60 shadow-xs">
            AUCUN ÉVÉNEMENT TROUVÉ DANS LA BASE DE DONNÉES.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              const publicUrl = `https://tyks.app/events/${event.slug || event.id}`;

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

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {priceFormatted}
                      </span>
                      <span className="text-[11px] text-white/50">
                        {event.capacity ? `${event.capacity} PLACES` : 'JAUGE LIBRE'}
                      </span>
                    </div>

                    {/* Boutons d'actions groupés */}
                    <div className="flex items-center gap-2">
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition shadow-xs text-center"
                      >
                        <span>VOIR</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      <Link
                        href={`/events/${event.slug || event.id}/edit`}
                        className="w-10 h-10 rounded-xl border border-white/20 bg-neutral-950 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs"
                        title="MODIFIER"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="w-10 h-10 rounded-xl border border-white/20 bg-neutral-950 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs"
                        title="SUPPRIMER"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

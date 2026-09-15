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
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* En-tête */}
        <div className="space-y-6 pb-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        </div>

        {/* Liste des événements */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-16 text-center text-xs text-white/60 shadow-xs">
            AUCUN ÉVÉNEMENT TROUVÉ DANS LA BASE DE DONNÉES.
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="rounded-2xl border border-white/10 bg-neutral-900 p-6 md:p-8 space-y-6 shadow-xs transition-all hover:border-white/30"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-xs text-white/50 font-bold">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{event.organizations?.name || 'ORGANISATEUR INDÉPENDANT'}</span>
                      </div>
                      <h3 className="text-xl font-normal text-white">{event.title}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-neutral-950 border border-white/15 text-white text-xs w-fit">
                      {event.status?.toUpperCase() || 'ACTIF'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-white/70">
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-white shrink-0" />
                      <span>{priceFormatted} {event.capacity ? `• ${event.capacity} PLACES` : ''}</span>
                    </div>
                  </div>

                  {/* Boutons d'actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition shadow-xs text-center"
                    >
                      <span>VOIR</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>

                    <Link
                      href={`/events/${event.slug || event.id}/edit`}
                      className="px-4 py-3 rounded-xl border border-white/20 bg-neutral-950 text-white flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs text-xs font-bold"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">MODIFIER</span>
                    </Link>

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-4 py-3 rounded-xl border border-white/20 bg-neutral-950 text-white flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">SUPPRIMER</span>
                    </button>
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

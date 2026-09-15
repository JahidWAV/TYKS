'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowUpRight, Ticket, Edit3, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
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
      <div className="w-full space-y-8">
        
        {/* Compteur discret en haut à droite */}
        <div className="flex justify-end">
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/15 text-white shadow-xs">
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
                  className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden shadow-xs flex flex-col justify-between hover:border-white transition group"
                >
                  <div>
                    {/* Affiche de l'événement */}
                    <div className="w-full h-44 bg-neutral-950 border-b border-white/10 relative overflow-hidden">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-1">
                          <ImageIcon className="w-6 h-6" />
                          <span className="text-[10px]">AUCUN VISUEL</span>
                        </div>
                      )}
                    </div>

                    {/* Contenu textuel */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-white/50 font-bold">
                        <span>{formattedDate}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 border border-white/15 text-white text-[10px]">
                          {event.status?.toUpperCase() || 'ACTIF'}
                        </span>
                      </div>

                      <h3 className="text-xl font-normal text-white leading-snug line-clamp-1">
                        {event.title}
                      </h3>

                      <p className="text-xs text-white/60 font-bold truncate">
                        {event.organizations?.name || 'ORGANISATEUR INDÉPENDANT'}
                      </p>

                      {event.location && (
                        <div className="flex items-center gap-2 text-xs text-white/70 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Boutons d'actions et prix */}
                  <div className="p-6 pt-0 space-y-4">
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs font-bold text-white">
                        {priceFormatted}
                      </span>
                      <span className="text-[11px] text-white/50">
                        {event.capacity ? `${event.capacity} PLACES` : 'JAUGE LIBRE'}
                      </span>
                    </div>

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

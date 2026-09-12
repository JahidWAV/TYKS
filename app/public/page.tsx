'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin, Search } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true });

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#0a0b0e] text-white font-sans selection:bg-[#E5D4B4] selection:text-black">
      
      {/* ─── HERO SECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 border-b border-neutral-800 space-y-8">
        <div className="max-w-3xl space-y-6">
          <span className="inline-block font-mono text-xs uppercase tracking-widest bg-[#14171f] text-[#E5D4B4] border border-neutral-800 px-3 py-1.5 rounded-full font-bold">
            BILLETTERIE OFFICIELLE & INDÉPENDANTE
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.95] text-white">
            L&apos;art du spectacle, sans artifice.
          </h1>
          <p className="font-mono text-xs sm:text-sm leading-relaxed text-neutral-400 max-w-xl">
            Zéro frais cachés, revente officielle instantanée, et une sélection pointue de la scène live. Réservez vos places en toute simplicité.
          </p>
        </div>

        {/* Barre de recherche intégrée au Hero */}
        <div className="pt-4 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un artiste, un lieu, un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 border border-neutral-800 bg-[#14171f] pl-11 pr-4 font-mono text-xs uppercase placeholder:text-neutral-500 focus:outline-none focus:border-[#E5D4B4] rounded-2xl shadow-xl text-white"
            />
          </div>
        </div>
      </section>

      {/* ─── LISTE DES ÉVÉNEMENTS ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 font-mono">
          <h2 className="text-xs uppercase tracking-widest font-bold text-white">
            Programmation à l&apos;affiche
          </h2>
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
            {filteredEvents.length} événement(s)
          </span>
        </div>

        {loading ? (
          <div className="border border-neutral-800 bg-[#14171f] p-16 text-center font-mono text-xs uppercase tracking-widest text-neutral-400 rounded-2xl shadow-xl">
            Chargement des ondes...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="border border-neutral-800 bg-[#14171f] p-16 text-center space-y-4 rounded-2xl shadow-xl">
            <Calendar className="mx-auto h-8 w-8 text-neutral-500" />
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              Aucun événement ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
              const dateStr = evt.starts_at
                ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Date non définie';

              return (
                <article
                  key={evt.id}
                  className="group flex flex-col border border-neutral-800 bg-[#14171f] rounded-2xl shadow-xl transition-all hover:border-neutral-700 overflow-hidden"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 border border-neutral-800 bg-[#101319] text-[#E5D4B4] text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {evt.organizations?.name || 'Live'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold uppercase tracking-tight leading-snug text-white">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs font-mono text-neutral-400 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 pt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#E5D4B4]" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4 bg-[#101319] font-mono">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E5D4B4]">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Gratuit'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-5 border border-neutral-800 bg-[#E5D4B4] hover:bg-white text-black font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-bold rounded-xl shadow-lg"
                    >
                      <span>Réserver</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}

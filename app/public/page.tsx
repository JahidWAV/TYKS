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
    <main className="min-h-screen bg-[#F5F5F7] text-black font-sans selection:bg-black selection:text-white">
      
      {/* ─── HEADER BRUTALISTE ─── */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 border-2 border-black bg-black text-white flex items-center justify-center font-mono font-bold text-xs">T</span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest">TYKS Live</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="h-11 px-6 border-2 border-black bg-white hover:bg-black hover:text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <span>Espace Pro</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 border-b-2 border-black space-y-8">
        <div className="max-w-3xl space-y-6">
          <span className="inline-block font-mono text-xs uppercase tracking-widest bg-black text-white px-3 py-1">
            BILLETTERIE OFFICIELLE & INDÉPENDANTE
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.95]">
            L&apos;art du spectacle, sans artifice.
          </h1>
          <p className="font-mono text-xs sm:text-sm leading-relaxed text-neutral-600 max-w-xl">
            Zéro frais cachés, revente officielle instantanée, et une sélection pointue de la scène live. Réservez vos places en toute simplicité.
          </p>
        </div>

        {/* Barre de recherche intégrée au Hero */}
        <div className="pt-4 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
            <input
              type="text"
              placeholder="Rechercher un artiste, un lieu, un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 border-2 border-black bg-white pl-11 pr-4 font-mono text-xs uppercase placeholder:text-neutral-400 focus:outline-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        </div>
      </section>

      {/* ─── LISTE DES ÉVÉNEMENTS ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-8">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <h2 className="font-mono text-xs uppercase tracking-widest font-bold">
            Programmation à l&apos;affiche
          </h2>
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-600">
            {filteredEvents.length} événement(s)
          </span>
        </div>

        {loading ? (
          <div className="border-2 border-black bg-white p-16 text-center font-mono text-xs uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            Chargement des ondes...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="border-2 border-black bg-white p-16 text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Calendar className="mx-auto h-8 w-8 text-black" />
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
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
                  className="group flex flex-col border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none overflow-hidden"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 border-2 border-black bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                        {evt.organizations?.name || 'Live'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold uppercase tracking-tight leading-snug">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs font-mono text-neutral-600 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 font-mono text-xs text-neutral-600 pt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t-2 border-black px-6 py-4 bg-[#F5F5F7]">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Gratuit'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-5 border-2 border-black bg-black text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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

      {/* ─── FOOTER ─── */}
      <footer className="border-t-2 border-black bg-white mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono uppercase tracking-wider gap-4">
          <div>© {new Date().getFullYear()} TYKS Inc. Tous droits réservés.</div>
          <div className="flex items-center gap-6">
            <Link href="/legal" className="hover:underline">Mentions Légales</Link>
            <Link href="/cgv" className="hover:underline">CGV</Link>
            <Link href="/privacy" className="hover:underline">Confidentialité</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}

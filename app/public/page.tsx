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
    <main className="min-h-screen bg-[#121214] text-[#FDFBF7] selection:bg-[#D4AF37] selection:text-black">
      
      {/* ─── HERO SECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-16 border-b border-white/10 space-y-10">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Billetterie Officielle & Indépendante
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight leading-[1.1] text-[#FDFBF7]">
            L&apos;art du spectacle, <br />
            <span className="italic font-light text-[#D4AF37]">sans artifice.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-white/60 max-w-xl font-light leading-relaxed">
            Zéro frais cachés, revente officielle instantanée et sélection pointue de la scène live. Réservez vos places en toute sérénité.
          </p>
        </div>

        {/* Barre de recherche élégante */}
        <div className="max-w-xl pt-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un artiste, un lieu, un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 bg-[#18181b] border border-white/10 pl-11 pr-4 text-sm text-[#FDFBF7] placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-all rounded-xl shadow-inner"
            />
          </div>
        </div>
      </section>

      {/* ─── LISTE DES ÉVÉNEMENTS ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Programmation à l&apos;affiche
          </h2>
          <span className="text-xs uppercase tracking-wider text-white/40 font-medium">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="bg-[#18181b] border border-white/10 p-16 text-center text-sm text-white/50 rounded-2xl">
            Chargement des expériences...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-[#18181b] border border-white/10 p-16 text-center space-y-3 rounded-2xl">
            <Calendar className="mx-auto h-8 w-8 text-[#D4AF37]" />
            <p className="text-sm text-white/60">
              Aucun événement ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
              const dateStr = evt.starts_at
                ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Date à venir';

              return (
                <article
                  key={evt.id}
                  className="group flex flex-col bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-black/50"
                >
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#D4AF37] tracking-wide">
                        {dateStr}
                      </span>
                      <span className="text-[11px] font-medium px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 rounded-full">
                        {evt.organizations?.name || 'Exclusivité'}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-medium text-[#FDFBF7] tracking-tight group-hover:text-[#D4AF37] transition-colors">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs text-white/50 font-light leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 text-xs text-white/60 pt-2">
                        <MapPin className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#141416]">
                    <span className="text-sm font-semibold tracking-wide text-[#FDFBF7]">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Entrée libre'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-5 bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl shadow-md cursor-pointer"
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

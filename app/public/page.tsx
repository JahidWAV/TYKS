'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Compass } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

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
        if (data.length > 0) setActiveId(data[0].id);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  const activeEvent = events.find((e) => e.id === activeId) || events[0];

  return (
    <main className="fixed inset-0 w-full h-[100dvh] bg-[#0A0507] text-[#FAF7F2] font-serif flex flex-col justify-between p-6 sm:p-12 overflow-hidden selection:bg-[#721120] selection:text-[#FAF7F2]">
      
      {/* ─── HEADER MINIMALISTE ─── */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#721120] animate-pulse" />
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#FAF7F2]/60">
            TYKS — Live Experience
          </span>
        </div>

        <Link
          href="/public"
          className="font-sans text-xs tracking-widest uppercase text-[#FAF7F2]/80 hover:text-[#FAF7F2] transition-colors flex items-center gap-1.5 group"
        >
          <span>Accès Agenda</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </header>

      {/* ─── CORPS PRINCIPAL : SPLIT VIEW TYPOGRAPHIQUE ─── */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 my-auto">
        
        {/* Titre & Manifesto à gauche */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-tight leading-[0.92]">
            L'art du <br />
            <span className="italic font-normal text-[#721120]">spectacle</span>, sans artifice.
          </h1>
          <p className="max-w-md font-sans font-light text-xs sm:text-sm text-[#FAF7F2]/60 leading-relaxed">
            Une billetterie radicale, pensée pour l'immédiateté. Zéro frais cachés, revente officielle instantanée, et une sélection pointue de la scène live.
          </p>
        </div>

        {/* Aperçu interactif dynamique de la programmation à droite */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {loading ? (
            <div className="font-sans text-xs uppercase tracking-widest text-[#FAF7F2]/40 py-12">
              Chargement des ondes...
            </div>
          ) : events.length === 0 ? (
            <div className="font-sans text-xs text-[#FAF7F2]/50 italic">
              Aucun événement pour le moment.
            </div>
          ) : (
            <div className="flex flex-col border-l border-[#FAF7F2]/15 pl-6 space-y-4">
              <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#721120] font-semibold">
                À l'affiche
              </span>
              <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-none pr-2">
                {events.map((evt) => {
                  const isSelected = evt.id === activeId;
                  const dateStr = evt.starts_at
                    ? new Date(evt.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    : '';

                  return (
                    <button
                      key={evt.id}
                      onClick={() => setActiveId(evt.id)}
                      className={`text-left w-full group transition-all py-2 ${
                        isSelected ? 'opacity-100 pl-2 border-l-2 border-[#721120]' : 'opacity-40 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between font-sans text-[10px] tracking-widest text-[#FAF7F2]/60 mb-1">
                        <span>{dateStr}</span>
                        <span>{evt.organizations?.name || 'Live'}</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-normal tracking-tight truncate group-hover:translate-x-1 transition-transform">
                        {evt.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeEvent && (
                <div className="pt-4 border-t border-[#FAF7F2]/10 flex items-center justify-between">
                  <div className="font-sans text-xs text-[#FAF7F2]/70 truncate max-w-[200px]">
                    {activeEvent.location || 'Lieu secret'}
                  </div>
                  <Link
                    href={`/events/${activeEvent.slug}`}
                    className="px-5 py-2.5 rounded-full bg-[#721120] text-[#FAF7F2] font-sans text-xs font-medium uppercase tracking-widest hover:bg-[#5c0e1a] transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <span>Réserver</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </section>

      {/* ─── FOOTER DISCRET INTÉGRÉ ─── */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-[#FAF7F2]/40 gap-4 z-10 pt-4 border-t border-[#FAF7F2]/10">
        <div>© {new Date().getFullYear()} TYKS. Tous droits réservés.</div>
        <div className="flex items-center gap-6">
          <Link href="/legal" className="hover:text-[#FAF7F2] transition-colors">Mentions Légales</Link>
          <Link href="/cgv" className="hover:text-[#FAF7F2] transition-colors">CGV</Link>
          <Link href="/privacy" className="hover:text-[#FAF7F2] transition-colors">Confidentialité</Link>
        </div>
      </footer>

    </main>
  );
}

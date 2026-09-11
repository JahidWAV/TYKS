'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const PILIERS = [
  {
    num: 'I',
    title: 'Clarté des conditions',
    text: 'Une grille tarifaire d’une transparence absolue, exempte de toute surcharge imprévue.'
  },
  {
    num: 'II',
    title: 'Indépendance native',
    text: 'Les lieux et les collectifs cultivent leur singularité en protégeant l’accès à leurs données.'
  },
  {
    num: 'III',
    title: 'Épure sensorielle',
    text: 'Un parcours d’achat fluide et enveloppant, conçu pour ne laisser de place qu’à l’émotion du live.'
  }
];

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true })
        .limit(4);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2] font-serif">
      
      <main className="mx-auto max-w-7xl px-6 md:px-16 flex-1 w-full">

        {/* ─── HERO ─── */}
        <section className="py-28 md:py-44 grid lg:grid-cols-[1.3fr_0.7fr] gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.25em] uppercase px-4 py-1.5 rounded-full bg-[#F0EBE3] text-[#5C1D24] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5C1D24]" />
              <span>Saison 2026 &bull; Édition Limitée</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.02]">
              L’architecture <br />
              <span className="italic font-light text-[#5C1D24]">du spectacle</span>.
            </h1>

            <p className="max-w-lg text-base md:text-lg font-sans font-light text-[#2D2220]/70 leading-relaxed">
              Une infrastructure de billetterie pensée comme une maison d'édition. Sans artifice commercial, dédiée à la beauté des rencontres scéniques.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <a 
                href="#events" 
                className="px-8 py-4 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#43141A] transition-all flex items-center gap-3 shadow-sm"
              >
                <span>Explorer les rendez-vous</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a 
                href="https://pro.tyks.app" 
                className="text-xs font-sans font-medium uppercase tracking-widest text-[#2D2220]/60 hover:text-[#5C1D24] transition-colors"
              >
                Espace Organisateur &rarr;
              </a>
            </div>
          </div>

          {/* Carte visuelle lumineuse et chaleureuse */}
          <div className="p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-6 shadow-xs">
            <div className="flex items-center justify-between text-xs font-sans tracking-widest uppercase text-[#2D2220]/50">
              <span>Application mobile</span>
              <span className="text-[#5C1D24] font-semibold px-2.5 py-0.5 rounded-full bg-[#5C1D24]/10 text-[10px]">Bientôt</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-normal">Votre passeport intime.</h3>
              <p className="text-sm font-sans font-light text-[#2D2220]/70 leading-relaxed">
                Retrouvez vos invitations et vos billets dans un écrin numérique fluide, disponible partout, même hors-connexion.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-3 text-xs font-sans tracking-widest text-[#2D2220]/40 uppercase">
              <span>[ iOS Store ]</span>
              <span>&bull;</span>
              <span>[ Google Play ]</span>
            </div>
          </div>
        </section>

        {/* ─── AGENDA / ÉVÉNEMENTS ─── */}
        <section id="events" className="py-28 border-t border-[#E4DCD0]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#2D2220]/50">Programmation</span>
              <h2 className="text-3xl md:text-4xl font-normal mt-2">Prochaines dates</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs font-sans tracking-widest uppercase text-[#2D2220] border-b border-[#5C1D24] pb-0.5 hover:text-[#5C1D24] transition-colors"
            >
              Consulter l'agenda
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40">Chargement...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40 bg-[#F2ECE4] rounded-[2rem] border border-[#E4DCD0]">
              Aucun événement programmé pour l'instant.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Offert' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group p-8 rounded-[2rem] bg-[#F2ECE4] border border-[#E4DCD0] hover:border-[#5C1D24]/40 transition-all duration-300 flex flex-col justify-between h-[360px]"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-xs font-sans tracking-wider text-[#2D2220]/50">
                        <span className="truncate">{item.organizations?.name || 'Collectif'}</span>
                        <span>{formattedDate}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-normal group-hover:text-[#5C1D24] group-hover:italic transition-all leading-snug">{item.title}</h3>
                        <p className="text-xs font-sans font-light text-[#2D2220]/50 mt-2 truncate">{item.location || 'Lieu confidentiel'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E4DCD0] flex items-center justify-between">
                      <span className="text-sm font-sans font-medium">{priceLabel}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#2D2220]/40 group-hover:text-[#5C1D24] transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── PILIERS / MANIFESTO ─── */}
        <section className="py-28 border-t border-[#E4DCD0]">
          <div className="grid md:grid-cols-3 gap-12">
            {PILIERS.map((item) => (
              <div key={item.num} className="p-8 rounded-[2rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-4">
                <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#5C1D24] font-semibold px-2.5 py-0.5 rounded-full bg-[#5C1D24]/10 inline-block">{item.num}</span>
                <h3 className="text-2xl font-normal">{item.title}</h3>
                <p className="text-xs font-sans font-light text-[#2D2220]/70 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA PRO ─── */}
        <section className="my-28 p-12 md:p-16 rounded-[2.5rem] bg-[#5C1D24] text-[#FAF7F2] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-md">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#FAF7F2]/60">Espace Organisateur</span>
            <h2 className="text-3xl md:text-4xl font-normal">Vous pilotez un espace culturel ?</h2>
            <p className="text-sm font-sans font-light text-[#FAF7F2]/80 leading-relaxed">
              Déployez votre propre billetterie indépendante et reprenez la pleine souveraineté de vos flux et de votre communauté.
            </p>
          </div>
          <a
            href="https://pro.tyks.app"
            className="px-8 py-4 rounded-full bg-[#FAF7F2] text-[#5C1D24] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest shrink-0"
          >
            Ouvrir un compte Pro
          </a>
        </section>

      </main>
    </div>
  );
}

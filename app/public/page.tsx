'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Compass, Heart } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const VALEURS = [
  {
    tag: '01 / Éthique',
    title: 'Des tarifs justes',
    text: 'Une structure de frais transparente qui respecte à la fois le public et le travail des artistes.'
  },
  {
    tag: '02 / Indépendance',
    title: 'Souveraineté totale',
    text: 'Chaque salle ou collectif gère son public et ses données sans intermédiaire opaque.'
  },
  {
    tag: '03 / Expérience',
    title: 'Simplicité organique',
    text: 'Un parcours d’achat fluide, chaleureux et pensé pour aller droit à l’essentiel : la musique.'
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
    <div className="flex-1 flex flex-col bg-[#F7F5F0] text-[#2C2825] selection:bg-[#2C2825] selection:text-[#F7F5F0] font-serif">
      
      <main className="mx-auto max-w-7xl px-6 md:px-12 flex-1 w-full">

        {/* ─── HERO ─── */}
        <section className="py-28 md:py-40 grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          <div className="space-y-8">
            <span className="inline-block text-xs font-sans tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-[#EFECE6] text-[#2C2825]/70">
              Saison Culturelle 2026
            </span>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.05]">
              Vivre la <br />
              <span className="italic font-light text-[#2C2825]/60">scène autrement</span>.
            </h1>

            <p className="max-w-md text-base md:text-lg font-sans font-light text-[#2C2825]/70 leading-relaxed">
              Une billetterie indépendante à taille humaine, pensée pour relier directement les lieux de création, les artistes et les amoureux de spectacles vivants.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <a 
                href="#events" 
                className="px-8 py-4 bg-[#2C2825] text-[#F7F5F0] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#433D39] transition-all flex items-center gap-3"
              >
                <span>Découvrir l'agenda</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a 
                href="https://pro.tyks.app" 
                className="text-xs font-sans font-medium uppercase tracking-widest text-[#2C2825]/60 hover:text-[#2C2825] transition-colors"
              >
                Espace Organisateur &rarr;
              </a>
            </div>
          </div>

          {/* Carte visuelle organique */}
          <div className="p-10 rounded-[2.5rem] bg-[#EFECE6] border border-[#E4E0D8] space-y-6 shadow-sm">
            <div className="flex items-center justify-between text-xs font-sans tracking-widest uppercase text-[#2C2825]/50">
              <span>Application mobile</span>
              <span>Bientôt</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-normal">Votre carnet de billets.</h3>
              <p className="text-sm font-sans font-light text-[#2C2825]/70 leading-relaxed">
                Retrouvez l'ensemble de vos accès et vos invitations directement regroupés dans une application fluide, élégante et hors-ligne.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-3 text-xs font-sans tracking-widest text-[#2C2825]/40 uppercase">
              <span>[ iOS ]</span>
              <span>&bull;</span>
              <span>[ Android ]</span>
            </div>
          </div>
        </section>

        {/* ─── AGENDA / ÉVÉNEMENTS ─── */}
        <section id="events" className="py-28 border-t border-[#E4E0D8]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#2C2825]/50">Programmation</span>
              <h2 className="text-3xl md:text-4xl font-normal mt-2">Les rendez-vous à venir</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs font-sans tracking-widest uppercase text-[#2C2825] border-b border-[#2C2825] pb-0.5 hover:opacity-60 transition-opacity"
            >
              Voir tout l'agenda
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-sans tracking-widest uppercase text-[#2C2825]/40">Chargement...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center text-xs font-sans tracking-widest uppercase text-[#2C2825]/40 bg-[#EFECE6] rounded-3xl">
              Aucun événement pour le moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Gratuit' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group p-8 rounded-[2rem] bg-[#EFECE6] border border-[#E4E0D8] hover:border-[#2C2825]/30 transition-all duration-300 flex flex-col justify-between h-[360px]"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-xs font-sans tracking-wider text-[#2C2825]/50">
                        <span className="truncate">{item.organizations?.name || 'Collectif'}</span>
                        <span>{formattedDate}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-normal group-hover:italic transition-all leading-snug">{item.title}</h3>
                        <p className="text-xs font-sans font-light text-[#2C2825]/50 mt-2 truncate">{item.location || 'Lieu confidentiel'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E4E0D8] flex items-center justify-between">
                      <span className="text-sm font-sans font-medium">{priceLabel}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#2C2825]/40 group-hover:text-[#2C2825] transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── VALEURS / MANIFESTO ─── */}
        <section className="py-28 border-t border-[#E4E0D8]">
          <div className="grid md:grid-cols-3 gap-12">
            {VALEURS.map((item, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] bg-[#EFECE6] border border-[#E4E0D8] space-y-4">
                <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#2C2825]/40">{item.tag}</span>
                <h3 className="text-2xl font-normal">{item.title}</h3>
                <p className="text-xs font-sans font-light text-[#2C2825]/70 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA PRO ─── */}
        <section className="my-28 p-12 md:p-16 rounded-[2.5rem] bg-[#2C2825] text-[#F7F5F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#F7F5F0]/50">Espace Organisateur</span>
            <h2 className="text-3xl md:text-4xl font-normal">Vous gérez un lieu ou un festival ?</h2>
            <p className="text-sm font-sans font-light text-[#F7F5F0]/70 leading-relaxed">
              Créez votre propre billetterie sur-mesure et reprenez la pleine maîtrise de votre programmation et de vos relations publiques.
            </p>
          </div>
          <a
            href="https://pro.tyks.app"
            className="px-8 py-4 rounded-full bg-[#F7F5F0] text-[#2C2825] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest shrink-0"
          >
            Ouvrir un compte Pro
          </a>
        </section>

      </main>
    </div>
  );
}

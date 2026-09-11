'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass, Layers, Shield } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const PRINCIPES = [
  {
    num: '01',
    title: 'Transparence absolue',
    text: 'Le prix affiché est définitif. Aucun frais additionnel masqué ne vient alourdir l’expérience au moment du règlement.',
  },
  {
    num: '02',
    title: 'Indépendance des lieux',
    text: 'Les salles, les collectifs et les artistes conservent la pleine maîtrise de leur billetterie et de leurs données.',
  },
  {
    num: '03',
    title: 'Fluidité sensorielle',
    text: 'Un parcours d’achat épuré, instantané et pensé pour effacer la technique au profit de la musique.',
  },
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
    <div className="flex-1 flex flex-col bg-[#F4F3EE] text-[#1C1C1A] selection:bg-[#1C1C1A] selection:text-[#F4F3EE] font-serif">
      
      {/* ─── HERO SECTION ─── */}
      <section className="pt-32 pb-36 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-20 items-end">
          
          <div className="space-y-10">
            <span className="inline-block text-xs font-sans tracking-[0.25em] uppercase text-[#1C1C1A]/50 pb-2 border-b border-[#1C1C1A]/20">
              Billetterie indépendante &bull; Saison 2026
            </span>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-[0.9] font-serif">
              L’art <br />
              <span className="italic font-light text-[#1C1C1A]/70">du direct</span>.
            </h1>

            <p className="max-w-lg text-lg md:text-xl font-sans font-light text-[#1C1C1A]/70 leading-relaxed">
              Une infrastructure de billetterie pensée pour les espaces culturels exigeants. Sans artifice, au plus près des créateurs et du public.
            </p>
          </div>

          {/* Bloc secondaire minimaliste */}
          <div className="p-8 rounded-2xl bg-[#EBE9E1] border border-[#1C1C1A]/10 space-y-6">
            <div className="flex items-center justify-between text-xs font-sans tracking-widest uppercase text-[#1C1C1A]/50">
              <span>Application mobile</span>
              <span>Prochainement</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-serif font-normal">Votre passeport numérique.</h3>
              <p className="text-sm font-sans font-light text-[#1C1C1A]/60 leading-relaxed">
                Centralisez vos billets et accédez aux expériences live en un geste. Bientôt disponible sur iOS et Android.
              </p>
            </div>

            <div className="pt-2 flex gap-4 text-xs font-sans font-medium tracking-wider uppercase text-[#1C1C1A]/40">
              <span>iOS</span>
              <span>&bull;</span>
              <span>Android</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── PROCHAINS ÉVÉNEMENTS ─── */}
      <section id="events" className="py-32 border-t border-[#1C1C1A]/10 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#1C1C1A]/50">Programmation</span>
            <h2 className="text-4xl md:text-5xl font-serif font-normal mt-2">Prochaines dates</h2>
          </div>
          <Link 
            href="/events"
            className="font-sans text-xs tracking-widest uppercase border-b border-[#1C1C1A] pb-1 hover:opacity-60 transition-opacity"
          >
            Consulter l'agenda complet
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-sans tracking-widest uppercase text-[#1C1C1A]/40">Chargement des données...</div>
        ) : events.length === 0 ? (
          <div className="py-24 text-center border-t border-b border-[#1C1C1A]/10 text-xs font-sans tracking-widest uppercase text-[#1C1C1A]/40">
            Aucun événement programmé pour le moment.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-[#1C1C1A]/10">
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
                  className="group p-8 flex flex-col justify-between border-b md:border-r border-[#1C1C1A]/10 hover:bg-[#EBE9E1]/50 transition-colors cursor-pointer min-h-[360px]"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs font-sans tracking-wider uppercase text-[#1C1C1A]/50">
                      <span>{item.organizations?.name || 'Concert'}</span>
                      <span>{formattedDate}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-normal group-hover:italic transition-all leading-snug">{item.title}</h3>
                      <p className="text-xs font-sans font-light text-[#1C1C1A]/50 mt-2 truncate">{item.location || 'Lieu confidentiel'}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#1C1C1A]/10 flex items-center justify-between">
                    <span className="text-sm font-sans font-normal tracking-wide">{priceLabel}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── PRINCIPES / MANIFESTO ─── */}
      <section className="py-32 border-t border-[#1C1C1A]/10 px-8 md:px-16 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-16">
          {PRINCIPES.map((item) => (
            <div key={item.num} className="space-y-6">
              <span className="font-sans text-xs tracking-[0.2em] text-[#1C1C1A]/40">{item.num}</span>
              <h3 className="text-3xl font-serif font-normal">{item.title}</h3>
              <p className="font-sans font-light text-sm text-[#1C1C1A]/70 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ESPACE PRO (Bandeau épuré) ─── */}
      <section className="my-24 mx-8 md:mx-16 max-w-7xl px-8 md:px-16 py-20 rounded-3xl bg-[#1C1C1A] text-[#F4F3EE] flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        <div className="space-y-4 max-w-xl">
          <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#F4F3EE]/50">Espace Organisateur</span>
          <h2 className="text-4xl md:text-5xl font-serif font-normal">Vous pilotez un lieu de diffusion ?</h2>
          <p className="font-sans font-light text-sm text-[#F4F3EE]/70 leading-relaxed">
            Déployez votre propre billetterie en quelques minutes et reprenez la souveraineté totale de vos flux de billetterie.
          </p>
        </div>
        <a
          href="https://pro.tyks.app"
          className="font-sans text-xs uppercase tracking-widest px-8 py-4 rounded-full bg-[#F4F3EE] text-[#1C1C1A] hover:bg-white transition-colors shrink-0 font-medium"
        >
          Ouvrir un compte Pro
        </a>
      </section>

    </div>
  );
}

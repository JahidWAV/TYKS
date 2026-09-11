'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Zap, ShieldCheck, Radio, ChevronRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const PILLARS = [
  {
    icon: Zap,
    title: 'Zéro friction',
    text: 'Un tunnel d’achat éclair en un clic, pensé pour des flux de foule instantanés.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparence radicale',
    text: 'Fini les frais cachés au dernier moment. Le prix affiché intègre tout, en toute clarté.',
  },
  {
    icon: Radio,
    title: 'Données souveraines',
    text: 'Les collectifs et les salles récupèrent le contrôle absolu de leur communauté.',
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
    <div className="flex-1 flex flex-col bg-[#050505] text-white selection:bg-[#CCFF00] selection:text-black">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 px-6 md:px-12 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Glow de fond subtil */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#CCFF00]/10 via-purple-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-[1.3fr_0.7fr] gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
              <span className="text-white/90">La nouvelle ère de la billetterie live</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92]">
              LE SOUND <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] via-teal-400 to-emerald-400">
                SANS FILTRE.
              </span>
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-white/60 font-light leading-relaxed">
              La billetterie indépendante qui remet les artistes, les salles et les spectateurs au centre de la piste. Sans commission abusive.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="#events" 
                className="px-8.5 py-4 rounded-2xl bg-[#CCFF00] text-black font-bold text-sm tracking-wide hover:bg-[#b3e000] transition-all shadow-[0_0_30px_-5px_rgba(204,255,0,0.3)] flex items-center gap-2 group"
              >
                Explorer les soirées
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="https://pro.tyks.app" 
                className="px-8.5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all backdrop-blur-md"
              >
                Espace Organisateur
              </a>
            </div>
          </div>

          {/* Carte visuelle immersive droite */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#CCFF00] to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-3xl p-8 bg-[#0D0D0D] border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#CCFF00]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-white/80">Application Mobile</span>
                </div>
                <span className="text-xs font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-md">Bientôt</span>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold tracking-tight">Ton pass direct dans la poche.</h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  Scannabilité instantanée, portefeuille de billets unifié et accès aux afters cachés sur iOS & Android.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center text-xs font-mono text-white/40">
                  App Store
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center text-xs font-mono text-white/40">
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCHAINS ÉVÉNEMENTS ─── */}
      <section id="events" className="py-24 border-t border-white/10 bg-[#070707]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#CCFF00]">Agenda Live</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">Prochaines dates</h2>
            </div>
            <Link 
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-[#CCFF00] transition-colors"
            >
              Voir toute la programmation
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-white/40 animate-pulse">Chargement des ondes...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl text-white/40 font-mono text-xs">
              Aucun événement actif pour le moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Gratuit' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group relative p-6 rounded-3xl bg-[#0D0D0D] border border-white/10 hover:border-[#CCFF00]/50 transition-all duration-300 flex flex-col justify-between h-[320px] overflow-hidden"
                  >
                    {/* Effet lumineux au hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#CCFF00]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 uppercase">
                          {item.organizations?.name || 'Club / Live'}
                        </span>
                        <span className="text-xs font-mono text-[#CCFF00] font-bold">{formattedDate}</span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold tracking-tight group-hover:text-[#CCFF00] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-white/40 mt-1.5 truncate">
                          {item.location || 'Lieu confidentiel'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                      <span className="text-sm font-mono font-bold text-white">{priceLabel}</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#CCFF00] group-hover:text-black transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── PILIERS / MANIFESTO ─── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="p-8 rounded-3xl bg-[#0D0D0D] border border-white/10 space-y-6 relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#CCFF00] group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight">{pillar.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-light">
                    {pillar.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── BANDEAU CTA PRO ─── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 w-full pb-24">
        <div className="relative rounded-3xl p-10 md:p-16 bg-gradient-to-r from-purple-950/40 via-[#111] to-[#0D0D0D] border border-white/10 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#CCFF00]">Partenaires & Organisateurs</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Reprenez le contrôle de votre billetterie.</h2>
            <p className="text-sm text-white/60 font-light leading-relaxed">
              Installez votre propre espace de vente en quelques minutes, profitez d'une structure de frais transparente et fidélisez votre public.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="relative z-10 px-8.5 py-4 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-[#CCFF00] transition-colors shadow-lg shrink-0"
          >
            Lancer mon événement Pro
          </a>
        </div>
      </section>

    </div>
  );
}

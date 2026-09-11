'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Terminal, Hash, Radio, Disc } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const MANIFESTO_ITEMS = [
  {
    code: 'SYS_01',
    title: 'Transparence des flux',
    text: 'Le prix payé est la stricte vérité du coût. Zéro frais déguisé, zéro surprise de dernière minute.'
  },
  {
    code: 'SYS_02',
    title: 'Souveraineté des données',
    text: 'Les collectifs et les salles réinitialisent leur indépendance en reprenant le contrôle de leur public.'
  },
  {
    code: 'SYS_03',
    title: 'Latence zéro',
    text: 'Un parcours d’acquisition immédiat, taillé pour les flux tendus de la culture live.'
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
    <div className="flex-1 flex flex-col bg-[#0A0A0A] text-[#E0E0E0] selection:bg-[#E0E0E0] selection:text-black font-mono">
      
      {/* Grille de fond technique subtile (lignes directrices) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <main className="mx-auto max-w-7xl px-6 md:px-12 flex-1 w-full relative z-10">

        {/* ─── HERO ─── */}
        <section className="py-24 md:py-36 grid lg:grid-cols-[1.3fr_0.7fr] gap-16 items-center border-b border-white/10">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/40 pb-2 border-b border-white/10">
              <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              <span>Infrastructures Live // Édition 2026</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] uppercase text-white font-sans">
              Fréquence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/50 to-white/20">
                Souveraine.
              </span>
            </h1>

            <p className="max-w-lg text-sm md:text-base font-light text-white/60 leading-relaxed">
              Le protocole de billetterie pensé pour les salles et les collectifs exigeants. Élimination des commissions excessives, restitution totale du contrôle.
            </p>

            <div className="flex items-center gap-6 pt-2">
              <a 
                href="#events" 
                className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-3"
              >
                <span>Accéder au réseau</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a 
                href="https://pro.tyks.app" 
                className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Espace Organisateur &rarr;
              </a>
            </div>
          </div>

          {/* COLONNE DE DROITE : Bloc type "Terminal / Objet technique" */}
          <div className="p-8 rounded-none border border-white/15 bg-black/40 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-white/40 border-b border-white/10 pb-4">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" /> app_mobile.bin
              </span>
              <span className="text-emerald-400">En cours de déploiement</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold tracking-tight text-white font-sans">Le pass unifié dans votre poche.</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                Centralisation des accès, cryptage des flux et scannabilité hors-ligne. Bientôt disponible sur iOS & Android.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/30">
              <span>[ iOS Store ]</span>
              <span>[ Google Play ]</span>
            </div>
          </div>
        </section>

        {/* ─── AGENDA / ÉVÉNEMENTS ─── */}
        <section id="events" className="py-28 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Flux & Programmation</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-1 font-sans">Prochaines dates</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>Voir tout l'index</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs tracking-widest uppercase text-white/40 animate-pulse">Chargement des flux...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center border border-white/10 text-xs uppercase tracking-widest text-white/40">
              Aucun événement actif pour le moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
              {events.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? '0.00 €' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group p-8 flex flex-col justify-between border-r border-b border-white/10 hover:bg-white/[0.02] transition-colors cursor-pointer min-h-[320px]"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-[11px] tracking-wider text-white/40">
                        <span className="truncate max-w-[120px]">{item.organizations?.name || 'Collectif'}</span>
                        <span>{formattedDate}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors font-sans line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-white/40 mt-2 truncate">{item.location || 'Lieu confidentiel'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{priceLabel}</span>
                      <Disc className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── MANIFESTO TECHNIQUE ─── */}
        <section className="py-28 border-b border-white/10">
          <div className="grid md:grid-cols-3 gap-12">
            {MANIFESTO_ITEMS.map((item) => (
              <div key={item.code} className="space-y-4 p-6 border border-white/10 bg-white/[0.01]">
                <div className="text-[10px] tracking-[0.2em] text-white/30">{item.code}</div>
                <h3 className="text-xl font-bold text-white tracking-tight font-sans">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-light">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA PRO ─── */}
        <section className="my-28 p-12 md:p-16 border border-white/20 bg-gradient-to-r from-white/[0.04] to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">Accès Organisateur</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">Pilotez votre propre infrastructure.</h2>
            <p className="text-xs md:text-sm text-white/60 font-light leading-relaxed">
              Déployez votre billetterie en quelques minutes, affranchissez-vous des intermédiaires et reprenez la main sur vos flux financiers.
            </p>
          </div>
          <a
            href="https://pro.tyks.app"
            className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shrink-0"
          >
            Ouvrir un compte Pro
          </a>
        </section>

      </main>
    </div>
  );
}

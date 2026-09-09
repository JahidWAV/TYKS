'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const EVENTS = [
  {
    title: 'Nuit Électro — Session I',
    venue: 'Le Sous-Sol, Lyon',
    date: '12.03',
    price: '18,00 €',
  },
  {
    title: 'Open Air Botanique',
    venue: 'Les Docks, Marseille',
    date: '21.03',
    price: '22,00 €',
  },
  {
    title: 'Club Infini',
    venue: 'La Chapelle, Paris',
    date: '27.03',
    price: '15,00 €',
  },
];

const UPCOMING_EVENTS = [
  {
    title: 'Subterranean Echoes',
    venue: 'Glitch Club, Bordeaux',
    date: '04.04',
    price: '16,00 €',
    genre: 'Live Modular',
  },
  {
    title: 'Klubnacht Extended',
    venue: 'Le Sucre, Lyon',
    date: '11.04',
    price: '20,00 €',
    genre: 'Techno',
  },
  {
    title: 'Ambient Sessions Vol. 4',
    venue: 'L’Église, Nantes',
    date: '18.04',
    price: '14,00 €',
    genre: 'Ambient / Drone',
  },
  {
    title: 'Concrete Legacy',
    venue: 'Péniche Alternat, Paris',
    date: '25.04',
    price: '19,00 €',
    genre: 'House / Breaks',
  },
];

const MANIFESTO = [
  {
    num: '01',
    title: 'Transparence totale',
    text: 'Le prix affiché est le prix payé. Pas de frais de service cachés au moment de régler.',
  },
  {
    num: '02',
    title: 'Souveraineté des salles',
    text: 'Les lieux et les collectifs gardent la main sur leur billetterie et leurs données.',
  },
  {
    num: '03',
    title: 'Simplicité d’usage',
    text: 'Un achat en un geste, un pass numérique instantané et sans artifice.',
  },
];

interface PublicHomeProps {
  isDarkMode?: boolean;
}

export default function PublicHome({ isDarkMode = false }: PublicHomeProps) {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 md:px-12">

        {/* ─── HERO ─── */}
        <section className="py-24 md:py-36 grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-end">
          <div className="space-y-8">
            <span className={`inline-block text-xs font-mono uppercase tracking-widest pb-1 border-b ${isDarkMode ? 'text-[#F7F5F0]/50 border-[#F7F5F0]/20' : 'text-[#111110]/50 border-[#111110]/20'}`}>
              Billetterie indépendante — Édition 2026
            </span>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
              L’alternative
              <br />
              radicale.
            </h1>

            <p className={`max-w-md text-base md:text-lg leading-relaxed font-light ${isDarkMode ? 'text-[#F7F5F0]/70' : 'text-[#111110]/70'}`}>
              Une billetterie pensée pour la culture indépendante. Sans commission abusive, sans artifice visuel, au plus près des artistes et des salles.
            </p>
          </div>

          <div className={`border-t lg:border-t-0 lg:border-l pt-8 lg:pt-0 lg:pl-12 flex flex-col justify-between h-full ${isDarkMode ? 'border-[#F7F5F0]/10' : 'border-[#111110]/10'}`}>
            <div className="space-y-6">
              <p className={`text-xs font-mono uppercase tracking-widest ${isDarkMode ? 'text-[#F7F5F0]/40' : 'text-[#111110]/40'}`}>Prochains rendez-vous</p>
              <div className="space-y-4">
                {EVENTS.map((ev, i) => (
                  <div key={i} className={`group flex items-center justify-between py-3 border-b cursor-pointer ${isDarkMode ? 'border-[#F7F5F0]/10' : 'border-[#111110]/10'}`}>
                    <div>
                      <p className="font-display font-semibold text-lg group-hover:italic transition-all">{ev.title}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-[#F7F5F0]/50' : 'text-[#111110]/50'}`}>{ev.venue} · {ev.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono">{ev.price}</span>
                      <ArrowUpRight className="w-4 h-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <Link 
                href="/evenements"
                className={`inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 ${isDarkMode ? 'decoration-[#F7F5F0]/30 hover:decoration-[#F7F5F0]' : 'decoration-[#111110]/30 hover:decoration-[#111110]'}`}
              >
                Voir tout le catalogue des événements &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ─── PROCHAINS ÉVÉNEMENTS ─── */}
        <section className={`py-24 border-t ${isDarkMode ? 'border-[#F7F5F0]/10' : 'border-[#111110]/10'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className={`text-xs font-mono uppercase tracking-widest ${isDarkMode ? 'text-[#F7F5F0]/50' : 'text-[#111110]/50'}`}>Agenda</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Prochains événements</h2>
            </div>
            <Link 
              href="/evenements"
              className={`text-sm font-medium underline underline-offset-4 ${isDarkMode ? 'decoration-[#F7F5F0]/30 hover:decoration-[#F7F5F0]' : 'decoration-[#111110]/30 hover:decoration-[#111110]'}`}
            >
              Tout afficher
            </Link>
          </div>

          <div className={`grid md:grid-cols-2 lg:grid-cols-4 border-t ${isDarkMode ? 'border-[#F7F5F0]/10' : 'border-[#111110]/10'}`}>
            {UPCOMING_EVENTS.map((item, index) => (
              <div 
                key={index} 
                className={`group p-8 flex flex-col justify-between border-b md:border-r ${isDarkMode ? 'border-[#F7F5F0]/10 hover:bg-[#F7F5F0]/[0.02]' : 'border-[#111110]/10 hover:bg-[#111110]/[0.02]'} transition-colors cursor-pointer`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${isDarkMode ? 'border-[#F7F5F0]/20 text-[#F7F5F0]/70' : 'border-[#111110]/20 text-[#111110]/70'}`}>
                      {item.genre}
                    </span>
                    <span className={`text-xs font-mono ${isDarkMode ? 'text-[#F7F5F0]/50' : 'text-[#111110]/50'}`}>{item.date}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight group-hover:italic transition-all">{item.title}</h3>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#F7F5F0]/50' : 'text-[#111110]/50'}`}>{item.venue}</p>
                  </div>
                </div>

                <div className={`mt-8 pt-4 border-t flex items-center justify-between ${isDarkMode ? 'border-[#F7F5F0]/10' : 'border-[#111110]/10'}`}>
                  <span className="text-sm font-mono font-semibold">{item.price}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── MANIFESTO GRILLE ─── */}
        <section className={`py-24 border-t ${isDarkMode ? 'border-[#F7F5F0]/10' : 'border-[#111110]/10'}`}>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {MANIFESTO.map((item) => (
              <div key={item.num} className="space-y-4">
                <span className={`font-mono text-xs ${isDarkMode ? 'text-[#F7F5F0]/40' : 'text-[#111110]/40'}`}>{item.num}</span>
                <h3 className="font-display text-2xl font-bold tracking-tight">{item.title}</h3>
                <p className={`text-sm leading-relaxed font-light ${isDarkMode ? 'text-[#F7F5F0]/70' : 'text-[#111110]/70'}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BANDEAU PRO DISCRET ─── */}
        <section className={`my-24 rounded-2xl p-12 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 transition-colors ${isDarkMode ? 'bg-[#F7F5F0] text-[#111110]' : 'bg-[#111110] text-[#F7F5F0]'}`}>
          <div className="space-y-3 max-w-xl">
            <span className={`text-xs font-mono uppercase tracking-widest ${isDarkMode ? 'text-[#111110]/50' : 'text-[#F7F5F0]/50'}`}>Espace Organisateur</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Vous pilotez une salle ou un collectif ?</h2>
            <p className={`text-sm font-light leading-relaxed ${isDarkMode ? 'text-[#111110]/70' : 'text-[#F7F5F0]/70'}`}>
              Installez votre propre billetterie en quelques minutes et récupérez le contrôle total de vos données de diffusion.
            </p>
          </div>
          <a
            href="https://pro.tyks.app"
            className={`rounded-full px-8 py-4 text-xs font-semibold transition-transform hover:scale-105 shrink-0 ${isDarkMode ? 'bg-[#111110] text-[#F7F5F0]' : 'bg-[#F7F5F0] text-[#111110]'}`}
          >
            Ouvrir un compte Pro
          </a>
        </section>

      </div>
    </div>
  );
}

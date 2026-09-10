'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Smartphone, Apple, Play } from 'lucide-react';

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

export default function PublicHome() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération des événements depuis l'API ou le state partagé de votre site
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data.slice(0, 4)); // Affiche les 4 premiers événements de la plateforme
        } else {
          // Fallback si l'API est vide pour l'instant
          setEvents([
            {
              title: 'Nuit Électro — Session I',
              venue: 'Le Sous-Sol, Lyon',
              date: '12.03',
              price: '18,00 €',
              genre: 'Techno / Club',
            },
            {
              title: 'Open Air Botanique',
              venue: 'Les Docks, Marseille',
              date: '21.03',
              price: '22,00 €',
              genre: 'House / Outdoor',
            },
            {
              title: 'Club Infini',
              venue: 'La Chapelle, Paris',
              date: '27.03',
              price: '15,00 €',
              genre: 'Electro / Live',
            },
            {
              title: 'Subterranean Echoes',
              venue: 'Glitch Club, Bordeaux',
              date: '04.04',
              price: '16,00 €',
              genre: 'Live Modular',
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className={`flex-1 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#111110] text-[#F7F5F0]' : 'bg-[#F7F5F0] text-[#111110]'}`}>
      <main className="mx-auto max-w-7xl px-6 md:px-12 flex-1 w-full">

        {/* ─── HERO ─── */}
        <section className="py-24 md:py-36 grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
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

          {/* COLONNE DE DROITE : Animation App Mobile / Bientôt disponible */}
          <div className={`border-t lg:border-t-0 lg:border-l pt-8 lg:pt-0 lg:pl-12 flex flex-col justify-center h-full ${isDarkMode ? 'border-[#F7F5F0]/10' : 'border-[#111110]/10'}`}>
            <div className={`rounded-3xl p-8 border relative overflow-hidden transition-all ${isDarkMode ? 'bg-[#F7F5F0]/[0.03] border-[#F7F5F0]/15' : 'bg-white/60 border-[#111110]/10'} shadow-sm`}>
              
              {/* Badge discret animé */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Bientôt disponible
                </span>
                <Smartphone className={`w-5 h-5 ${isDarkMode ? 'text-[#F7F5F0]/40' : 'text-[#111110]/40'}`} />
              </div>

              {/* Contenu de l'annonce */}
              <div className="space-y-3 mb-8">
                <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                  L'application arrive dans votre poche.
                </h3>
                <p className={`text-xs md:text-sm font-light leading-relaxed ${isDarkMode ? 'text-[#F7F5F0]/60' : 'text-[#111110]/60'}`}>
                  Retrouvez tous vos billets, accédez aux soirées en un flash et profitez d'une expérience fluide sur iOS et Android.
                </p>
              </div>

              {/* Boutons plateformes en mode "Coming Soon" */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center gap-3 p-3 rounded-2xl border ${isDarkMode ? 'bg-[#111110] border-[#F7F5F0]/10 text-[#F7F5F0]' : 'bg-[#111110] text-[#F7F5F0] border-transparent'} opacity-80 cursor-default select-none`}>
                  <Apple className="w-5 h-5 shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="block text-[9px] uppercase font-mono opacity-50">Bientôt sur</span>
                    <span className="text-xs font-bold font-mono">iOS App Store</span>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-2xl border ${isDarkMode ? 'bg-[#111110] border-[#F7F5F0]/10 text-[#F7F5F0]' : 'bg-[#111110] text-[#F7F5F0] border-transparent'} opacity-80 cursor-default select-none`}>
                  <Play className="w-4 h-4 shrink-0 fill-current" />
                  <div className="text-left leading-tight">
                    <span className="block text-[9px] uppercase font-mono opacity-50">Bientôt sur</span>
                    <span className="text-xs font-bold font-mono">Google Play</span>
                  </div>
                </div>
              </div>

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
            {events.map((item, index) => (
              <Link 
                key={index} 
                href={item.url || `/evenements/${item.id || index}`}
                className={`group p-8 flex flex-col justify-between border-b md:border-r ${isDarkMode ? 'border-[#F7F5F0]/10 hover:bg-[#F7F5F0]/[0.02]' : 'border-[#111110]/10 hover:bg-[#111110]/[0.02]'} transition-colors cursor-pointer`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${isDarkMode ? 'border-[#F7F5F0]/20 text-[#F7F5F0]/70' : 'border-[#111110]/20 text-[#111110]/70'}`}>
                      {item.genre || 'Concert / Club'}
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
              </Link>
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

      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import TicketPass from '@/components/TicketPass';
import {
  Ticket,
  Compass,
  Trophy,
  ArrowUpRight,
  Calendar,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

// Données de démonstration pour le catalogue d'événements
const UPCOMING_EVENTS = [
  {
    id: 'neon-nights-2026',
    title: 'Neon Nights Festival',
    date: '12 sept. — 23h00',
    location: 'Le Warehouse, Paris',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    tag: 'Techno / Industrial',
    price: '25 €',
  },
  {
    id: 'solaris-sunset',
    title: 'Solaris Rooftop Sessions',
    date: '18 sept. — 18h00',
    location: 'Rooftop 52, Lyon',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    tag: 'House / Deep',
    price: '18 €',
  },
  {
    id: 'cyber-vault',
    title: 'Cyber Vault: Underground',
    date: '02 oct. — 00h00',
    location: 'Nuits Fauves, Paris',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    tag: 'Acid / Dark Electro',
    price: '20 €',
  },
];

// Historique / Palmarès de démonstration
const PAST_EVENTS = [
  {
    id: 'past-1',
    title: 'Aura Open Air',
    date: '14 juin 2025',
    location: 'Bois de Vincennes',
  },
  {
    id: 'past-2',
    title: 'Klubraum w/ Charlotte K.',
    date: '08 nov. 2025',
    location: 'Rex Club',
  },
];

const TABS = [
  { id: 'pass', label: 'Mon Pass', icon: Ticket },
  { id: 'events', label: 'Événements', icon: Compass },
  { id: 'history', label: 'Palmarès', icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Home() {
  const { authenticated, login, ready } = usePrivy();
  const [activeTab, setActiveTab] = useState<TabId>('pass');

  if (!ready) {
    return (
      <div className="min-h-screen bg-void text-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-gold/60 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-faint text-xs tracking-wide">Chargement d'iorti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void bg-night-glow text-ink pb-24 md:pb-14">

      {/* Hero — visible uniquement avant connexion */}
      {!authenticated && (
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-ink-faint mb-6">
              Billetterie sélective pour soirées et festivals
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tightest leading-[0.98] text-ink">
              Un pass. Chaque porte s'ouvre.
            </h1>
            <p className="mt-6 text-ink-muted text-base md:text-lg leading-relaxed max-w-md">
              Connexion en un geste, un seul QR code pour accéder à chaque
              soirée, et un palmarès qui garde la trace de chacune d'elles.
            </p>
            <div className="mt-9">
              <button
                onClick={login}
                className="inline-flex items-center gap-2.5 bg-ink hover:bg-white text-void font-semibold px-7 py-3.5 rounded-full transition-colors"
              >
                <span>Obtenir mon pass</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-surface-hair grid grid-cols-3 max-w-lg">
            {[
              { label: 'Sans friction', detail: 'Google ou email' },
              { label: 'Infalsifiable', detail: 'Pass unique' },
              { label: 'Zéro jargon', detail: 'Aucun wallet visible' },
            ].map((item, i) => (
              <div key={item.label} className={i < 2 ? 'punch-divider pr-4' : 'pl-4'}>
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-ink-faint mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Espace membre — visible une fois connecté */}
      {authenticated && (
        <main className="max-w-5xl mx-auto px-6 pt-10">

          {/* Rail d'onglets — desktop */}
          <div className="hidden md:flex items-center gap-8 border-b border-surface-hair mb-10">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
                    active ? 'text-ink' : 'text-ink-faint hover:text-ink-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gold" />
                  )}
                </button>
              );
            })}
          </div>

          {/* VUE 1 : MON PASS */}
          {activeTab === 'pass' && (
            <div className="fade-rise">
              <TicketPass />
            </div>
          )}

          {/* VUE 2 : ÉVÉNEMENTS & BILLETTERIE */}
          {activeTab === 'events' && (
            <div className="space-y-8 fade-rise">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tightest text-ink">À l'affiche</h2>
                <p className="text-sm text-ink-faint mt-1">Réservez directement sur votre pass, sans billet séparé</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {UPCOMING_EVENTS.map((evt) => (
                  <article
                    key={evt.id}
                    className="group rounded-2xl overflow-hidden border border-surface-hair bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                      <div className="absolute top-3.5 left-3.5 text-[10px] font-semibold tracking-wide text-ink/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                        {evt.tag}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-display text-lg font-bold text-white leading-tight">
                          {evt.title}
                        </h3>
                        <div className="mt-2 flex flex-col gap-1 text-xs text-white/70">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {evt.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {evt.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3.5 flex items-center justify-between">
                      <span className="text-base font-bold text-ink">{evt.price}</span>
                      <button className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-xs font-semibold transition-colors">
                        <span>Réserver</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* VUE 3 : PALMARÈS & SOUVENIRS */}
          {activeTab === 'history' && (
            <div className="space-y-8 fade-rise">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tightest text-ink">Mon Palmarès</h2>
                <p className="text-sm text-ink-faint mt-1">L'historique de vos soirées, conservé sur votre pass</p>
              </div>

              <div className="divide-y divide-surface-hair border-y border-surface-hair">
                {PAST_EVENTS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-surface-raised border border-white/8 flex items-center justify-center text-gold-soft">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-ink text-sm">{item.title}</h4>
                        <p className="text-xs text-ink-faint mt-0.5">{item.location} · {item.date}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-gold-soft border border-gold/20 bg-gold/5 px-2.5 py-1 rounded-full shrink-0">
                      Vérifié
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      )}

      {/* Navigation mobile inférieure */}
      {authenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel px-6 py-2.5 flex items-center justify-around">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 transition-colors ${
                  active ? 'text-gold-soft' : 'text-ink-faint'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

    </div>
  );
}

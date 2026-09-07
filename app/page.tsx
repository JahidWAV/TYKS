'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from '@/components/Navbar';
import TicketPass from '@/components/TicketPass';
import { Sparkles, Calendar, Award, ArrowUpRight, ShieldCheck, Zap, MapPin, ChevronRight, Filter } from 'lucide-react';

// Soirées de démonstration pour peupler la billetterie
const FEATURED_EVENTS = [
  {
    id: '1',
    title: 'AURA: Underground Session',
    subtitle: 'Industrial Techno & Light Performance',
    date: '12 SEP 2026 • 23:00',
    location: 'Le Warehouse, Paris',
    price: '25 €',
    tag: 'EXCLUSIF',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '2',
    title: 'SOLARIS Rooftop Club',
    subtitle: 'Sunset Melodic House',
    date: '18 SEP 2026 • 18:00',
    location: 'Rooftop 52, Lyon',
    price: '18 €',
    tag: 'DERNIÈRES PLACES',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '3',
    title: 'CYBER VAULT N-01',
    subtitle: 'Acid & Electro Warehouse',
    date: '02 OCT 2026 • 23:30',
    location: 'Nexus Club, Paris',
    price: '22 €',
    tag: 'RÉSERVÉ VIP',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
  },
];

export default function HomePage() {
  const { authenticated, login } = usePrivy();
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'rewards'>('events');

  return (
    <div className="min-h-screen bg-void text-ink pb-20">
      <Navbar />

      {!authenticated ? (
        <main className="max-w-5xl mx-auto px-6 pt-12 md:pt-20">
          <section className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3.5 py-1.5 text-xs font-medium text-gold-soft">
              <Sparkles className="w-3.5 h-3.5" />
              <span>La billetterie Neo-Nightlife & Accès Exclusifs</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-ink leading-tight">
              L&apos;expérience festive, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">
                sans aucune friction.
              </span>
            </h1>

            <p className="text-ink-muted text-base sm:text-lg max-w-xl mx-auto font-normal">
              Un Pass QR unique, infalsifiable et instantané. Vos billets conservés comme des souvenirs d&apos;exception.
            </p>

            <div className="pt-4 flex items-center justify-center">
              <button
                onClick={login}
                className="inline-flex items-center justify-center gap-3 bg-ink hover:bg-white text-void font-semibold px-8 py-4 rounded-full transition-all shadow-xl hover:scale-[1.02]"
              >
                <span>Obtenir mon Pass iorti</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-surface-hair pt-12">
            <div className="p-6 rounded-2xl bg-surface border border-surface-hair space-y-2">
              <Zap className="w-5 h-5 text-gold-soft" />
              <h3 className="font-bold text-ink text-sm">Entrée Instantanée</h3>
              <p className="text-xs text-ink-faint">Scannez votre Pass à l&apos;entrée en moins de 2 secondes.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-surface-hair space-y-2">
              <ShieldCheck className="w-5 h-5 text-gold-soft" />
              <h3 className="font-bold text-ink text-sm">Zéro Frais Cachés</h3>
              <p className="text-xs text-ink-faint">Une billetterie équitable pour le public et les organisateurs.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-surface-hair space-y-2">
              <Award className="w-5 h-5 text-gold-soft" />
              <h3 className="font-bold text-ink text-sm">Palmarès Collectible</h3>
              <p className="text-xs text-ink-faint">Chaque soirée vécue débloque un souvenir numérique vérifié.</p>
            </div>
          </section>
        </main>
      ) : (
        <main className="max-w-5xl mx-auto px-6 pt-8">
          {/* Navigation par onglets */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 bg-surface border border-surface-hair rounded-full gap-1">
              <button
                onClick={() => setActiveTab('pass')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'pass'
                    ? 'bg-ink text-void shadow-lg'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mon Pass
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'events'
                    ? 'bg-ink text-void shadow-lg'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Événements
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'rewards'
                    ? 'bg-ink text-void shadow-lg'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Palmarès
              </button>
            </div>
          </div>

          {/* ONGLET 1 : MON PASS */}
          {activeTab === 'pass' && (
            <div className="flex flex-col items-center justify-center fade-rise">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
                  Votre Pass Permanent
                </h1>
                <p className="text-sm text-ink-muted">
                  Présentez ce QR Code à l&apos;entrée de vos événements VIP.
                </p>
              </div>
              <TicketPass />
            </div>
          )}

          {/* ONGLET 2 : ÉVÉNEMENTS (CATALOGUE PREMIUM) */}
          {activeTab === 'events' && (
            <div className="space-y-8 fade-rise">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-hair pb-6">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Événements à l&apos;affiche</h2>
                  <p className="text-xs text-ink-muted mt-1">Sélection exclusive pour membres iorti</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 bg-surface border border-surface-hair px-4 py-2 rounded-full text-xs text-ink-muted hover:text-ink transition-colors">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrer par ville</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURED_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="group relative bg-surface border border-surface-hair rounded-3xl overflow-hidden hover:border-gold/30 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Visual & Badge */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 bg-void/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gold-soft border border-gold/20">
                          {event.tag}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gold-soft">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{event.date}</span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-ink leading-snug group-hover:text-gold-soft transition-colors">
                          {event.title}
                        </h3>

                        <p className="text-xs text-ink-faint line-clamp-1">{event.subtitle}</p>

                        <div className="flex items-center gap-1.5 text-xs text-ink-muted pt-1">
                          <MapPin className="w-3.5 h-3.5 text-ink-faint" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Buy Action */}
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-surface-hair/50 mt-4">
                      <div>
                        <span className="text-[10px] uppercase text-ink-faint block">Tarif unique</span>
                        <span className="font-display text-lg font-bold text-ink">{event.price}</span>
                      </div>

                      <button className="inline-flex items-center gap-1.5 bg-ink hover:bg-white text-void font-semibold text-xs px-4 py-2.5 rounded-full transition-all">
                        <span>Réserver</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 3 : PALMARÈS */}
          {activeTab === 'rewards' && (
            <div className="space-y-6 fade-rise max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold tracking-tight mb-2">
                  Votre Palmarès
                </h2>
                <p className="text-sm text-ink-muted">
                  Vos collectibles & historiques de présence vérifiés sur la blockchain.
                </p>
              </div>

              <div className="p-8 bg-surface border border-surface-hair rounded-3xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 text-gold-soft flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-ink text-base">Aucun souvenir pour le moment</h3>
                <p className="text-xs text-ink-faint max-w-md mx-auto">
                  Participez à votre premier événement iorti pour débloquer votre Pass souvenir infalsifiable.
                </p>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

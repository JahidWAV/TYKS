'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from '@/components/Navbar';
import TicketPass from '@/components/TicketPass';
import { Sparkles, Calendar, Award, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  const { authenticated, login } = usePrivy();
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'rewards'>('events');

  return (
    <div className="min-h-screen bg-void text-ink pb-20">
      <Navbar />

      {/* STATE 1 : UTILISATEUR NON CONNECTÉ (Hero Section & Catalogue) */}
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

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={login}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-ink hover:bg-white text-void font-semibold px-8 py-4 rounded-full transition-all shadow-xl hover:scale-[1.02]"
              >
                <span>Obtenir mon Pass iorti</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Section features rapides */}
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
        /* STATE 2 : UTILISATEUR CONNECTÉ (Navigation & Dashboard Client) */
        <main className="max-w-4xl mx-auto px-6 pt-8">
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

          {activeTab === 'events' && (
            <div className="space-y-6 fade-rise">
              <h2 className="font-display text-2xl font-bold tracking-tight">À l&apos;affiche</h2>
              <p className="text-sm text-ink-muted">Aucun événement disponible pour le moment.</p>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="text-center py-12 fade-rise">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
                Collection & Souvenirs
              </h2>
              <p className="text-sm text-ink-muted">
                Vos Pass consommés et collectibles apparaîtront ici.
              </p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import TicketPass from '@/components/TicketPass';
import { Sparkles, Calendar, Award } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'rewards'>('pass');

  return (
    <div className="min-h-screen bg-void text-ink pb-20">
      <Navbar />

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
                Présentez ce QR Code à l'entrée de vos événements VIP.
              </p>
            </div>
            <TicketPass />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6 fade-rise">
            <h2 className="font-display text-2xl font-bold tracking-tight">À l'affiche</h2>
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
    </div>
  );
}

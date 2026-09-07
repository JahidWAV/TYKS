'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from '@/components/Navbar';
import TicketPass from '@/components/TicketPass';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { IortiEvent } from '@/types/event';
import { Sparkles, Calendar, Award, ArrowUpRight, ShieldCheck, Zap, MapPin, ChevronRight, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { authenticated, login } = usePrivy();
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'rewards'>('events');
  const [events, setEvents] = useState<IortiEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchPublishedEvents() {
      try {
        const { data, error } = await supabaseBrowser
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('starts_at', { ascending: true });

        if (!error && data) {
          setEvents(data);
        }
      } catch {
        // Fallback silencieux si la table n'est pas encore peuplée
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchPublishedEvents();
  }, []);

  return (
    <div className="min-h-screen bg-void text-ink font-sans antialiased selection:bg-gold/20 selection:text-gold">
      <Navbar />

      {/* STATE 1 : VISITEUR NON CONNECTÉ */}
      {!authenticated ? (
        <main className="max-w-4xl mx-auto px-6 pt-16 md:pt-28 pb-20">
          <section className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-surface-hair bg-surface/50 backdrop-blur-md px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span>Accès VIP & Billetterie Off-Chain / Solana</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tighter text-ink leading-[1.05]">
              Le pass unique pour <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-500">
                la nightlife d&apos;exception.
              </span>
            </h1>

            <p className="text-ink-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-normal">
              Entrée instantanée via QR Code infalsifiable. Portefeuille d&apos;accès sécurisé et collectibles digitaux pour chaque soirée vécue.
            </p>

            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={login}
                className="group relative inline-flex items-center justify-center gap-3 bg-white text-void font-semibold text-xs tracking-wider uppercase px-8 py-4 rounded-full transition-all duration-300 hover:bg-neutral-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Activer mon Pass</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </section>

          {/* Grille d'atouts minimaliste */}
          <section className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-surface-hair pt-12">
            <div className="p-6 rounded-2xl bg-surface/30 border border-surface-hair/60 space-y-3">
              <Zap className="w-4 h-4 text-ink-muted" />
              <h3 className="font-display font-semibold text-ink text-sm tracking-tight">Vitesse Absolue</h3>
              <p className="text-xs text-ink-faint leading-relaxed">Contrôle d&apos;accès fluide en porte. Moins de 2 secondes par scan.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface/30 border border-surface-hair/60 space-y-3">
              <ShieldCheck className="w-4 h-4 text-ink-muted" />
              <h3 className="font-display font-semibold text-ink text-sm tracking-tight">Transparence Totale</h3>
              <p className="text-xs text-ink-faint leading-relaxed">Zéro frais masqués lors du paiement. Modèle direct organisateur.</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface/30 border border-surface-hair/60 space-y-3">
              <Award className="w-4 h-4 text-ink-muted" />
              <h3 className="font-display font-semibold text-ink text-sm tracking-tight">Mémoire Numérique</h3>
              <p className="text-xs text-ink-faint leading-relaxed">Chaque soirée débloque une preuve de présence archivée dans votre pass.</p>
            </div>
          </section>
        </main>
      ) : (
        /* STATE 2 : UTILISATEUR CONNECTÉ */
        <main className="max-w-4xl mx-auto px-6 pt-10 pb-20">
          {/* Controls / Tabs */}
          <div className="flex justify-center mb-12">
            <nav className="inline-flex p-1 bg-surface/80 backdrop-blur-md border border-surface-hair rounded-full">
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'events'
                    ? 'bg-white text-void font-semibold shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Événements
              </button>
              <button
                onClick={() => setActiveTab('pass')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'pass'
                    ? 'bg-white text-void font-semibold shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mon Pass
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'rewards'
                    ? 'bg-white text-void font-semibold shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Palmarès
              </button>
            </nav>
          </div>

          {/* TAB 1 : ÉVÉNEMENTS (RÉEL SUPABASE) */}
          {activeTab === 'events' && (
            <div className="space-y-8 fade-rise">
              <div className="flex items-center justify-between border-b border-surface-hair pb-5">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Saison en cours</h2>
                  <p className="text-xs text-ink-faint mt-0.5">Billetterie officielle et événements partenaires</p>
                </div>
                <span className="font-mono text-[10px] text-ink-muted border border-surface-hair px-3 py-1 rounded-full uppercase tracking-wider">
                  {events.length} Disponible{events.length > 1 ? 's' : ''}
                </span>
              </div>

              {loadingEvents ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-ink-muted animate-spin" />
                  <span className="font-mono text-xs text-ink-faint">Chargement du catalogue…</span>
                </div>
              ) : events.length === 0 ? (
                /* Empty state ultra-clean */
                <div className="py-20 border border-dashed border-surface-hair/80 rounded-3xl text-center flex flex-col items-center justify-center px-4">
                  <div className="w-10 h-10 rounded-full bg-surface border border-surface-hair flex items-center justify-center mb-4 text-ink-muted">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-ink tracking-tight mb-1">
                    Aucune session programmée
                  </h3>
                  <p className="text-xs text-ink-faint max-w-xs leading-relaxed">
                    Les prochaines dates exclusives seront annoncées sous peu. Gardez votre pass actif.
                  </p>
                </div>
              ) : (
                /* Liste des vrais événements depuis Supabase */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((evt) => (
                    <article
                      key={evt.id}
                      className="group p-6 bg-surface/40 hover:bg-surface/80 border border-surface-hair rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-gold-soft uppercase tracking-wider">
                            {new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-[10px] font-mono text-ink-faint border border-surface-hair px-2 py-0.5 rounded">
                            {evt.status}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-ink tracking-tight group-hover:text-white transition-colors">
                          {evt.title}
                        </h3>

                        {evt.description && (
                          <p className="text-xs text-ink-faint line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-surface-hair/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <MapPin className="w-3.5 h-3.5 text-ink-faint" />
                          <span>{evt.location}</span>
                        </div>

                        <button className="inline-flex items-center gap-1.5 bg-white text-void font-semibold text-xs px-4 py-2 rounded-full transition-colors hover:bg-neutral-200">
                          <span>Accéder</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2 : PASS CLIENT */}
          {activeTab === 'pass' && (
            <div className="flex flex-col items-center justify-center fade-rise pt-4">
              <div className="text-center mb-8 space-y-1">
                <h2 className="font-display text-2xl font-bold tracking-tight">Pass Membre Permanent</h2>
                <p className="text-xs text-ink-muted">
                  Présentez ce QR Code unique au contrôle d&apos;accès de l&apos;établissement.
                </p>
              </div>
              <TicketPass />
            </div>
          )}

          {/* TAB 3 : PALMARÈS */}
          {activeTab === 'rewards' && (
            <div className="space-y-6 fade-rise max-w-lg mx-auto pt-4">
              <div className="text-center mb-8 space-y-1">
                <h2 className="font-display text-2xl font-bold tracking-tight">Historique & Distinctions</h2>
                <p className="text-xs text-ink-muted">
                  Preuves de présence chiffrées sur le registre Solana.
                </p>
              </div>

              <div className="p-8 border border-surface-hair bg-surface/30 rounded-2xl text-center space-y-3">
                <div className="w-9 h-9 rounded-full bg-surface border border-surface-hair text-ink-muted flex items-center justify-center mx-auto">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-ink text-sm">Registre vierge</h3>
                <p className="text-xs text-ink-faint max-w-xs mx-auto leading-relaxed">
                  Scannez votre Pass lors de votre première soirée pour débloquer votre premier insigne.
                </p>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

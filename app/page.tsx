'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Navbar from '@/components/Navbar';
import TicketPass from '@/components/TicketPass';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { IortiEvent } from '@/types/event';
import { Sparkles, Calendar, Award, ArrowUpRight, MapPin, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  cancelled: 'Annulé',
};

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
    <div className="min-h-screen bg-onyx text-bone font-sans antialiased selection:bg-cobalt/30 selection:text-bone">
      <Navbar />

      {/* STATE 1 : VISITEUR NON CONNECTÉ */}
      {!authenticated ? (
        <main className="max-w-4xl mx-auto px-6 pt-16 md:pt-28 pb-20">
          <section className="text-center space-y-8">
            <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tightest text-bone leading-[1.05]">
              Votre soirée commence
              <br />
              par un pass.
            </h1>

            <p className="text-bone-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-normal">
              TYKS est la billetterie premium des soirées d&apos;exception : un accès vérifié,
              un prix honnête, et une entrée qui ne fait jamais attendre.
            </p>

            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={login}
                className="group relative inline-flex items-center justify-center gap-3 bg-cobalt text-bone font-semibold text-xs tracking-wide px-8 py-4 rounded-full transition-all duration-300 hover:bg-cobalt-soft hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Activer mon pass</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </section>

          {/* Fine print, comme au dos d'un vrai billet — pas une grille de cartes. */}
          <section className="mt-28 rounded-3xl border border-onyx-line bg-onyx-raised/50 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 divide-onyx-line">
              <div className="punch-divider p-7 space-y-2">
                <h3 className="font-display font-semibold text-bone text-sm">Entrée en deux secondes</h3>
                <p className="text-xs text-bone-faint leading-relaxed">
                  Un scan, une porte qui s&apos;ouvre. Aucune file, aucun papier.
                </p>
              </div>
              <div className="punch-divider p-7 space-y-2">
                <h3 className="font-display font-semibold text-bone text-sm">Prix affiché, prix payé</h3>
                <p className="text-xs text-bone-faint leading-relaxed">
                  Aucun frais ajouté à la dernière étape du paiement.
                </p>
              </div>
              <div className="p-7 space-y-2">
                <h3 className="font-display font-semibold text-bone text-sm">Un pass, toutes les soirées</h3>
                <p className="text-xs text-bone-faint leading-relaxed">
                  Chaque accès reste archivé dans votre pass, pour toujours.
                </p>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* STATE 2 : UTILISATEUR CONNECTÉ */
        <main className="max-w-4xl mx-auto px-6 pt-10 pb-20">
          {/* Controls / Tabs */}
          <div className="flex justify-center mb-12">
            <nav className="inline-flex p-1 bg-onyx-raised/80 backdrop-blur-md border border-onyx-line rounded-full">
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'events'
                    ? 'bg-bone text-onyx font-semibold shadow-sm'
                    : 'text-bone-muted hover:text-bone'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Événements
              </button>
              <button
                onClick={() => setActiveTab('pass')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'pass'
                    ? 'bg-bone text-onyx font-semibold shadow-sm'
                    : 'text-bone-muted hover:text-bone'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mon pass
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'rewards'
                    ? 'bg-bone text-onyx font-semibold shadow-sm'
                    : 'text-bone-muted hover:text-bone'
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
              <div className="flex items-center justify-between border-b border-onyx-line pb-5">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-bone">Saison en cours</h2>
                  <p className="text-xs text-bone-faint mt-0.5">Billetterie officielle et événements partenaires</p>
                </div>
                <span className="font-mono text-[10px] text-bone-muted border border-onyx-line px-3 py-1 rounded-full">
                  {events.length} disponible{events.length > 1 ? 's' : ''}
                </span>
              </div>

              {loadingEvents ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-bone-muted animate-spin" />
                  <span className="font-mono text-xs text-bone-faint">Chargement du catalogue…</span>
                </div>
              ) : events.length === 0 ? (
                <div className="py-20 border border-dashed border-onyx-line rounded-3xl text-center flex flex-col items-center justify-center px-4">
                  <div className="w-10 h-10 rounded-full bg-onyx-raised border border-onyx-line flex items-center justify-center mb-4 text-bone-muted">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-bone tracking-tight mb-1">
                    Aucune session programmée
                  </h3>
                  <p className="text-xs text-bone-faint max-w-xs leading-relaxed">
                    Les prochaines dates exclusives seront annoncées sous peu. Gardez votre pass actif.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((evt) => (
                    <article
                      key={evt.id}
                      className="group p-6 bg-onyx-raised/60 hover:bg-onyx-raised border border-onyx-line rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-cobalt-soft">
                            {new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-[10px] font-mono text-bone-faint border border-onyx-line px-2 py-0.5 rounded">
                            {STATUS_LABEL[evt.status] ?? evt.status}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-bone tracking-tight group-hover:text-white transition-colors">
                          {evt.title}
                        </h3>

                        {evt.description && (
                          <p className="text-xs text-bone-faint line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-onyx-line flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-bone-muted">
                          <MapPin className="w-3.5 h-3.5 text-bone-faint" />
                          <span>{evt.location}</span>
                        </div>

                        <button className="inline-flex items-center gap-1.5 bg-bone text-onyx font-semibold text-xs px-4 py-2 rounded-full transition-colors hover:bg-stub">
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
                <h2 className="font-display text-2xl font-bold tracking-tight">Pass membre permanent</h2>
                <p className="text-xs text-bone-muted">
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
                <h2 className="font-display text-2xl font-bold tracking-tight">Historique &amp; distinctions</h2>
                <p className="text-xs text-bone-muted">
                  Preuves de présence chiffrées sur le registre Solana.
                </p>
              </div>

              <div className="p-8 border border-onyx-line bg-onyx-raised/60 rounded-2xl text-center space-y-3">
                <div className="w-9 h-9 rounded-full bg-onyx-raised border border-onyx-line text-bone-muted flex items-center justify-center mx-auto">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-bone text-sm">Registre vierge</h3>
                <p className="text-xs text-bone-faint max-w-xs mx-auto leading-relaxed">
                  Scannez votre pass lors de votre première soirée pour débloquer votre premier insigne.
                </p>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

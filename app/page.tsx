'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TicketPass from '@/components/TicketPass';
import EventCard from '@/components/EventCard';
import SamplePassPreview from '@/components/SamplePassPreview';
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
    <div className="relative min-h-screen bg-onyx text-bone font-sans antialiased selection:bg-cobalt/30 selection:text-bone">
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10">
      <Navbar />

      {/* STATE 1 : VISITEUR NON CONNECTÉ — la vitrine */}
      {!authenticated ? (
        <main>
          {/* HERO */}
          <section className="max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-20">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-10 items-center">
              <div className="text-center lg:text-left space-y-8">
                <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold tracking-tightest text-bone leading-[1.04]">
                  Votre soirée commence par un pass.
                </h1>

                <p className="text-bone-muted text-sm sm:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
                  TYKS est la billetterie premium des soirées d&apos;exception : un accès
                  vérifié, un prix honnête, et une entrée qui ne fait jamais attendre.
                </p>

                <div className="flex flex-col sm:flex-row lg:justify-start justify-center items-center gap-5 pt-2">
                  <button
                    onClick={login}
                    className="group relative inline-flex items-center justify-center gap-3 bg-cobalt text-bone font-semibold text-xs tracking-wide px-8 py-4 rounded-full transition-all duration-300 hover:bg-cobalt-soft hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Activer mon pass</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>

                  <Link
                    href="/organisateur"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-bone-muted hover:text-bone transition-colors"
                  >
                    <span>J&apos;organise des événements</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <SamplePassPreview />
              </div>
            </div>
          </section>

          {/* COMMENT ÇA MARCHE — une vraie séquence, donc numérotée */}
          <section className="max-w-4xl mx-auto px-6 pb-24">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone text-center mb-12">
              Comment ça marche
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
              <div className="text-center sm:text-left space-y-3">
                <p className="font-mono text-sm text-cobalt-soft">01</p>
                <h3 className="font-display font-semibold text-bone text-base">Trouvez votre soirée</h3>
                <p className="text-xs text-bone-faint leading-relaxed max-w-[220px] mx-auto sm:mx-0">
                  Parcourez les événements publiés par nos organisateurs partenaires.
                </p>
              </div>
              <div className="text-center sm:text-left space-y-3">
                <p className="font-mono text-sm text-cobalt-soft">02</p>
                <h3 className="font-display font-semibold text-bone text-base">Payez en un geste</h3>
                <p className="text-xs text-bone-faint leading-relaxed max-w-[220px] mx-auto sm:mx-0">
                  Le prix affiché est le prix payé, sans frais ajoutés au paiement.
                </p>
              </div>
              <div className="text-center sm:text-left space-y-3">
                <p className="font-mono text-sm text-cobalt-soft">03</p>
                <h3 className="font-display font-semibold text-bone text-base">Scannez à l&apos;entrée</h3>
                <p className="text-xs text-bone-faint leading-relaxed max-w-[220px] mx-auto sm:mx-0">
                  Votre pass s&apos;affiche, la porte s&apos;ouvre. Moins de deux secondes.
                </p>
              </div>
            </div>
          </section>

          {/* PROCHAINES SOIRÉES — vraies données, pas de mock marketing */}
          {!loadingEvents && events.length > 0 && (
            <section className="max-w-5xl mx-auto px-6 pb-24">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-bone">
                    Les prochaines soirées
                  </h2>
                  <p className="text-xs text-bone-faint mt-1">Billetterie officielle et événements partenaires</p>
                </div>
                <button
                  onClick={login}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-bone-muted hover:text-bone transition-colors shrink-0"
                >
                  <span>Voir tout</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {events.slice(0, 3).map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            </section>
          )}

          {/* Fine print, comme au dos d'un vrai billet — pas une grille de cartes. */}
          <section className="max-w-4xl mx-auto px-6 pb-24">
            <div className="rounded-3xl border border-onyx-line bg-onyx-raised/50 overflow-hidden">
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
            </div>
          </section>

          {/* CTA final */}
          <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tightest text-bone leading-tight mb-5">
              Activez votre pass avant la prochaine soirée.
            </h2>
            <button
              onClick={login}
              className="inline-flex items-center justify-center gap-3 bg-cobalt text-bone font-semibold text-xs tracking-wide px-8 py-4 rounded-full transition-all duration-300 hover:bg-cobalt-soft hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Activer mon pass</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-onyx-line">
            <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-display text-sm font-extrabold tracking-tightest text-bone">TYKS</p>
                <p className="text-[11px] text-bone-faint mt-0.5">La billetterie premium des soirées d&apos;exception.</p>
              </div>
              <Link
                href="/organisateur"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-bone-muted hover:text-bone transition-colors"
              >
                <span>Créer un espace organisateur</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </footer>
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
    </div>
  );
}

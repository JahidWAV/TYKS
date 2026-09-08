'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar '@/components/Navbar';
import TicketPass from '@/components/TicketPass';
import EventCard from '@/components/EventCard';
import SamplePassPreview from '@/components/SamplePassPreview';
import CustomAuthModal from '@/components/CustomAuthModal';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { IortiEvent } from '@/types/event';
import { Sparkles, Calendar, Award, ArrowUpRight, ChevronRight, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'rewards'>('events');
  const [events, setEvents] = useState<IortiEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Vérifie la session Supabase active
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
    });

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        // Fallback silencieux
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchPublishedEvents();
  }, []);

  return (
    <div className="relative min-h-screen bg-onyx text-bone font-sans antialiased selection:bg-bone/20 selection:text-bone">
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
        {!authenticated ? (
          <main>
            <section className="max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-20">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-10 items-center">
                <div className="text-center lg:text-left space-y-8">
                  <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold tracking-tightest text-bone leading-[1.04]">
                    Votre soirée commence par un pass.
                  </h1>
                  <p className="text-bone-muted text-sm sm:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
                    TYKS est la billetterie premium des soirées d&apos;exception : un accès vérifié, un prix honnête, et une entrée qui ne fait jamais attendre.
                  </p>
                  <div className="flex flex-col sm:flex-row lg:justify-start justify-center items-center gap-5 pt-2">
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="group relative inline-flex items-center justify-center gap-3 bg-bone text-onyx font-semibold text-xs tracking-wide px-8 py-4 rounded-full transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.99]"
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
            {!loadingEvents && events.length > 0 && (
              <section className="max-w-5xl mx-auto px-6 pb-24">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-bone">
                      Les prochaines soirées
                    </h2>
                    <p className="text-xs text-bone-faint mt-1">Billetterie officielle et événements partenaires</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {events.slice(0, 3).map((evt) => (
                    <EventCard key={evt.id} event={evt} />
                  ))}
                </div>
              </section>
            )}
          </main>
        ) : (
          <main className="max-w-4xl mx-auto px-6 pt-10 pb-20">
            <div className="flex justify-center mb-12">
              <nav className="inline-flex p-1 bg-onyx-raised/80 backdrop-blur-md border border-onyx-line rounded-full">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    activeTab === 'events' ? 'bg-bone text-onyx font-semibold shadow-sm' : 'text-bone-muted hover:text-bone'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Événements
                </button>
                <button
                  onClick={() => setActiveTab('pass')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    activeTab === 'pass' ? 'bg-bone text-onyx font-semibold shadow-sm' : 'text-bone-muted hover:text-bone'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Mon pass
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    activeTab === 'rewards' ? 'bg-bone text-onyx font-semibold shadow-sm' : 'text-bone-muted hover:text-bone'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Palmarès
                </button>
              </nav>
            </div>
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
          </main>
        )}
      </div>
      <CustomAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

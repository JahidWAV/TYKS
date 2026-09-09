'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2 } from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import { supabaseBrowser } from '@/lib/supabase-browser';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  cancelled: 'Annulé',
};

export default function OrganizerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<IortiEvent[]>([]);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      setUser(session?.user ?? null);
      setReady(true);
    }
    getSession();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDashboard = useCallback(async (userId: string) => {
    try {
      setLoading(true);

      // 1. Tenter de récupérer l'organization_id via organization_members
      const { data: membership } = await supabaseBrowser
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .maybeSingle();

      let query = supabaseBrowser.from('events').select('*');

      if (membership?.organization_id) {
        // Si l'orga est trouvée, on filtre par organization_id
        query = query.eq('organization_id', membership.organization_id);
      } else {
        // Sinon, fallback de sécurité sur created_by pour ne pas afficher 0 si la liaison n'est pas encore faite
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query.order('starts_at', { ascending: true });

      if (error) {
        console.error('Erreur Supabase :', error.message);
      } else if (data) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Erreur de chargement :', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && user?.id) {
      loadDashboard(user.id);
    } else if (ready && !user) {
      setLoading(false);
    }
  }, [ready, user, loadDashboard]);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setAuthLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer cet événement ?')) return;

    try {
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert("Impossible de supprimer l'événement.");
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
      </div>
    );
  }

  // ==========================================
  // 1. LANDING PAGE PRO (non connectés)
  // ==========================================
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center space-y-8">
        <p className="font-mono text-xs text-bone-faint">espace organisateur</p>

        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-bone md:text-5xl">
          Reprenez le contrôle de votre
          <br className="hidden md:block" /> billetterie et de vos marges.
        </h1>

        <p className="mx-auto max-w-md text-sm leading-relaxed text-bone-muted">
          Fin des commissions abusives et des données captives. Une
          plateforme sur-mesure, des frais réduits, l'accès direct à votre
          public.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="inline-flex items-center gap-3 rounded-full bg-bone px-8 py-3.5 text-sm font-semibold text-onyx transition hover:bg-white disabled:opacity-50"
        >
          {authLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          Accéder à mon espace Pro
        </button>

        <div className="grid divide-y divide-onyx-line rounded-2xl border border-onyx-line pt-2 text-left sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="space-y-2 p-8">
            <h3 className="font-display text-base font-bold text-bone">
              Marges maximales
            </h3>
            <p className="text-xs leading-relaxed text-bone-muted">
              Gardez un maximum de revenus sur chaque place vendue, sans
              grille tarifaire imposée.
            </p>
          </div>
          <div className="space-y-2 p-8">
            <h3 className="font-display text-base font-bold text-bone">
              Données 100% vous
            </h3>
            <p className="text-xs leading-relaxed text-bone-muted">
              Accédez en temps réel aux emails et contacts de votre public.
            </p>
          </div>
          <div className="space-y-2 p-8">
            <h3 className="font-display text-base font-bold text-bone">
              Image de marque
            </h3>
            <p className="text-xs leading-relaxed text-bone-muted">
              Un sous-domaine dédié et une interface aux couleurs de votre
              structure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
      </div>
    );
  }

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'published').length;

  // ==========================================
  // 2. DASHBOARD ORGANISATEUR (connectés)
  // ==========================================
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-bone">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-bone-muted">
            Vos événements et vos performances, en direct.
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx transition hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Créer un événement
        </Link>
      </div>

      {/* Ledger de stats */}
      <div className="grid divide-y divide-onyx-line rounded-2xl border border-onyx-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-6">
          <p className="font-mono text-[11px] text-bone-faint">événements</p>
          <p className="mt-2 font-display text-4xl font-bold text-bone">
            {totalEvents}
          </p>
        </div>
        <div className="p-6">
          <p className="font-mono text-[11px] text-bone-faint">publiés</p>
          <p className="mt-2 font-display text-4xl font-bold text-bone">
            {publishedEvents}
          </p>
        </div>
        <div className="flex flex-col justify-center p-6">
          <p className="font-mono text-[11px] text-bone-faint">compte</p>
          <p className="ink-stamp mt-2 inline-flex w-fit items-center gap-2 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Vérifié
          </p>
        </div>
      </div>

      {/* Liste des événements */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-bone">
          Vos événements
        </h2>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-onyx-line p-16 text-center space-y-3">
            <Calendar className="mx-auto h-6 w-6 text-bone-faint" />
            <p className="text-sm text-bone-muted">
              Aucun événement à votre actif pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <article
                key={evt.id}
                className="group flex flex-col rounded-2xl border border-onyx-line bg-onyx-raised/40 transition-colors hover:bg-onyx-raised"
              >
                <div className="space-y-3 p-6 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-bone-faint">
                      {new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-mono text-[10px] text-bone-faint">
                      {STATUS_LABEL[evt.status] ?? evt.status}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold leading-snug text-bone">
                    {evt.title}
                  </h3>

                  {evt.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-bone-muted">
                      {evt.description}
                    </p>
                  )}

                  {evt.location && (
                    <div className="flex items-center gap-1.5 text-xs text-bone-faint">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-onyx-line px-6 py-3">
                  <span className="font-mono text-xs text-bone">
                    {STATUS_LABEL[evt.status] ?? evt.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 text-bone-faint hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

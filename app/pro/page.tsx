'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2, Edit3, TrendingUp, Users, DollarSign, ShieldCheck, Zap, Database } from 'lucide-react';
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
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('starts_at', { ascending: true });

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
      alert('Impossible de supprimer l\'événement.');
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
  // 1. LANDING PAGE PRO (Non connectés)
  // ==========================================
  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-onyx-line bg-onyx-raised px-4 py-1.5 text-xs text-bone-muted">
            <Zap className="w-3.5 h-3.5 text-bone" />
            <span>L&apos;alternative moderne à Shotgun et DICE</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-bone tracking-tight max-w-3xl">
            Reprenez le contrôle de votre billetterie et de vos marges.
          </h1>

          <p className="max-w-xl text-base text-bone-muted leading-relaxed">
            Fins de commissions abusives et de données captives. Tyks Pro vous offre une plateforme sur-mesure, des frais réduits et l&apos;accès direct à votre communauté.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="inline-flex items-center gap-3 rounded-full bg-bone px-8 py-4 text-sm font-semibold text-onyx transition hover:bg-white disabled:opacity-50 shadow-lg shadow-bone/5"
          >
            {authLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpRight className="h-4 w-4" />
            )}
            <span>Accéder à mon espace Pro</span>
          </button>
        </div>

        {/* Grille Avantages / Comparatif rapide */}
        <div className="grid md:grid-cols-3 gap-6 pt-10 border-t border-onyx-line">
          <div className="p-8 rounded-2xl bg-onyx-raised/40 border border-onyx-line space-y-4">
            <div className="w-10 h-10 rounded-xl bg-bone/10 flex items-center justify-center text-bone">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-bone">Marges maximales</h3>
            <p className="text-xs text-bone-muted leading-relaxed">
              Oubliez les grilles tarifaires rigides des grandes applications. Gardez un maximum de revenus sur chaque place vendue.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-onyx-raised/40 border border-onyx-line space-y-4">
            <div className="w-10 h-10 rounded-xl bg-bone/10 flex items-center justify-center text-bone">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-bone">Données 100% vous</h3>
            <p className="text-xs text-bone-muted leading-relaxed">
              Contrairement aux plateformes qui conservent vos spectateurs captifs, accédez en temps réel aux emails et contacts de votre public.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-onyx-raised/40 border border-onyx-line space-y-4">
            <div className="w-10 h-10 rounded-xl bg-bone/10 flex items-center justify-center text-bone">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-bone">Image de marque</h3>
            <p className="text-xs text-bone-muted leading-relaxed">
              Profitez d&apos;un sous-domaine dédié (`pro.tyks.app`) et d&apos;une interface aux couleurs de votre univers artistique ou de votre structure.
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

  // Calculs statistiques globaux basés sur les événements réels
  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;

  // ==========================================
  // 2. DASHBOARD ORGANISATEUR (Connectés)
  // ==========================================
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-bone">Tableau de bord Pro</h1>
          <p className="text-sm text-bone-muted">Pilotez vos événements et suivez vos performances en direct</p>
        </div>
        <Link
          href="/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx transition hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Créer un événement
        </Link>
      </div>

      {/* Statistiques Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-2">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Total Événements</span>
            <Calendar className="w-4 h-4 text-bone-faint" />
          </div>
          <p className="font-display text-3xl font-bold text-bone">{totalEvents}</p>
        </div>

        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-2">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Événements publiés</span>
            <TrendingUp className="w-4 h-4 text-bone-faint" />
          </div>
          <p className="font-display text-3xl font-bold text-bone">{publishedEvents}</p>
        </div>

        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-2">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Statut du compte</span>
            <Users className="w-4 h-4 text-bone-faint" />
          </div>
          <p className="font-display text-sm font-semibold text-emerald-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Compte Vérifié & Actif
          </p>
        </div>
      </div>

      {/* Liste des Événements */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-bone">Vos Événements</h2>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-onyx-line bg-onyx-raised/50 p-12 text-center space-y-3">
            <Calendar className="h-8 w-8 text-bone-muted mx-auto" />
            <p className="text-bone-muted text-sm">Aucun événement à votre actif pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <article
                key={evt.id}
                className="group p-6 bg-onyx-raised/60 hover:bg-onyx-raised border border-onyx-line rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-bone-faint">
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
                    <span>{evt.location || 'Lieu non spécifié'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${evt.id}`}
                      className="p-2 rounded-full border border-onyx-line hover:bg-white/10 text-bone transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 rounded-full border border-red-500/30 hover:bg-red-500/10 text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

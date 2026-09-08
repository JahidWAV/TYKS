'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2, Edit3 } from 'lucide-react';
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

  // 1. Gestion de la session Supabase
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

  // Connexion Google directe depuis le sous-domaine
  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/organisateur`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setAuthLoading(false);
    }
  };

  // Suppression d'un événement
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

  // Écran de connexion intégré propre au sous-domaine Pro
  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-bone">Espace Organisateur Pro</h1>
          <p className="max-w-sm text-sm text-bone-muted">
            Connecte-toi pour piloter tes ventes, créer et configurer tes événements sur Tyks.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="inline-flex items-center gap-3 rounded-full bg-bone px-8 py-4 text-sm font-semibold text-onyx transition hover:bg-white disabled:opacity-50"
        >
          {authLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          <span>Se connecter avec Google</span>
        </button>
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-bone">Tableau de bord</h1>
          <p className="text-sm text-bone-muted">Gère tes événements, modifications et suppressions</p>
        </div>
        <Link
          href="/organisateur/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx transition hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Créer un événement
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-onyx-line bg-onyx-raised/50 p-12 text-center space-y-3">
          <Calendar className="h-8 w-8 text-bone-muted mx-auto" />
          <p className="text-bone-muted text-sm">Aucun événement à ton actif pour le moment.</p>
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
                    href={`/organisateur/${evt.id}`}
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
  );
}

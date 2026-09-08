'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2, Calendar, MapPin } from 'lucide-react';
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

  // 1. Récupération de l'utilisateur connecté via Supabase Auth
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

  // 1. En attente d'initialisation
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
      </div>
    );
  }

  // 2. Non authentifié
  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="max-w-xs text-sm text-bone-muted">
          Connecte-toi pour accéder à l&apos;espace organisateur.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-white"
        >
          <span>Se connecter sur le site principal</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // 3. Chargement des données organisateur
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
      </div>
    );
  }

  // 4. Authentifié et chargé
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-bone">Espace Organisateur</h1>
          <p className="text-sm text-bone-muted">Gère tes événements et ta billetterie</p>
        </div>
        <Link
          href="/organisateur/evenements/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx transition hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Créer un événement
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-onyx-line bg-onyx-raised/50 p-12 text-center space-y-3">
          <Calendar className="h-8 w-8 text-bone-muted mx-auto" />
          <p className="text-bone-muted text-sm">Aucun événement créé pour le moment.</p>
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

                <Link
                  href={`/organisateur/evenements/${evt.id}`}
                  className="inline-flex items-center gap-1.5 bg-bone text-onyx font-semibold text-xs px-4 py-2 rounded-full transition-colors hover:bg-white"
                >
                  Gérer
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

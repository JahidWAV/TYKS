'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { ArrowUpRight, Pencil, Trash2, Plus } from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import type { OrgRole } from '@/lib/organizer';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  cancelled: 'Annulé',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrganizerDashboard() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();

  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [events, setEvents] = useState<IortiEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/events?mine=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();

      if (res.status === 403) {
        // Pas encore d'espace organisateur — on affiche l'onboarding.
        setRole(null);
        setEvents([]);
        return;
      }
      if (!res.ok) {
        setError(body.error ?? 'Erreur inconnue.');
        return;
      }
      setRole(body.role);
      setEvents(body.events);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setChecking(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (ready && authenticated) loadDashboard();
    else setChecking(false);
  }, [ready, authenticated, loadDashboard]);

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault();
    if (!onboardingName.trim()) return;
    setOnboardingBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/organizer/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: onboardingName.trim() }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Impossible de créer l'espace organisateur.");
        return;
      }
      await loadDashboard();
    } finally {
      setOnboardingBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer définitivement cet événement ?')) return;
    setDeletingId(id);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'Suppression impossible.');
        return;
      }
      setEvents((prev) => prev.filter((evt) => evt.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (!ready || checking) {
    return (
      <div className="min-h-screen bg-void text-ink flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-gold/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-void text-ink flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-ink-muted text-sm max-w-xs">
          Connecte-toi pour accéder à l&apos;espace organisateur.
        </p>
        <button
          onClick={login}
          className="inline-flex items-center gap-2.5 bg-ink hover:bg-white text-void font-semibold px-7 py-3.5 rounded-full transition-colors"
        >
          <span>Se connecter</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Pas encore d'organisation : onboarding, comme "Je veux organiser un
  // événement" chez Shotgun.
  if (!role) {
    return (
      <div className="min-h-screen bg-void bg-night-glow text-ink flex items-center justify-center px-6">
        <form
          onSubmit={handleOnboard}
          className="w-full max-w-sm bg-surface border border-surface-hair rounded-2xl p-7"
        >
          <h1 className="font-display text-xl font-bold text-ink mb-2">Devenir organisateur</h1>
          <p className="text-sm text-ink-faint mb-6">
            Crée ton espace pour publier et gérer tes événements.
          </p>
          <label className="block text-xs text-ink-faint mb-2">Nom de ton organisation</label>
          <input
            value={onboardingName}
            onChange={(e) => setOnboardingName(e.target.value)}
            placeholder="Ex : Nuits Fauves"
            className="w-full bg-surface-raised border border-surface-hair rounded-xl px-4 py-3 text-sm text-ink mb-4 outline-none focus:border-gold/40"
          />
          {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={onboardingBusy}
            className="w-full bg-ink hover:bg-white text-void font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
          >
            {onboardingBusy ? 'Création…' : 'Créer mon espace organisateur'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void bg-night-glow text-ink pt-10 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tightest text-ink">Mes événements</h1>
            <p className="text-sm text-ink-faint mt-1">
              Rôle : <span className="text-gold-soft">{role}</span>
            </p>
          </div>
          {(role === 'owner' || role === 'editor') && (
            <Link
              href="/organisateur/nouveau"
              className="inline-flex items-center gap-2 bg-ink hover:bg-white text-void font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouvel événement
            </Link>
          )}
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {events.length === 0 ? (
          <p className="text-sm text-ink-faint">Aucun événement pour l&apos;instant.</p>
        ) : (
          <div className="divide-y divide-surface-hair border-y border-surface-hair">
            {events.map((evt) => (
              <div key={evt.id} className="flex items-center justify-between py-5 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-ink text-sm truncate">{evt.title}</h4>
                    <span className="text-[10px] font-medium text-ink-faint border border-surface-hair px-2 py-0.5 rounded-full shrink-0">
                      {STATUS_LABEL[evt.status] ?? evt.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-faint mt-1">
                    {evt.location} · {formatDate(evt.starts_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(role === 'owner' || role === 'editor') && (
                    <Link
                      href={`/organisateur/${evt.id}`}
                      className="p-2 rounded-lg border border-surface-hair text-ink-muted hover:text-ink hover:border-white/20 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  )}
                  {role === 'owner' && (
                    <button
                      onClick={() => handleDelete(evt.id)}
                      disabled={deletingId === evt.id}
                      className="p-2 rounded-lg border border-surface-hair text-ink-muted hover:text-red-400 hover:border-red-400/30 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

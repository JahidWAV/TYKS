'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2 } from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import type { OrgRole } from '@/lib/organizer';
import CustomAuthModal from '@/components/CustomAuthModal';

export default function OrganizerDashboard() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<IortiEvent[]>([]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      // Charge tes événements/données organisateur ici via fetch()
      // Exemple :
      // const res = await fetch('/api/organizer/events', { headers: { Authorization: `Bearer ${token}` } });
      // const data = await res.json();
      // setEvents(data.events);
    } catch (err) {
      console.error('Erreur de chargement :', err);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (ready && authenticated) {
      loadDashboard();
    }
  }, [ready, authenticated, loadDashboard]);

  // 1. En attente d'initialisation de Privy
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
      </div>
    );
  }

  // 2. Non authentifié
  if (!authenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="max-w-xs text-sm text-bone-muted">
          Connecte-toi pour accéder à l&apos;espace organisateur.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2.5 rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-white"
        >
          <span>Se connecter</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>

        <CustomAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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
        <div className="rounded-2xl border border-onyx-line bg-onyx-raised/50 p-12 text-center">
          <p className="text-bone-muted">Aucun événement trouvé pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Liste des événements */}
        </div>
      )}
    </div>
  );
}

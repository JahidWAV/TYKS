'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { IortiEvent } from '@/types/event';

export default function ManageEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const { ready, authenticated } = usePrivy();
  const [event, setEvent] = useState<IortiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Erreur Supabase :', error.message);
      } else {
        setEvent(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (ready && authenticated) {
      fetchEvent();
    }
  }, [ready, authenticated, fetchEvent]);

  // Passer le statut de l'événement de 'draft' à 'published' (ou inversement)
  const toggleStatus = async () => {
    if (!event) return;
    const newStatus = event.status === 'published' ? 'draft' : 'published';

    try {
      setUpdating(true);
      const { error } = await supabaseBrowser
        .from('events')
        .update({ status: newStatus })
        .eq('id', event.id);

      if (error) {
        alert("Erreur lors de la mise à jour du statut.");
      } else {
        setEvent({ ...event, status: newStatus });
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <p className="text-bone-muted">Événement introuvable.</p>
        <Link href="/organisateur" className="mt-4 inline-block text-xs text-bone underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx text-bone pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/organisateur"
          className="inline-flex items-center gap-2 text-xs text-bone-faint hover:text-bone transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux événements</span>
        </Link>

        {/* Header événement */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-onyx-line pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
                  event.status === 'published'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                {event.status === 'published' ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> Publié
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" /> En attente de validation (Brouillon)
                  </>
                )}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-bone">{event.title}</h1>
          </div>

          {/* Action de publication manuelle */}
          <button
            onClick={toggleStatus}
            disabled={updating}
            className="inline-flex items-center gap-2 bg-bone hover:bg-white text-onyx font-semibold px-5 py-2.5 rounded-full text-xs transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            {updating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : event.status === 'published' ? (
              'Repasser en brouillon'
            ) : (
              'Valider et publier'
            )}
          </button>
        </div>

        {/* Détails de l'événement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Informations</h2>
              <p className="text-sm text-bone-muted leading-relaxed">
                {event.description || 'Aucune description fournie.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4 text-xs">
              <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Détails clés</h2>
              <div className="flex items-center gap-2 text-bone-muted">
                <MapPin className="w-4 h-4 text-bone-faint" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-bone-muted">
                <Calendar className="w-4 h-4 text-bone-faint" />
                <span>{new Date(event.starts_at).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

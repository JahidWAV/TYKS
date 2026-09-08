'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Loader2, Calendar, MapPin, Sparkles, ArrowUpRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { IortiEvent } from '@/types/event';

export default function EventPublicPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<IortiEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!error && data) {
        setEvent(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-onyx text-bone flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-onyx text-bone flex flex-col">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center flex-1 flex flex-col items-center justify-center">
          <p className="text-bone-muted text-sm mb-4">Cet événement est introuvable.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-bone text-onyx font-semibold text-xs px-6 py-3 rounded-full transition-colors hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </div>
    );
  }

  const evtData = event as any;
  const priceFormatted = evtData.price && parseFloat(evtData.price) > 0 
    ? `${parseFloat(evtData.price).toFixed(2)} €` 
    : 'Gratuit';

  return (
    <div className="min-h-screen bg-onyx text-bone font-sans antialiased selection:bg-bone/25 selection:text-bone">
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-10 pb-24">
          {/* Retour */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-bone-faint hover:text-bone transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux événements</span>
            </Link>
          </div>

          {/* Grille Principale */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
            
            {/* Colonne Gauche */}
            <div className="space-y-8">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-onyx-line bg-onyx-raised shadow-2xl">
                {evtData.image_url ? (
                  <img
                    src={evtData.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-onyx-raised to-onyx text-bone-faint">
                    <Sparkles className="w-10 h-10 mb-2 opacity-40" />
                    <span className="font-mono text-xs tracking-widest uppercase">TYKS Experience</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-bone leading-[1.1]">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-bone-muted border-y border-onyx-line py-4 font-mono">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-bone-faint" />
                    <span>
                      {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-bone-faint" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="bg-onyx-raised/60 border border-onyx-line rounded-3xl p-8 space-y-4">
                <h3 className="font-display text-lg font-bold text-bone">À propos de l&apos;événement</h3>
                <p className="text-sm text-bone-muted leading-relaxed whitespace-pre-line">
                  {event.description || 'Aucune description détaillée fournie.'}
                </p>
              </div>
            </div>

            {/* Colonne Droite (Sticky) */}
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="bg-onyx-raised border border-onyx-line rounded-3xl p-8 space-y-6 shadow-xl backdrop-blur-xl">
                <div>
                  <p className="text-xs font-mono text-bone-faint uppercase tracking-wider">Tarif d&apos;accès</p>
                  <p className="font-display text-4xl font-extrabold text-bone mt-1">{priceFormatted}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-onyx-line text-xs text-bone-muted">
                  <div className="flex justify-between">
                    <span>Frais de service</span>
                    <span className="text-emerald-400 font-mono">0,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation du pass</span>
                    <span className="text-bone font-mono">Instantanée</span>
                  </div>
                </div>

                <button
                  onClick={() => alert("Module de génération de pass en cours d'activation")}
                  className="w-full inline-flex items-center justify-center gap-2 bg-bone text-onyx font-semibold text-xs tracking-wide py-4 rounded-full transition-all hover:bg-white hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                >
                  <span>Obtenir mon pass</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-bone-faint leading-relaxed">
                  Accès sécurisé par QR Code. Présentez votre pass à l&apos;entrée.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Loader2, Calendar, MapPin, Sparkles, ArrowUpRight, ChevronRight, X } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { IortiEvent } from '@/types/event';

export default function EventCompactPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<IortiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
          <p className="text-bone-muted text-sm mb-4">Événement introuvable.</p>
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
    <div className="h-screen bg-onyx text-bone font-sans antialiased selection:bg-bone/25 selection:text-bone overflow-hidden flex flex-col">
      <div className="grain" aria-hidden="true" />
      <Navbar />

      {/* Conteneur principal optimisé pour tenir sur un seul écran */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col justify-between">
        
        {/* Navigation retour discrète */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-bone-faint hover:text-bone transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>

        {/* Grille principale : Affiche verticale à gauche / Blocs de droite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          
          {/* GAUCHE : Affiche au format strictement vertical (ex: 3/4 ou 4/5) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative aspect-[3/4] w-full max-w-[340px] lg:max-w-none h-[420px] lg:h-[500px] overflow-hidden rounded-2xl border border-onyx-line bg-onyx-raised shadow-2xl">
              {evtData.image_url ? (
                <img
                  src={evtData.image_url}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-onyx-raised to-onyx text-bone-faint">
                  <Sparkles className="w-8 h-8 mb-2 opacity-40" />
                  <span className="font-mono text-[10px] tracking-widest uppercase">TYKS Experience</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-onyx/80 backdrop-blur-md border border-onyx-line text-bone font-mono text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {event.status === 'published' ? 'Officiel' : 'Brouillon'}
                </span>
              </div>
            </div>
          </div>

          {/* DROITE : Prix en haut, Détails essentiels en bas */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Titre & Infos rapides */}
            <div className="space-y-2">
              <h1 className="font-display text-2xl lg:text-4xl font-extrabold tracking-tight text-bone leading-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-bone-muted font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-bone-faint" />
                  <span>
                    {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-bone-faint" />
                  <span className="truncate max-w-[200px]">{event.location}</span>
                </div>
              </div>
            </div>

            {/* PRIX (Haut droite) */}
            <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[10px] font-mono text-bone-faint uppercase tracking-wider">Tarif d&apos;accès</p>
                <p className="font-display text-2xl lg:text-3xl font-extrabold text-bone mt-0.5">{priceFormatted}</p>
              </div>
              <button
                onClick={() => alert("Module de génération de pass en cours d'activation")}
                className="inline-flex items-center gap-2 bg-bone text-onyx font-semibold text-xs tracking-wide px-6 py-3 rounded-full transition-all hover:bg-white hover:scale-[1.01] shadow-md"
              >
                <span>Obtenir mon pass</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DÉTAILS & DESCRIPTION COURTE (Bas droite) */}
            <div className="bg-onyx-raised/60 border border-onyx-line rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-bone-faint uppercase tracking-wider">À propos</h3>
                {event.description && event.description.length > 120 && (
                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="inline-flex items-center gap-1 text-xs text-bone hover:underline font-medium"
                  >
                    <span>Voir plus de détails</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-bone-muted leading-relaxed line-clamp-3">
                {event.description || 'Aucune description fournie.'}
              </p>
            </div>

          </div>
        </div>

        <div className="h-4" />
      </main>

      {/* MODAL POUR "VOIR PLUS DE DÉTAILS" */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-onyx-raised border border-onyx-line rounded-3xl max-w-xl w-full p-8 space-y-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-6 right-6 text-bone-faint hover:text-bone transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-bone-faint uppercase tracking-wider">Détails complets</span>
              <h2 className="font-display text-2xl font-bold text-bone">{event.title}</h2>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs text-bone-muted leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
            <div className="pt-4 border-t border-onyx-line flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-bone text-onyx font-semibold text-xs px-5 py-2.5 rounded-full hover:bg-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

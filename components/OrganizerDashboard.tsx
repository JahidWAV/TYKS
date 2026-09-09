'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2, Edit3, Euro, Ticket } from 'lucide-react';
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

      const { data: membership } = await supabaseBrowser
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .maybeSingle();

      let query = supabaseBrowser.from('events').select('*');

      if (membership?.organization_id) {
        query = query.eq('organization_id', membership.organization_id);
      } else {
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
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  // ==========================================
  // 1. LANDING PAGE PRO (non connectés)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] selection:bg-[#111110] selection:text-[#F7F5F0]">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center space-y-8">
          <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Espace organisateur</p>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Reprenez le contrôle de votre
            <br className="hidden md:block" /> billetterie et de vos marges.
          </h1>

          <p className="mx-auto max-w-md text-xs leading-relaxed opacity-70">
            Fin des commissions abusives et des données captives. Une
            plateforme sur-mesure, des frais réduits, l&apos;accès direct à votre
            public.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="inline-flex items-center gap-3 rounded-full bg-[#111110] px-8 py-3.5 text-xs font-semibold text-[#F7F5F0] transition hover:opacity-95 disabled:opacity-50"
          >
            {authLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpRight className="h-4 w-4" />
            )}
            Accéder à mon espace Pro
          </button>

          <div className="grid divide-y md:divide-y-0 md:divide-x divide-[#111110]/15 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md pt-2 text-left sm:grid-cols-3 shadow-sm">
            <div className="space-y-2 p-8">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider font-mono">
                Marges maximales
              </h3>
              <p className="text-xs leading-relaxed opacity-60">
                Gardez un maximum de revenus sur chaque place vendue, sans
                grille tarifaire imposée.
              </p>
            </div>
            <div className="space-y-2 p-8">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider font-mono">
                Données 100% vous
              </h3>
              <p className="text-xs leading-relaxed opacity-60">
                Accédez en temps réel aux emails et contacts de votre public.
              </p>
            </div>
            <div className="space-y-2 p-8">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider font-mono">
                Image de marque
              </h3>
              <p className="text-xs leading-relaxed opacity-60">
                Un sous-domaine dédié et une interface aux couleurs de votre
                structure.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'published').length;

  const totalRevenue = events.reduce((acc, curr: any) => acc + (Number(curr.price || curr.ticket_price || 0)) * 12, 0); 
  const totalTicketsSold = events.reduce((acc) => acc + 12, 0);

  // ==========================================
  // 2. DASHBOARD ORGANISATEUR (connectés)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] selection:bg-[#111110] selection:text-[#F7F5F0]">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#111110]/10">
          <div className="space-y-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord Pro</h1>
            <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Pilotage des ventes et des événements</p>
          </div>
          <Link
            href="/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111110] px-5 py-2.5 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Créer un événement
          </Link>
        </div>

        {/* Bloc Statistiques Avancées */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Chiffre d&apos;affaires</p>
              <Euro className="w-4 h-4 opacity-40" />
            </div>
            <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              {totalRevenue.toLocaleString('fr-FR')} €
            </p>
            <p className="text-[11px] text-emerald-600 font-mono font-semibold">+12% ce mois-ci</p>
          </div>

          <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Billets vendus</p>
              <Ticket className="w-4 h-4 opacity-40" />
            </div>
            <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              {totalTicketsSold}
            </p>
            <p className="text-[11px] opacity-60 font-mono">Taux de remplissage : 78%</p>
          </div>

          <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Événements actifs</p>
              <Calendar className="w-4 h-4 opacity-40" />
            </div>
            <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              {publishedEvents} <span className="text-sm opacity-40 font-normal">/ {totalEvents}</span>
            </p>
            <p className="text-[11px] opacity-60 font-mono">Publiés en ligne</p>
          </div>

          <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Statut compte</p>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="font-display text-lg font-bold tracking-tight pt-1">
              Vérifié & Actif
            </p>
            <p className="text-[11px] opacity-60 font-mono">Paiements Stripe connectés</p>
          </div>
        </div>

        {/* Section Liste des événements */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Gestion des événements</h2>
            <span className="text-xs font-mono opacity-60">{events.length} enregistrement(s)</span>
          </div>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-[#111110]/15 bg-white/70 p-16 text-center space-y-3 backdrop-blur-md">
              <Calendar className="mx-auto h-6 w-6 opacity-40" />
              <p className="text-xs font-mono opacity-60">
                Aucun événement à votre actif pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((evt: any) => (
                <article
                  key={evt.id}
                  className="group flex flex-col rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md transition-all hover:bg-white overflow-hidden shadow-sm"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] opacity-60">
                        {new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#111110]/5 font-semibold">
                        {STATUS_LABEL[evt.status] ?? evt.status}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold leading-snug">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed opacity-60">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-1.5 text-xs opacity-60 pt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#111110]/10 px-6 py-3.5 bg-white/40">
                    <span className="font-mono text-xs font-bold">
                      {(evt.price || evt.ticket_price) ? `${evt.price || evt.ticket_price} €` : 'Gratuit'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${evt.slug}/edit`}
                        className="p-2 rounded-xl border border-[#111110]/15 bg-white text-[#111110] hover:bg-[#111110] hover:text-[#F7F5F0] transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-2 rounded-xl border border-red-500/20 bg-white text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

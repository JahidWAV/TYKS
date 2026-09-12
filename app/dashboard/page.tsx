'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2, Edit3, 
  Euro, Ticket, Search, RefreshCw, Zap, TrendingUp, Users, ShieldCheck, Database 
} from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import { supabaseBrowser } from '@/lib/supabase-browser';
import CustomAuthModal from '@/components/CustomAuthModal';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  cancelled: 'Annulé',
};

interface DashboardStats {
  totalRevenue: number;
  totalTicketsSold: number;
  totalCapacity: number;
  publishedEventsCount: number;
  totalEventsCount: number;
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<IortiEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalCapacity: 0,
    publishedEventsCount: 0,
    totalEventsCount: 0,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const loadDashboard = useCallback(async (userId: string, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

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

      const { data: eventsData, error } = await query.order('starts_at', { ascending: true });

      if (error) {
        console.error('Erreur Supabase :', error.message);
        return;
      }

      if (eventsData) {
        setEvents(eventsData);

        const totalEventsCount = eventsData.length;
        const publishedEventsCount = eventsData.filter((e) => e.status === 'published').length;

        let calculatedRevenue = 0;
        let calculatedTickets = 0;
        let calculatedCapacity = 0;

        eventsData.forEach((evt: any) => {
          const price = Number(evt.price || evt.ticket_price || 0);
          const sold = Number(evt.tickets_sold || evt.sold_count || 0);
          const capacity = Number(evt.capacity || evt.max_attendees || 0);

          calculatedRevenue += price * sold;
          calculatedTickets += sold;
          calculatedCapacity += capacity;
        });

        setStats({
          totalRevenue: calculatedRevenue,
          totalTicketsSold: calculatedTickets,
          totalCapacity: calculatedCapacity,
          publishedEventsCount,
          totalEventsCount,
        });
      }
    } catch (err) {
      console.error('Erreur de chargement du dashboard :', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (ready && user?.id) {
      loadDashboard(user.id);
    } else if (ready && !user) {
      setLoading(false);
    }
  }, [ready, user, loadDashboard]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer cet événement ?')) return;

    try {
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
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
  // 1. LANDING PAGE PRO (Non connectés) - DA Identique page-15
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
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center gap-3 rounded-full bg-bone px-8 py-4 text-sm font-semibold text-onyx transition hover:bg-white shadow-lg shadow-bone/5 cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Accéder à mon espace Pro</span>
          </button>
        </div>

        {/* Grille Avantages / Comparatif rapide */}
        <div className="grid md:grid-cols-3 gap-6 pt-10 border-t border-onyx-line">
          <div className="p-8 rounded-2xl bg-onyx-raised/40 border border-onyx-line space-y-4">
            <div className="w-10 h-10 rounded-xl bg-bone/10 flex items-center justify-center text-bone">
              <Euro className="w-5 h-5" />
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

        <CustomAuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
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

  const filteredEvents = events.filter((evt: any) => {
    const matchesSearch = evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fillRate = stats.totalCapacity > 0 
    ? Math.round((stats.totalTicketsSold / stats.totalCapacity) * 100) 
    : 0;

  // ==========================================
  // 2. DASHBOARD ORGANISATEUR (Connectés) - DA page-15
  // ==========================================
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      
      {/* En-tête & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-bone">Tableau de bord Pro</h1>
          <p className="text-sm text-bone-muted">Pilotez vos événements et suivez vos performances en direct</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(user.id, true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-onyx-line bg-onyx-raised/60 px-4 py-2.5 text-sm font-semibold text-bone transition hover:bg-onyx-raised disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <Link
            href="/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx transition hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            Créer un événement
          </Link>
        </div>
      </div>

      {/* Statistiques Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-2">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Chiffre d&apos;affaires</span>
            <Euro className="w-4 h-4 text-bone-faint" />
          </div>
          <p className="font-display text-3xl font-bold text-bone">{stats.totalRevenue.toLocaleString('fr-FR')} €</p>
        </div>

        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-2">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Billets vendus</span>
            <Ticket className="w-4 h-4 text-bone-faint" />
          </div>
          <p className="font-display text-3xl font-bold text-bone">{stats.totalTicketsSold} <span className="text-xs font-normal text-bone-muted">({fillRate}%)</span></p>
        </div>

        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-2">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Événements publiés</span>
            <TrendingUp className="w-4 h-4 text-bone-faint" />
          </div>
          <p className="font-display text-3xl font-bold text-bone">{stats.publishedEventsCount} <span className="text-xs font-normal text-bone-muted">/ {stats.totalEventsCount}</span></p>
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

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-onyx-line bg-onyx-raised/40">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-bone-faint" />
          <input
            type="text"
            placeholder="Rechercher par titre ou lieu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-onyx-line bg-onyx px-11 text-xs text-bone placeholder:text-bone-faint focus:outline-none focus:border-bone/40"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'published', 'draft', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-bone text-onyx font-bold' 
                  : 'bg-onyx border border-onyx-line text-bone-muted hover:text-bone'
              }`}
            >
              {status === 'all' ? 'Tous' : STATUS_LABEL[status] || status}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des Événements */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-bone">Vos Événements ({filteredEvents.length})</h2>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-onyx-line bg-onyx-raised/50 p-12 text-center space-y-3">
            <Calendar className="h-8 w-8 text-bone-muted mx-auto" />
            <p className="text-bone-muted text-sm">
              {events.length === 0 ? "Aucun événement à votre actif pour le moment." : "Aucun événement ne correspond à vos filtres."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
              return (
                <article
                  key={evt.id}
                  className="group p-6 bg-onyx-raised/60 hover:bg-onyx-raised border border-onyx-line rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-bone-faint">
                        {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Date non définie'}
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
                      <span className="truncate max-w-[140px]">{evt.location || 'Lieu non spécifié'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-bone font-semibold mr-1">
                        {eventPrice > 0 ? `${eventPrice} €` : 'Gratuit'}
                      </span>
                      <Link
                        href={`/events/${evt.slug || evt.id}/edit`}
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
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

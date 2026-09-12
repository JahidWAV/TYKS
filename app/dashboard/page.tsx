'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2, Edit3, 
  Euro, Ticket, Search, RefreshCw, Layers, TrendingUp 
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

export default function OrganizerOverviewDashboard() {
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
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-bone-muted" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, affichage de l'accès propre avec modale (évite la 404 /login)
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-onyx-line bg-onyx-raised px-4 py-1.5 text-xs text-bone-muted">
          <Layers className="w-3.5 h-3.5 text-bone" />
          <span>Espace Organisateur Sécurisé</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-bone tracking-tight">
          Connectez-vous pour accéder à votre overview.
        </h1>
        <p className="text-sm text-bone-muted max-w-md mx-auto">
          Pilotez vos ventes, suivez vos jauges et gérez vos événements en toute simplicité.
        </p>
        <div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-bone px-8 py-3.5 text-sm font-semibold text-onyx transition hover:bg-white cursor-pointer shadow-lg shadow-bone/5"
          >
            <span>Se connecter</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
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
      <div className="flex min-h-[80vh] items-center justify-center">
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      
      {/* En-tête de l'Overview Organisateur */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-onyx-line pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-bone-muted uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 text-bone" />
            <span>Dashboard Organisateur · Overview</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-bone tracking-tight">Vue d&apos;ensemble</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => user?.id && loadDashboard(user.id, true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-onyx-line bg-onyx-raised/60 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-bone transition hover:bg-onyx-raised disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold text-onyx transition hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvel événement</span>
          </Link>
        </div>
      </div>

      {/* Blocs d'Overview chiffrés (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-3">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Chiffre d&apos;affaires</span>
            <Euro className="w-4 h-4 text-bone" />
          </div>
          <p className="font-display text-3xl font-bold text-bone tracking-tight">
            {stats.totalRevenue.toLocaleString('fr-FR')} <span className="text-lg">€</span>
          </p>
          <p className="text-[11px] text-bone-muted font-mono">Volume brut global encaissé</p>
        </div>

        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-3">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Billets écoulés</span>
            <Ticket className="w-4 h-4 text-bone" />
          </div>
          <p className="font-display text-3xl font-bold text-bone tracking-tight">
            {stats.totalTicketsSold}
          </p>
          <p className="text-[11px] text-bone-muted font-mono">Taux de remplissage : {fillRate}%</p>
        </div>

        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-3">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Événements</span>
            <Calendar className="w-4 h-4 text-bone" />
          </div>
          <p className="font-display text-3xl font-bold text-bone tracking-tight">
            {stats.publishedEventsCount} <span className="text-sm font-normal text-bone-muted">/ {stats.totalEventsCount}</span>
          </p>
          <p className="text-[11px] text-bone-muted font-mono">Publiés / Total créés</p>
        </div>

        <div className="p-6 rounded-2xl border border-onyx-line bg-onyx-raised/40 space-y-3">
          <div className="flex items-center justify-between text-bone-muted">
            <span className="text-xs uppercase tracking-wider font-mono">Performance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-display text-sm font-bold text-emerald-400 pt-1 tracking-wide uppercase">
            Flux actifs & stables
          </p>
          <p className="text-[11px] text-bone-muted font-mono">Synchronisation temps réel</p>
        </div>
      </div>

      {/* Barre de recherche et filtres de l'overview */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl border border-onyx-line bg-onyx-raised/40">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-bone-muted" />
          <input
            type="text"
            placeholder="Filtrer les événements par titre ou lieu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-onyx-line bg-onyx px-11 text-xs text-bone placeholder:text-bone-muted focus:outline-none focus:border-bone/40 font-mono"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {['all', 'published', 'draft', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status 
                  ? 'bg-bone text-onyx font-bold shadow-sm' 
                  : 'bg-onyx border border-onyx-line text-bone-muted hover:text-bone'
              }`}
            >
              {status === 'all' ? 'Tous les statuts' : STATUS_LABEL[status] || status}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des événements de l'organisateur */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-bone">Gestion des événements</h2>
          <span className="text-xs font-mono text-bone-muted">{filteredEvents.length} résultat(s)</span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-onyx-line bg-onyx-raised/30 p-16 text-center space-y-4">
            <Calendar className="h-8 w-8 text-bone-muted mx-auto" />
            <p className="text-bone-muted text-xs font-mono uppercase tracking-wider">
              {events.length === 0 
                ? "Aucun événement enregistré sur ce compte pour l'instant." 
                : "Aucun événement ne correspond à vos critères de recherche."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
              return (
                <article
                  key={evt.id}
                  className="group p-6 bg-onyx-raised/50 hover:bg-onyx-raised border border-onyx-line rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-bone-muted uppercase tracking-wider">
                        {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Date non définie'}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                        evt.status === 'published' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : evt.status === 'cancelled'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-onyx border-onyx-line text-bone-muted'
                      }`}>
                        {STATUS_LABEL[evt.status] ?? evt.status}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-bone tracking-tight group-hover:text-white transition-colors">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="text-xs text-bone-muted line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-1.5 text-xs text-bone-muted pt-1">
                        <MapPin className="w-3.5 h-3.5 text-bone-faint shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-onyx-line flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-bone">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Gratuit'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${evt.slug || evt.id}/edit`}
                        className="p-2 rounded-xl border border-onyx-line hover:bg-white/10 text-bone transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
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

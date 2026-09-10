'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2, Edit3, 
  Euro, Ticket, Search, RefreshCw, ShieldCheck
} from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CustomAuthModal } from '@/components/CustomAuthModal';

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
    if (!confirm('Attention : Cette action est irréversible. Voulez-vous vraiment supprimer cet événement ?')) return;

    try {
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert("Impossible de supprimer l'événement en raison d'une contrainte technique.");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex flex-col lg:flex-row w-full overflow-hidden selection:bg-[#111110] selection:text-[#F7F5F0]">
        
        {/* Colonne gauche : Branding & Connexion */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-20 z-10 bg-[#F7F5F0]">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-xl bg-[#111110] text-[#F7F5F0] flex items-center justify-center font-bold text-xs tracking-wider">T</span>
            <span className="font-display font-bold text-base tracking-tight">TYKS Pro</span>
          </div>

          <div className="space-y-6 my-auto py-12">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wider">TYKS PRO · ESPACE ORGANISATEUR</p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Créez autant d&apos;événements que vous voulez.
            </h1>
            <p className="text-xs leading-relaxed opacity-70 max-w-md">
              Zéro abonnement, commission à la performance. Aucune limite de volume ni de jauge. Publiez vos événements en illimité et ne payez qu&apos;en cas de vente réussie.
            </p>
            <div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-3 rounded-full bg-[#111110] px-8 py-3.5 text-xs font-semibold text-[#F7F5F0] transition hover:opacity-95 shadow-sm"
              >
                <ArrowUpRight className="h-4 w-4" />
                Accéder à mon espace Pro
              </button>
            </div>
          </div>

          <div className="text-xs font-mono opacity-40">
            © TYKS Inc.
          </div>
        </div>

        {/* Colonne droite : Aperçu élégant du Dashboard en arrière-plan */}
        <div className="hidden lg:flex w-1/2 bg-[#111110] text-white p-12 relative overflow-hidden items-center justify-center select-none pointer-events-none">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-500/80"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-[10px] font-mono text-white/40">dashboard.tyks.app</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="h-2 w-12 bg-white/20 rounded"></div>
                <div className="h-6 w-20 bg-white/40 rounded"></div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="h-2 w-12 bg-white/20 rounded"></div>
                <div className="h-6 w-16 bg-white/40 rounded"></div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="h-2 w-12 bg-white/20 rounded"></div>
                <div className="h-6 w-14 bg-emerald-500/40 rounded"></div>
              </div>
            </div>

            <div className="h-40 bg-white/5 rounded-2xl border border-white/5 flex items-end p-4 gap-2">
              <div className="w-1/6 h-1/2 bg-white/20 rounded-t-lg"></div>
              <div className="w-1/6 h-3/4 bg-white/30 rounded-t-lg"></div>
              <div className="w-1/6 h-2/3 bg-white/20 rounded-t-lg"></div>
              <div className="w-1/6 h-full bg-white/50 rounded-t-lg"></div>
              <div className="w-1/6 h-4/5 bg-white/30 rounded-t-lg"></div>
              <div className="w-1/6 h-5/6 bg-white/40 rounded-t-lg"></div>
            </div>
          </div>
        </div>

        {/* Modale d'authentification personnalisée */}
        <CustomAuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />

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
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#111110]/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Accès Illimité (Sans Abonnement)
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Sales Overview</h1>
          <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Analysez et optimisez vos ventes en temps réel</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(user.id, true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#111110]/15 bg-white/70 px-4 py-2.5 text-xs font-semibold transition hover:bg-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <Link
            href="/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111110] px-5 py-2.5 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Créer un événement illimité
          </Link>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Chiffre d&apos;affaires</p>
            <Euro className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            {stats.totalRevenue.toLocaleString('fr-FR')} €
          </p>
          <p className="text-[11px] opacity-60 font-mono">Volume brut encaissé</p>
        </div>

        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Billets vendus</p>
            <Ticket className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            {stats.totalTicketsSold}
          </p>
          <p className="text-[11px] opacity-60 font-mono">Taux de remplissage : {fillRate}%</p>
        </div>

        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Événements publiés</p>
            <Calendar className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            {stats.publishedEventsCount} <span className="text-xs font-normal opacity-50">({stats.totalEventsCount} total)</span>
          </p>
          <p className="text-[11px] opacity-60 font-mono">Création illimitée</p>
        </div>

        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Modèle tarifaire</p>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="font-display text-base font-bold tracking-tight pt-1">
            Commission sur ventes
          </p>
          <p className="text-[11px] opacity-60 font-mono">0 € d&apos;abonnement fixe</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="text"
              placeholder="Rechercher par titre ou lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#111110]/15 bg-white/70 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#111110] transition"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['all', 'published', 'draft', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition whitespace-nowrap border ${
                  statusFilter === status 
                    ? 'bg-[#111110] text-[#F7F5F0] border-[#111110]' 
                    : 'bg-white/70 text-[#111110] border-[#111110]/15 hover:bg-white'
                }`}
              >
                {status === 'all' ? 'Tous' : STATUS_LABEL[status] || status}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs font-mono opacity-60 text-right">
          {filteredEvents.length} événement(s)
        </span>
      </div>

      {/* Liste des événements */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-[#111110]/15 bg-white/70 p-16 text-center space-y-3 backdrop-blur-md">
            <Calendar className="mx-auto h-6 w-6 opacity-40" />
            <p className="text-xs font-mono opacity-60">
              {events.length === 0 
                ? "Vous n'avez pas encore créé d'événement. Lancez-vous, c'est illimité !" 
                : "Aucun événement ne correspond à vos filtres."}
            </p>
            {events.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-5 py-2 text-xs font-semibold text-[#F7F5F0]"
                >
                  Créer mon premier événement
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
              return (
                <article
                  key={evt.id}
                  className="group flex flex-col rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md transition-all hover:bg-white overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] opacity-60">
                        {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Date non définie'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        evt.status === 'published' 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                          : evt.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-700 border border-red-500/20'
                          : 'bg-[#111110]/5 text-[#111110]'
                      }`}>
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
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Gratuit'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${evt.slug || evt.id}/edit`}
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
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

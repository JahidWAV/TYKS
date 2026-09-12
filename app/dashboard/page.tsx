'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, Plus, Loader2, Calendar, MapPin, Trash2, Edit3, 
  Euro, Ticket, Search, RefreshCw 
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
      <div className="min-h-screen bg-[#F5F5F7] text-black font-mono text-xs uppercase tracking-widest flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-black flex flex-col lg:flex-row w-full overflow-hidden selection:bg-black selection:text-white font-sans">
        
        {/* Colonne gauche : Branding & Connexion */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 z-10 bg-[#F5F5F7] border-b-2 lg:border-b-0 lg:border-r-2 border-black">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 border-2 border-black bg-black text-white flex items-center justify-center font-mono font-bold text-xs">T</span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest">TYKS Pro</span>
          </div>

          <div className="space-y-6 my-auto py-12">
            <span className="inline-block font-mono text-xs uppercase tracking-widest bg-black text-white px-3 py-1">
              TYKS PRO · ESPACE ORGANISATEUR
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.95]">
              Créez autant d&apos;événements que vous voulez.
            </h1>
            <p className="font-mono text-xs leading-relaxed text-neutral-600 max-w-md">
              Zéro abonnement, commission à la performance. Aucune limite de volume ni de jauge. Publiez vos événements en illimité et ne payez qu&apos;en cas de vente réussie.
            </p>
            <div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-black text-white font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none font-bold"
              >
                <span>Accéder à mon espace Pro</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            © TYKS Inc.
          </div>
        </div>

        {/* Colonne droite : Aperçu brut du Dashboard en arrière-plan */}
        <div className="hidden lg:flex w-1/2 bg-white p-12 relative overflow-hidden items-center justify-center select-none pointer-events-none">
          <div className="w-full max-w-lg bg-[#F5F5F7] border-2 border-black p-6 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 border border-black bg-black"></span>
                <span className="h-3 w-3 border border-black bg-white"></span>
                <span className="h-3 w-3 border border-black bg-black"></span>
              </div>
              <span className="text-xs font-mono uppercase tracking-wider">dashboard.tyks.app</span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-white border-2 border-black p-4 space-y-2">
                <div className="h-2 w-12 bg-neutral-200"></div>
                <div className="h-6 w-16 bg-black"></div>
              </div>
              <div className="bg-white border-2 border-black p-4 space-y-2">
                <div className="h-2 w-12 bg-neutral-200"></div>
                <div className="h-6 w-12 bg-black"></div>
              </div>
              <div className="bg-white border-2 border-black p-4 space-y-2">
                <div className="h-2 w-12 bg-neutral-200"></div>
                <div className="h-6 w-10 bg-black"></div>
              </div>
            </div>

            <div className="h-40 bg-white border-2 border-black flex items-end p-4 gap-2">
              <div className="w-1/6 h-1/2 bg-black"></div>
              <div className="w-1/6 h-3/4 bg-black"></div>
              <div className="w-1/6 h-2/3 bg-black"></div>
              <div className="w-1/6 h-full bg-black"></div>
              <div className="w-1/6 h-4/5 bg-black"></div>
              <div className="w-1/6 h-5/6 bg-black"></div>
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
      <div className="min-h-screen bg-[#F5F5F7] text-black font-mono text-xs uppercase tracking-widest flex items-center justify-center">
        Chargement...
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
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-black">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tighter uppercase leading-none">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(user.id, true)}
            disabled={refreshing}
            className="h-12 px-5 border-2 border-black bg-white hover:bg-black hover:text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <Link
            href="/new"
            className="h-12 px-6 border-2 border-black bg-black text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un événement illimité</span>
          </Link>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        <div className="p-6 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-600 font-bold">Chiffre d&apos;affaires</p>
            <Euro className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {stats.totalRevenue.toLocaleString('fr-FR')} €
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Volume brut encaissé</p>
        </div>

        <div className="p-6 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-600 font-bold">Billets vendus</p>
            <Ticket className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {stats.totalTicketsSold}
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Taux de remplissage : {fillRate}%</p>
        </div>

        <div className="p-6 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-600 font-bold">Événements publiés</p>
            <Calendar className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {stats.publishedEventsCount} <span className="text-xs font-normal text-neutral-500">({stats.totalEventsCount} total)</span>
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Création illimitée</p>
        </div>

        <div className="p-6 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-600 font-bold">Modèle tarifaire</p>
            <span className="h-3 w-3 border border-black bg-black animate-pulse" />
          </div>
          <p className="text-base font-bold tracking-tight pt-1 uppercase">
            Commission sur ventes
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">0 € d&apos;abonnement fixe</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
            <input
              type="text"
              placeholder="Rechercher par titre ou lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 border-2 border-black bg-white pl-11 pr-4 font-mono text-xs uppercase placeholder:text-neutral-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {['all', 'published', 'draft', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`h-12 px-4 border-2 border-black font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer font-bold ${
                  statusFilter === status 
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                {status === 'all' ? 'Tous' : STATUS_LABEL[status] || status}
              </button>
            ))}
          </div>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-600 text-right">
          {filteredEvents.length} événement(s)
        </span>
      </div>

      {/* Liste des événements */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="border-2 border-black bg-white p-16 text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Calendar className="mx-auto h-8 w-8 text-black" />
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
              {events.length === 0 
                ? "Vous n'avez pas encore créé d'événement. Lancez-vous, c'est illimité !" 
                : "Aucun événement ne correspond à vos filtres."}
            </p>
            {events.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 h-12 px-6 border-2 border-black bg-black text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Créer mon premier événement
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
              return (
                <article
                  key={evt.id}
                  className="group flex flex-col border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none overflow-hidden"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Date non définie'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 border-2 border-black text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : evt.status === 'cancelled'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-neutral-100 text-neutral-900'
                      }`}>
                        {STATUS_LABEL[evt.status] ?? evt.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold uppercase tracking-tight leading-snug">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs font-mono text-neutral-600 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 font-mono text-xs text-neutral-600 pt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t-2 border-black px-6 py-4 bg-[#F5F5F7]">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Gratuit'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${evt.slug || evt.id}/edit`}
                        className="w-10 h-10 border-2 border-black bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Modifier"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="w-10 h-10 border-2 border-black bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
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

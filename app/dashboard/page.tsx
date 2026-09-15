'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, Plus, Calendar, MapPin, Trash2, Edit3, 
  Euro, Ticket, Search, RefreshCw, ShieldCheck
} from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import { supabaseBrowser } from '@/lib/supabase-browser';
import CustomAuthModal from '@/components/CustomAuthModal';

const STATUS_LABEL: Record<string, string> = {
  draft: 'BROUILLON',
  published: 'PUBLIÉ',
  cancelled: 'ANNULÉ',
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
    if (!confirm('ATTENTION : CETTE ACTION EST IRRÉVERSIBLE. VOULEZ-VOUS VRAIMENT SUPPRIMER CET ÉVÉNEMENT ?')) return;

    try {
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert("IMPOSSIBLE DE SUPPRIMER L'ÉVÉNEMENT EN RAISON D'UNE CONTRAINTE TECHNIQUE.");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white/60 font-grotesque text-xs flex items-center justify-center uppercase">
        CHARGEMENT...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col lg:flex-row w-full overflow-hidden selection:bg-white selection:text-black font-grotesque uppercase">
        
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 z-10 bg-[#0f0f0f] border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-white text-black flex items-center justify-center font-grotesque font-bold text-xs">T</span>
            <span className="font-grotesque text-xs font-bold text-white">TYKS PRO</span>
          </div>

          <div className="space-y-6 my-auto py-12">
            <span className="inline-block font-grotesque text-[11px] bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-full">
              TYKS PRO · ESPACE ORGANISATEUR
            </span>
            <h1 className="text-4xl lg:text-6xl font-grotesque font-normal tracking-tight text-white leading-[1.05]">
              REPRENEZ LE CONTRÔLE DE VOTRE BILLETTERIE ET DE VOS MARGES.
            </h1>
            <p className="font-grotesque text-xs leading-relaxed text-white/70 max-w-md">
              FINS DE COMMISSIONS ABUSIVES ET DE DONNÉES CAPTIVES. TYKS PRO VOUS OFFRE UNE PLATEFORME SUR-MESURE, DES FRAIS RÉDUITS ET L&apos;ACCÈS DIRECT À VOTRE COMMUNAUTÉ.
            </p>
            <div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-grotesque text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-3 cursor-pointer font-bold rounded-xl shadow-lg"
              >
                <span>ACCÉDER À MON ESPACE PRO</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="font-grotesque text-xs text-white/40">
            © TYKS INC.
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 bg-neutral-900 p-12 relative overflow-hidden items-center justify-center select-none pointer-events-none">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/15 rounded-3xl p-6 space-y-6 shadow-xl font-grotesque">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white/20"></span>
                <span className="h-3 w-3 rounded-full bg-white/20"></span>
                <span className="h-3 w-3 rounded-full bg-white/20"></span>
              </div>
              <span className="text-xs font-grotesque text-white/50 lowercase">dashboard.tyks.app</span>
            </div>
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
      <div className="min-h-screen bg-[#0f0f0f] text-white/60 font-grotesque text-xs flex items-center justify-center uppercase">
        CHARGEMENT...
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
    <div className="w-full px-6 lg:px-12 pt-4 pb-12 space-y-8 font-grotesque text-white bg-[#0f0f0f] min-h-full uppercase">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-xs font-grotesque bg-white/10 font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-white" /> ACCÈS ILLIMITÉ (SANS ABONNEMENT)
            </span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-grotesque font-normal tracking-tight leading-none text-white">APERÇU DES VENTES</h1>
          <p className="text-xs font-grotesque text-white/60">ANALYSEZ ET OPTIMISEZ VOS VENTES EN TEMPS RÉEL</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(user.id, true)}
            disabled={refreshing}
            className="h-12 px-5 rounded-xl border border-white/20 bg-neutral-900 hover:bg-neutral-800 text-white font-grotesque text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer font-bold shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">ACTUALISER</span>
          </button>
          <Link
            href="/new"
            className="h-12 px-6 rounded-xl bg-white text-black hover:bg-neutral-200 font-grotesque text-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>CRÉER UN ÉVÉNEMENT ILLIMITÉ</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-grotesque">
        <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60 font-bold">CHIFFRE D&apos;AFFAIRES</p>
            <Euro className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {stats.totalRevenue.toLocaleString('fr-FR')} €
          </p>
          <p className="text-[11px] text-white/50">VOLUME BRUT ENCAISSÉ</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60 font-bold">BILLETS VENDUS</p>
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {stats.totalTicketsSold}
          </p>
          <p className="text-[11px] text-white/50">TAUX DE REMPLISSAGE : {fillRate}%</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60 font-bold">ÉVÉNEMENTS PUBLIÉS</p>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {stats.publishedEventsCount} <span className="text-xs font-normal text-white/50">({stats.totalEventsCount} TOTAL)</span>
          </p>
          <p className="text-[11px] text-white/50">CRÉATION ILLIMITÉE</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60 font-bold">MODÈLE TARIFAIRE</p>
            <span className="h-3 w-3 rounded-full bg-white animate-pulse" />
          </div>
          <p className="text-base font-bold tracking-tight pt-1 text-white">
            COMMISSION SUR VENTES
          </p>
          <p className="text-[11px] text-white/50">0 € D&apos;ABONNEMENT FIXE</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="RECHERCHER PAR TITRE OU LIEU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl border border-white/20 bg-neutral-900 pl-11 pr-4 font-grotesque text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white shadow-xs"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1 font-grotesque">
            {['all', 'published', 'draft', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`h-12 px-4 rounded-xl border font-grotesque text-xs transition-all whitespace-nowrap cursor-pointer font-bold shadow-xs ${
                  statusFilter === status 
                    ? 'bg-white text-black border-white' 
                    : 'bg-neutral-900 border-white/20 text-white/80 hover:bg-neutral-800'
                }`}
              >
                {status === 'all' ? 'TOUS' : STATUS_LABEL[status] || status}
              </button>
            ))}
          </div>
        </div>
        <span className="font-grotesque text-xs text-white/60 text-right">
          {filteredEvents.length} ÉVÉNEMENT(S)
        </span>
      </div>

      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-16 text-center space-y-4 shadow-xs font-grotesque">
            <Calendar className="mx-auto h-8 w-8 text-white" />
            <p className="font-grotesque text-xs text-white/60">
              {events.length === 0 
                ? "VOUS N'AVEZ PAS ENCORE CRÉÉ D'ÉVÉNEMENT. LANCEZ-VOUS, C'EST ILLIMITÉ !" 
                : "AUCUN ÉVÉNEMENT NE CORRESPOND À VOS FILTRES."}
            </p>
            {events.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-black font-grotesque text-xs font-bold hover:bg-neutral-200 transition-all shadow-md"
                >
                  CRÉER MON PREMIER ÉVÉNEMENT
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
                  className="group flex flex-col rounded-2xl border border-white/15 bg-neutral-900 shadow-xs transition-all hover:border-white hover:shadow-md overflow-hidden font-grotesque"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between font-grotesque">
                      <span className="text-[11px] text-white/50 font-bold">
                        {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).toUpperCase() : 'DATE NON DÉFINIE'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                        evt.status === 'published' 
                          ? 'bg-white/10 text-white border-white/20' 
                          : evt.status === 'cancelled'
                          ? 'bg-neutral-800 text-white/60 border-white/20 line-through'
                          : 'bg-neutral-950 text-white/60 border-white/20'
                      }`}>
                        {STATUS_LABEL[evt.status] ?? evt.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-grotesque font-normal leading-snug text-white">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs font-grotesque text-white/70 leading-relaxed font-light">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 font-grotesque text-xs text-white/70 pt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-white" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-neutral-950 font-grotesque">
                    <span className="font-grotesque text-xs font-bold text-white">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'GRATUIT'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${evt.slug || evt.id}/edit`}
                        className="w-10 h-10 rounded-xl border border-white/20 bg-neutral-900 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs"
                        title="MODIFIER"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="w-10 h-10 rounded-xl border border-white/20 bg-neutral-900 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs"
                        title="SUPPRIMER"
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

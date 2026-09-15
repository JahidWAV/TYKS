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
      <div className="min-h-screen bg-white text-[#1e3932]/60 font-mono text-xs flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-[#1e3932] flex flex-col lg:flex-row w-full overflow-hidden selection:bg-[#1e3932] selection:text-white font-sans">
        
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 z-10 bg-white border-b lg:border-b-0 lg:border-r border-[#1e3932]/10">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-[#1e3932] text-white flex items-center justify-center font-mono font-bold text-xs">T</span>
            <span className="font-mono text-xs font-bold text-[#1e3932]">TYKS Pro</span>
          </div>

          <div className="space-y-6 my-auto py-12">
            <span className="inline-block font-mono text-[11px] bg-[#1e3932]/10 border border-[#1e3932]/20 text-[#1e3932] px-3 py-1.5 rounded-full">
              TYKS Pro · Espace organisateur
            </span>
            <h1 className="text-4xl lg:text-6xl font-serif font-normal tracking-tight text-[#1e3932] leading-[1.05]">
              Reprenez le contrôle de votre billetterie et de vos marges.
            </h1>
            <p className="font-mono text-xs leading-relaxed text-[#1e3932]/70 max-w-md">
              Fins de commissions abusives et de données captives. Tyks Pro vous offre une plateforme sur-mesure, des frais réduits et l&apos;accès direct à votre communauté.
            </p>
            <div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-[#1e3932] text-white font-mono text-xs hover:bg-[#152a25] transition-colors flex items-center justify-center gap-3 cursor-pointer font-bold rounded-xl shadow-lg"
              >
                <span>Accéder à mon espace Pro</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="font-mono text-xs text-[#1e3932]/40">
            © TYKS Inc.
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 bg-[#f8faf9] p-12 relative overflow-hidden items-center justify-center select-none pointer-events-none">
          <div className="w-full max-w-lg bg-white border border-[#1e3932]/15 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1e3932]/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#1e3932]/20"></span>
                <span className="h-3 w-3 rounded-full bg-[#1e3932]/20"></span>
                <span className="h-3 w-3 rounded-full bg-[#1e3932]/20"></span>
              </div>
              <span className="text-xs font-mono text-[#1e3932]/50">dashboard.tyks.app</span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-[#f8faf9] border border-[#1e3932]/10 rounded-xl p-4 space-y-2">
                <div className="h-2 w-12 bg-[#1e3932]/20 rounded"></div>
                <div className="h-6 w-16 bg-[#1e3932] rounded opacity-90"></div>
              </div>
              <div className="bg-[#f8faf9] border border-[#1e3932]/10 rounded-xl p-4 space-y-2">
                <div className="h-2 w-12 bg-[#1e3932]/20 rounded"></div>
                <div className="h-6 w-12 bg-[#1e3932] rounded opacity-90"></div>
              </div>
              <div className="bg-[#f8faf9] border border-[#1e3932]/10 rounded-xl p-4 space-y-2">
                <div className="h-2 w-12 bg-[#1e3932]/20 rounded"></div>
                <div className="h-6 w-10 bg-[#1e3932] rounded opacity-90"></div>
              </div>
            </div>

            <div className="h-40 bg-[#f8faf9] border border-[#1e3932]/10 rounded-xl flex items-end p-4 gap-2">
              <div className="w-1/6 h-1/2 bg-[#1e3932]/20 rounded-t"></div>
              <div className="w-1/6 h-3/4 bg-[#1e3932] rounded-t"></div>
              <div className="w-1/6 h-2/3 bg-[#1e3932]/20 rounded-t"></div>
              <div className="w-1/6 h-full bg-[#1e3932] rounded-t"></div>
              <div className="w-1/6 h-4/5 bg-[#1e3932]/20 rounded-t"></div>
              <div className="w-1/6 h-5/6 bg-[#1e3932] rounded-t"></div>
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
      <div className="min-h-screen bg-white text-[#1e3932]/60 font-mono text-xs flex items-center justify-center">
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
    <div className="w-full px-6 lg:px-12 pt-4 pb-12 space-y-8 font-sans text-[#1e3932] bg-white min-h-full">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1e3932]/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1e3932]/20 text-xs font-mono bg-[#1e3932]/10 font-bold text-[#1e3932]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1e3932]" /> Accès illimité (sans abonnement)
            </span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-serif tracking-tight leading-none text-[#1e3932]">Aperçu des ventes</h1>
          <p className="text-xs font-mono text-[#1e3932]/60">Analysez et optimisez vos ventes en temps réel</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(user.id, true)}
            disabled={refreshing}
            className="h-12 px-5 rounded-xl border border-[#1e3932]/15 bg-white hover:bg-[#f8faf9] text-[#1e3932] font-mono text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer font-bold shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <Link
            href="/new"
            className="h-12 px-6 rounded-xl bg-[#1e3932] text-white hover:bg-[#152a25] font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un événement illimité</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Chiffre d&apos;affaires</p>
            <Euro className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {stats.totalRevenue.toLocaleString('fr-FR')} €
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Volume brut encaissé</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Billets vendus</p>
            <Ticket className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {stats.totalTicketsSold}
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Taux de remplissage : {fillRate}%</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Événements publiés</p>
            <Calendar className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {stats.publishedEventsCount} <span className="text-xs font-normal text-[#1e3932]/50">({stats.totalEventsCount} total)</span>
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Création illimitée</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Modèle tarifaire</p>
            <span className="h-3 w-3 rounded-full bg-[#1e3932] animate-pulse" />
          </div>
          <p className="text-base font-bold tracking-tight pt-1 text-[#1e3932]">
            Commission sur ventes
          </p>
          <p className="text-[11px] text-[#1e3932]/50">0 € d&apos;abonnement fixe</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e3932]/40" />
            <input
              type="text"
              placeholder="Rechercher par titre ou lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl border border-[#1e3932]/15 bg-white pl-11 pr-4 font-mono text-xs text-[#1e3932] placeholder:text-[#1e3932]/40 focus:outline-none focus:border-[#1e3932] shadow-xs"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {['all', 'published', 'draft', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`h-12 px-4 rounded-xl border font-mono text-xs transition-all whitespace-nowrap cursor-pointer font-bold shadow-xs ${
                  statusFilter === status 
                    ? 'bg-[#1e3932] text-white border-[#1e3932]' 
                    : 'bg-white border-[#1e3932]/15 text-[#1e3932]/80 hover:bg-[#f8faf9]'
                }`}
              >
                {status === 'all' ? 'Tous' : STATUS_LABEL[status] || status}
              </button>
            ))}
          </div>
        </div>
        <span className="font-mono text-xs text-[#1e3932]/60 text-right">
          {filteredEvents.length} événement(s)
        </span>
      </div>

      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] p-16 text-center space-y-4 shadow-xs">
            <Calendar className="mx-auto h-8 w-8 text-[#1e3932]" />
            <p className="font-mono text-xs text-[#1e3932]/60">
              {events.length === 0 
                ? "Vous n'avez pas encore créé d'événement. Lancez-vous, c'est illimité !" 
                : "Aucun événement ne correspond à vos filtres."}
            </p>
            {events.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[#1e3932] text-white font-mono text-xs font-bold hover:bg-[#152a25] transition-all shadow-md"
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
                  className="group flex flex-col rounded-2xl border border-[#1e3932]/15 bg-[#f8faf9] shadow-xs transition-all hover:border-[#1e3932]/40 hover:shadow-md overflow-hidden"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[11px] text-[#1e3932]/50 font-bold">
                        {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Date non définie'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                        evt.status === 'published' 
                          ? 'bg-[#1e3932]/10 text-[#1e3932] border-[#1e3932]/20' 
                          : evt.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-white text-[#1e3932]/60 border-[#1e3932]/15'
                      }`}>
                        {STATUS_LABEL[evt.status] ?? evt.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-medium leading-snug text-[#1e3932]">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs font-mono text-[#1e3932]/70 leading-relaxed font-light">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 font-mono text-xs text-[#1e3932]/70 pt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#1e3932]" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1e3932]/10 px-6 py-4 bg-white">
                    <span className="font-mono text-xs font-bold text-[#1e3932]">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Gratuit'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${evt.slug || evt.id}/edit`}
                        className="w-10 h-10 rounded-xl border border-[#1e3932]/15 bg-white text-[#1e3932] flex items-center justify-center hover:bg-[#1e3932] hover:text-white transition-colors cursor-pointer shadow-xs"
                        title="Modifier"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="w-10 h-10 rounded-xl border border-[#1e3932]/15 bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-xs"
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

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
      <div className="min-h-screen bg-[#0a0b0e] text-neutral-400 font-mono text-xs uppercase tracking-widest flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] text-white flex flex-col lg:flex-row w-full overflow-hidden selection:bg-[#E5D4B4] selection:text-black font-sans">
        
        {/* Colonne gauche : Branding & Connexion */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 z-10 bg-[#0a0b0e] border-b lg:border-b-0 lg:border-r border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-[#E5D4B4] text-black flex items-center justify-center font-mono font-bold text-xs">T</span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E5D4B4]">TYKS Pro</span>
          </div>

          <div className="space-y-6 my-auto py-12">
            <span className="inline-block font-mono text-[11px] uppercase tracking-widest bg-[#14171f] border border-neutral-800 text-[#E5D4B4] px-3 py-1.5 rounded-full">
              TYKS PRO · ESPACE ORGANISATEUR
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
              Reprenez le contrôle de votre billetterie et de vos marges.
            </h1>
            <p className="font-mono text-xs leading-relaxed text-neutral-400 max-w-md">
              Fins de commissions abusives et de données captives. Tyks Pro vous offre une plateforme sur-mesure, des frais réduits et l&apos;accès direct à votre communauté.
            </p>
            <div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-[#E5D4B4] text-black font-mono text-xs uppercase tracking-widest hover:bg-[#d8c39e] transition-colors flex items-center justify-center gap-3 cursor-pointer font-bold rounded-xl shadow-lg"
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

        {/* Colonne droite : Aperçu élégant du Dashboard en arrière-plan */}
        <div className="hidden lg:flex w-1/2 bg-[#050608] p-12 relative overflow-hidden items-center justify-center select-none pointer-events-none">
          <div className="w-full max-w-lg bg-[#14171f] border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-neutral-700"></span>
                <span className="h-3 w-3 rounded-full bg-neutral-700"></span>
                <span className="h-3 w-3 rounded-full bg-neutral-700"></span>
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">dashboard.tyks.app</span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-[#101319] border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="h-2 w-12 bg-neutral-800 rounded"></div>
                <div className="h-6 w-16 bg-[#E5D4B4] rounded opacity-80"></div>
              </div>
              <div className="bg-[#101319] border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="h-2 w-12 bg-neutral-800 rounded"></div>
                <div className="h-6 w-12 bg-[#E5D4B4] rounded opacity-80"></div>
              </div>
              <div className="bg-[#101319] border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="h-2 w-12 bg-neutral-800 rounded"></div>
                <div className="h-6 w-10 bg-[#E5D4B4] rounded opacity-80"></div>
              </div>
            </div>

            <div className="h-40 bg-[#101319] border border-neutral-800 rounded-xl flex items-end p-4 gap-2">
              <div className="w-1/6 h-1/2 bg-neutral-700 rounded-t"></div>
              <div className="w-1/6 h-3/4 bg-[#E5D4B4] rounded-t"></div>
              <div className="w-1/6 h-2/3 bg-neutral-700 rounded-t"></div>
              <div className="w-1/6 h-full bg-[#E5D4B4] rounded-t"></div>
              <div className="w-1/6 h-4/5 bg-neutral-700 rounded-t"></div>
              <div className="w-1/6 h-5/6 bg-[#E5D4B4] rounded-t"></div>
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
      <div className="min-h-screen bg-[#0a0b0e] text-neutral-400 font-mono text-xs uppercase tracking-widest flex items-center justify-center">
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
    <div className="w-full px-6 lg:px-12 py-10 space-y-8 font-sans text-white bg-[#0a0b0e] min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800 text-xs font-mono bg-[#14171f] font-bold uppercase tracking-wider text-[#E5D4B4]">
              <ShieldCheck className="w-3.5 h-3.5" /> Accès Illimité (Sans Abonnement)
            </span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight uppercase leading-none text-white">Sales Overview</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">Analysez et optimisez vos ventes en temps réel</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(user.id, true)}
            disabled={refreshing}
            className="h-12 px-5 rounded-xl border border-neutral-800 bg-[#14171f] hover:bg-neutral-800 text-neutral-200 font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <Link
            href="/new"
            className="h-12 px-6 rounded-xl bg-[#E5D4B4] text-black hover:bg-[#d8c39e] font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un événement illimité</span>
          </Link>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Chiffre d&apos;affaires</p>
            <Euro className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {stats.totalRevenue.toLocaleString('fr-FR')} €
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Volume brut encaissé</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Billets vendus</p>
            <Ticket className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {stats.totalTicketsSold}
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Taux de remplissage : {fillRate}%</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Événements publiés</p>
            <Calendar className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {stats.publishedEventsCount} <span className="text-xs font-normal text-neutral-500">({stats.totalEventsCount} total)</span>
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Création illimitée</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Modèle tarifaire</p>
            <span className="h-3 w-3 rounded-full bg-[#E5D4B4] animate-pulse" />
          </div>
          <p className="text-base font-bold tracking-tight pt-1 uppercase text-white">
            Commission sur ventes
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">0 € d&apos;abonnement fixe</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-800 bg-[#14171f] pl-11 pr-4 font-mono text-xs uppercase text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#E5D4B4]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {['all', 'published', 'draft', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`h-12 px-4 rounded-xl border border-neutral-800 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer font-bold ${
                  statusFilter === status 
                    ? 'bg-[#E5D4B4] text-black border-[#E5D4B4]' 
                    : 'bg-[#14171f] text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {status === 'all' ? 'Tous' : STATUS_LABEL[status] || status}
              </button>
            ))}
          </div>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 text-right">
          {filteredEvents.length} événement(s)
        </span>
      </div>

      {/* Liste des événements */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-[#14171f] p-16 text-center space-y-4 shadow-xl">
            <Calendar className="mx-auto h-8 w-8 text-[#E5D4B4]" />
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              {events.length === 0 
                ? "Vous n'avez pas encore créé d'événement. Lancez-vous, c'est illimité !" 
                : "Aucun événement ne correspond à vos filtres."}
            </p>
            {events.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[#E5D4B4] text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#d8c39e] transition-all shadow-lg"
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
                  className="group flex flex-col rounded-2xl border border-neutral-800 bg-[#14171f] shadow-lg transition-all hover:border-neutral-700 overflow-hidden"
                >
                  <div className="space-y-3 p-6 flex-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                        {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Date non définie'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === 'published' 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                          : evt.status === 'cancelled'
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                      }`}>
                        {STATUS_LABEL[evt.status] ?? evt.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold uppercase tracking-tight leading-snug text-white">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs font-mono text-neutral-400 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 pt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#E5D4B4]" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4 bg-[#101319]">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E5D4B4]">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Gratuit'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${evt.slug || evt.id}/edit`}
                        className="w-10 h-10 rounded-xl border border-neutral-800 bg-[#14171f] text-neutral-300 flex items-center justify-center hover:bg-[#E5D4B4] hover:text-black hover:border-[#E5D4B4] transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="w-10 h-10 rounded-xl border border-neutral-800 bg-[#14171f] text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors cursor-pointer"
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

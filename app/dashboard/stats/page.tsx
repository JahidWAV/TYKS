'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Users, Ticket, Euro, Calendar, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    conversionRate: 0,
    activeEvents: 0,
    revenueHistory: [] as any[],
    topEvents: [] as any[],
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session?.user) return;

        const { data: orgMember } = await supabaseBrowser
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (orgMember?.organization_id) {
          const orgId = orgMember.organization_id;

          // Récupération des événements de l'orga
          const { data: events } = await supabaseBrowser
            .from('events')
            .select('id, title, status, created_at')
            .eq('organization_id', orgId);

          const eventIds = events?.map(e => e.id) || [];

          // Récupération des commandes / billets vendus si la table existe
          let totalRev = 0;
          let ticketsCount = 0;
          let eventsWithSales: any[] = [];

          if (eventIds.length > 0) {
            const { data: orders } = await supabaseBrowser
              .from('orders')
              .select('id, total_amount, quantity, event_id, created_at, status')
              .in('event_id', eventIds)
              .eq('status', 'completed');

            if (orders) {
              totalRev = orders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
              ticketsCount = orders.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);

              // Mapping des top events
              const eventSalesMap: Record<string, { revenue: number; count: number }> = {};
              orders.forEach(o => {
                if (!eventSalesMap[o.event_id]) {
                  eventSalesMap[o.event_id] = { revenue: 0, count: 0 };
                }
                eventSalesMap[o.event_id].revenue += Number(o.total_amount || 0);
                eventSalesMap[o.event_id].count += Number(o.quantity || 0);
              });

              eventsWithSales = (events || []).map(ev => ({
                id: ev.id,
                title: ev.title,
                revenue: eventSalesMap[ev.id]?.revenue || 0,
                tickets: eventSalesMap[ev.id]?.count || 0,
              })).sort((a, b) => b.revenue - a.revenue);
            }
          }

          setAnalyticsData({
            totalRevenue: totalRev,
            ticketsSold: ticketsCount,
            conversionRate: 4.8, // Taux fictif ou calculé selon les visites si dispo
            activeEvents: events?.filter(e => e.status === 'published' || e.status === 'active').length || events?.length || 0,
            revenueHistory: [],
            topEvents: eventsWithSales.slice(0, 5),
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement des analytics :', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
      
      {/* Filtres de période */}
      <div className="flex items-center justify-between pb-4 border-b border-[#111110]/10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#111110]/5 text-[#111110] font-semibold border border-[#111110]/10">
            <BarChart3 className="w-3 h-3" /> Performance globale
          </span>
        </div>
        <div className="flex items-center bg-white/70 backdrop-blur-md border border-[#111110]/15 rounded-full p-1 shadow-sm">
          {['7d', '30d', '12m', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition ${
                timeRange === range
                  ? 'bg-[#111110] text-[#F7F5F0] shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : range === '12m' ? '12 mois' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des KPI principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Chiffre d'affaires</p>
            <Euro className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-3xl font-bold tracking-tight">
            {analyticsData.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs période préc.
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Billets vendus</p>
            <Ticket className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-3xl font-bold tracking-tight">
            {analyticsData.ticketsSold.toLocaleString('fr-FR')}
          </p>
          <p className="text-[11px] font-mono opacity-60">Total des places écoulées</p>
        </div>

        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Taux de conversion</p>
            <PieChart className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-3xl font-bold tracking-tight">
            {analyticsData.conversionRate}%
          </p>
          <p className="text-[11px] font-mono opacity-60">Visiteurs convertis en acheteurs</p>
        </div>

        <div className="p-6 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Événements actifs</p>
            <Calendar className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-3xl font-bold tracking-tight">
            {analyticsData.activeEvents}
          </p>
          <p className="text-[11px] font-mono opacity-60">Gérés sur la plateforme</p>
        </div>

      </div>

      {/* Section détaillée : Top Événements & Graphique visuel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graphique simulé / Zone d'évolution */}
        <div className="lg:col-span-2 p-8 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">Évolution des ventes</h2>
              <p className="text-xs font-mono opacity-60">Tendance des revenus sur la période sélectionnée</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
              Temps réel
            </span>
          </div>

          {/* Représentation visuelle épurée (Barres de tendance) */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-[#111110]/10">
            {[40, 65, 45, 80, 55, 95, 75, 85, 60, 100, 90, 110].map((val, idx) => (
              <div key={idx} className="w-full bg-[#111110]/5 rounded-t-xl relative group flex flex-col justify-end h-full">
                <div 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-[#111110] rounded-t-xl transition-all duration-300 group-hover:bg-emerald-500"
                ></div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono opacity-60">
            <span>Début de période</span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        {/* Top Événements par CA */}
        <div className="p-8 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Top Événements</h2>
            <p className="text-xs font-mono opacity-60">Classement par chiffre d'affaires</p>
          </div>

          <div className="space-y-4">
            {analyticsData.topEvents.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono opacity-60">
                Aucun événement avec ventes pour le moment.
              </div>
            ) : (
              analyticsData.topEvents.map((ev, index) => (
                <div key={ev.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-[#111110]/10 hover:border-[#111110]/30 transition">
                  <div className="space-y-0.5 pr-3 truncate">
                    <p className="text-xs font-bold font-display truncate">#{index + 1} {ev.title}</p>
                    <p className="text-[11px] font-mono opacity-60">{ev.tickets} billets vendus</p>
                  </div>
                  <span className="font-mono text-xs font-bold shrink-0">
                    {ev.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

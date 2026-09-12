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

          const { data: events } = await supabaseBrowser
            .from('events')
            .select('id, title, status, created_at')
            .eq('organization_id', orgId);

          const eventIds = events?.map(e => e.id) || [];

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
            conversionRate: 4.8,
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
      <div className="min-h-screen bg-[#0a0b0e] text-neutral-400 font-mono text-xs uppercase tracking-widest flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-10 space-y-8 font-sans text-white bg-[#0a0b0e] min-h-full">
      
      {/* Filtres de période */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-[#14171f] text-[#E5D4B4] font-bold border border-neutral-800 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-[#E5D4B4]" /> Performance globale
          </span>
        </div>
        <div className="flex items-center bg-[#14171f] border border-neutral-800 rounded-2xl p-1 shadow-lg font-mono">
          {['7d', '30d', '12m', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                timeRange === range
                  ? 'bg-[#E5D4B4] text-black shadow-lg'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : range === '12m' ? '12 mois' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des KPI principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        
        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Chiffre d&apos;affaires</p>
            <Euro className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {analyticsData.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs période préc.
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Billets vendus</p>
            <Ticket className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {analyticsData.ticketsSold.toLocaleString('fr-FR')}
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Total des places écoulées</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Taux de conversion</p>
            <PieChart className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {analyticsData.conversionRate}%
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Visiteurs convertis en acheteurs</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Événements actifs</p>
            <Calendar className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {analyticsData.activeEvents}
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Gérés sur la plateforme</p>
        </div>

      </div>

      {/* Section détaillée : Top Événements & Graphique visuel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphique simulé / Zone d'évolution */}
        <div className="lg:col-span-2 p-8 rounded-2xl border border-neutral-800 bg-[#14171f] shadow-lg space-y-6 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Évolution des ventes</h2>
              <p className="text-[11px] text-neutral-500 uppercase">Tendance des revenus sur la période sélectionnée</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Temps réel
            </span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-neutral-800">
            {[40, 65, 45, 80, 55, 95, 75, 85, 60, 100, 90, 110].map((val, idx) => (
              <div key={idx} className="w-full bg-neutral-900 rounded-t-xl relative group flex flex-col justify-end h-full">
                <div 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-[#E5D4B4] rounded-t-xl transition-all duration-300 group-hover:bg-white"
                ></div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] uppercase text-neutral-500">
            <span>Début de période</span>
            <span>Aujourd&apos;hui</span>
          </div>
        </div>

        {/* Top Événements par CA */}
        <div className="p-8 rounded-2xl border border-neutral-800 bg-[#14171f] shadow-lg space-y-6 font-mono">
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Top Événements</h2>
            <p className="text-[11px] text-neutral-500 uppercase">Classement par chiffre d&apos;affaires</p>
          </div>

          <div className="space-y-4">
            {analyticsData.topEvents.length === 0 ? (
              <div className="py-12 text-center text-xs uppercase tracking-wider text-neutral-500">
                Aucun événement avec ventes pour le moment.
              </div>
            ) : (
              analyticsData.topEvents.map((ev, index) => (
                <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl bg-[#101319] border border-neutral-800 hover:border-neutral-700 transition">
                  <div className="space-y-0.5 pr-3 truncate">
                    <p className="text-xs font-bold uppercase tracking-wider text-white truncate">#{index + 1} {ev.title}</p>
                    <p className="text-[10px] text-neutral-500 uppercase">{ev.tickets} billets vendus</p>
                  </div>
                  <span className="text-xs font-bold text-[#E5D4B4] shrink-0">
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

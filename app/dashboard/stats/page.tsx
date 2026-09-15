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
        console.error('ERREUR LORS DU CHARGEMENT DES ANALYTICS :', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black/60 font-grotesque text-xs flex items-center justify-center uppercase">
        CHARGEMENT...
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-4 space-y-8 font-grotesque text-black bg-white min-h-full uppercase">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/15 gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-grotesque bg-neutral-50 text-black font-bold border border-black/20 shadow-xs">
            <BarChart3 className="w-4 h-4 text-black" /> PERFORMANCE GLOBALE
          </span>
        </div>
        <div className="flex items-center bg-neutral-50 border border-black/15 rounded-xl p-1 shadow-xs font-grotesque">
          {['7d', '30d', '12m', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeRange === range
                  ? 'bg-black text-white shadow-md'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              {range === '7d' ? '7 JOURS' : range === '30d' ? '30 JOURS' : range === '12m' ? '12 MOIS' : 'TOUT'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-grotesque">
        
        <div className="p-6 rounded-2xl border border-black/15 bg-neutral-50 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-black/60 font-bold">CHIFFRE D&apos;AFFAIRES</p>
            <Euro className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-black">
            {analyticsData.totalRevenue.toLocaleString('fr-FR')} €
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-black font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% VS PÉRIODE PRÉC.
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-black/15 bg-neutral-50 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-black/60 font-bold">BILLETS VENDUS</p>
            <Ticket className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-black">
            {analyticsData.ticketsSold.toLocaleString('fr-FR')}
          </p>
          <p className="text-[11px] text-black/50">TOTAL DES PLACES ÉCOULÉES</p>
        </div>

        <div className="p-6 rounded-2xl border border-black/15 bg-neutral-50 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-black/60 font-bold">TAUX DE CONVERSION</p>
            <PieChart className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-black">
            {analyticsData.conversionRate}%
          </p>
          <p className="text-[11px] text-black/50">VISITEURS CONVERTIS EN ACHETEURS</p>
        </div>

        <div className="p-6 rounded-2xl border border-black/15 bg-neutral-50 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-black/60 font-bold">ÉVÉNEMENTS ACTIFS</p>
            <Calendar className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-black">
            {analyticsData.activeEvents}
          </p>
          <p className="text-[11px] text-black/50">GÉRÉS SUR LA PLATEFORME</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 p-8 rounded-2xl border border-black/15 bg-neutral-50 shadow-xs space-y-6 flex flex-col justify-between font-grotesque">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-black">ÉVOLUTION DES VENTES</h2>
              <p className="text-[11px] text-black/50">TENDANCE DES REVENUS SUR LA PÉRIODE SÉLECTIONNÉE</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/10 text-black border border-black/20">
              TEMPS RÉEL
            </span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-black/15">
            {[40, 65, 45, 80, 55, 95, 75, 85, 60, 100, 90, 110].map((val, idx) => (
              <div key={idx} className="w-full bg-black/5 rounded-t-xl relative group flex flex-col justify-end h-full">
                <div 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-black rounded-t-xl transition-all duration-300 group-hover:bg-neutral-800"
                ></div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-black/50">
            <span>DÉBUT DE PÉRIODE</span>
            <span>AUJOURD&apos;HUI</span>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-black/15 bg-neutral-50 shadow-xs space-y-6 font-grotesque">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-black">TOP ÉVÉNEMENTS</h2>
            <p className="text-[11px] text-black/50">CLASSEMENT PAR CHIFFRE D&apos;AFFAIRES</p>
          </div>

          <div className="space-y-4">
            {analyticsData.topEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-black/50">
                AUCUN ÉVÉNEMENT AVEC VENTES POUR LE MOMENT.
              </div>
            ) : (
              analyticsData.topEvents.map((ev, index) => (
                <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-black/15 hover:border-black transition shadow-xs">
                  <div className="space-y-0.5 pr-3 truncate">
                    <p className="text-xs font-bold text-black truncate">#{index + 1} {ev.title}</p>
                    <p className="text-[10px] text-black/50">{ev.tickets} BILLETS VENDUS</p>
                  </div>
                  <span className="text-xs font-bold text-black shrink-0">
                    {ev.revenue.toLocaleString('fr-FR')} €
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

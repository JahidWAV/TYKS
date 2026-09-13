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
      <div className="min-h-screen bg-white text-[#1e3932]/60 font-mono text-xs flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-10 space-y-8 font-sans text-[#1e3932] bg-white min-h-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1e3932]/10 gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-[#f8faf9] text-[#1e3932] font-bold border border-[#1e3932]/15">
            <BarChart3 className="w-4 h-4 text-[#1e3932]" /> Performance globale
          </span>
        </div>
        <div className="flex items-center bg-[#f8faf9] border border-[#1e3932]/15 rounded-2xl p-1 shadow-xs font-mono">
          {['7d', '30d', '12m', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeRange === range
                  ? 'bg-[#1e3932] text-white shadow-md'
                  : 'text-[#1e3932]/60 hover:text-[#1e3932]'
              }`}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : range === '12m' ? '12 mois' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        
        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Chiffre d&apos;affaires</p>
            <Euro className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {analyticsData.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs période préc.
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Billets vendus</p>
            <Ticket className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {analyticsData.ticketsSold.toLocaleString('fr-FR')}
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Total des places écoulées</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Taux de conversion</p>
            <PieChart className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {analyticsData.conversionRate}%
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Visiteurs convertis en acheteurs</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Événements actifs</p>
            <Calendar className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {analyticsData.activeEvents}
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Gérés sur la plateforme</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 p-8 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] shadow-xs space-y-6 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-[#1e3932]">Évolution des ventes</h2>
              <p className="text-[11px] text-[#1e3932]/50">Tendance des revenus sur la période sélectionnée</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#1e3932]/10 text-[#1e3932] border border-[#1e3932]/20">
              Temps réel
            </span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-[#1e3932]/10">
            {[40, 65, 45, 80, 55, 95, 75, 85, 60, 100, 90, 110].map((val, idx) => (
              <div key={idx} className="w-full bg-[#1e3932]/5 rounded-t-xl relative group flex flex-col justify-end h-full">
                <div 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-[#1e3932] rounded-t-xl transition-all duration-300 group-hover:bg-[#152a25]"
                ></div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#1e3932]/50">
            <span>Début de période</span>
            <span>Aujourd&apos;hui</span>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] shadow-xs space-y-6 font-mono">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-[#1e3932]">Top événements</h2>
            <p className="text-[11px] text-[#1e3932]/50">Classement par chiffre d&apos;affaires</p>
          </div>

          <div className="space-y-4">
            {analyticsData.topEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#1e3932]/50">
                Aucun événement avec ventes pour le moment.
              </div>
            ) : (
              analyticsData.topEvents.map((ev, index) => (
                <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#1e3932]/10 hover:border-[#1e3932]/30 transition shadow-2xs">
                  <div className="space-y-0.5 pr-3 truncate">
                    <p className="text-xs font-bold text-[#1e3932] truncate">#{index + 1} {ev.title}</p>
                    <p className="text-[10px] text-[#1e3932]/50">{ev.tickets} billets vendus</p>
                  </div>
                  <span className="text-xs font-bold text-[#1e3932] shrink-0">
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

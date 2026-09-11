'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Smartphone, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const HIGHLIGHTS = [
  {
    title: 'Transparence totale.',
    text: 'Le prix affiché est clair dès le départ. Aucune surprise au moment de régler.',
  },
  {
    title: 'Souveraineté des lieux.',
    text: 'Les salles et les collectifs gardent le contrôle absolu de leurs données.',
  },
  {
    title: 'Simplicité d’usage.',
    text: 'Un achat en un geste, un pass numérique instantané sur tous vos appareils.',
  },
];

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true })
        .limit(4);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white font-sans antialiased">
      
      {/* ─── HERO SECTION ─── */}
      <section className="pt-28 pb-32 px-6 md:px-12 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            <span>Billetterie Indépendante &bull; Édition 2026</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-[#1d1d1f] leading-[1.05]">
            La billetterie. <br />
            <span className="text-[#86868b] font-normal">Réinventée tout en simplicité.</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg md:text-xl text-[#86868b] font-normal leading-relaxed">
            Une plateforme conçue pour la culture indépendante. Sans commission abusive, d'une fluidité remarquable, pensée pour les artistes et le public.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a 
              href="#events" 
              className="px-6 py-3 rounded-full bg-[#0071e3] text-white font-medium text-sm hover:bg-[#0077ed] transition-all shadow-sm"
            >
              Explorer les soirées
            </a>
            <a 
              href="https://pro.tyks.app" 
              className="px-6 py-3 rounded-full bg-[#f5f5f7] text-[#0071e3] font-medium text-sm hover:bg-[#e8e8ed] transition-all"
            >
              Espace Organisateur &rarr;
            </a>
          </div>
        </div>

        {/* Visuel App style "Apple Product Card" */}
        <div className="mt-20 max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-[#fbfbfd] border border-[#d2d2d7]/40 shadow-sm relative overflow-hidden text-left grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Application iOS & Android</span>
            <h3 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">Votre pass, partout avec vous.</h3>
            <p className="text-sm text-[#86868b] leading-relaxed font-normal">
              Accédez à vos événements en un éclair grâce à un portefeuille unifié et sécurisé directement dans votre poche.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-[#d2d2d7]/60 text-center text-xs font-medium text-[#1d1d1f] shadow-2xs">
              App Store
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#d2d2d7]/60 text-center text-xs font-medium text-[#1d1d1f] shadow-2xs">
              Google Play
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCHAINS ÉVÉNEMENTS ─── */}
      <section id="events" className="py-28 bg-[#fbfbfd] border-t border-[#d2d2d7]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Agenda</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] mt-1">Prochaines dates</h2>
            </div>
            <Link 
              href="/events"
              className="text-sm font-medium text-[#0071e3] hover:underline"
            >
              Tout afficher &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#86868b]">Chargement des événements...</div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#86868b] bg-white rounded-2xl border border-[#d2d2d7]/40">
              Aucun événement publié pour le moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Gratuit' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group p-6 rounded-2xl bg-white border border-[#d2d2d7]/50 hover:border-[#0071e3]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[320px]"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#86868b]">
                          {item.organizations?.name || 'Concert'}
                        </span>
                        <span className="text-xs font-medium text-[#86868b]">{formattedDate}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-[#86868b] mt-1 truncate">{item.location || 'Lieu confidentiel'}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#f5f5f7] flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#1d1d1f]">{priceLabel}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#86868b] group-hover:text-[#0071e3] transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── HIGHLIGHTS (Style Bento Grid épuré) ─── */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-6">
          {HIGHLIGHTS.map((item, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-[#fbfbfd] border border-[#d2d2d7]/40 space-y-4">
              <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">{item.title}</h3>
              <p className="text-sm text-[#86868b] leading-relaxed font-normal">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BANDEAU ORGANISATEUR ─── */}
      <section className="my-20 mx-6 md:mx-12 max-w-7xl px-8 md:px-16 py-16 rounded-3xl bg-[#f5f5f7] border border-[#d2d2d7]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">Espace Organisateur</span>
          <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">Vous pilotez un lieu ou un collectif ?</h2>
          <p className="text-sm text-[#86868b] font-normal leading-relaxed">
            Installez votre propre billetterie en quelques minutes et reprenez le contrôle total de vos données de diffusion.
          </p>
        </div>
        <a
          href="https://pro.tyks.app"
          className="px-6 py-3 rounded-full bg-[#1d1d1f] text-white hover:bg-[#333336] transition-colors text-sm font-medium shrink-0"
        >
          Ouvrir un compte Pro
        </a>
      </section>

    </div>
  );
}

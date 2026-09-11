'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Flame, Compass, Music } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const HIGHLIGHTS = [
  {
    num: '01',
    title: 'Zéro blabla',
    text: 'Un achat de billet en deux secondes chrono, sans parcours utilisateur kafkaïen.',
    bg: 'bg-[#FF5C00]', // Orange vif pop
    textCol: 'text-white'
  },
  {
    num: '02',
    title: 'Transparence totale',
    text: 'Le prix affiché est le vrai prix. Zéro frais surprise au moment de valider le panier.',
    bg: 'bg-[#002DFF]', // Bleu Klein électrique
    textCol: 'text-white'
  },
  {
    num: '03',
    title: 'Souveraineté live',
    text: 'Les salles et les collectifs reprennent le contrôle absolu de leurs données et de leur image.',
    bg: 'bg-[#FFE500]', // Jaune poussin intense
    textCol: 'text-black'
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
    <div className="flex-1 flex flex-col bg-[#FAFAFA] text-[#111] selection:bg-[#FF5C00] selection:text-white font-sans">
      
      {/* ─── HERO SECTION ─── */}
      <section className="pt-20 pb-28 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] text-white text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#FFE500]" />
              <span>Billetterie Indépendante — 2026</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.92]">
              SORTIR <br />
              <span className="bg-[#FFE500] px-3 py-1 inline-block border-4 border-[#111] shadow-[4px_4px_0px_#111] mt-2">
                SANS SE PRENDRE
              </span> <br />
              LA TÊTE.
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-[#111]/80 font-medium leading-relaxed">
              Une plateforme ultra-vitaminée pensée pour la culture club et indépendante. Des prix clairs, de vrais artistes, zéro arnaque.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#events" 
                className="px-8 py-5 rounded-2xl bg-[#FF5C00] text-white font-black text-sm tracking-wide border-4 border-[#111] shadow-[4px_4px_0px_#111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111] transition-all flex items-center gap-3"
              >
                Explorer l'agenda
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* COLONNE DE DROITE : Bloc visuel App ludique */}
          <div className="relative p-8 md:p-10 rounded-[36px] bg-[#002DFF] text-white border-4 border-[#111] shadow-[8px_8px_0px_#111]">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE500] text-[#111] border-3 border-[#111] grid place-content-center font-black">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Bientôt dispo</span>
            </div>

            <div className="space-y-4 mb-10">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Ton pass direct dans la poche.
              </h3>
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                Retrouve tous tes billets au même endroit et accède aux soirées en un éclair. Sur iOS et Android.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="py-3.5 px-4 rounded-xl bg-white text-[#111] font-black text-center text-xs border-2 border-[#111]">
                iOS App Store
              </div>
              <div className="py-3.5 px-4 rounded-xl bg-white text-[#111] font-black text-center text-xs border-2 border-[#111]">
                Google Play
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── PROCHAINS ÉVÉNEMENTS ─── */}
      <section id="events" className="py-28 border-t-4 border-[#111] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Les prochaines dates</h2>
            <Link 
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-bold bg-[#FFE500] px-4 py-2 rounded-xl border-2 border-[#111] shadow-[2px_2px_0px_#111] hover:bg-[#ffd700] transition-colors"
            >
              Voir tout l'agenda
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-[#111]/40">Chargement des ondes...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-[#111]/20 rounded-[32px] text-[#111]/40 font-bold text-sm">
              Aucun événement publié pour le moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'GRATUIT' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group p-6 rounded-[28px] bg-[#FAFAFA] border-4 border-[#111] shadow-[6px_6px_0px_#111] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#111] transition-all flex flex-col justify-between h-[340px]"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-[#FFE500] border-2 border-[#111] uppercase tracking-wider text-[#111]">
                          {item.organizations?.name || 'Club'}
                        </span>
                        <span className="text-xs font-black bg-[#111] text-white px-2.5 py-1 rounded-md">{formattedDate}</span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-black tracking-tight group-hover:text-[#FF5C00] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs font-medium text-[#111]/60 mt-2 truncate">
                          {item.location || 'Lieu secret'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t-2 border-[#111]/10 flex items-center justify-between">
                      <span className="text-lg font-black">{priceLabel}</span>
                      <div className="w-10 h-10 rounded-xl bg-[#FF5C00] text-white border-2 border-[#111] grid place-content-center group-hover:rotate-12 transition-transform">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── VALEURS / MANIFESTO (Grille Pop) ─── */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto w-full border-t-4 border-[#111]">
        <div className="grid md:grid-cols-3 gap-8">
          {HIGHLIGHTS.map((item, idx) => (
            <div key={idx} className={`p-8 rounded-[32px] border-4 border-[#111] shadow-[6px_6px_0px_#111] ${item.bg} ${item.textCol} space-y-6`}>
              <span className="text-sm font-black tracking-widest opacity-80 font-mono">{item.num}</span>
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tight">{item.title}</h3>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BANDEAU PRO ─── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 w-full pb-28">
        <div className="relative rounded-[36px] p-10 md:p-16 bg-[#FFE500] border-4 border-[#111] shadow-[8px_8px_0px_#111] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest bg-[#111] text-white px-3 py-1.5 rounded-lg">Espace Organisateur</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111]">Tu pilotes un lieu ou un collectif ?</h2>
            <p className="text-sm md:text-base font-medium text-[#111]/80 leading-relaxed">
              Installe ta propre billetterie en quelques minutes, récupère le contrôle de tes données et offre une expérience fluide à ton public.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="px-8 py-5 rounded-2xl bg-[#002DFF] text-white font-black text-sm uppercase tracking-wider border-4 border-[#111] shadow-[4px_4px_0px_#111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111] transition-all shrink-0"
          >
            Lancer mon compte Pro
          </a>
        </div>
      </section>

    </div>
  );
}

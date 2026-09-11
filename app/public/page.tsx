'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin, Sparkles, RefreshCw, HeartHandshake, ShieldCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const FEATURES = [
  {
    title: "Billetterie ultra-rapide",
    text: "Prends tes places en quelques secondes, sans friction ni mauvaise surprise au moment de payer."
  },
  {
    title: "Revente sécurisée",
    text: "Un changement de plan ? Revends ton billet facilement et en toute sécurité sur la plateforme."
  },
  {
    title: "Prix transparents",
    text: "zéro frais cachés, le prix affiché est celui que tu payes."
  }
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
        .limit(6);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2] font-serif">
      
      {/* ─── HERO PUBLIC (Inspiré DICE & Shotgun : Expérience fan) ─── */}
      <section className="px-6 md:px-16 pt-24 pb-20 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.25em] uppercase px-4 py-1.5 rounded-full bg-[#F0EBE3] text-[#5C1D24] font-medium border border-[#E4DCD0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C1D24]" />
            <span>Bienvenue dans l'alternative</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light tracking-tight leading-[0.95]">
            Chope ton billet, <br />
            <span className="italic font-normal text-[#5C1D24]">crée des souvenirs</span>.
          </h1>

          <p className="max-w-xl text-base md:text-lg font-sans font-light text-[#2D2220]/70 leading-relaxed">
            Concerts, lives, nuits et performances : découvre les meilleurs événements de ta scène locale, réserve en un clin d'œil et profite de tes soirées l'esprit léger.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a 
              href="#events" 
              className="px-8 py-4 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#43141A] transition-all flex items-center gap-3 shadow-sm"
            >
              <span>Explorer l'agenda</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bloc réassurance fan / Expérience */}
        <div className="lg:col-span-5 p-8 md:p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-6 shadow-xs">
          <div className="flex items-center justify-between text-xs font-sans tracking-widest uppercase text-[#2D2220]/50">
            <span>Expérience Fan</span>
            <span className="text-[#5C1D24] font-semibold">100% Fluide</span>
          </div>
          
          <div className="space-y-4 pt-2 border-t border-[#E4DCD0]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-medium">Recommandations sur-mesure</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">Retrouve tes artistes favoris et découvre de nouvelles pépites.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-medium">Revente simplifiée</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">Un imprévu ? Revends ton billet en quelques clics à un autre fan.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-medium">Zéro mauvaise surprise</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">Des tarifs clairs et affichés en toute transparence dès le départ.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION AGENDA / ÉVÈNEMENTS POPULAIRES ─── */}
      <section id="events" className="py-24 px-6 md:px-16 border-t border-[#E4DCD0] bg-[#F4EFE6]/40">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Autour de toi</span>
              <h2 className="text-4xl md:text-5xl font-light mt-2">Événements populaires</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs font-sans tracking-widest uppercase text-[#2D2220] border-b border-[#5C1D24] pb-0.5 hover:text-[#5C1D24] transition-colors"
            >
              Voir tous les événements &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40">Chargement des événements...</div>
          ) : events.length === 0 ? (
            <div className="py-24 text-center border border-[#E4DCD0] rounded-[2rem] bg-[#F2ECE4] space-y-3">
              <p className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/60">Aucun événement disponible pour le moment.</p>
              <p className="text-xs font-sans font-light text-[#2D2220]/40">Reviens vite pour découvrir la programmation à venir.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Offert' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] hover:border-[#5C1D24] transition-all duration-300 flex flex-col justify-between h-[400px] shadow-xs"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-xs font-sans tracking-wider text-[#2D2220]/50">
                        <span className="truncate max-w-[150px] font-medium text-[#5C1D24]">{item.organizations?.name || 'Collectif'}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-normal group-hover:italic transition-all leading-snug">{item.title}</h3>
                        <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-3 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {item.location || 'Lieu confidentiel'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E4DCD0] flex items-center justify-between">
                      <span className="text-sm font-sans font-medium px-3 py-1 rounded-full bg-[#F2ECE4] border border-[#E4DCD0]">{priceLabel}</span>
                      <div className="w-9 h-9 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center group-hover:bg-[#5C1D24] group-hover:text-[#FAF7F2] transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── SECTION AVANTAGES / POURQUOI TYKS ─── */}
      <section className="py-24 px-6 md:px-16 border-t border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-2xl">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Pourquoi nous choisir</span>
            <h2 className="text-4xl md:text-5xl font-light mt-2">Une billetterie pensée pour le public</h2>
            <p className="text-sm font-sans font-light text-[#2D2220]/70 mt-3 leading-relaxed">
              Fini les galères de réservation et les frais de dernière minute cachés. Retrouve le plaisir de sortir en toute sérénité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, idx) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold px-3 py-1 rounded-full bg-[#FAF7F2] inline-block border border-[#E4DCD0]">
                    0{idx + 1}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-normal">{f.title}</h3>
                  <p className="text-sm font-sans font-light text-[#2D2220]/70 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANDEAU APP / ENGAGEMENT FINAL ─── */}
      <section className="py-24 px-6 md:px-16 bg-[#5C1D24] text-[#FAF7F2]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#FAF7F2]/60">Expérience Mobile</span>
          <h2 className="text-4xl md:text-6xl font-light leading-tight">
            Prêt à vivre <br />
            <span className="italic">les meilleurs moments de ta ville</span> ?
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed">
            Rejoins la communauté, découvre les prochains événements et réserve tes places en quelques secondes.
          </p>
          <div className="pt-2">
            <a
              href="#events"
              className="px-8 py-4 rounded-full bg-[#FAF7F2] text-[#5C1D24] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest inline-block shadow-md"
            >
              Découvrir les événements
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

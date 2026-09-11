'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin, Sparkles, RefreshCw, ShieldCheck, Flame, Heart } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const VILLES = ['Paris', 'Bordeaux', 'Lyon', 'Marseille', 'Nantes'];

const LABELS_PARTENAIRES = [
  'Factory Town', 'Boiler Room', 'Sónar', 'Spotify', 'Framework', 'Outernet', 'Rough Trade', 'Labyrinth', 'Red Bull'
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
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2] font-serif overflow-hidden">
      
      {/* ─── HERO ÉDITORIAL & IMMERSIF (Style Manifeste Culturel) ─── */}
      <section className="relative px-6 md:px-16 pt-16 pb-28 max-w-7xl mx-auto w-full border-b border-[#E4DCD0]">
        
        {/* Barre de navigation éditoriale supérieure */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.3em] uppercase px-4 py-2 rounded-full bg-[#F0EBE3] text-[#5C1D24] font-medium border border-[#E4DCD0]">
            <span className="w-2 h-2 rounded-full bg-[#5C1D24] animate-pulse" />
            <span>Welcome to the alternative[cite: 2]</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-[#2D2220]/60">
            <span>Explorer par ville :</span>
            <div className="flex gap-2 font-medium text-[#2D2220]">
              {VILLES.slice(0, 3).map((v, i) => (
                <span key={v} className="hover:text-[#5C1D24] cursor-pointer transition-colors">
                  {v}{i < 2 ? ' •' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Titre monumental asymétrique */}
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 space-y-6">
            <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-light tracking-tighter leading-[0.9]">
              Chope ton <br />
              <span className="italic font-normal text-[#5C1D24]">billet</span>.
            </h1>
          </div>
          <div className="lg:col-span-4 space-y-6 pb-4">
            <p className="text-base md:text-lg font-sans font-light text-[#2D2220]/70 leading-relaxed">
              Incredible live shows, upfront pricing, and relevant recommendations. On rend tes sorties simples, intenses et indépendantes[cite: 2].
            </p>
            <div>
              <a 
                href="#events" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#43141A] transition-all shadow-sm"
              >
                <span>Explorer l'agenda</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Chiffres clés / Manifeste en pied de hero */}
        <div className="mt-24 pt-10 border-t border-[#E4DCD0] grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">0 frais</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">Cachés au checkout[cite: 2]</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">100%</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">Revente sécurisée[cite: 3]</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">Millions</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">De fans connectés[cite: 2]</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">Instantané</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">Billets sur ton tél[cite: 2]</div>
          </div>
        </div>

      </section>

      {/* ─── MARQUEE / RÉSEAU DE PARTENAIRES (Inspiré Dice & Shotgun) ─── */}
      <section className="py-12 border-b border-[#E4DCD0] bg-[#F4EFE6]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16 mb-6">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#2D2220]/40 block text-center">
            En partenariat avec les meilleurs promoteurs et salles du monde[cite: 2]
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 px-6 opacity-75">
          {LABELS_PARTENAIRES.map((label, idx) => (
            <span key={idx} className="text-sm md:text-base font-sans font-medium tracking-wider uppercase text-[#2D2220]/75">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ─── AGENDA / TENDANCES DYNAMIQUES ─── */}
      <section id="events" className="py-28 px-6 md:px-16 border-b border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4" /> Trending around you[cite: 2]
              </span>
              <h2 className="text-4xl md:text-6xl font-light mt-3">Événements populaires</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs font-sans tracking-widest uppercase text-[#2D2220] border-b border-[#5C1D24] pb-0.5 hover:text-[#5C1D24] transition-colors"
            >
              Voir tous les événements &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40">Chargement de la programmation...</div>
          ) : events.length === 0 ? (
            <div className="py-24 text-center border border-[#E4DCD0] rounded-[2.5rem] bg-[#F2ECE4] space-y-3">
              <p className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/60">Aucun événement disponible pour le moment.</p>
              <p className="text-xs font-sans font-light text-[#2D2220]/40">Reviens vite pour découvrir les prochaines dates.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((item, index) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Offert' : `${Number(item.price).toFixed(2)} €`;

                const offsetClass = index % 3 === 1 ? 'lg:translate-y-6' : index % 3 === 2 ? 'lg:translate-y-12' : '';

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className={`group p-8 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] hover:border-[#5C1D24] transition-all duration-300 flex flex-col justify-between h-[420px] shadow-xs ${offsetClass}`}
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
                      <span className="text-sm font-sans font-medium px-4 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E4DCD0]">{priceLabel}</span>
                      <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center group-hover:bg-[#5C1D24] group-hover:text-[#FAF7F2] transition-colors">
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

      {/* ─── SECTION EXPÉRIENCE FAN (Weirdly easy ticketing) ─── */}
      <section className="py-28 px-6 md:px-16 border-b border-[#E4DCD0] bg-[#F4EFE6]/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Weirdly easy ticketing[cite: 2]</span>
            <h2 className="text-4xl md:text-6xl font-light leading-tight">Get tickets in less time than it took to read this[cite: 2].</h2>
            <p className="text-sm md:text-base font-sans font-light text-[#2D2220]/70 leading-relaxed">
              Plus besoin de chercher des e-mails ou d'imprimer des PDF. Tout est centralisé sur ton téléphone, avec des codes sécurisés et des remboursements gérés en quelques clics[cite: 2, 3].
            </p>
            <div className="pt-4 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#5C1D24]" />
                <span className="text-xs font-sans uppercase tracking-widest font-medium">Prix transparents[cite: 2]</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#5C1D24]" />
                <span className="text-xs font-sans uppercase tracking-widest font-medium">Revente éthique[cite: 3]</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal">Recommandations sur-mesure[cite: 2]</h3>
              <p className="text-xs font-sans font-light text-[#2D2220]/70 leading-relaxed">
                Suis tes artistes favoris et reçois des suggestions ultra-pertinentes basées sur tes goûts musicaux[cite: 2].
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal">Changement de plan ?[cite: 3]</h3>
              <p className="text-xs font-sans font-light text-[#2D2220]/70 leading-relaxed">
                Un empêchement ? Revends ton billet instantanément et en toute sécurité sur la plateforme officielle[cite: 3].
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION TÉMOIGNAGES COMMUNAUTÉ (Loved by millions) ─── */}
      <section className="py-28 px-6 md:px-16 border-b border-[#E4DCD0]">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#5C1D24] font-semibold">Loved by millions[cite: 2]</span>
          <blockquote className="text-3xl md:text-5xl font-light italic leading-tight text-[#2D2220]">
            "La meilleure application de billetterie, rafraîchissante, rassurante, sans stress, 10/10, simple et humaine[cite: 2]."
          </blockquote>
          <div className="text-xs font-sans uppercase tracking-widest text-[#2D2220]/50">
            &mdash; Extraits des retours de notre communauté[cite: 2]
          </div>
        </div>
      </section>

      {/* ─── BANDEAU CTA FINAL ─── */}
      <section className="py-28 px-6 md:px-16 bg-[#5C1D24] text-[#FAF7F2] text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#FAF7F2]/60">Expérience Mobile</span>
          <h2 className="text-5xl md:text-7xl font-light leading-tight">
            Chope ton billet, <br />
            <span className="italic">ne rate plus jamais une nuit</span>.
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed">
            Découvre les prochains événements et réserve tes places en quelques secondes, où que tu sois.
          </p>
          <div className="pt-4">
            <a
              href="#events"
              className="px-8 py-4 rounded-full bg-[#FAF7F2] text-[#5C1D24] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest shadow-md inline-block"
            >
              Découvrir les événements[cite: 2]
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

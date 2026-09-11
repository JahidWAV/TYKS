'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Zap, Ticket, Music, MapPin, Calendar, Radio } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const MANIFESTO = [
  { 
    num: '01', 
    title: 'Transparence des flux', 
    text: 'Une structure tarifaire intègre, sans intermédiaires obscurs ni frais cachés pour le public.' 
  },
  { 
    num: '02', 
    title: 'Souveraineté des lieux', 
    text: 'Les collectifs reprennent le contrôle absolu de leurs données et de leur communauté.' 
  },
  { 
    num: '03', 
    title: 'Expérience fluide', 
    text: 'Un accès instantané, pensé pour la réalité physique et l’effervescence du spectacle vivant.' 
  },
];

const TEMOIGNAGES = [
  {
    quote: "Enfin une billetterie qui respecte notre travail de programmation et notre public.",
    author: "Collectif Sonic Vibe, Paris"
  },
  {
    quote: "La prise en main est instantanée, les frais sont transparents. Un vrai soulagement.",
    author: "L’Imprimerie, Bordeaux"
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
      
      {/* ─── HERO IMMERSIF & RICHE EN CONTENU ─── */}
      <section className="px-6 md:px-16 pt-24 pb-20 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.25em] uppercase px-4 py-1.5 rounded-full bg-[#F0EBE3] text-[#5C1D24] font-medium border border-[#E4DCD0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C1D24]" />
            <span>Saison 2026 &bull; Indice Culturel</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light tracking-tight leading-[0.95]">
            L'art <br />
            <span className="italic font-normal text-[#5C1D24]">du direct</span>.
          </h1>

          <p className="max-w-xl text-base md:text-lg font-sans font-light text-[#2D2220]/70 leading-relaxed">
            Une infrastructure de billetterie indépendante conçue pour relier directement les lieux de création, les artistes et les passionnés, loin de la spéculation des plateformes de masse.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a 
              href="#events" 
              className="px-8 py-4 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#43141A] transition-all flex items-center gap-3 shadow-sm"
            >
              <span>Explorer l'agenda</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a 
              href="https://pro.tyks.app" 
              className="px-8 py-4 bg-[#F2ECE4] text-[#2D2220] border border-[#E4DCD0] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:border-[#5C1D24] transition-all"
            >
              Espace Organisateur
            </a>
          </div>
        </div>

        {/* Bloc de statistiques / réassurance éditorial */}
        <div className="lg:col-span-5 p-8 md:p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-6 shadow-xs">
          <div className="flex items-center justify-between text-xs font-sans tracking-widest uppercase text-[#2D2220]/50">
            <span>Protocole TYKS</span>
            <span className="text-[#5C1D24] font-semibold">100% Souverain</span>
          </div>
          
          <div className="space-y-4 pt-2 border-t border-[#E4DCD0]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-medium">Zéro commission abusive</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">La juste rémunération pour les salles et les collectifs indépendants.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-medium">Pass numérique unifié</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">Centralisation des accès et scannabilité fluide garantie hors-ligne.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-medium">Flux tendus en direct</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">Mise à jour instantanée des jauges et des disponibilités de places.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION AGENDA RICHE (Grille dynamique) ─── */}
      <section id="events" className="py-24 px-6 md:px-16 border-t border-[#E4DCD0] bg-[#F4EFE6]/40">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Programmation</span>
              <h2 className="text-4xl md:text-5xl font-light mt-2">Prochaines dates & rendez-vous</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs font-sans tracking-widest uppercase text-[#2D2220] border-b border-[#5C1D24] pb-0.5 hover:text-[#5C1D24] transition-colors"
            >
              Consulter l'intégralité des flux &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40">Chargement des événements...</div>
          ) : events.length === 0 ? (
            <div className="py-24 text-center border border-[#E4DCD0] rounded-[2rem] bg-[#F2ECE4] space-y-3">
              <p className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/60">Aucun événement programmé pour le moment.</p>
              <p className="text-xs font-sans font-light text-[#2D2220]/40">Revenez très prochainement ou connectez-vous à l'espace pro pour lancer une programmation.</p>
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

      {/* ─── SECTION MANIFESTO (3 piliers riches) ─── */}
      <section className="py-24 px-6 md:px-16 border-t border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-2xl">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Philosophie</span>
            <h2 className="text-4xl md:text-5xl font-light mt-2">Bâtir un écosystème pérenne</h2>
            <p className="text-sm font-sans font-light text-[#2D2220]/70 mt-3 leading-relaxed">
              Face à l'industrialisation à outrance de la billetterie, TYKS remet l'art et les relations humaines au centre de l'équation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {MANIFESTO.map((m) => (
              <div key={m.num} className="p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold px-3 py-1 rounded-full bg-[#FAF7F2] inline-block border border-[#E4DCD0]">{m.num}</span>
                  <h3 className="text-2xl md:text-3xl font-normal">{m.title}</h3>
                  <p className="text-sm font-sans font-light text-[#2D2220]/70 leading-relaxed">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION TÉMOIGNAGES / ENGAGEMENT ─── */}
      <section className="py-24 px-6 md:px-16 border-t border-[#E4DCD0] bg-[#F4EFE6]/30">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Ils nous font confiance</span>
            <h2 className="text-4xl md:text-5xl font-light leading-tight">Adopté par les salles et collectifs exigeants.</h2>
            <p className="text-sm font-sans font-light text-[#2D2220]/70 leading-relaxed">
              Que vous gériez un club underground, une salle de concert associative ou un festival indépendant, notre infrastructure s'adapte à vos spécificités sans compromis.
            </p>
            <div className="pt-2">
              <a 
                href="https://pro.tyks.app"
                className="text-xs font-sans font-medium uppercase tracking-widest text-[#5C1D24] border-b border-[#5C1D24] pb-1 hover:opacity-70 transition-opacity inline-flex items-center gap-2"
              >
                <span>Découvrir l'espace professionnel</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            {TEMOIGNAGES.map((t, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4 shadow-xs">
                <p className="text-base font-serif italic text-[#2D2220]/90">"{t.quote}"</p>
                <div className="text-xs font-sans tracking-widest uppercase text-[#5C1D24] font-medium">&mdash; {t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANDEAU CTA PRO (Plein format burgundy) ─── */}
      <section className="py-24 px-6 md:px-16 bg-[#5C1D24] text-[#FAF7F2]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#FAF7F2]/60">Espace Organisateur</span>
          <h2 className="text-4xl md:text-6xl font-light leading-tight">
            Reprenez le contrôle <br />
            <span className="italic">de vos salles et de vos flux</span>.
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed">
            Installez votre propre billetterie indépendante en quelques minutes et affranchissez-vous définitivement des intermédiaires opaques.
          </p>
          <div className="pt-2">
            <a
              href="https://pro.tyks.app"
              className="px-8 py-4 rounded-full bg-[#FAF7F2] text-[#5C1D24] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest inline-block shadow-md"
            >
              Ouvrir un compte Pro
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

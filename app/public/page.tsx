'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Ticket,
  QrCode,
  Music2,
  Megaphone,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const VILLES = ['Toutes', 'Paris', 'Bordeaux', 'Lyon', 'Marseille', 'Nantes'];

const LABELS_PARTENAIRES = [
  'Factory Town', 'Boiler Room', 'Sónar', 'Spotify', 'Framework',
  'Outernet', 'Rough Trade', 'Labyrinth', 'Red Bull',
];

const LINEUP = [
  'Kaytranada', 'Overmono', 'Fred again..', 'Job Jobse', 'Amelie Lens', 'DJ Seinfeld',
];

const TEMOIGNAGES = [
  { texte: "J'ai trouvé le concert d'un ami à trois villes de chez moi en deux minutes, et le remboursement s'est fait tout seul quand j'ai dû annuler.", auteur: 'Un fan de la communauté' },
  { texte: "Le prix affiché au départ, c'est celui que je paie à la fin. Ça paraît basique mais c'est rare.", auteur: 'Un fan de la communauté' },
];

/** Un petit tampon rond façon contrôle d'entrée, texte mono, bordure pointillée. */
function Stamp({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center border-2 border-dashed rounded-full px-5 py-2 text-[10px] font-mono uppercase tracking-[0.25em] ${className}`}
    >
      {children}
    </span>
  );
}

/** Encoches rondes qui viennent "poinçonner" une ligne pointillée verticale. */
function VerticalNotches({ bg }: { bg: string }) {
  return (
    <>
      <span className={`absolute -top-3 left-0 -translate-x-1/2 w-6 h-6 rounded-full ${bg}`} />
      <span className={`absolute -bottom-3 left-0 -translate-x-1/2 w-6 h-6 rounded-full ${bg}`} />
    </>
  );
}

/** Encoches rondes sur une ligne pointillée horizontale (bords gauche/droite d'un billet). */
function HorizontalNotches({ bg }: { bg: string }) {
  return (
    <>
      <span className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${bg}`} />
      <span className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${bg}`} />
    </>
  );
}

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [villeActive, setVilleActive] = useState('Toutes');

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true })
        .limit(12);

      if (!error && data) setEvents(data);
      setLoading(false);
    };
    fetchPublishedEvents();
  }, []);

  const evenementsFiltres = useMemo(() => {
    if (villeActive === 'Toutes') return events.slice(0, 6);
    return events
      .filter((item) => (item.location || '').toLowerCase().includes(villeActive.toLowerCase()))
      .slice(0, 6);
  }, [events, villeActive]);

  return (
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2] overflow-hidden">

      {/* ─── HERO : le billet lui-même ─── */}
      <section className="relative px-6 md:px-16 pt-16 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-10 items-center">

          <div className="lg:col-span-7 space-y-8">
            <Stamp className="border-[#5C1D24] text-[#5C1D24] -rotate-3">Accès toutes salles</Stamp>

            <h1 className="font-sans font-black text-6xl md:text-8xl tracking-tighter leading-[0.88]">
              Chope ton
              <br />
              billet<span className="text-[#5C1D24]">.</span>
            </h1>

            <p className="font-mono text-xs md:text-sm text-[#2D2220]/60 max-w-md leading-relaxed uppercase tracking-wide">
              Prix affiché = prix payé. Recommandations qui collent à tes oreilles.
              Revente sécurisée si les plans changent.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#events"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-mono font-medium uppercase tracking-widest hover:bg-[#43141A] transition-colors"
              >
                Voir l'agenda <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link
                href="/organisateurs"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-[#2D2220]/20 text-xs font-mono font-medium uppercase tracking-widest hover:border-[#5C1D24] hover:text-[#5C1D24] transition-colors"
              >
                Créer un événement
              </Link>
            </div>
          </div>

          {/* Le billet mock, pièce centrale de la page */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative -rotate-3 w-full max-w-sm rounded-[1.75rem] border-2 border-[#2D2220]/15 bg-[#F2ECE4] shadow-[0_20px_40px_-20px_rgba(45,34,32,0.35)]">
              <div className="p-6 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2D2220]/50">Pass soirée</span>
                <Ticket className="w-5 h-5 text-[#5C1D24]" />
              </div>
              <div className="px-6 pb-6">
                <div className="text-4xl font-black tracking-tight">CE SOIR</div>
                <div className="font-mono text-xs text-[#2D2220]/50 mt-1 uppercase tracking-wide">Porte ouverte 22:00</div>
              </div>

              <div className="relative border-t-2 border-dashed border-[#2D2220]/20 mx-0">
                <HorizontalNotches bg="bg-[#FAF7F2]" />
              </div>

              <div className="p-6 flex items-center justify-between">
                <div
                  className="h-8 w-28"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #2D2220 0px, #2D2220 2px, transparent 2px, transparent 5px)',
                  }}
                />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#2D2220]/50">N° 004821</span>
                  <QrCode className="w-8 h-8 text-[#2D2220]/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SÉLECTEUR DE VILLE : bande façon carte d'embarquement ─── */}
      <section className="px-6 md:px-16 max-w-7xl mx-auto w-full">
        <div className="rounded-full border border-[#E4DCD0] bg-[#F0EBE3] px-6 py-3 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5C1D24] font-semibold shrink-0">Destination</span>
          <div className="flex flex-wrap gap-2">
            {VILLES.map((ville) => (
              <button
                key={ville}
                onClick={() => setVilleActive(ville)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors ${
                  villeActive === ville
                    ? 'bg-[#5C1D24] text-[#FAF7F2]'
                    : 'text-[#2D2220]/60 hover:text-[#5C1D24]'
                }`}
              >
                {ville}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LINEUP ─── */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5C1D24] font-semibold">Programmé cette saison</span>
        <div className="mt-6 divide-y divide-dashed divide-[#E4DCD0]">
          {LINEUP.map((artiste, i) => (
            <div
              key={artiste}
              className={`flex items-center gap-4 py-4 ${i % 2 === 0 ? '' : 'pl-8 md:pl-16'}`}
            >
              <Music2 className="w-4 h-4 text-[#5C1D24]/50 shrink-0" />
              <span
                className={`leading-none tracking-tight ${
                  i % 3 === 0
                    ? 'text-4xl md:text-6xl font-black'
                    : i % 3 === 1
                    ? 'text-3xl md:text-5xl font-light italic'
                    : 'text-2xl md:text-4xl font-black text-[#5C1D24]'
                }`}
              >
                {artiste}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AGENDA : souches de billets ─── */}
      <section id="events" className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5C1D24] font-semibold">Guichet</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-2">Événements populaires</h2>
          </div>
          <Link
            href="/events"
            className="text-xs font-mono uppercase tracking-widest text-[#2D2220] border-b border-[#5C1D24] pb-0.5 hover:text-[#5C1D24] transition-colors whitespace-nowrap"
          >
            Tout l'agenda &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs font-mono uppercase tracking-widest text-[#2D2220]/40">
            Impression des billets en cours...
          </div>
        ) : evenementsFiltres.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-[#E4DCD0] rounded-[2rem] space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-[#2D2220]/60">
              Guichet vide à {villeActive === 'Toutes' ? "l'affiche" : villeActive} pour l'instant.
            </p>
            <p className="text-xs font-sans font-light text-[#2D2220]/40">Reviens vite pour les prochaines dates.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {evenementsFiltres.map((item, index) => {
              const startDate = item.starts_at ? new Date(item.starts_at) : null;
              const formattedDate = startDate
                ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                : '';
              const priceLabel = Number(item.price) === 0 ? 'OFFERT' : `${Number(item.price).toFixed(0)}€`;
              const rotation = index % 2 === 0 ? '-rotate-1' : 'rotate-1';

              return (
                <Link
                  key={item.id}
                  href={`/events/${item.slug}`}
                  className={`group relative flex rounded-[1.5rem] border-2 border-[#2D2220]/15 bg-[#F2ECE4] hover:border-[#5C1D24] transition-colors overflow-visible ${rotation} hover:rotate-0`}
                >
                  <div className="flex-1 p-6 space-y-4 min-w-0">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#2D2220]/50">
                      <span>N° {String(1000 + index * 47).padStart(5, '0')}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{formattedDate}</span>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight leading-snug">{item.title}</h3>
                      <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-2 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {item.location || 'Lieu confidentiel'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#5C1D24]/70">{item.organizations?.name || 'Collectif'}</span>
                  </div>

                  <div className="relative w-24 shrink-0 border-l-2 border-dashed border-[#2D2220]/20 flex flex-col items-center justify-center gap-3 p-3">
                    <VerticalNotches bg="bg-[#FAF7F2]" />
                    <span
                      className="font-mono text-sm font-bold tracking-wide"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      {priceLabel}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center group-hover:bg-[#5C1D24] group-hover:text-[#FAF7F2] transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── CE QUI CHANGE : trois souches côte à côte ─── */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5C1D24] font-semibold">Sur ce billet, c'est écrit noir sur blanc</span>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, titre: 'Prix transparent', texte: "Ce qui est affiché à la recherche, c'est ce que tu paies au checkout." },
            { icon: Sparkles, titre: 'Ça te ressemble', texte: 'Des recommandations basées sur ce que tu écoutes vraiment, pas sur des tendances génériques.' },
            { icon: RefreshCw, titre: 'Plan qui change ?', texte: 'Revends ton billet en deux minutes, en toute sécurité, sur la plateforme.' },
          ].map(({ icon: Icon, titre, texte }, i) => (
            <div
              key={titre}
              className={`p-6 rounded-[1.5rem] border-2 border-dashed border-[#E4DCD0] ${i === 1 ? 'md:-translate-y-3' : ''}`}
            >
              <Icon className="w-6 h-6 text-[#5C1D24] mb-4" />
              <h3 className="text-lg font-black tracking-tight mb-2">{titre}</h3>
              <p className="text-xs font-sans font-light text-[#2D2220]/70 leading-relaxed">{texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PARTENAIRES : liseré façon bracelet festival ─── */}
      <section className="py-10 border-y-2 border-dashed border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {LABELS_PARTENAIRES.map((label) => (
            <span key={label} className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#2D2220]/50">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ─── ORGANISATEURS : le dos du billet ─── */}
      <section className="py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-[#5C1D24] text-[#FAF7F2] p-10 md:p-16 relative overflow-hidden">
          <Stamp className="border-[#FAF7F2]/40 text-[#FAF7F2]/80 -rotate-6 mb-8">Accès organisateur</Stamp>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FAF7F2]/60">
                <Megaphone className="w-4 h-4" /> Publier un événement
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                Trouvez votre public.
              </h2>
              <p className="text-sm md:text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed max-w-lg">
                Vendez vos billets à la bonne personne, au bon moment, au juste prix — et suivez tout depuis un
                tableau de bord unique.
              </p>
              <Link
                href="/organisateurs"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#FAF7F2] text-[#5C1D24] rounded-full text-xs font-mono font-medium uppercase tracking-widest hover:bg-white transition-colors"
              >
                Publier mon événement <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-[#FAF7F2]/20 rounded-[1.25rem] overflow-hidden">
              {[
                ['0 €', 'Frais de mise en ligne'],
                ['J+1', "Versement après l'événement"],
                ['Live', 'Suivi des ventes en temps réel'],
                ['24/7', 'Support organisateurs'],
              ].map(([chiffre, label]) => (
                <div key={label} className="bg-[#5C1D24] p-6 space-y-2">
                  <div className="text-2xl font-black">{chiffre}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#FAF7F2]/60 leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES : pass scotchés ─── */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5C1D24] font-semibold">La communauté en parle</span>
        <div className="mt-10 grid md:grid-cols-2 gap-10">
          {TEMOIGNAGES.map((t, i) => (
            <div
              key={t.auteur + i}
              className={`relative p-8 bg-[#F2ECE4] border border-[#E4DCD0] rounded-sm shadow-sm ${i === 0 ? '-rotate-1' : 'rotate-1'}`}
            >
              <span
                className={`absolute -top-3 ${i === 0 ? '-left-3 -rotate-12' : '-right-3 rotate-12'} w-14 h-6 bg-[#F0EBE3]/90 border border-[#E4DCD0]`}
              />
              <blockquote className="text-lg md:text-xl font-light italic leading-snug">"{t.texte}"</blockquote>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#2D2220]/50">— {t.auteur}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA FINAL : grand billet plein cadre ─── */}
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-7xl mx-auto relative rounded-[2rem] border-2 border-[#2D2220]/15 bg-[#F4EFE6] p-12 md:p-20 text-center overflow-visible">
          <Stamp className="border-[#5C1D24] text-[#5C1D24] rotate-6 mb-8">Admit one</Stamp>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            Ne rate plus
            <br />
            <span className="text-[#5C1D24]">jamais une nuit.</span>
          </h2>
          <p className="max-w-xl mx-auto mt-6 text-base font-sans font-light text-[#2D2220]/70 leading-relaxed">
            Découvre les prochains événements et réserve ta place en quelques secondes, où que tu sois.
          </p>
          <div className="mt-8 relative inline-block">
            <a
              href="#events"
              className="px-10 py-4 rounded-full bg-[#5C1D24] text-[#FAF7F2] hover:bg-[#43141A] transition-colors text-xs font-mono font-medium uppercase tracking-widest inline-block"
            >
              Découvrir les événements
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

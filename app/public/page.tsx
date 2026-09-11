'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Flame,
  Search,
  Smartphone,
  Megaphone,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const VILLES = ['Toutes', 'Paris', 'Bordeaux', 'Lyon', 'Marseille', 'Nantes'];

const LABELS_PARTENAIRES = [
  'Factory Town', 'Boiler Room', 'Sónar', 'Spotify', 'Framework',
  'Outernet', 'Rough Trade', 'Labyrinth', 'Red Bull',
];

const ARTISTES_A_LAFFICHE = [
  { nom: 'Kaytranada', taille: 'text-4xl md:text-6xl font-normal' },
  { nom: 'Overmono', taille: 'text-2xl md:text-4xl font-light italic' },
  { nom: 'Fred again..', taille: 'text-5xl md:text-7xl font-normal' },
  { nom: 'Job Jobse', taille: 'text-2xl md:text-3xl font-light' },
  { nom: 'Amelie Lens', taille: 'text-4xl md:text-6xl font-normal italic' },
  { nom: 'DJ Seinfeld', taille: 'text-2xl md:text-4xl font-light' },
];

const TEMOIGNAGES = [
  {
    texte: "J'ai trouvé le concert d'un ami trois villes plus loin en deux minutes, et le remboursement s'est fait tout seul quand j'ai dû annuler.",
    auteur: 'Un fan de la communauté',
  },
  {
    texte: "Le prix affiché au départ, c'est celui que je paie à la fin. Ça paraît basique mais c'est rare.",
    auteur: 'Un fan de la communauté',
  },
];

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

      if (!error && data) {
        setEvents(data);
      }
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
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2] font-serif overflow-hidden">

      {/* ─── HERO ─── */}
      <section className="relative px-6 md:px-16 pt-16 pb-24 max-w-7xl mx-auto w-full border-b border-[#E4DCD0]">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.3em] uppercase px-4 py-2 rounded-full bg-[#F0EBE3] text-[#5C1D24] font-medium border border-[#E4DCD0]">
            <span className="w-2 h-2 rounded-full bg-[#5C1D24] animate-pulse" />
            <span>Bienvenue dans l'alternative</span>
          </div>

        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 space-y-6">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-[0.9]">
              Chope ton billet.
              <br />
              <span className="italic font-normal text-[#5C1D24]">Vis la soirée.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 space-y-6 pb-4">
            <p className="text-base md:text-lg font-sans font-light text-[#2D2220]/70 leading-relaxed">
              Des concerts et soirées près de chez toi, un prix affiché sans surprise au checkout,
              et des recommandations qui collent vraiment à tes goûts.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#events"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#43141A] transition-colors shadow-sm"
              >
                <span>Explorer l'agenda</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link
                href="/organisateurs"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-[#2D2220]/20 text-xs font-sans font-medium uppercase tracking-widest hover:border-[#5C1D24] hover:text-[#5C1D24] transition-colors"
              >
                <span>Créer un événement</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[#E4DCD0] grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">0 frais</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">cachés au checkout</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">100 %</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">revente sécurisée</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">5 villes</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">et bientôt plus</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-light text-[#5C1D24]">Instantané</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/50 mt-1">billet sur ton tél.</div>
          </div>
        </div>
      </section>

      {/* ─── ARTISTES À L'AFFICHE ─── */}
      <section className="py-20 px-6 md:px-16 border-b border-[#E4DCD0] bg-[#F4EFE6]/40">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">
            Artistes à l'affiche
          </span>
          <div className="mt-8 flex flex-col gap-3">
            {ARTISTES_A_LAFFICHE.map((artiste) => (
              <span key={artiste.nom} className={`${artiste.taille} leading-none tracking-tight`}>
                {artiste.nom}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AGENDA / ÉVÉNEMENTS ─── */}
      <section id="events" className="py-28 px-6 md:px-16 border-b border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4" /> Tendance en ce moment
              </span>
              <h2 className="text-4xl md:text-6xl font-light mt-3">Événements populaires</h2>
            </div>
            <Link
              href="/events"
              className="text-xs font-sans tracking-widest uppercase text-[#2D2220] border-b border-[#5C1D24] pb-0.5 hover:text-[#5C1D24] transition-colors whitespace-nowrap"
            >
              Voir tous les événements &rarr;
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-12">
            {VILLES.map((ville) => (
              <button
                key={ville}
                onClick={() => setVilleActive(ville)}
                className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-widest border transition-colors ${
                  villeActive === ville
                    ? 'bg-[#5C1D24] text-[#FAF7F2] border-[#5C1D24]'
                    : 'border-[#E4DCD0] text-[#2D2220]/60 hover:border-[#5C1D24] hover:text-[#5C1D24]'
                }`}
              >
                {ville}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40">
              Chargement de la programmation...
            </div>
          ) : evenementsFiltres.length === 0 ? (
            <div className="py-24 text-center border border-[#E4DCD0] rounded-[2.5rem] bg-[#F2ECE4] space-y-3">
              <p className="text-xs font-sans tracking-widest uppercase text-[#2D2220]/60">
                Aucun événement à {villeActive === 'Toutes' ? 'afficher' : villeActive} pour le moment.
              </p>
              <p className="text-xs font-sans font-light text-[#2D2220]/40">Reviens vite pour découvrir les prochaines dates.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {evenementsFiltres.map((item) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Offert' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link
                    key={item.id}
                    href={`/events/${item.slug}`}
                    className="group p-8 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] hover:border-[#5C1D24] transition-colors duration-300 flex flex-col justify-between h-[380px] shadow-xs"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-xs font-sans tracking-wider text-[#2D2220]/50 gap-3">
                        <span className="truncate font-medium text-[#5C1D24]">{item.organizations?.name || 'Collectif'}</span>
                        <span className="flex items-center gap-1.5 shrink-0"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
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

      {/* ─── EXPÉRIENCE FAN ─── */}
      <section className="py-28 px-6 md:px-16 border-b border-[#E4DCD0] bg-[#F4EFE6]/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">
              Une billetterie qui ne complique rien
            </span>
            <h2 className="text-4xl md:text-6xl font-light leading-tight mt-3">
              Le billet en moins de temps qu'il n'en faut pour le lire.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal">Prix transparent</h3>
              <p className="text-xs font-sans font-light text-[#2D2220]/70 leading-relaxed">
                Le prix affiché à la recherche est celui du checkout, sans frais qui apparaissent au dernier moment.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal">Recommandations sur-mesure</h3>
              <p className="text-xs font-sans font-light text-[#2D2220]/70 leading-relaxed">
                Suis tes artistes favoris et reçois des suggestions basées sur ce que tu écoutes vraiment.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal">Changement de plan ?</h3>
              <p className="text-xs font-sans font-light text-[#2D2220]/70 leading-relaxed">
                Un empêchement ? Revends ton billet instantanément et en toute sécurité sur la plateforme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RÉSEAU DE PARTENAIRES ─── */}
      <section className="py-16 border-b border-[#E4DCD0] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16 mb-8">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#2D2220]/40 block text-center">
            En partenariat avec des promoteurs et des salles de tout le pays
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 px-6 opacity-75">
          {LABELS_PARTENAIRES.map((label) => (
            <span key={label} className="text-sm md:text-base font-sans font-medium tracking-wider uppercase text-[#2D2220]/75">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ─── POUR LES ORGANISATEURS ─── */}
      <section className="py-28 px-6 md:px-16 bg-[#5C1D24] text-[#FAF7F2] border-b border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#FAF7F2]/60 font-semibold flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> Pour les organisateurs
            </span>
            <h2 className="text-4xl md:text-6xl font-light leading-tight">
              Vous organisez un événement ?
              <br />
              <span className="italic">Trouvez votre public.</span>
            </h2>
            <p className="text-sm md:text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed max-w-lg">
              Vendez vos billets à la bonne personne, au bon moment, au juste prix — et suivez tout depuis un seul
              tableau de bord.
            </p>
            <Link
              href="/organisateurs"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FAF7F2] text-[#5C1D24] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-white transition-colors"
            >
              <span>Publier mon événement</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-[2rem] bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 space-y-2">
              <div className="text-3xl font-light">0 €</div>
              <div className="text-xs font-sans uppercase tracking-widest text-[#FAF7F2]/60">frais de mise en ligne</div>
            </div>
            <div className="p-6 rounded-[2rem] bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 space-y-2">
              <div className="text-3xl font-light">J+1</div>
              <div className="text-xs font-sans uppercase tracking-widest text-[#FAF7F2]/60">versement après l'événement</div>
            </div>
            <div className="p-6 rounded-[2rem] bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 space-y-2 col-span-2">
              <div className="text-xl font-light">Suivi des ventes en temps réel</div>
              <div className="text-xs font-sans uppercase tracking-widest text-[#FAF7F2]/60">jauge, revenus, provenance du public</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TÉLÉCHARGER L'APP ─── */}
      <section className="py-28 px-6 md:px-16 border-b border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Sur ton téléphone
            </span>
            <h2 className="text-4xl md:text-6xl font-light leading-tight">
              Chope ton billet, garde le souvenir.
            </h2>
            <p className="text-sm md:text-base font-sans font-light text-[#2D2220]/70 leading-relaxed max-w-md">
              Plus besoin de chercher un e-mail ou d'imprimer un PDF : tout est centralisé sur ton téléphone, avec
              des codes sécurisés et des remboursements gérés en deux clics.
            </p>
            <div className="flex gap-3">
              <span className="px-6 py-3 rounded-full border border-[#2D2220]/20 text-xs font-sans font-medium uppercase tracking-widest">
                App Store
              </span>
              <span className="px-6 py-3 rounded-full border border-[#2D2220]/20 text-xs font-sans font-medium uppercase tracking-widest">
                Google Play
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="w-56 h-[420px] rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] shadow-sm p-4 flex flex-col gap-3">
              <div className="flex-1 rounded-[1.75rem] bg-[#5C1D24]/10 flex items-center justify-center">
                <span className="text-xs font-sans uppercase tracking-widest text-[#5C1D24]/50">Aperçu billet</span>
              </div>
              <div className="h-10 rounded-full bg-[#5C1D24]" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─── */}
      <section className="py-28 px-6 md:px-16 border-b border-[#E4DCD0]">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#5C1D24] font-semibold">
            La communauté en parle
          </span>
          <div className="grid md:grid-cols-2 gap-12">
            {TEMOIGNAGES.map((t) => (
              <div key={t.auteur} className="space-y-4">
                <blockquote className="text-2xl md:text-3xl font-light italic leading-tight text-[#2D2220]">
                  "{t.texte}"
                </blockquote>
                <div className="text-xs font-sans uppercase tracking-widest text-[#2D2220]/50">
                  &mdash; {t.auteur}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-28 px-6 md:px-16 bg-[#F4EFE6] text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-light leading-tight">
            Ne rate plus jamais
            <br />
            <span className="italic text-[#5C1D24]">une nuit.</span>
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#2D2220]/70 leading-relaxed">
            Découvre les prochains événements et réserve ta place en quelques secondes, où que tu sois.
          </p>
          <div className="pt-4">
            <a
              href="#events"
              className="px-8 py-4 rounded-full bg-[#5C1D24] text-[#FAF7F2] hover:bg-[#43141A] transition-colors text-xs font-sans font-medium uppercase tracking-widest shadow-md inline-block"
            >
              Découvrir les événements
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

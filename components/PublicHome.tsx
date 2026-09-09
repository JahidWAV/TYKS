import Link from 'next/link';
import {
  Zap,
  ArrowUpRight,
  TrendingUp,
  Users2,
  Palette,
  ShieldCheck,
} from 'lucide-react';

const EVENTS = [
  {
    title: 'Nuit Électro',
    venue: 'Le Sous-Sol, Lyon',
    org: 'Collectif Basalte',
    date: '12 mars',
    price: '14 €',
    tags: ['Techno', 'House'],
    gradient: 'from-[#FF4D8D]/40 via-[#7C5CFF]/30 to-transparent',
    featured: true,
  },
  {
    title: "Open Air d'Automne",
    venue: 'Parc des Docks, Marseille',
    date: '4 oct.',
    price: '22 €',
    tags: ['Techno', 'Trance'],
    gradient: 'from-[#FFB86B]/30 via-[#FF4D8D]/20 to-transparent',
  },
  {
    title: 'Club Interdit',
    venue: 'La Chapelle, Lille',
    date: '28 nov.',
    price: '18 €',
    tags: ['Drum & Bass'],
    gradient: 'from-[#3D5AFE]/30 via-[#7C5CFF]/20 to-transparent',
  },
  {
    title: 'Salon Vinyle',
    venue: 'La Cordonnerie, Bordeaux',
    date: '9 déc.',
    price: '6 €',
    tags: ['Disco', 'Funk'],
    gradient: 'from-[#7C5CFF]/30 via-[#FF4D8D]/20 to-transparent',
  },
];

const FIELDS = [
  {
    icon: TrendingUp,
    title: 'Marges maximales',
    body: "Pas de grille tarifaire imposée. Vous gardez l'essentiel de chaque vente.",
    glow: 'bg-[#FF4D8D]/20',
  },
  {
    icon: Users2,
    title: 'Données directes',
    body: 'Vos contacts et vos ventes vous appartiennent, en temps réel.',
    glow: 'bg-[#3D5AFE]/20',
  },
  {
    icon: Palette,
    title: 'Image sur-mesure',
    body: "Un sous-domaine et une interface aux couleurs de votre salle.",
    glow: 'bg-[#7C5CFF]/20',
  },
];

export default function PublicHome() {
  return (
    <div className="relative overflow-hidden bg-onyx">
      {/* Ambient orbes — fixed, layered, asymmetric */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-[-8%] h-[42rem] w-[42rem] rounded-full bg-gradient-to-br from-[#FF4D8D]/20 to-[#7C5CFF]/20 blur-[100px]" />
        <div className="absolute right-[-10%] top-[28%] h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-[#3D5AFE]/20 to-[#7C5CFF]/10 blur-[110px]" />
        <div className="absolute left-[20%] top-[75%] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-[#FF4D8D]/10 to-transparent blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ---------- HERO — broken 12-col grid ---------- */}
        <section className="grid grid-cols-1 gap-y-16 pb-20 pt-24 lg:grid-cols-12 lg:gap-x-6 lg:pt-32">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 font-mono text-[11px] text-bone-muted backdrop-blur-xl">
              <Zap className="h-3 w-3 text-[#FF4D8D]" />
              Sans commissions cachées
            </span>

            <h1 className="mt-7 font-display font-bold tracking-tight text-bone">
              <span className="block text-[3.2rem] leading-[0.95] md:text-[5rem]">La billetterie</span>
              <span className="block bg-gradient-to-r from-bone via-bone to-bone/40 bg-clip-text text-[3.2rem] leading-[0.95] text-transparent md:text-[5rem]">
                qui reste
              </span>
              <span className="block text-[3.2rem] leading-[0.95] md:text-[5rem]">entre vos mains.</span>
            </h1>

            <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-bone-muted">
              TYKS connecte le public aux organisateurs, sans les
              commissions ni la boîte noire des grandes plateformes.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/evenements"
                className="inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-all duration-300 hover:bg-white"
              >
                Voir les événements
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="https://pro.tyks.app"
                className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.02] px-7 py-3.5 text-sm font-semibold text-bone backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05]"
              >
                Espace organisateur
              </a>
            </div>
          </div>

          {/* Collector-grade ticket — offset, overlapping the grid */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mt-8">
            <div className="relative mx-auto w-[20rem] rotate-[-5deg] lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-[#FF4D8D]/25 via-[#7C5CFF]/20 to-[#3D5AFE]/25 blur-3xl" />

              <div className="relative flex overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-white/[0.03] shadow-[0_40px_80px_-30px_rgba(124,92,255,0.5)] backdrop-blur-2xl">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.14) 48%, transparent 66%)',
                  }}
                />
                <div className="relative flex-1 space-y-6 p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-wide text-bone-faint">admit one</span>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4D8D]/60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#FF4D8D] to-[#7C5CFF]" />
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-bone-faint">jeu 12 mars — 21:00</p>
                    <h3 className="mt-1.5 font-display text-[1.8rem] font-bold leading-tight text-bone">Nuit Électro</h3>
                    <p className="mt-1 text-xs text-bone-muted">Le Sous-Sol, Lyon</p>
                  </div>
                  <div className="border-t border-dashed border-white/[0.15] pt-4">
                    <p className="font-mono text-[10px] text-bone-faint">place</p>
                    <p className="font-mono text-base text-bone">A12</p>
                  </div>
                </div>

                <div className="relative flex w-[4.75rem] shrink-0 items-center justify-center border-l border-dashed border-white/[0.15]">
                  {/* precise perforation notches down the stub */}
                  <div
                    aria-hidden
                    className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to bottom, rgba(255,255,255,0.25) 0 3px, transparent 3px 9px)',
                    }}
                  />
                  <span
                    className="font-mono text-[10px] tracking-[0.15em] text-bone-faint"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    TYKS · A12
                  </span>
                  <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                  <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                </div>
              </div>
            </div>
          </div>

          {/* Fee breakdown — glass strip spanning both columns */}
          <div className="lg:col-span-12">
            <div className="grid gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-bone-faint">Sur un billet à 20,00 €</p>
                <div className="mt-3 space-y-1.5 font-mono text-sm">
                  <div className="flex justify-between text-bone-muted">
                    <span>Frais de traitement (paiement + service)</span>
                    <span>1,00 €</span>
                  </div>
                  <div className="flex justify-between font-semibold text-bone">
                    <span>Reversé à l'organisateur</span>
                    <span>19,00 €</span>
                  </div>
                </div>
              </div>
              <div className="hidden h-16 w-px bg-white/[0.1] sm:block" />
              <p className="text-sm leading-relaxed text-bone-muted">
                Sur une plateforme généraliste, les frais cumulés côté
                organisateur et acheteur dépassent souvent 10 à 15 % du prix
                du billet. Chez TYKS, ce sont les frais de traitement réels —
                et rien d'autre.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- MANIFESTO ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="relative max-w-2xl rounded-2xl border border-white/[0.06] bg-white/[0.015] p-10 backdrop-blur-xl">
            <div className="absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-[#7C5CFF]/10 blur-3xl" />
            <p className="font-display text-2xl font-medium leading-snug text-bone md:text-3xl">
              Une billetterie ne devrait pas décider à la place de
              l'organisateur combien coûte sa soirée, à quoi ressemble sa
              page, ni qui a le droit de connaître son public. TYKS ne fait
              que le lien entre une salle et les gens qui veulent y être.
            </p>
          </div>
        </section>

        {/* ---------- EVENTS — asymmetric bento, deep gradient masks ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-bone">Ça bouge en ce moment</h2>
            <Link href="/evenements" className="inline-flex items-center gap-1 text-sm font-medium text-bone-muted transition-colors hover:text-bone">
              Tout voir
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EVENTS.map((event) => (
              <Link
                key={event.title}
                href="/evenements"
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.04] ${
                  event.featured ? 'sm:col-span-2 sm:row-span-2' : ''
                }`}
              >
                <div className={`relative ${event.featured ? 'h-56' : 'h-32'} overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient}`} />
                  <div className="absolute inset-0 bg-onyx/20" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/[0.15] bg-black/30 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {event.org && (
                    <span className="absolute bottom-3 left-3 font-mono text-[10px] text-white/70">par {event.org}</span>
                  )}
                </div>
                <div className="flex items-start justify-between p-5">
                  <div>
                    <h3 className={`font-display font-bold text-bone ${event.featured ? 'text-xl' : 'text-base'}`}>
                      {event.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-bone-muted">{event.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] text-bone-faint">{event.date}</p>
                    <p className="font-mono text-sm text-bone">{event.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- ORGANIZERS — asymmetric, localized glows, dashboard preview ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-5">
              <h2 className="font-display text-[1.9rem] font-bold leading-tight text-bone">
                Votre soirée, vos
                <br />
                chiffres, en direct.
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-bone-muted">
                Pas de rapport à demander, pas d'export à attendre. L'espace
                pro affiche vos ventes au fur et à mesure, avec vos propres
                contacts acheteurs — jamais partagés avec un concurrent.
              </p>
              <a
                href="https://pro.tyks.app"
                className="inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-all duration-300 hover:bg-white"
              >
                Accéder à l'espace Pro
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* Dashboard preview — glass panel with glow */}
            <div className="relative lg:col-span-7">
              <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-[#3D5AFE]/15 blur-[90px]" />
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
                  <span className="flex items-center gap-2 font-mono text-[11px] text-bone-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#7C5CFF]" />
                    Nuit Électro — 12 mars
                  </span>
                  <span className="font-mono text-[10px] text-bone-faint">mis à jour à l'instant</span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/[0.08]">
                  <div className="px-6 py-6">
                    <p className="font-mono text-[10px] text-bone-faint">Billets vendus</p>
                    <p className="mt-1 font-display text-2xl font-bold text-bone">342</p>
                  </div>
                  <div className="px-6 py-6">
                    <p className="font-mono text-[10px] text-bone-faint">Revenu net</p>
                    <p className="mt-1 font-display text-2xl font-bold text-bone">6 498 €</p>
                  </div>
                  <div className="px-6 py-6">
                    <p className="font-mono text-[10px] text-bone-faint">Remplissage</p>
                    <p className="mt-1 font-display text-2xl font-bold text-bone">87 %</p>
                  </div>
                </div>
                <div className="border-t border-white/[0.08] px-6 py-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#7C5CFF]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature blocks — staggered, localized glows, mono micro-accents */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {FIELDS.map((field, i) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.title}
                  className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.035] ${
                    i === 1 ? 'sm:mt-6' : ''
                  }`}
                >
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${field.glow}`} />
                  <div className="relative flex items-center justify-between">
                    <Icon className="h-5 w-5 text-bone-muted" />
                    <span className="font-mono text-[10px] text-bone-faint">0{i + 1}</span>
                  </div>
                  <h3 className="relative mt-5 font-display text-base font-bold text-bone">{field.title}</h3>
                  <p className="relative mt-2 text-xs leading-relaxed text-bone-muted">{field.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

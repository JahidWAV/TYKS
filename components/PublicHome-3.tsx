import Link from 'next/link';

const SCENE_WORDS = [
  { text: 'Techno', size: 'text-5xl md:text-7xl', tone: 'text-bone' },
  { text: 'nuits underground', size: 'text-2xl md:text-4xl', tone: 'bg-gradient-to-r from-[#FF4D8D] to-[#7C5CFF] bg-clip-text text-transparent' },
  { text: 'open air', size: 'text-3xl md:text-5xl', tone: 'text-bone' },
  { text: 'clubs indépendants', size: 'text-xl md:text-3xl', tone: 'text-bone-muted' },
  { text: 'raves', size: 'text-4xl md:text-6xl', tone: 'bg-gradient-to-r from-[#7C5CFF] to-[#3D5AFE] bg-clip-text text-transparent' },
];

const STEPS = [
  { n: '01', title: 'Trouver', body: 'Parcourez les événements de créateurs et de salles qui vendent en direct, sans intermédiaire.' },
  { n: '02', title: 'Réserver', body: 'Payez en quelques secondes. Votre billet arrive sous forme de pass numérique, prêt à scanner.' },
  { n: '03', title: 'Scanner', body: "Présentez votre pass à l'entrée. Un contrôle instantané, sans papier, sans file." },
];

const EVENTS = [
  {
    title: 'Nuit Électro',
    venue: 'Le Sous-Sol, Lyon',
    date: '12 mars',
    price: '14 €',
    tags: ['Techno', 'House'],
    gradient: 'from-[#FF4D8D] via-[#B857E0] to-[#3D5AFE]',
  },
  {
    title: "Open Air d'Automne",
    venue: 'Parc des Docks, Marseille',
    date: '4 oct.',
    price: '22 €',
    tags: ['Techno', 'Trance'],
    gradient: 'from-[#FFB86B] via-[#FF4D8D] to-[#7C5CFF]',
  },
  {
    title: 'Club Interdit',
    venue: 'La Chapelle, Lille',
    date: '28 nov.',
    price: '18 €',
    tags: ['Drum & Bass', 'Hardcore'],
    gradient: 'from-[#3D5AFE] via-[#7C5CFF] to-[#FF4D8D]',
  },
];

const FIELDS = [
  {
    title: 'Marges maximales',
    body: "Pas de grille tarifaire imposée. Les organisateurs gardent l'essentiel de chaque vente.",
    glow: 'bg-[#FF4D8D]/[0.10]',
  },
  {
    title: 'Données directes',
    body: 'Chaque organisateur accède à ses propres contacts et ventes, en temps réel.',
    glow: 'bg-[#3D5AFE]/[0.10]',
  },
  {
    title: 'Image sur-mesure',
    body: "Un sous-domaine et une interface aux couleurs de chaque salle ou collectif.",
    glow: 'bg-[#7C5CFF]/[0.10]',
  },
];

export default function PublicHome() {
  return (
    <div className="bg-onyx">
      <div className="mx-auto max-w-6xl px-6">
        {/* ---------- HERO ---------- */}
        <section className="py-24 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12">
            <div className="space-y-8">
              <h1 className="font-display text-[2.9rem] font-bold leading-[0.98] tracking-tight text-bone md:text-[4.2rem]">
                La billetterie
                <br />
                qui reste entre
                <br />
                vos mains.
              </h1>
              <p className="max-w-sm text-[1.05rem] leading-relaxed text-bone-muted">
                TYKS connecte le public aux organisateurs, sans les
                commissions ni la boîte noire des grandes plateformes.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href="/evenements"
                  className="inline-flex items-center rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-colors duration-300 hover:bg-white"
                >
                  Voir les événements
                </Link>
                <a
                  href="https://pro.tyks.app"
                  className="inline-flex items-center rounded-full border border-white/[0.1] px-7 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:border-white/25"
                >
                  Espace organisateur
                </a>
              </div>
            </div>

            {/* Ticket — colorful glass, the one bold object on the page */}
            <div className="mx-auto lg:mx-0 lg:justify-self-end">
              <div className="relative w-[19rem] rotate-[-4deg]">
                <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-[#FF4D8D]/25 via-[#7C5CFF]/20 to-[#3D5AFE]/25 blur-3xl" />
                <div className="relative flex overflow-hidden rounded-[1.75rem] border border-white/[0.12] bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-transparent shadow-[0_30px_70px_-25px_rgba(124,92,255,0.45)] backdrop-blur-2xl">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.5]"
                    style={{ background: 'linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)' }}
                  />
                  <div className="relative flex-1 space-y-6 p-7">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-wide text-bone-faint">admit one</span>
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#7C5CFF]" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-bone-faint">jeu 12 mars — 21:00</p>
                      <h3 className="mt-1.5 font-display text-[1.7rem] font-bold leading-tight text-bone">Nuit Électro</h3>
                      <p className="mt-1 text-xs text-bone-muted">Le Sous-Sol, Lyon</p>
                    </div>
                    <div className="border-t border-dashed border-white/[0.15] pt-4">
                      <p className="font-mono text-[10px] text-bone-faint">place</p>
                      <p className="font-mono text-base text-bone">A12</p>
                    </div>
                  </div>
                  <div className="relative flex w-[4.5rem] shrink-0 items-center justify-center border-l border-dashed border-white/[0.15]">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-bone-faint" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      TYKS · A12
                    </span>
                    <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                    <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scene word stack — typographic device, grounded in the actual live-music vocabulary */}
          <div className="mt-20 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-white/[0.06] pt-12">
            {SCENE_WORDS.map((word) => (
              <span key={word.text} className={`font-display font-bold leading-none ${word.size} ${word.tone}`}>
                {word.text}
              </span>
            ))}
          </div>
        </section>

        {/* ---------- EVENTS ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-bone">Ça bouge en ce moment</h2>
            <Link href="/evenements" className="text-sm font-medium text-bone-muted transition-colors hover:text-bone">
              Tout voir
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {EVENTS.map((event) => (
              <div key={event.title} className="group">
                <div className={`relative h-40 overflow-hidden rounded-2xl bg-gradient-to-br ${event.gradient}`}>
                  <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/0" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-black/30 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-bone">{event.title}</h3>
                    <p className="text-xs text-bone-muted">{event.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-bone-faint">{event.date}</p>
                    <p className="font-mono text-sm text-bone">{event.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="relative grid gap-12 sm:grid-cols-3 sm:gap-8">
            <div className="absolute left-0 right-0 top-[0.6rem] hidden h-px bg-gradient-to-r from-[#FF4D8D]/40 via-[#7C5CFF]/40 to-[#3D5AFE]/40 sm:block" />
            {STEPS.map((step) => (
              <div key={step.n} className="relative space-y-4">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.15] bg-onyx">
                  <span className="font-mono text-[9px] text-bone-faint">{step.n}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-bone">{step.title}</h3>
                <p className="max-w-[26ch] text-sm leading-relaxed text-bone-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FOR ORGANIZERS ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="mb-12 max-w-lg space-y-3">
            <h2 className="font-display text-[1.9rem] font-bold leading-tight text-bone">Pour ceux qui organisent</h2>
            <p className="text-sm leading-relaxed text-bone-muted">
              Un espace pro pensé pour piloter vos ventes, vos contacts et vos
              marges, sans dépendre d'une plateforme tierce.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {FIELDS.map((field) => (
              <div key={field.title} className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${field.glow}`} />
                <h3 className="relative font-display text-base font-bold text-bone">{field.title}</h3>
                <p className="relative mt-2 text-xs leading-relaxed text-bone-muted">{field.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="https://pro.tyks.app"
              className="inline-flex items-center rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-colors duration-300 hover:bg-white"
            >
              Accéder à l'espace Pro
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

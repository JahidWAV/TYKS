import Link from 'next/link';

const STEPS = [
  { n: '01', title: 'Trouver', body: 'Parcourez les événements de créateurs et de salles qui vendent en direct, sans intermédiaire.' },
  { n: '02', title: 'Réserver', body: 'Payez en quelques secondes. Votre billet arrive sous forme de pass numérique, prêt à scanner.' },
  { n: '03', title: 'Scanner', body: "Présentez votre pass à l'entrée. Un contrôle instantané, sans papier, sans file." },
];

const EVENTS = [
  { title: 'Nuit Électro', venue: 'Le Sous-Sol, Lyon', date: '12 mars', price: '14 €', tags: ['Techno', 'House'] },
  { title: "Open Air d'Automne", venue: 'Parc des Docks, Marseille', date: '4 oct.', price: '22 €', tags: ['Techno', 'Trance'] },
  { title: 'Club Interdit', venue: 'La Chapelle, Lille', date: '28 nov.', price: '18 €', tags: ['Drum & Bass', 'Hardcore'] },
  { title: 'Salon Vinyle', venue: 'La Cordonnerie, Bordeaux', date: '9 déc.', price: '6 €', tags: ['Disco', 'Funk'] },
];

const FIELDS = [
  { title: 'Marges maximales', body: "Pas de grille tarifaire imposée. Les organisateurs gardent l'essentiel de chaque vente." },
  { title: 'Données directes', body: 'Chaque organisateur accède à ses propres contacts et ventes, en temps réel.' },
  { title: 'Image sur-mesure', body: "Un sous-domaine et une interface aux couleurs de chaque salle ou collectif." },
];

export default function PublicHome() {
  return (
    <div>
      {/* ---------- HERO — ink ---------- */}
      <section className="relative overflow-hidden bg-onyx">
        <span className="pointer-events-none absolute -right-10 top-6 select-none font-display text-[16rem] font-bold leading-none text-white/[0.03] md:text-[22rem]">
          A12
        </span>

        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <div className="max-w-2xl space-y-8">
            <h1 className="font-display text-[3rem] font-bold leading-[0.98] tracking-tight text-bone md:text-[4.5rem]">
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
                className="inline-flex items-center rounded-full border border-white/[0.15] px-7 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:border-white/40"
              >
                Espace organisateur
              </a>
            </div>
          </div>

          {/* Ticket — pure ink & paper, one stamp of colour */}
          <div className="mt-20 flex justify-end">
            <div className="relative w-[19rem] rotate-[2deg]">
              <div className="relative flex overflow-hidden rounded-sm border border-white/[0.15] bg-bone">
                <div className="relative flex-1 space-y-6 p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-wide text-onyx/50">admit one</span>
                    <span className="rotate-[-8deg] rounded-sm border-2 border-[#C81E3A] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[#C81E3A]">
                      VALIDE
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-onyx/50">jeu 12 mars — 21:00</p>
                    <h3 className="mt-1.5 font-display text-[1.7rem] font-bold leading-tight text-onyx">Nuit Électro</h3>
                    <p className="mt-1 text-xs text-onyx/60">Le Sous-Sol, Lyon</p>
                  </div>
                  <div className="border-t border-dashed border-onyx/20 pt-4">
                    <p className="font-mono text-[10px] text-onyx/50">place</p>
                    <p className="font-mono text-base text-onyx">A12</p>
                  </div>
                </div>
                <div className="relative flex w-[4.5rem] shrink-0 items-center justify-center border-l border-dashed border-onyx/20">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-onyx/50" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    TYKS · A12
                  </span>
                  <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                  <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS — paper ---------- */}
      <section className="bg-bone">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="font-display text-2xl font-bold text-onyx">Comment ça marche</h2>
          <div className="mt-10 divide-y divide-onyx/10 border-t border-onyx/10">
            {STEPS.map((step) => (
              <div key={step.n} className="grid gap-2 py-7 sm:grid-cols-[3rem_1fr_2fr] sm:items-baseline sm:gap-8">
                <span className="font-mono text-sm text-onyx/40">{step.n}</span>
                <h3 className="font-display text-lg font-bold text-onyx">{step.title}</h3>
                <p className="max-w-md text-sm leading-relaxed text-onyx/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- EVENTS — ink, programme listing ---------- */}
      <section className="bg-onyx">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-bone">Ça bouge en ce moment</h2>
            <Link href="/evenements" className="text-sm font-medium text-bone-muted transition-colors hover:text-bone">
              Tout voir
            </Link>
          </div>

          <div className="divide-y divide-white/[0.08] border-t border-white/[0.08]">
            {EVENTS.map((event) => (
              <Link
                key={event.title}
                href="/evenements"
                className="group grid grid-cols-[1fr_auto] items-center gap-4 py-6 transition-colors duration-200 hover:bg-white/[0.02] sm:grid-cols-[2fr_2fr_auto_auto]"
              >
                <div>
                  <h3 className="font-display text-base font-bold text-bone">{event.title}</h3>
                  <p className="text-xs text-bone-muted">{event.venue}</p>
                </div>
                <div className="hidden gap-2 sm:flex">
                  {event.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[11px] text-bone-faint">
                      [{tag}]
                    </span>
                  ))}
                </div>
                <span className="font-mono text-xs text-bone-faint">{event.date}</span>
                <span className="font-mono text-sm text-bone">{event.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FOR ORGANIZERS — paper, dossier ---------- */}
      <section className="bg-bone">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-3">
              <h2 className="font-display text-[1.9rem] font-bold leading-tight text-onyx">
                Pour ceux qui
                <br />
                organisent
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-onyx/60">
                Un espace pro pensé pour piloter vos ventes, vos contacts et
                vos marges, sans dépendre d'une plateforme tierce.
              </p>
              <a
                href="https://pro.tyks.app"
                className="inline-flex items-center rounded-full bg-onyx px-7 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:bg-black"
              >
                Accéder à l'espace Pro
              </a>
            </div>

            <div className="divide-y divide-onyx/10 border-t border-onyx/10 lg:border-t-0">
              {FIELDS.map((field, i) => (
                <div key={field.title} className="grid gap-1 py-6 sm:grid-cols-[3rem_1fr] sm:gap-6">
                  <span className="font-mono text-sm text-onyx/30">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-base font-bold text-onyx">{field.title}</h3>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-onyx/60">{field.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

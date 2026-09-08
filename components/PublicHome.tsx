import Link from 'next/link';

const STEPS = [
  {
    n: '01',
    title: 'Trouver',
    body: 'Parcourez les événements de créateurs et de salles qui vendent en direct, sans intermédiaire.',
  },
  {
    n: '02',
    title: 'Réserver',
    body: 'Payez en quelques secondes. Votre billet arrive sous forme de pass numérique, prêt à scanner.',
  },
  {
    n: '03',
    title: 'Scanner',
    body: "Présentez votre pass à l'entrée. Un contrôle instantané, sans papier, sans file.",
  },
];

const FIELDS = [
  {
    title: 'Marges maximales',
    body: "Pas de grille tarifaire imposée. Les organisateurs gardent l'essentiel de chaque vente.",
  },
  {
    title: 'Données directes',
    body: 'Chaque organisateur accède à ses propres contacts et ventes, en temps réel.',
  },
  {
    title: 'Image sur-mesure',
    body: "Un sous-domaine et une interface aux couleurs de chaque salle ou collectif.",
  },
];

export default function PublicHome() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="grid gap-16 py-20 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:py-28">
        <div className="space-y-8">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-bone md:text-6xl">
            La billetterie qui reste
            <br />
            entre vos mains.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-bone-muted">
            TYKS connecte le public aux organisateurs, sans les commissions ni
            la boîte noire des grandes plateformes.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/evenements"
              className="inline-flex items-center rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition hover:bg-white"
            >
              Voir les événements
            </Link>
            
            <a
              href="https://pro.tyks.app"
              className="inline-flex items-center rounded-full border border-onyx-line px-7 py-3.5 text-sm font-semibold text-bone transition hover:border-bone/40 hover:bg-onyx-raised"
            >
              Espace organisateur
            </a>
          </div>
        </div>

        <div className="mx-auto lg:mx-0">
          <div className="hero-settle metal-card flex w-72 rotate-[-6deg] rounded-3xl border border-onyx-line bg-onyx-raised shadow-2xl shadow-black/50">
            <div className="flex-1 space-y-5 p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-bone-faint">
                  admit one
                </span>
                <span className="h-2 w-2 rounded-full bg-cobalt" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-bone-faint">
                  jeu 12 mars — 21:00
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-bone">
                  Nuit Électro
                </h3>
                <p className="mt-1 text-xs text-bone-muted">
                  Le Sous-Sol, Lyon
                </p>
              </div>
              <div className="border-t border-dashed border-onyx-line/70 pt-4">
                <p className="font-mono text-[10px] text-bone-faint">place</p>
                <p className="font-mono text-sm text-bone">A12</p>
              </div>
            </div>

            <div className="relative flex w-16 shrink-0 items-center justify-center border-l border-dashed border-onyx-line/70">
              <span
                className="font-mono text-[10px] tracking-wider text-bone-faint"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                TYKS · A12
              </span>
              <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
              <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-onyx-line py-16">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step) => (
            <div key={step.n} className="space-y-3">
              <span className="font-mono text-xs text-bone-faint">
                {step.n}
              </span>
              <h3 className="font-display text-lg font-bold text-bone">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-bone-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-onyx-line py-16">
        <div className="mb-10 max-w-lg space-y-3">
          <h2 className="font-display text-2xl font-bold text-bone">
            Pour ceux qui organisent
          </h2>
          <p className="text-sm leading-relaxed text-bone-muted">
            Un espace pro pensé pour piloter vos ventes, vos contacts et vos
            marges, sans dépendre d'une plateforme tierce.
          </p>
        </div>

        <div className="grid divide-y divide-onyx-line rounded-2xl border border-onyx-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {FIELDS.map((field) => (
            <div key={field.title} className="punch-divider space-y-2 p-8">
              <h3 className="font-display text-base font-bold text-bone">
                {field.title}
              </h3>
              <p className="text-xs leading-relaxed text-bone-muted">
                {field.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a
            href="https://pro.tyks.app"
            className="inline-flex items-center rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition hover:bg-white"
          >
            Accéder à l'espace Pro
          </a>
        </div>
      </section>
    </div>
  );
}

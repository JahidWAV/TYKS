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
    size: 'lg' as const,
  },
  {
    title: 'Données directes',
    body: 'Chaque organisateur accède à ses propres contacts et ventes, en temps réel.',
    size: 'sm' as const,
  },
  {
    title: 'Image sur-mesure',
    body: "Un sous-domaine et une interface aux couleurs de chaque salle ou collectif.",
    size: 'sm' as const,
  },
];

export default function PublicHome() {
  return (
    <div className="relative overflow-hidden bg-onyx">
      {/* Ambient background glows — fixed, diffuse, organic */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-[-10%] h-[38rem] w-[38rem] opacity-[0.14] blur-[110px]"
          style={{
            background: 'radial-gradient(closest-side, #3D5AFE, transparent)',
            borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%',
          }}
        />
        <div
          className="absolute right-[-15%] top-[18%] h-[30rem] w-[30rem] opacity-[0.10] blur-[100px]"
          style={{
            background: 'radial-gradient(closest-side, #6D5AE6, transparent)',
            borderRadius: '63% 37% 30% 70% / 50% 45% 55% 50%',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ---------- HERO ---------- */}
        <section className="grid gap-20 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-32">
          <div className="space-y-9">
            <h1 className="font-display text-[2.75rem] font-bold leading-[1.04] tracking-tight text-bone md:text-[3.75rem]">
              La billetterie qui reste
              <br />
              entre vos mains.
            </h1>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-bone-muted">
              TYKS connecte le public aux organisateurs, sans les commissions
              ni la boîte noire des grandes plateformes.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/evenements"
                className="inline-flex items-center rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-all duration-300 hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_8px_24px_-8px_rgba(255,255,255,0.35)]"
              >
                Voir les événements
              </Link>

              <a
                href="https://pro.tyks.app"
                className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-7 py-3.5 text-sm font-semibold text-bone backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
              >
                Espace organisateur
              </a>
            </div>
          </div>

          {/* Digital ticket — collectible object */}
          <div className="mx-auto lg:mx-0 lg:justify-self-end">
            <div className="group relative w-[19rem] rotate-[-4deg] transition-transform duration-700 ease-out hover:rotate-[-1deg]">
              {/* soft light bloom behind the card */}
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-cobalt/10 blur-3xl" />

              <div className="relative flex overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-black/40 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_30px_60px_-20px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
                {/* faint diagonal light reflection */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.08]"
                  style={{
                    background:
                      'linear-gradient(115deg, transparent 30%, white 48%, transparent 62%)',
                  }}
                />

                <div className="relative flex-1 space-y-6 p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-wide text-bone-faint">
                      admit one
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cobalt/60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cobalt" />
                    </span>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] text-bone-faint">
                      jeu 12 mars — 21:00
                    </p>
                    <h3 className="mt-1.5 font-display text-[1.7rem] font-bold leading-tight text-bone">
                      Nuit Électro
                    </h3>
                    <p className="mt-1 text-xs text-bone-muted">
                      Le Sous-Sol, Lyon
                    </p>
                  </div>

                  <div className="border-t border-dashed border-white/[0.12] pt-4">
                    <p className="font-mono text-[10px] text-bone-faint">
                      place
                    </p>
                    <p className="font-mono text-base text-bone">A12</p>
                  </div>
                </div>

                {/* perforated stub with realistic notches */}
                <div className="relative flex w-[4.5rem] shrink-0 items-center justify-center border-l border-dashed border-white/[0.12]">
                  <span
                    className="font-mono text-[10px] tracking-[0.15em] text-bone-faint"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    TYKS · A12
                  </span>
                  <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                  <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-onyx" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- HOW IT WORKS — connected timeline ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="relative grid gap-12 sm:grid-cols-3 sm:gap-8">
            <div className="absolute left-0 right-0 top-[0.6rem] hidden h-px bg-gradient-to-r from-white/[0.14] via-white/[0.14] to-transparent sm:block" />
            {STEPS.map((step) => (
              <div key={step.n} className="relative space-y-4">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.14] bg-onyx">
                  <span className="font-mono text-[9px] text-bone-faint">
                    {step.n}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-bone">
                  {step.title}
                </h3>
                <p className="max-w-[26ch] text-sm leading-relaxed text-bone-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FOR ORGANIZERS — asymmetric bento ---------- */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="mb-12 max-w-lg space-y-3">
            <h2 className="font-display text-[1.9rem] font-bold leading-tight text-bone">
              Pour ceux qui organisent
            </h2>
            <p className="text-sm leading-relaxed text-bone-muted">
              Un espace pro pensé pour piloter vos ventes, vos contacts et vos
              marges, sans dépendre d'une plateforme tierce.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-9 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.035] sm:row-span-2">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cobalt/[0.06] blur-3xl transition-opacity duration-500 group-hover:opacity-150" />
              <h3 className="relative font-display text-xl font-bold text-bone">
                {FIELDS[0].title}
              </h3>
              <p className="relative mt-3 max-w-[30ch] text-sm leading-relaxed text-bone-muted">
                {FIELDS[0].body}
              </p>
            </div>

            {FIELDS.slice(1).map((field) => (
              <div
                key={field.title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.035]"
              >
                <h3 className="font-display text-base font-bold text-bone">
                  {field.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-bone-muted">
                  {field.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="https://pro.tyks.app"
              className="inline-flex items-center rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-all duration-300 hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_8px_24px_-8px_rgba(255,255,255,0.35)]"
            >
              Accéder à l'espace Pro
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

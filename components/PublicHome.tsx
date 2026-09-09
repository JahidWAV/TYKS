import Link from 'next/link';

const EVENTS = [
  { title: 'Nuit Électro', venue: 'Le Sous-Sol, Lyon', org: 'Collectif Basalte', date: '12 mars', price: '14 €', tags: ['Techno', 'House'] },
  { title: "Open Air d'Automne", venue: 'Parc des Docks, Marseille', org: 'Rézo Sud', date: '4 oct.', price: '22 €', tags: ['Techno', 'Trance'] },
  { title: 'Club Interdit', venue: 'La Chapelle, Lille', org: 'Nord Nocturne', date: '28 nov.', price: '18 €', tags: ['Drum & Bass', 'Hardcore'] },
  { title: 'Salon Vinyle', venue: 'La Cordonnerie, Bordeaux', org: 'Disquaire Sessions', date: '9 déc.', price: '6 €', tags: ['Disco', 'Funk'] },
];

// A torn-perforation strip used as the seam between every section — the one motif that repeats everywhere.
function Perforation({ from, to }: { from: string; to: string }) {
  return (
    <div
      aria-hidden
      className="relative h-4 w-full"
      style={{
        backgroundColor: from,
        backgroundImage: `radial-gradient(circle at 12px 0, ${to} 6px, transparent 6.5px)`,
        backgroundSize: '24px 16px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'bottom',
      }}
    />
  );
}

export default function PublicHome() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-onyx">
        <span className="pointer-events-none absolute -right-6 top-4 select-none font-display text-[15rem] font-bold leading-none text-white/[0.035] md:text-[20rem]">
          A12
        </span>

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 lg:pt-32">
          <div className="max-w-2xl space-y-8">
            <h1 className="font-display text-[3rem] font-bold leading-[0.98] tracking-tight text-bone md:text-[4.5rem]">
              La billetterie
              <br />
              qui reste entre
              <br />
              vos mains.
            </h1>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-bone-muted">
              TYKS connecte le public aux organisateurs, sans les
              commissions ni la boîte noire des grandes plateformes. Voici ce
              que ça change, en chiffres.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link href="/evenements" className="inline-flex items-center rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition-colors duration-300 hover:bg-white">
                Voir les événements
              </Link>
              <a href="https://pro.tyks.app" className="inline-flex items-center rounded-full border border-white/[0.15] px-7 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:border-white/40">
                Espace organisateur
              </a>
            </div>
          </div>

          {/* Fee breakdown — the promise made verifiable */}
          <div className="mt-20 grid gap-6 border-t border-white/[0.1] pt-10 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
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

      <Perforation from="#0A0A0C" to="#F5F3EF" />

      {/* ---------- MANIFESTO — paper ---------- */}
      <section className="bg-bone">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="max-w-2xl font-display text-2xl font-medium leading-snug text-onyx md:text-3xl">
            Une billetterie ne devrait pas décider à la place de
            l'organisateur combien coûte sa soirée, à quoi ressemble sa
            page, ni qui a le droit de connaître son public. TYKS ne fait
            que le lien entre une salle et les gens qui veulent y être.
          </p>
        </div>
      </section>

      <Perforation from="#F5F3EF" to="#0A0A0C" />

      {/* ---------- EVENTS — ink, programme listing ---------- */}
      <section className="bg-onyx">
        <div className="mx-auto max-w-6xl px-6 py-20">
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
                className="group grid grid-cols-[1fr_auto] items-center gap-4 py-6 transition-colors duration-200 hover:bg-white/[0.02] sm:grid-cols-[2fr_1.2fr_1.4fr_auto_auto]"
              >
                <div>
                  <h3 className="font-display text-base font-bold text-bone">{event.title}</h3>
                  <p className="text-xs text-bone-muted">{event.venue}</p>
                </div>
                <p className="hidden font-mono text-[11px] text-bone-faint sm:block">par {event.org}</p>
                <div className="hidden gap-2 sm:flex">
                  {event.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[11px] text-bone-faint">[{tag}]</span>
                  ))}
                </div>
                <span className="font-mono text-xs text-bone-faint">{event.date}</span>
                <span className="font-mono text-sm text-bone">{event.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Perforation from="#0A0A0C" to="#F5F3EF" />

      {/* ---------- FOR ORGANIZERS — paper, real dashboard preview ---------- */}
      <section className="bg-bone">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-5">
              <h2 className="font-display text-[1.9rem] font-bold leading-tight text-onyx">
                Votre soirée, vos
                <br />
                chiffres, en direct.
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-onyx/60">
                Pas de rapport à demander, pas d'export à attendre. L'espace
                pro affiche vos ventes au fur et à mesure, avec vos propres
                contacts acheteurs — jamais partagés avec un concurrent.
              </p>
              <a href="https://pro.tyks.app" className="inline-flex items-center rounded-full bg-onyx px-7 py-3.5 text-sm font-semibold text-bone transition-colors duration-300 hover:bg-black">
                Accéder à l'espace Pro
              </a>
            </div>

            {/* Stylised dashboard preview — concrete, not decorative */}
            <div className="rounded-sm border border-onyx/10 bg-white">
              <div className="flex items-center justify-between border-b border-onyx/10 px-6 py-4">
                <span className="font-mono text-[11px] text-onyx/50">Nuit Électro — 12 mars</span>
                <span className="font-mono text-[10px] text-onyx/40">mis à jour à l'instant</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-onyx/10">
                <div className="px-6 py-6">
                  <p className="font-mono text-[10px] text-onyx/40">Billets vendus</p>
                  <p className="mt-1 font-display text-2xl font-bold text-onyx">342</p>
                </div>
                <div className="px-6 py-6">
                  <p className="font-mono text-[10px] text-onyx/40">Revenu net</p>
                  <p className="mt-1 font-display text-2xl font-bold text-onyx">6 498 €</p>
                </div>
                <div className="px-6 py-6">
                  <p className="font-mono text-[10px] text-onyx/40">Remplissage</p>
                  <p className="mt-1 font-display text-2xl font-bold text-onyx">87 %</p>
                </div>
              </div>
              <div className="border-t border-onyx/10 px-6 py-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-onyx/10">
                  <div className="h-full w-[87%] rounded-full bg-onyx" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

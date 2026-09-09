import Link from 'next/link';
import { Search, Check } from 'lucide-react';

const PARTNERS = ['Le Sous-Sol', 'Rézo Sud', 'Nord Nocturne', 'La Cordonnerie', 'Basalte', 'Les Docks'];

const CHECKLIST = [
  'Accédez à des événements complets',
  'Invitez vos amis en un geste',
  'Profitez d\u2019offres exclusives des organisateurs',
];

// Three simple single-stroke illustrations — a nod to DICE's line-art creatures, kept minimal and hand-drawn in feel
function Blob1() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16" stroke="currentColor" strokeWidth="1.5">
      <path d="M40 8c16 0 26 12 26 27s-11 30-27 30S13 49 13 34 24 8 40 8Z" />
      <path d="M30 34c2-4 6-4 8 0M50 34c-2-4-6-4-8 0M30 50c4 4 16 4 20 0" strokeLinecap="round" />
    </svg>
  );
}
function Blob2() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 45c0-18 10-32 25-32s25 14 25 32c0 12-11 22-25 22S15 57 15 45Z" />
      <path d="M28 40h6M46 40h6" strokeLinecap="round" />
      <path d="M28 55c6 5 18 5 24 0" strokeLinecap="round" />
    </svg>
  );
}
function Blob3() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16" stroke="currentColor" strokeWidth="1.5">
      <path d="M40 10c20 6 28 20 24 38-3 14-15 22-24 22s-21-8-24-22c-4-18 4-32 24-38Z" />
      <circle cx="32" cy="42" r="2.5" fill="currentColor" />
      <circle cx="48" cy="42" r="2.5" fill="currentColor" />
      <path d="M33 56c4 3 10 3 14 0" strokeLinecap="round" />
    </svg>
  );
}

const HOW = [
  { Icon: Blob1, title: 'Achetez plus vite qu\u2019il ne faut pour lire ceci' },
  { Icon: Blob2, title: 'Le prix affiché est le prix payé, sans surprise à la caisse' },
  { Icon: Blob3, title: 'Des recommandations pensées pour vos goûts' },
];

export default function PublicHome() {
  return (
    <div className="bg-bone text-onyx">
      {/* ---------- NAV ---------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <span className="font-display text-lg font-bold tracking-tight">TYKS</span>
        <div className="hidden flex-1 max-w-sm items-center gap-2 rounded-full border border-onyx/15 px-4 py-2 sm:flex sm:mx-8">
          <Search className="h-4 w-4 text-onyx/40" />
          <span className="text-sm text-onyx/40">Rechercher un événement, une ville…</span>
        </div>
        <Link href="/evenements" className="rounded-full bg-onyx px-5 py-2.5 text-sm font-semibold text-bone">
          Voir les événements
        </Link>
      </header>

      {/* ---------- HERO — one headline, vast air ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-32 pt-16 md:pt-24">
        <h1 className="font-display text-[3.6rem] font-bold uppercase leading-[0.94] tracking-tight md:text-[6.5rem]">
          Bienvenue
          <br />
          dans l&apos;alternative.
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-onyx/55">
          Des salles indépendantes. Des prix affichés d&apos;avance. Aucune
          commission cachée. TYKS simplifie la billetterie.
        </p>
        <div className="mt-8">
          <Link href="/evenements" className="inline-flex items-center rounded-full bg-onyx px-7 py-3.5 text-sm font-semibold text-bone">
            Voir les événements
          </Link>
        </div>

        <div className="mt-28 flex flex-col items-start justify-between gap-6 border-t border-onyx/10 pt-10 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Tendances à Lyon</p>
            <p className="mt-1 max-w-sm text-sm text-onyx/55">
              Les événements les plus suivis en ce moment près de vous.
            </p>
          </div>
          <Link href="/evenements" className="rounded-full border border-onyx/20 px-6 py-3 text-sm font-semibold">
            Parcourir les événements
          </Link>
        </div>
      </section>

      {/* ---------- SIMPLE, INK — three illustrated ideas ---------- */}
      <section className="bg-onyx py-32 text-bone">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-xl font-medium text-bone-muted">Une billetterie étonnamment simple</h2>
          <div className="mt-16 grid gap-16 sm:grid-cols-3">
            {HOW.map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <step.Icon />
                <p className="mt-6 max-w-[20ch] text-sm leading-relaxed text-bone-muted">{step.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHAT ELSE — real screen, modest ---------- */}
      <section className="py-32">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
          <div className="mx-auto w-[13rem] rounded-[1.75rem] border-[5px] border-onyx bg-onyx p-1">
            <div className="rounded-[1.3rem] bg-bone p-4">
              <div className="h-20 rounded-md bg-onyx/10" />
              <p className="mt-3 text-xs font-semibold">Nuit Électro</p>
              <p className="text-[11px] text-onyx/50">Le Sous-Sol, Lyon</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-onyx/50">Prix</span>
                <span className="font-semibold">14,00 €</span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-full border border-onyx/15 px-3 py-1.5 text-xs">
                <span>—</span>
                <span>1</span>
                <span>+</span>
              </div>
              <div className="mt-3 rounded-full bg-onyx py-2.5 text-center text-xs font-semibold text-bone">Réserver</div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">Et sinon ?</h2>
            <ul className="mt-6 space-y-4">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-onyx/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-onyx/40" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- NETWORK — logo wall, ink ---------- */}
      <section className="bg-onyx py-28 text-bone">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-lg">
            <h2 className="font-display text-2xl font-bold">Un réseau de salles et d&apos;organisateurs indépendants</h2>
            <p className="mt-3 text-sm leading-relaxed text-bone-muted">
              Nous travaillons avec les lieux et les collectifs qui font
              vivre la scène partout en France.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {PARTNERS.map((name) => (
              <span key={name} className="font-display text-lg font-medium text-bone-faint">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIAL ---------- */}
      <section className="py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="font-display text-2xl font-medium leading-snug md:text-3xl">
            &laquo; Enfin une billetterie qui ne prend pas la moitié de la
            marge pour un simple lien de paiement. Simple, honnête, ça
            change tout. &raquo;
          </p>
          <p className="mt-6 text-sm text-onyx/50">— Un organisateur indépendant</p>
        </div>
      </section>

      {/* ---------- ORGANIZER — one quiet line, not a section ---------- */}
      <section className="border-t border-onyx/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <p className="text-sm text-onyx/60">Vous organisez un événement ?</p>
          <a href="https://pro.tyks.app" className="text-sm font-semibold underline underline-offset-4">
            Publiez-le sur TYKS
          </a>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-onyx py-16 text-bone">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold text-bone-faint">Notre société</h4>
              <ul className="mt-4 space-y-2 text-sm text-bone-muted">
                <li>À propos de TYKS</li>
                <li>Carrières</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-bone-faint">Support</h4>
              <ul className="mt-4 space-y-2 text-sm text-bone-muted">
                <li>Aide</li>
                <li>Demander un remboursement</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-bone-faint">Ressources</h4>
              <ul className="mt-4 space-y-2 text-sm text-bone-muted">
                <li>Organisateurs</li>
                <li>Salles</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-bone-faint">
            <span>© 2026 TYKS</span>
            <span className="font-display font-bold text-bone">TYKS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { Zap, ArrowUpRight, Search, ScanLine, Wallet, Share2, RefreshCw, MoreHorizontal } from 'lucide-react';

const EVENTS = [
  { title: 'Nuit Électro', venue: 'Le Sous-Sol, Lyon', date: '12 – 13 sept.', price: '14 €', tags: ['Techno', 'House'], img: 'https://picsum.photos/seed/tyks-electro/500/650' },
  { title: 'Dystopia 2026', venue: 'Parc Expo, Saint-Étienne', date: '4 – 6 déc.', price: '48 €', tags: ['Hardcore', 'Hardstyle'], img: 'https://picsum.photos/seed/tyks-dystopia/500/650' },
  { title: 'Club Interdit', venue: 'La Chapelle, Lille', date: '28 nov. – 1 déc.', price: '18 €', tags: ['Drum & Bass'], img: 'https://picsum.photos/seed/tyks-interdit/500/650' },
];

// Genre/scene words stacked at varying sizes — the marquee device, built from real vocabulary of the platform
const SCENE_WORDS = [
  { text: 'TECHNO', size: 'text-6xl md:text-8xl' },
  { text: 'open air', size: 'text-3xl md:text-5xl' },
  { text: 'DRUM & BASS', size: 'text-5xl md:text-7xl' },
  { text: 'clubs indépendants', size: 'text-2xl md:text-4xl' },
  { text: 'RAVE', size: 'text-6xl md:text-8xl' },
];

const HOW = [
  { icon: Zap, title: 'Achetez en un instant', body: 'Le temps de lire cette phrase, votre billet est réservé.' },
  { icon: Wallet, title: 'Prix affiché, prix payé', body: "Le montant à l'achat est celui à l'entrée. Aucune surprise au moment de payer." },
  { icon: ScanLine, title: 'Scan direct, sans file', body: "Votre pass numérique s'affiche à l'écran, prêt à scanner." },
];

export default function PublicHome() {
  return (
    <div className="bg-bone">
      {/* ---------- NAV ---------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-bold tracking-tight text-onyx">TYKS</span>
        <div className="hidden flex-1 max-w-sm items-center gap-2 rounded-full border border-onyx/15 px-4 py-2 sm:flex sm:mx-8">
          <Search className="h-4 w-4 text-onyx/40" />
          <span className="text-sm text-onyx/40">Rechercher un événement, une ville…</span>
        </div>
        <Link href="/evenements" className="text-sm font-semibold text-onyx">
          Se connecter
        </Link>
      </header>

      {/* ---------- HERO — flat, bold, paper ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="font-display text-[3.4rem] font-bold uppercase leading-[0.92] tracking-tight text-onyx md:text-[5.5rem]">
              Chope ton
              <br />
              billet.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-onyx/60">
              Les événements de créateurs et de salles indépendantes,
              vendus en direct, sans commission cachée.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/evenements" className="inline-flex items-center gap-2 rounded-full bg-onyx px-7 py-3.5 text-sm font-semibold text-bone">
                Voir les événements
              </Link>
              <a href="#organisateurs" className="inline-flex items-center rounded-full border border-onyx/20 px-7 py-3.5 text-sm font-semibold text-onyx">
                Je suis organisateur
              </a>
            </div>
          </div>

          {/* Phone mockup — the actual ticket, QR and all, like a real product screenshot */}
          <div className="mx-auto lg:mx-0 lg:justify-self-end">
            <div className="w-[15.5rem] rounded-[2.25rem] border-[6px] border-onyx bg-onyx p-1.5 shadow-[0_25px_50px_-20px_rgba(0,0,0,0.4)]">
              <div className="rounded-[1.6rem] bg-bone px-5 pb-6 pt-8">
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-onyx/40">Nuit Électro</p>
                  <p className="text-xs text-onyx/50">jeu 12 mars, 21:00</p>
                </div>
                <div className="mt-5 rounded-xl border border-dashed border-onyx/20 p-3">
                  <div className="grid grid-cols-8 gap-[3px]">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <span key={i} className={`aspect-square rounded-[1px] ${QR_PATTERN[i] ? 'bg-onyx' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-center font-mono text-xs text-onyx">Place A12</p>
                <div className="mt-5 flex items-center justify-around border-t border-onyx/10 pt-4">
                  <RefreshCw className="h-4 w-4 text-onyx/50" />
                  <Share2 className="h-4 w-4 text-onyx/50" />
                  <MoreHorizontal className="h-4 w-4 text-onyx/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- TRENDING EVENTS — real posters ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-onyx">Événements populaires</h2>
          <Link href="/evenements" className="text-sm font-semibold text-onyx/60 hover:text-onyx">
            Plus d'événements →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {EVENTS.map((event) => (
            <Link key={event.title} href="/evenements" className="group">
              <div className="overflow-hidden rounded-lg">
                <img src={event.img} alt="" className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-onyx">{event.title}</h3>
              <p className="text-sm text-onyx/60">{event.venue}</p>
              <p className="text-sm text-onyx/60">{event.date} · {event.price}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-onyx/[0.06] px-2.5 py-1 text-[11px] font-medium text-onyx/70">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- SCENE MARQUEE — full black break ---------- */}
      <section className="bg-onyx py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {SCENE_WORDS.map((word) => (
              <span key={word.text} className={`font-display font-bold uppercase leading-none text-bone ${word.size}`}>
                {word.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS — flat icon block, still on black ---------- */}
      <section className="bg-onyx pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 border-t border-white/10 pt-16 sm:grid-cols-3">
            {HOW.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title}>
                  <Icon className="h-6 w-6 text-bone" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-base font-bold text-bone">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-bone-muted">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- ORGANIZER TEASER — flat banner, paper ---------- */}
      <section id="organisateurs" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-onyx/10 pt-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-onyx">
              Vous organisez un événement ?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-onyx/60">
              Vendez à la bonne personne, au bon prix, sans dépendre d'une plateforme tierce.
            </p>
          </div>
          <a href="https://pro.tyks.app" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-onyx px-7 py-3.5 text-sm font-semibold text-bone">
            Publier mon événement
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-onyx/10 bg-onyx">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-4">
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wide text-bone-faint">À propos</h4>
              <ul className="mt-4 space-y-2 text-sm text-bone-muted">
                <li>Je suis organisateur</li>
                <li>Kit presse</li>
                <li>On recrute</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wide text-bone-faint">Villes</h4>
              <ul className="mt-4 space-y-2 text-sm text-bone-muted">
                <li>Paris</li>
                <li>Lyon</li>
                <li>Marseille</li>
                <li>Lille</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wide text-bone-faint">Organisateurs</h4>
              <ul className="mt-4 space-y-2 text-sm text-bone-muted">
                <li>Collectif Basalte</li>
                <li>Rézo Sud</li>
                <li>Nord Nocturne</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wide text-bone-faint">Support</h4>
              <ul className="mt-4 space-y-2 text-sm text-bone-muted">
                <li>Aide</li>
                <li>Nous contacter</li>
                <li>Signaler un contenu</li>
              </ul>
            </div>
          </div>
          <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-bone-faint">
            <span>© 2026 TYKS. Tous droits réservés.</span>
            <span className="font-display font-bold text-bone">TYKS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Fixed pseudo-QR pattern (decorative, not a real scannable code)
const QR_PATTERN = [
  1,1,1,0,1,0,1,1, 1,0,1,0,0,1,0,1, 1,1,1,0,1,1,0,1, 0,0,0,0,0,0,1,0,
  1,1,0,1,1,0,1,1, 0,1,0,0,1,0,0,1, 1,0,1,1,0,1,1,1, 1,1,1,0,1,0,1,1,
];

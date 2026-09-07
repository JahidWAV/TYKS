"use client";

import { usePrivy } from "@privy-io/react-auth";
import {
  MousePointerClick,
  ShieldCheck,
  Repeat2,
  MapPin,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

const reassurance = [
  {
    icon: MousePointerClick,
    title: "Connexion Google ou Email",
    body: "Un clic suffit. Pas de mot de passe à retenir, pas d'extension à installer.",
  },
  {
    icon: ShieldCheck,
    title: "Pass garanti, sans doublon",
    body: "Chaque billet est unique et vérifiable : impossible à copier ou falsifier.",
  },
  {
    icon: Repeat2,
    title: "Revente éthique encadrée",
    body: "Si vos plans changent, revendez votre pass au juste prix, en toute sécurité.",
  },
];

export default function Home() {
  const { ready, authenticated, login } = usePrivy();

  const handlePurchase = () => {
    if (!authenticated) {
      login();
    }
  };

  return (
    <main className="bg-void">
      {/* Hero */}
      <section className="relative overflow-hidden bg-night-glow">
        <div className="mx-auto flex max-w-6xl flex-col items-start px-6 pb-24 pt-20 sm:pt-28">
          <span className="mb-6 text-sm font-medium text-indigo-soft">
            Billetterie nouvelle génération
          </span>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink sm:text-7xl">
            iorti
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
            Vos billets d&apos;événements infalsifiables, zéro friction.
          </p>
          <a
            href="#events"
            className="mt-10 inline-flex items-center rounded-full bg-indigo px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo/25 transition hover:bg-indigo-soft"
          >
            Découvrir les événements
          </a>
        </div>
      </section>

      {/* Demo event — ticket stub */}
      <section id="events" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-8 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Le prochain à ne pas manquer
        </h2>

        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-white/5 bg-surface shadow-2xl shadow-black/40 sm:max-w-lg">
          {/* Placeholder image */}
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo/40 via-surface-raised to-void sm:h-56">
            <span className="font-display text-sm tracking-wide text-ink-muted">
              Visuel de l&apos;événement
            </span>
          </div>

          {/* Event info */}
          <div className="px-6 pb-6 pt-5 sm:px-8">
            <h3 className="font-display text-2xl font-bold text-ink">
              Neon Nights Festival 2026
            </h3>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:gap-6">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                14 mars 2026 — 20h00
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Halle des Docks, Lyon
              </span>
            </div>
          </div>

          {/* Ticket seam */}
          <div className="ticket-seam mx-6 sm:mx-8" />

          {/* Price + CTA */}
          <div className="flex items-center justify-between px-6 py-6 sm:px-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-faint">
                Pass unique
              </p>
              <p className="font-display text-3xl font-bold text-amber">25 €</p>
            </div>

            {authenticated ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Prêt pour le paiement par carte
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={!ready}
                className="inline-flex items-center rounded-full bg-indigo px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo/25 transition hover:bg-indigo-soft disabled:opacity-50"
              >
                Acheter mon pass
              </button>
            )}
          </div>
          {authenticated && (
            <p className="px-6 pb-6 text-xs text-ink-faint sm:px-8">
              Pass lié à votre compte — prêt à être ajouté à votre paiement.
            </p>
          )}
        </div>
      </section>

      {/* Reassurance */}
      <section className="border-t border-white/5">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/5 px-6 py-16 sm:grid-cols-3 sm:divide-y-0 sm:py-20">
          {reassurance.map(({ icon: Icon, title, body }, index) => (
            <div
              key={title}
              className={`flex flex-col gap-4 py-8 sm:px-8 sm:py-0 ${
                index < reassurance.length - 1 ? "punch-divider" : ""
              }`}
            >
              <Icon className="h-6 w-6 text-amber" />
              <h3 className="font-display text-lg font-semibold text-ink">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

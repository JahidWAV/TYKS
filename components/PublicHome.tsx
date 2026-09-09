'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Ticket, Compass, QrCode } from 'lucide-react';

const STEPS = [
  {
    n: '01',
    title: 'Explorer',
    body: 'Parcourez les sélections de clubs, collectifs et artistes qui vendent en direct, sans intermédiaire.',
    icon: Compass,
  },
  {
    n: '02',
    title: 'Acheter',
    body: 'Un paiement en un tap. Votre pass numérique se stocke instantanément sur votre téléphone.',
    icon: Ticket,
  },
  {
    n: '03',
    title: 'Entrer',
    body: 'Présentez votre QR code dynamique à l’entrée. Pas de papier, pas de file d’attente.',
    icon: QrCode,
  },
];

const FIELDS = [
  {
    icon: Zap,
    title: 'Marges maximales',
    body: 'Zéro commission cachée. Les organisateurs captent l’essentiel de chaque billet vendu pour faire vivre la culture.',
  },
  {
    icon: ShieldCheck,
    title: 'Données souveraines',
    body: 'Accédez en temps réel à votre fanbase, vos contacts et vos chiffres. Vous gardez la main.',
  },
  {
    icon: Sparkles,
    title: 'Identité sur-mesure',
    body: 'Une vitrine aux couleurs de votre salle ou de votre collectif, propulsée sous votre propre sous-domaine.',
  },
];

const TRENDING = [
  {
    title: 'Nuit Électro — Warehouse Session',
    venue: 'Le Sous-Sol, Lyon',
    date: 'Jeu 12 Mars',
    price: '18,00 €',
    tag: 'Techno',
    gradient: 'from-cobalt/40 via-purple-600/20 to-transparent',
  },
  {
    title: 'Open Air Botanique',
    venue: 'Les Docks, Marseille',
    date: 'Sam 21 Mars',
    price: '22,00 €',
    tag: 'House',
    gradient: 'from-pink-600/30 via-cobalt/20 to-transparent',
  },
  {
    title: 'Club Infini x Boiler',
    venue: 'La Chapelle, Paris',
    date: 'Ven 27 Mars',
    price: '15,00 €',
    tag: 'Minimal',
    gradient: 'from-purple-600/40 via-blue-600/20 to-transparent',
  },
];

export default function PublicHome() {
  return (
    <div className="relative min-h-screen bg-onyx text-bone overflow-hidden selection:bg-cobalt/30 selection:text-bone">
      
      {/* ─── AMBIENT GLOWS (Inspiration OS / Shotgun) ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cobalt/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[70%] -right-32 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">

        {/* ─── HERO SECTION ─── */}
        <section className="grid gap-16 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-32">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl">
              <span className="w-2 h-2 rounded-full bg-cobalt animate-pulse" />
              <span className="text-xs font-mono text-bone-muted tracking-wider uppercase">La billetterie indépendante</span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-bone md:text-6xl lg:text-7xl">
              La billetterie qui reste
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bone via-bone to-bone-faint">
                entre vos mains.
              </span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-bone-muted md:text-lg">
              TYKS connecte directement le public aux créateurs et aux salles, en s’affranchissant des commissions abusives des géants de l’industrie.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/evenements"
                className="inline-flex items-center gap-2.5 rounded-full bg-bone px-8 py-4 text-sm font-semibold text-onyx transition-all duration-300 hover:bg-white hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/10"
              >
                <span>Explorer les événements</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href="https://pro.tyks.app"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.02] px-8 py-4 text-sm font-semibold text-bone backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Espace organisateur</span>
              </a>
            </div>
          </div>

          {/* ─── HERO TICKET (Objet collector numérique) ─── */}
          <div className="mx-auto lg:mx-auto relative">
            <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr from-cobalt/40 via-purple-500/20 to-pink-500/20 blur-2xl opacity-70 animate-pulse" />
            
            <div className="relative flex w-[21rem] rotate-[-3deg] rounded-[2rem] border border-white/12 bg-white/[0.03] backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-1.5 transition-transform duration-500 hover:rotate-0">
              <div className="flex-1 space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-bone-faint bg-white/[0.05] px-3 py-1 rounded-full border border-white/5">
                    Pass Collector
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-cobalt shadow-lg shadow-cobalt" />
                </div>
                
                <div className="space-y-1.5">
                  <p className="font-mono text-xs text-cobalt font-medium tracking-wide">
                    JEU 12 MARS — 21:00
                  </p>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-bone">
                    Nuit Électro
                  </h3>
                  <p className="text-xs text-bone-muted">
                    Le Sous-Sol, Lyon
                  </p>
                </div>

                <div className="border-t border-dashed border-white/10 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] text-bone-faint">TARIF</p>
                    <p className="font-mono text-sm font-semibold text-bone">18,00 €</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-bone-faint">ACCÈS</p>
                    <p className="font-mono text-sm font-semibold text-cobalt">VIP / FAST</p>
                  </div>
                </div>
              </div>

              <div className="relative flex w-16 shrink-0 items-center justify-center border-l border-dashed border-white/10 bg-white/[0.01]">
                <span
                  className="font-mono text-[10px] tracking-[0.2em] text-bone-faint uppercase"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  TYKS · PASS
                </span>
                <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#121212] border border-white/10" />
                <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#121212] border border-white/10" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── TENDANCES SECTION (Style Shotgun) ─── */}
        <section className="border-t border-white/10 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono text-cobalt uppercase tracking-widest">En direct</span>
              <h2 className="font-display text-3xl font-bold text-bone mt-1">Ça bouge en ce moment</h2>
            </div>
            <Link 
              href="/evenements" 
              className="inline-flex items-center gap-2 text-sm font-medium text-bone-muted hover:text-bone transition-colors"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {TRENDING.map((event) => (
              <div 
                key={event.title}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1"
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${event.gradient} opacity-40 pointer-events-none transition-opacity group-hover:opacity-70`} />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-wider uppercase bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full text-bone">
                      {event.tag}
                    </span>
                    <span className="font-mono text-xs text-bone-muted">{event.date}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-bone group-hover:text-white transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-bone-muted">{event.venue}</p>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-bone">{event.price}</span>
                    <span className="text-xs font-semibold text-cobalt group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Réserver &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="border-t border-white/10 py-24">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono text-cobalt uppercase tracking-widest">Simplicité absolue</span>
            <h2 className="font-display text-3xl font-bold text-bone">Comment ça marche</h2>
            <p className="text-sm text-bone-muted">Trois étapes pour vivre vos nuits sans friction.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => {
              const IconComp = step.icon;
              return (
                <div 
                  key={step.n} 
                  className="relative p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-block font-mono text-xs text-cobalt font-bold bg-cobalt/10 px-3 py-1 rounded-full border border-cobalt/20">
                      {step.n}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-bone">
                      <IconComp className="w-5 h-5 text-cobalt" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-bone">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-bone-muted">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── PRO SECTION ─── */}
        <section className="border-t border-white/10 py-24 mb-20">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-end gap-8 mb-12">
            <div className="max-w-xl space-y-3">
              <span className="text-xs font-mono text-cobalt uppercase tracking-widest">Espace Organisateur</span>
              <h2 className="font-display text-3xl font-bold text-bone md:text-4xl">
                Conçu pour ceux qui font bouger la culture
              </h2>
              <p className="text-sm leading-relaxed text-bone-muted">
                Reprenez le contrôle total de vos billetteries, de vos données et de vos revenus.
              </p>
            </div>
            <div>
              <a
                href="https://pro.tyks.app"
                className="inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-onyx transition hover:bg-white shadow-lg"
              >
                <span>Accéder à l'espace Pro</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {FIELDS.map((field) => {
              const IconComponent = field.icon;
              return (
                <div 
                  key={field.title} 
                  className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] space-y-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cobalt/10 border border-cobalt/20 flex items-center justify-center text-cobalt">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-bone">
                    {field.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-bone-muted">
                    {field.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

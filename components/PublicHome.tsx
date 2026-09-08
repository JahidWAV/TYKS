import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Ticket } from 'lucide-react';

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
    icon: Zap,
    title: 'Marges maximales',
    body: "Pas de grille tarifaire imposée. Les organisateurs gardent l'essentiel de chaque vente.",
  },
  {
    icon: ShieldCheck,
    title: 'Données directes',
    body: 'Chaque organisateur accède à ses propres contacts et ventes, en temps réel.',
  },
  {
    icon: Sparkles,
    title: 'Image sur-mesure',
    body: "Un sous-domaine et une interface aux couleurs de chaque salle ou collectif.",
  },
];

export default function PublicHome() {
  return (
    <div className="mx-auto max-w-6xl px-6 relative overflow-hidden">
      {/* Éléments lumineux de fond style glassmorphism */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cobalt/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="grid gap-16 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-12 lg:py-32 relative z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-cobalt animate-pulse" />
            <span className="text-xs font-mono text-bone-muted tracking-wide">La billetterie nouvelle génération</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-bone md:text-6xl lg:text-7xl">
            La billetterie qui reste
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bone via-bone to-bone-faint">
              entre vos mains.
            </span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-bone-muted md:text-lg">
            TYKS connecte directement le public aux organisateurs, en s'affranchissant des commissions abusives et des plateformes opaques.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/evenements"
              className="inline-flex items-center gap-2 rounded-full bg-bone px-8 py-4 text-sm font-semibold text-onyx transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              <span>Voir les événements</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <a
              href="https://pro.tyks.app"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-8 py-4 text-sm font-semibold text-bone backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/20 hover:scale-105 active:scale-95"
            >
              <span>Espace organisateur</span>
            </a>
          </div>
        </div>

        {/* Mockup Billet Glassmorphism */}
        <div className="mx-auto lg:mx-auto relative">
          <div className="absolute -inset-1 rounded-[2.55rem] bg-gradient-to-r from-cobalt/50 to-purple-500/30 blur-xl opacity-50" />
          
          <div className="hero-settle relative flex w-80 rotate-[-4deg] rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/80 p-1">
            <div className="flex-1 space-y-6 p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase text-bone-faint bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/5">
                  Pass VIP
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-cobalt animate-ping" />
              </div>
              
              <div className="space-y-1">
                <p className="font-mono text-xs text-cobalt font-medium">
                  JEU 12 MARS — 21:00
                </p>
                <h3 className="font-display text-2xl font-bold text-bone">
                  Nuit Électro
                </h3>
                <p className="text-xs text-bone-muted flex items-center gap-1.5 pt-0.5">
                  Le Sous-Sol, Lyon
                </p>
              </div>

              <div className="border-t border-dashed border-white/10 pt-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] text-bone-faint">TARIF</p>
                  <p className="font-mono text-sm font-semibold text-bone">24,00 €</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-bone-faint">ACCÈS</p>
                  <p className="font-mono text-sm font-semibold text-cobalt">ILLIMITÉ</p>
                </div>
              </div>
            </div>

            <div className="relative flex w-16 shrink-0 items-center justify-center border-l border-dashed border-white/10 bg-white/[0.01]">
              <span
                className="font-mono text-[10px] tracking-widest text-bone-faint"
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

      {/* Steps Section */}
      <section className="border-t border-white/10 py-24 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="font-display text-3xl font-bold text-bone">Comment ça marche</h2>
          <p className="text-sm text-bone-muted">Trois étapes simples pour vivre vos événements sans friction.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div 
              key={step.n} 
              className="relative p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] space-y-4 group"
            >
              <span className="inline-block font-mono text-xs text-cobalt font-bold bg-cobalt/10 px-3 py-1 rounded-full border border-cobalt/20">
                {step.n}
              </span>
              <h3 className="font-display text-xl font-bold text-bone">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-bone-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pro Section */}
      <section className="border-t border-white/10 py-24 relative z-10 mb-20">
        <div className="grid lg:grid-cols-[1fr_auto] lg:items-end gap-8 mb-12">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-mono text-cobalt uppercase tracking-widest">Espace Organisateur</span>
            <h2 className="font-display text-3xl font-bold text-bone md:text-4xl">
              Conçu pour ceux qui font bouger les choses
            </h2>
            <p className="text-sm leading-relaxed text-bone-muted">
              Un outil professionnel pensé pour piloter vos ventes, vos contacts et vos marges en toute autonomie.
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
  );
}

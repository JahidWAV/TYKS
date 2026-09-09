'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const EVENTS = [
  {
    title: 'Nuit Électro — Session I',
    venue: 'Le Sous-Sol, Lyon',
    date: '12.03',
    price: '18,00 €',
  },
  {
    title: 'Open Air Botanique',
    venue: 'Les Docks, Marseille',
    date: '21.03',
    price: '22,00 €',
  },
  {
    title: 'Club Infini',
    venue: 'La Chapelle, Paris',
    date: '27.03',
    price: '15,00 €',
  },
];

const MANIFESTO = [
  {
    num: '01',
    title: 'Transparence totale',
    text: 'Le prix affiché est le prix payé. Pas de frais de service cachés au moment de régler.',
  },
  {
    num: '02',
    title: 'Souveraineté des salles',
    text: 'Les lieux et les collectifs gardent la main sur leur billetterie et leurs données.',
  },
  {
    num: '03',
    title: 'Simplicité d’usage',
    text: 'Un achat en un geste, un pass numérique instantané et sans artifice.',
  },
];

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] selection:bg-[#111110] selection:text-[#F7F5F0]">
      
      {/* ─── NAVIGATION ─── */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 md:px-12 border-b border-[#111110]/10">
        <Link href="/" className="font-display text-xl font-bold tracking-tighter">
          TYKS
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#111110]/70">
          <Link href="/evenements" className="hover:text-[#111110] transition-colors">Événements</Link>
          <Link href="/salles" className="hover:text-[#111110] transition-colors">Salles & Collectifs</Link>
          <Link href="https://pro.tyks.app" className="hover:text-[#111110] transition-colors">Espace Pro</Link>
        </nav>

        <Link 
          href="/evenements" 
          className="rounded-full bg-[#111110] px-5 py-2.5 text-xs font-medium text-[#F7F5F0] transition-transform duration-200 hover:scale-[1.02]"
        >
          Explorer
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-6 md:px-12">

        {/* ─── HERO ─── */}
        <section className="py-24 md:py-36 grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-end">
          <div className="space-y-8">
            <span className="inline-block text-xs font-mono uppercase tracking-widest text-[#111110]/50 border-b border-[#111110]/20 pb-1">
              Billetterie indépendante — Édition 2026
            </span>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
              L’alternative
              <br />
              radicale.
            </h1>

            <p className="max-w-md text-base md:text-lg text-[#111110]/70 leading-relaxed font-light">
              Une billetterie pensée pour la culture indépendante. Sans commission abusive, sans artifice visuel, au plus près des artistes et des salles.
            </p>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-[#111110]/10 pt-8 lg:pt-0 lg:pl-12 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <p className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">Prochains rendez-vous</p>
              <div className="space-y-4">
                {EVENTS.map((ev, i) => (
                  <div key={i} className="group flex items-center justify-between py-3 border-b border-[#111110]/10 cursor-pointer">
                    <div>
                      <p className="font-display font-semibold text-lg group-hover:italic transition-all">{ev.title}</p>
                      <p className="text-xs text-[#111110]/50">{ev.venue} · {ev.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono">{ev.price}</span>
                      <ArrowUpRight className="w-4 h-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <Link 
                href="/evenements"
                className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-[#111110]/30 hover:decoration-[#111110]"
              >
                Voir tout le catalogue des événements &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ─── MANIFESTO GRILLE ─── */}
        <section className="py-24 border-t border-[#111110]/10">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {MANIFESTO.map((item) => (
              <div key={item.num} className="space-y-4">
                <span className="font-mono text-xs text-[#111110]/40">{item.num}</span>
                <h3 className="font-display text-2xl font-bold tracking-tight">{item.title}</h3>
                <p className="text-sm text-[#111110]/70 leading-relaxed font-light">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BANDEAU PRO DISCRET ─── */}
        <section className="my-24 rounded-2xl bg-[#111110] text-[#F7F5F0] p-12 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/50">Espace Organisateur</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Vous pilotez une salle ou un collectif ?</h2>
            <p className="text-sm text-[#F7F5F0]/70 font-light leading-relaxed">
              Installez votre propre billetterie en quelques minutes et récupérez le contrôle total de vos données de diffusion.
            </p>
          </div>
          <a
            href="https://pro.tyks.app"
            className="rounded-full bg-[#F7F5F0] px-8 py-4 text-xs font-semibold text-[#111110] transition-transform hover:scale-105 shrink-0"
          >
            Ouvrir un compte Pro
          </a>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#111110]/10 py-12 px-6 md:px-12 text-xs text-[#111110]/60">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/mentions" className="hover:text-[#111110]">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-[#111110]">Confidentialité</Link>
            <Link href="/contact" className="hover:text-[#111110]">Contact</Link>
          </div>
          <p>© 2026 TYKS — Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  );
}

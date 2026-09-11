'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const MANIFESTO = [
  { 
    num: '01', 
    title: 'Transparence des flux', 
    text: 'Une structure tarifaire intègre, sans intermédiaires obscurs ni frais cachés.' 
  },
  { 
    num: '02', 
    title: 'Souveraineté des lieux', 
    text: 'Les collectifs reprennent le contrôle absolu de leurs données et de leur public.' 
  },
  { 
    num: '03', 
    title: 'Expérience fluide', 
    text: 'Un accès instantané, pensé pour la réalité physique du spectacle vivant.' 
  },
];

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true })
        .limit(3);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2] font-serif">
      
      {/* ─── NAVIGATION HAUTE DISCRÈTE ─── */}
      <header className="px-6 md:px-16 py-8 flex items-center justify-between border-b border-[#E4DCD0]/60 max-w-7xl mx-auto w-full">
        <div className="text-xs font-sans tracking-[0.3em] uppercase font-semibold text-[#5C1D24]">
          TYKS <span className="text-[#2D2220]/40 font-normal">&bull; Index 2026</span>
        </div>
        <nav className="flex items-center gap-8">
          <a href="#events" className="text-xs font-sans uppercase tracking-widest text-[#2D2220]/70 hover:text-[#5C1D24] transition-colors hidden md:block">
            Agenda
          </a>
          <a href="https://pro.tyks.app" className="text-xs font-sans uppercase tracking-widest text-[#2D2220]/90 hover:text-[#5C1D24] transition-colors font-medium">
            Espace Pro &rarr;
          </a>
        </nav>
      </header>

      {/* ─── HERO STRUCTURÉ (Grille asymétrique moderne) ─── */}
      <section className="px-6 md:px-16 py-20 md:py-32 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.25em] uppercase px-4 py-1.5 rounded-full bg-[#F0EBE3] text-[#5C1D24] font-medium border border-[#E4DCD0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C1D24]" />
            <span>Édition Limitée &bull; Saison 2026</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light tracking-tight leading-[0.95]">
            L'art <br />
            <span className="italic font-normal text-[#5C1D24]">du direct</span>.
          </h1>

          <p className="max-w-xl text-base md:text-lg font-sans font-light text-[#2D2220]/70 leading-relaxed">
            Une infrastructure de billetterie indépendante conçue pour relier directement les lieux de création et le public, loin des standards industriels.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a 
              href="#events" 
              className="px-8 py-4 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#43141A] transition-all flex items-center gap-3 shadow-sm"
            >
              <span>Explorer l'agenda</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Colonne de droite : Carte de statut / Confiance */}
        <div className="lg:col-span-5 p-8 md:p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-6 shadow-xs">
          <div className="flex items-center justify-between text-xs font-sans tracking-widest uppercase text-[#2D2220]/50">
            <span>Souveraineté</span>
            <span className="text-[#5C1D24] font-semibold">100% Indépendant</span>
          </div>
          <div className="space-y-3 pt-2 border-t border-[#E4DCD0]">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-[#5C1D24] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-sans font-medium">Zéro commission abusive</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">Vos revenus intégraux reversés à la création.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pt-3">
              <Zap className="w-5 h-5 text-[#5C1D24] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-sans font-medium">Pass numérique unifié</h4>
                <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-0.5">Un accès instantané fluide, même hors-ligne.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AGENDA / FLUX (Style éditorial propre, épuré) ─── */}
      <section id="events" className="py-24 px-6 md:px-16 border-t border-[#E4DCD0] bg-[#F4EFE6]/50">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Programmation</span>
              <h2 className="text-4xl md:text-5xl font-light mt-2">Prochaines dates</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs font-sans tracking-widest uppercase text-[#2D2220] border-b border-[#5C1D24] pb-0.5 hover:text-[#5C1D24] transition-colors"
            >
              Consulter l'intégralité des flux &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40">Chargement...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center text-xs font-sans tracking-widest uppercase text-[#2D2220]/40 bg-[#F2ECE4] rounded-[2rem] border border-[#E4DCD0]">
              Aucun événement programmé pour l'instant.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {events.map((item, idx) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDate = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'Offert' : `${Number(item.price).toFixed(2)} €`;

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className="group p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] hover:border-[#5C1D24] transition-all duration-300 flex flex-col justify-between h-[380px] shadow-xs"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-xs font-sans tracking-wider text-[#2D2220]/50">
                        <span className="truncate">{item.organizations?.name || 'Collectif'}</span>
                        <span className="text-[#5C1D24] font-medium">{formattedDate}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-normal group-hover:italic transition-all leading-snug">{item.title}</h3>
                        <p className="text-xs font-sans font-light text-[#2D2220]/60 mt-3 truncate">{item.location || 'Lieu confidentiel'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E4DCD0] flex items-center justify-between">
                      <span className="text-sm font-sans font-medium">{priceLabel}</span>
                      <div className="w-8 h-8 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center group-hover:bg-[#5C1D24] group-hover:text-[#FAF7F2] transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── MANIFESTO (3 colonnes aérées) ─── */}
      <section className="py-24 px-6 md:px-16 border-t border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          {MANIFESTO.map((m) => (
            <div key={m.num} className="p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">{m.num} // Manifeste</span>
                <h3 className="text-2xl md:text-3xl font-normal">{m.title}</h3>
                <p className="text-sm font-sans font-light text-[#2D2220]/70 leading-relaxed">
                  {m.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BANDEAU CTA PRO (Plein format burgundy) ─── */}
      <section className="py-24 px-6 md:px-16 bg-[#5C1D24] text-[#FAF7F2]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#FAF7F2]/60">Espace Organisateur</span>
          <h2 className="text-4xl md:text-6xl font-light leading-tight">
            Reprenez le contrôle <br />
            <span className="italic">de vos salles et de vos flux</span>.
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed">
            Installez votre propre billetterie indépendante en quelques minutes et affranchissez-vous définitivement des intermédiaires opaques.
          </p>
          <div className="pt-2">
            <a
              href="https://pro.tyks.app"
              className="px-8 py-4 rounded-full bg-[#FAF7F2] text-[#5C1D24] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest inline-block shadow-md"
            >
              Ouvrir un compte Pro
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER SIMPLE ─── */}
      <footer className="py-12 px-6 md:px-16 border-t border-[#E4DCD0] max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-[#2D2220]/50 gap-4">
        <div>&copy; 2026 TYKS. Tous droits réservés.</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#5C1D24] transition-colors">Mentions légales</a>
          <a href="#" className="hover:text-[#5C1D24] transition-colors">Confidentialité</a>
          <a href="https://pro.tyks.app" className="hover:text-[#5C1D24] transition-colors">Espace Pro</a>
        </div>
      </footer>

    </div>
  );
}

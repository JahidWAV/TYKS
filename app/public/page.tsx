'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const MANIFESTO = [
  { num: '01', title: 'Transparence des flux', text: 'Une structure tarifaire intègre, sans intermédiaires obscurs ni frais cachés.' },
  { num: '02', title: 'Souveraineté des lieux', text: 'Les collectifs reprennent le contrôle absolu de leurs données et de leur public.' },
  { num: '03', title: 'Expérience fluide', text: 'Un accès instantané, pensé pour la réalité physique du spectacle vivant.' },
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
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2]">
      
      {/* ─── HERO IMMERSIF (Style Une de Magazine) ─── */}
      <section className="min-h-[90vh] flex flex-col justify-between px-6 md:px-16 pt-12 pb-20 border-b border-[#E4DCD0]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-[#5C1D24] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5C1D24]" />
            <span>Index 2026 // Édition Limitée</span>
          </div>
          <a 
            href="https://pro.tyks.app" 
            className="text-xs font-sans uppercase tracking-widest text-[#2D2220]/60 hover:text-[#5C1D24] transition-colors"
          >
            Espace Organisateur &rarr;
          </a>
        </div>

        <div className="my-auto py-16 max-w-6xl">
          <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-serif font-light tracking-tighter leading-[0.9] text-[#2D2220]">
            L'art <br />
            <span className="italic text-[#5C1D24] font-normal">du direct</span>.
          </h1>
          <div className="mt-12 grid md:grid-cols-2 gap-8 items-end">
            <p className="text-base md:text-lg font-sans font-light text-[#2D2220]/70 leading-relaxed">
              Une infrastructure de billetterie indépendante conçue pour relier directement les lieux de création et le public, loin des standards industriels.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="#events" 
                className="px-8 py-5 bg-[#5C1D24] text-[#FAF7F2] rounded-full text-xs font-sans font-medium uppercase tracking-widest hover:bg-[#43141A] transition-all flex items-center gap-3"
              >
                <span>Explorer l'agenda</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end text-xs font-mono tracking-widest text-[#2D2220]/50 uppercase gap-4">
          <span>[ Culture Indépendante ]</span>
          <span>[ Zéro Commission Abusive ]</span>
          <span>[ Pass Numérique Unifié ]</span>
        </div>
      </section>

      {/* ─── SECTION AGENDA (Mise en page éditoriale en ligne / liseuse) ─── */}
      <section id="events" className="py-32 px-6 md:px-16 border-b border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#5C1D24]">Programmation</span>
              <h2 className="text-5xl md:text-6xl font-serif font-light mt-3">Prochaines dates</h2>
            </div>
            <Link 
              href="/events"
              className="text-xs font-sans uppercase tracking-widest text-[#2D2220] border-b border-[#5C1D24] pb-1 hover:text-[#5C1D24] transition-colors"
            >
              Voir l'intégralité des flux &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-mono uppercase tracking-widest text-[#2D2220]/40">Chargement des données...</div>
          ) : events.length === 0 ? (
            <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-[#2D2220]/40 bg-[#F2ECE4] rounded-[2rem]">
              Aucun événement programmé pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="group p-8 md:p-12 rounded-[2rem] bg-[#F2ECE4] border border-[#E4DCD0] hover:border-[#5C1D24] transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6 md:gap-12">
                      <span className="text-xs font-mono text-[#5C1D24]">0{idx + 1}</span>
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-[#2D2220]/50 block mb-1">
                          {item.organizations?.name || 'Collectif'} &bull; {formattedDate}
                        </span>
                        <h3 className="text-3xl md:text-4xl font-serif group-hover:italic transition-all">{item.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#E4DCD0]">
                      <span className="text-xs font-mono uppercase tracking-widest text-[#2D2220]/60">{item.location || 'Lieu confidentiel'}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-medium px-4 py-2 rounded-full bg-[#FAF7F2] border border-[#E4DCD0]">{priceLabel}</span>
                        <div className="w-10 h-10 rounded-full bg-[#5C1D24] text-[#FAF7F2] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── SECTION MANIFESTO (Mise en page asymétrique en colonnes libres) ─── */}
      <section className="py-32 px-6 md:px-16 border-b border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          {MANIFESTO.map((m) => (
            <div key={m.num} className="p-10 rounded-[2.5rem] bg-[#F2ECE4] border border-[#E4DCD0] flex flex-col justify-between space-y-12">
              <span className="text-xs font-mono text-[#5C1D24] tracking-[0.2em]">{m.num} // MANIFESTO</span>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif">{m.title}</h3>
                <p className="text-sm font-sans font-light text-[#2D2220]/70 leading-relaxed">
                  {m.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BANDEAU CTA PRO (Plein format architectural) ─── */}
      <section className="py-32 px-6 md:px-16 bg-[#5C1D24] text-[#FAF7F2]">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#FAF7F2]/60">Espace Organisateur</span>
          <h2 className="text-5xl md:text-7xl font-serif font-light leading-tight">
            Reprenez le contrôle <br />
            <span className="italic">de vos salles et de vos flux</span>.
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed">
            Installez votre propre billetterie indépendante en quelques minutes et affranchissez-vous définitivement des intermédiaires opaques.
          </p>
          <div className="pt-4">
            <a
              href="https://pro.tyks.app"
              className="px-10 py-5 rounded-full bg-[#FAF7F2] text-[#5C1D24] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest inline-block shadow-lg"
            >
              Ouvrir un compte Pro
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

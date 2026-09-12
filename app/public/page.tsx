'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  Zap,
  Ticket,
  Clock,
  CheckCircle2,
  Smartphone,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const CATEGORIES = ['Tous', 'Concerts', 'Clubbing', 'Festivals', 'Live & Showcase', 'Underground'];

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true });

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  const filteredEvents = events.filter(() => true);

  return (
    <div className="flex-1 flex flex-col bg-[#fbfbfc] text-[#1A0A0F] selection:bg-[#721120] selection:text-[#FAF7F2] font-serif min-h-screen">

      {/* ─── 1. HERO SECTION PLEIN ÉCRAN (TAGLINE SEULE, CENTRAGE STRICT) ─── */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-6 border-b border-[#1A0A0F]/10">
        <h1 className="max-w-5xl text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95]">
          La billetterie, <br />
          <span className="italic font-normal text-[#721120]">sans compromis</span>.
        </h1>

        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#1A0A0F]/45">
            Scroller pour explorer
          </span>
          <div className="w-4 h-7 rounded-full border-2 border-[#1A0A0F]/20 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 bg-[#721120] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── 2. SECTION AVANTAGES ─── */}
      <section className="py-24 px-4 sm:px-6 md:px-16 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 font-sans w-full max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-[#721120]/10 text-[#721120] flex items-center justify-center shrink-0 border border-[#721120]/20 mx-auto">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-[#1A0A0F]">Zéro frais cachés</div>
              <div className="text-xs text-[#1A0A0F]/60">Le prix affiché est final</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-[#721120]/10 text-[#721120] flex items-center justify-center shrink-0 border border-[#721120]/20 mx-auto">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-[#1A0A0F]">Billets garantis</div>
              <div className="text-xs text-[#1A0A0F]/60">Anti-contrefaçon certifié</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-[#721120]/10 text-[#721120] flex items-center justify-center shrink-0 border border-[#721120]/20 mx-auto">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-[#1A0A0F]">100% Mobile</div>
              <div className="text-xs text-[#1A0A0F]/60">Accès direct sans imprimer</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-[#721120]/10 text-[#721120] flex items-center justify-center shrink-0 border border-[#721120]/20 mx-auto">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-[#1A0A0F]">Revente officielle</div>
              <div className="text-xs text-[#1A0A0F]/60">Cédez votre place en 1 clic</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SECTION AGENDA & FILTRES ─── */}
      <section id="agenda" className="py-24 px-4 sm:px-6 md:px-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 text-center lg:text-left">
          <div className="space-y-2">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#721120] font-semibold block">Programmation live</span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight">Prochains Événements</h2>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none font-sans w-full lg:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#721120] text-[#FAF7F2] border-[#721120]'
                    : 'bg-white text-[#1A0A0F]/70 border-[#1A0A0F]/15 hover:border-[#1A0A0F]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center font-sans text-xs tracking-widest uppercase text-[#1A0A0F]/40">
            Chargement de la programmation en cours...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-24 text-center border border-[#1A0A0F]/15 rounded-[2.5rem] bg-white space-y-4 font-sans shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
            <p className="text-base font-medium text-[#1A0A0F]/85">Aucun événement ne correspond à vos critères de recherche.</p>
            <button
              onClick={() => setSelectedCategory('Tous')}
              className="mt-2 px-6 py-3 bg-[#721120] text-[#FAF7F2] rounded-full text-xs font-medium uppercase tracking-widest hover:bg-[#5c0e1a] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((item) => {
              const startDate = item.starts_at ? new Date(item.starts_at) : null;
              const formattedDate = startDate
                ? startDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
                : '';
              const formattedTime = startDate
                ? startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';
              const priceLabel = Number(item.price) === 0 ? 'Gratuit' : `${Number(item.price).toFixed(2)} €`;

              return (
                <Link
                  key={item.id}
                  href={`/events/${item.slug}`}
                  className="group bg-white border border-[#1A0A0F]/15 rounded-[2.5rem] p-8 flex flex-col justify-between h-[440px] transition-shadow duration-300 shadow-sm hover:shadow-xl relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-sans tracking-wider text-[#1A0A0F]/60">
                      <span className="font-semibold text-[#721120] uppercase tracking-widest truncate max-w-[160px]">
                        {item.organizations?.name || 'Organisateur'}
                      </span>
                      <span className="flex items-center gap-1 bg-[#1A0A0F]/5 px-3 py-1 rounded-full border border-[#1A0A0F]/10">
                        <Calendar className="w-3 h-3 text-[#721120]" /> {formattedDate}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h3 className="text-2xl md:text-3xl font-normal transition-transform duration-300 group-hover:scale-[1.02] origin-left leading-snug line-clamp-2 text-[#1A0A0F]">
                        {item.title}
                      </h3>
                      <p className="text-xs font-sans font-light text-[#1A0A0F]/60 flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#721120]" />
                        <span className="truncate">{item.location || 'Lieu communiqué après réservation'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-[#1A0A0F]/10">
                    <div className="flex items-center justify-between text-xs font-sans text-[#1A0A0F]/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formattedTime || 'Ouverture des portes'}
                      </span>
                      <span className="font-medium text-[#1A0A0F] px-3 py-1 bg-[#1A0A0F]/5 rounded-full border border-[#1A0A0F]/10">
                        {priceLabel}
                      </span>
                    </div>

                    <div className="w-full py-3.5 rounded-full bg-[#721120] text-[#FAF7F2] flex items-center justify-center gap-2 text-xs font-sans font-medium uppercase tracking-widest shadow-sm">
                      <span>Réserver ma place</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 4. SECTION VALEUR AJOUTÉE ─── */}
      <section className="py-24 px-4 sm:px-6 md:px-16 bg-white border-t border-b border-[#1A0A0F]/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#721120] font-semibold">Notre engagement</span>
            <h2 className="text-4xl md:text-5xl font-light leading-tight">Repenser l'expérience de la billetterie live.</h2>
            <p className="text-sm md:text-base font-sans font-light text-[#1A0A0F]/75 leading-relaxed">
              Nous redonnons le pouvoir au public et aux créateurs d'événements. Fini les frais de service exorbitants au moment de payer et la spéculation abusive sur les billets.
            </p>
            <div className="pt-2 space-y-3 font-sans text-sm text-[#1A0A0F]/85 w-full">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#721120] shrink-0" />
                <span>Transparence totale sur les tarifs pratiqués</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#721120] shrink-0" />
                <span>Bourse d'échange officielle anti-arnaque</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#721120] shrink-0" />
                <span>Support réactif et humain 7j/7</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 font-sans">
            <div className="p-8 rounded-[2.5rem] bg-[#fbfbfc] border border-[#1A0A0F]/10 space-y-4 shadow-sm text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-full bg-[#721120]/10 text-[#721120] flex items-center justify-center border border-[#721120]/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-normal text-[#1A0A0F]">Revente sécurisée</h3>
              <p className="text-xs font-light text-[#1A0A0F]/70 leading-relaxed">
                Un empêchement de dernière minute ? Revendez votre billet en un clic au prix d'achat initial directement sur la plateforme. Zéro risque, zéro spéculation.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#fbfbfc] border border-[#1A0A0F]/10 space-y-4 shadow-sm text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-full bg-[#721120]/10 text-[#721120] flex items-center justify-center border border-[#721120]/20">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-normal text-[#1A0A0F]">Accès instantané</h3>
              <p className="text-xs font-light text-[#1A0A0F]/70 leading-relaxed">
                Retrouvez l'ensemble de vos billets centralisés dans votre espace personnel. Vos QR codes dynamiques fonctionnent même hors connexion à l'entrée des salles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. CTA FINAL ─── */}
      <section className="py-24 px-4 sm:px-6 md:px-16 bg-[#fbfbfc] text-[#1A0A0F] text-center border-t border-[#1A0A0F]/10 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#721120] font-semibold block">Rejoignez le mouvement</span>
          <h2 className="text-5xl md:text-7xl font-light leading-tight">
            Prêt à vivre votre <br />
            <span className="italic text-[#721120]">prochain concert</span> ?
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#1A0A0F]/70 leading-relaxed">
            Explorez notre agenda, sélectionnez vos artistes et réservez vos places en toute simplicité.
          </p>
          <div className="pt-4">
            <a
              href="#agenda"
              className="px-8 py-4 rounded-full bg-[#721120] text-[#FAF7F2] hover:bg-[#5c0e1a] transition-colors text-xs font-sans font-medium uppercase tracking-widest shadow-xl inline-block"
            >
              Explorer tous les événements
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar '@/components/Navbar';
import { 
  ArrowUpRight, 
  Calendar, 
  ShieldCheck, 
  Ticket, 
  Sparkles, 
  Smartphone, 
  QrCode, 
  Users, 
  Zap, 
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface TyksEvent {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  location?: string;
  starts_at?: string;
  price?: number;
  ticket_price?: number;
  image_url?: string;
  image?: string;
}

export default function PublicHome() {
  const router = useRouter();
  const [events, setEvents] = useState<TyksEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useLayoutEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const savedScrollPos = sessionStorage.getItem('home_scroll_pos');
    if (savedScrollPos) {
      container.scrollTop = Number(savedScrollPos);
    }
  }, []);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      sessionStorage.setItem('home_scroll_pos', container.scrollTop.toString());
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('starts_at', { ascending: true });

      if (!error && data) {
        setEvents(data);
        setFetchError(false);
      } else {
        setFetchError(true);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        slider.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [events]);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={mainContainerRef}
      className="bg-[#0f0f0f] text-white selection:bg-white selection:text-black font-grotesque antialiased h-screen overflow-y-scroll snap-y snap-mandatory flex flex-col"
    >
      
      {/* 1. NAVBAR */}
      <Navbar />

      {/* 2. CONTENU PRINCIPAL & SECTIONS MAGNÉTIQUES */}
      <main className="w-full flex-1">
        
        {/* HERO SECTION */}
        <section className="h-screen w-full snap-start snap-always flex items-center max-w-7xl mx-auto px-6 lg:px-12 py-12 shrink-0">
          <div className="w-full grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white">
                L&apos;ART DU SPECTACLE, <br />
                SANS ARTIFICE.
              </h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-xl font-normal leading-relaxed normal-case">
                Zéro frais cachés, revente officielle instantanée pour contrer la spéculation et sélection pointue de la scène live. Réservez vos places en toute sérénité sur le web, l&apos;application mobile ou directement dans votre Apple Wallet.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#evenements"
                  className="h-12 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg cursor-pointer"
                >
                  VOIR LA PROGRAMMATION
                </a>
                <a
                  href="https://pro.tyks.app"
                  className="h-12 px-8 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full cursor-pointer"
                >
                  ESPACE ORGANISATEUR
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="relative w-full max-w-md bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">APPLICATION TYKS</h3>
                      <p className="text-[10px] text-white/50 font-bold">IOS, ANDROID & WALLET</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    <Sparkles className="w-3 h-3" /> GRATUIT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                      Emportez vos billets partout avec vous et ajoutez vos passes en un clic dans Apple Wallet.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-neutral-800 border border-white/15 px-3 py-1.5 rounded-xl shadow-xs">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>WALLET SUPPORTÉ</span>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-white/15 p-3 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2 shadow-xs">
                    <div className="w-20 h-20 bg-neutral-900 rounded-2xl border border-white/15 flex items-center justify-center text-white">
                      <QrCode className="w-12 h-12 opacity-80" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-white/50 font-bold">SCANNEZ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION ÉVÉNEMENTS */}
        <section id="evenements" className="h-screen w-full snap-start snap-always flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 shrink-0 relative overflow-hidden">
          
          {/* Texte vertical gauche */}
          <div className="hidden xl:flex items-center justify-center shrink-0 w-16 h-[460px] select-none self-center">
            <span className="text-white/[0.04] uppercase tracking-[0.2em] text-3xl font-black [writing-mode:vertical-lr] rotate-180 whitespace-nowrap">
              PROCHAINS ÉVÉNEMENTS
            </span>
          </div>

          {/* Contenu central avec carrousel et flèches conditionnelles */}
          <div className="flex-1 relative w-full max-w-5xl mx-auto px-4 sm:px-8 z-10 flex items-center justify-center">
            
            {loading ? (
              <div className="w-full bg-neutral-900 border border-white/15 p-12 text-center text-xs text-white/60 rounded-[2rem] font-bold">
                CHARGEMENT DES EXPÉRIENCES EN COURS...
              </div>
            ) : fetchError ? (
              <div className="w-full bg-neutral-900 border border-white/15 p-12 text-center space-y-3 rounded-[2rem]">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-xs text-white/70 font-bold">
                  UNE ERREUR EST SURVENUE LORS DU CHARGEMENT. VEUILLEZ RÉESSAYER.
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="w-full bg-neutral-900 border border-white/15 p-12 text-center space-y-3 rounded-[2rem]">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-xs text-white/70 font-bold">
                  AUCUN ÉVÉNEMENT DISPONIBLE POUR LE MOMENT. REVENEZ TRÈS VITE !
                </p>
              </div>
            ) : (
              <>
                {/* Flèche Gauche */}
                {canScrollLeft && (
                  <button 
                    onClick={() => scrollSlider('left')}
                    className="hidden md:flex absolute -left-6 lg:-left-12 z-20 w-12 h-12 rounded-full bg-neutral-900 border border-white/20 items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Conteneur du Slider Horizontal (centrage automatique géré avec justify-center si peu d'items) */}
                <div 
                  ref={sliderRef}
                  className="w-full flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-2 justify-start xl:justify-center items-center"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {events.map((evt) => {
                    const basePrice = Number(evt.price || evt.ticket_price || 0);
                    // Calcul précis au centime près via arrondi mathématique strict
                    const finalPriceWithStripe = basePrice > 0 ? Math.round((basePrice * 1.015 + 0.25) * 100) / 100 : 0;
                    const eventImage = evt.image_url || evt.image;
                    
                    const dateObj = evt.starts_at ? new Date(evt.starts_at) : null;
                    const dateStr = dateObj
                      ? dateObj.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'DATE À VENIR';
                    
                    const timeStr = dateObj
                      ? dateObj.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';

                    const eventUrl = `/events/${evt.slug || evt.id}`;

                    return (
                      <article
                        key={evt.id}
                        onClick={() => router.push(eventUrl)}
                        className="group cursor-pointer flex flex-col bg-white text-black border border-white/15 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shrink-0 w-[300px] sm:w-[340px] snap-start"
                      >
                        {/* Image carrée propre */}
                        <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden border-b border-black/10 flex items-center justify-center">
                          {eventImage ? (
                            <img
                              src={eventImage}
                              alt={evt.title || 'Événement'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-black/30 space-y-1">
                              <Calendar className="w-6 h-6 stroke-[1.5]" />
                              <span className="text-[10px] uppercase tracking-widest font-bold">TYKS</span>
                            </div>
                          )}
                        </div>

                        {/* Infos textuelles centrées avec opacités hiérarchisées, sans lignes */}
                        <div className="p-5 flex-1 space-y-2 flex flex-col justify-center text-center">
                          {/* Titre (Opacité max / 100%) */}
                          <h3 className="text-base font-bold text-black tracking-tight group-hover:underline transition-colors line-clamp-1">
                            {evt.title}
                          </h3>
                          
                          {/* Lieu (Opacité intermédiaire / 70%) */}
                          {evt.location && (
                            <p className="text-xs text-black/70 font-semibold truncate">
                              {evt.location}
                            </p>
                          )}

                          {/* Date et heure (Opacité légère / 50%) */}
                          <p className="text-xs text-black/50 font-bold uppercase tracking-wider pt-0.5">
                            {dateStr} {timeStr ? `• ${timeStr}` : ''}
                          </p>
                        </div>

                        {/* Bouton du bas cliquable */}
                        <div className="flex items-center justify-center border-t border-black/10 p-3.5 bg-neutral-50">
                          <div
                            className="w-full h-9 px-4 bg-black group-hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 rounded-xl shadow-md"
                          >
                            <span>{basePrice > 0 ? `À partir de ${finalPriceWithStripe.toFixed(2).replace('.', ',')} €` : 'Entrée Libre'}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Flèche Droite */}
                {canScrollRight && (
                  <button 
                    onClick={() => scrollSlider('right')}
                    className="hidden md:flex absolute -right-6 lg:-right-12 z-20 w-12 h-12 rounded-full bg-neutral-900 border border-white/20 items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Texte vertical droit */}
          <div className="hidden xl:flex items-center justify-center shrink-0 w-16 h-[460px] select-none self-center">
            <span className="text-white/[0.04] uppercase tracking-[0.2em] text-3xl font-black [writing-mode:vertical-lr] whitespace-nowrap">
              PROCHAINS ÉVÉNEMENTS
            </span>
          </div>

        </section>

        {/* SECTION VALEURS */}
        <section className="h-screen w-full snap-start snap-always flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 py-12 shrink-0">
          <div className="space-y-12 w-full">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-4xl font-bold text-white">
                UNE BILLETTERIE PENSÉE POUR LA CULTURE.
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-normal normal-case">
                Nous remettons l&apos;humain et l&apos;équité au cœur de la billetterie live, en soutenant activement les artistes et les spectateurs passionnés.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-white">ZÉRO FRAIS CACHÉS</h3>
                <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                  Le prix affiché est le prix payé. Pas de frais de dossier surprise ou de majorations masquées au moment de régler.
                </p>
              </div>

              <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Ticket className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-white">REVENTE SÉCURISÉE</h3>
                <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                  Empêchez la spéculation et le marché noir. Revendez ou achetez des billets au prix juste avec intégration Apple Wallet.
                </p>
              </div>

              <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-white">SÉLECTION POINTUE</h3>
                <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                  Une programmation artistique rigoureuse, indépendante et de grande qualité pour des expériences authentiques.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DERNIÈRE SECTION + FOOTER GLOBAL INCLUS DANS LE MÊME ÉCRAN (snap-end) */}
        <section className="h-screen w-full snap-end snap-always flex flex-col justify-between max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-6 shrink-0">
          <div className="grid lg:grid-cols-2 gap-10 items-center w-full my-auto">
            <div className="space-y-5">
              <h2 className="text-2xl sm:text-4xl font-bold text-white">
                UN VÉRITABLE OUTIL DE CROISSANCE.
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed normal-case">
                Pour les spectateurs, c&apos;est la simplicité d&apos;accès à la culture. Pour les organisateurs, c&apos;est un écosystème sur-mesure combinant CRM et contrôle d&apos;accès ultra-rapide.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">PROPRIÉTÉ DES DONNÉES</h4>
                  <p className="text-[10px] text-white/50 font-normal normal-case">Gardez le contact direct avec votre public.</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">EXPÉRIENCE FLUIDE</h4>
                  <p className="text-[10px] text-white/50 font-normal normal-case">Encaissement instantané et passes Wallet.</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-white/15 p-8 sm:p-10 rounded-[3rem] space-y-5 shadow-xl text-center lg:text-left">
              <h3 className="text-xl font-bold text-white">VOUS ORGANISEZ UN ÉVÉNEMENT ?</h3>
              <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed normal-case">
                Rejoignez les collectifs, théâtres et petits festivals qui font confiance à TYKS pour simplifier leur gestion quotidienne.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="https://pro.tyks.app"
                  className="h-12 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center rounded-full shadow-lg cursor-pointer"
                >
                  DÉCOUVRIR L&apos;ESPACE PRO
                </a>
              </div>
            </div>
          </div>

          <div className="h-8 shrink-0" />
        </section>

      </main>

    </div>
  );
}

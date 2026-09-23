'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
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
}

export default function PublicHome() {
  const router = useRouter();
  const [events, setEvents] = useState<TyksEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const mainContainerRef = useRef<HTMLDivElement>(null);

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

  const fetchPublishedEvents = async () => {
    const { data, error } = await supabaseBrowser
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('starts_at', { ascending: true })
      .neq('id', '00000000-0000-0000-0000-000000000000'); 

    if (!error && data) {
      setEvents(data);
      setFetchError(false);
    } else {
      setFetchError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPublishedEvents();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPublishedEvents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const extendedEvents = events.length > 0 ? [...events, ...events, ...events] : [];
  const totalLength = events.length;

  useEffect(() => {
    if (events.length > 0) {
      setCurrentIndex(events.length);
    }
  }, [events.length]);

  const handleSlide = (direction: 'next' | 'prev') => {
    if (events.length === 0) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (direction === 'next' ? prev + 1 : prev - 1));
  };

  const handleTransitionEnd = () => {
    if (events.length === 0) return;

    if (currentIndex >= totalLength * 2) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - totalLength);
    } 
    else if (currentIndex < totalLength) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + totalLength);
    }
  };

  const cardWidthPx = 364;

  return (
    <div 
      ref={mainContainerRef}
      className="bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white font-grotesque antialiased h-screen overflow-y-scroll snap-y snap-mandatory flex flex-col"
    >
      
      <Navbar />

      <main className="w-full flex-1">
        
        {/* HERO SECTION */}
        <section className="h-screen w-full snap-start snap-always flex items-center max-w-7xl mx-auto px-6 lg:px-12 py-12 shrink-0">
          <div className="w-full grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
              {/* Titre principal en Lucidity (majuscules) */}
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-lucidity uppercase tracking-tight leading-[0.95] text-neutral-950">
                L&apos;ART DU SPECTACLE, <br />
                SANS ARTIFICE.
              </h1>
              
              <p className="text-xs sm:text-sm text-neutral-500 font-grotesque max-w-xl font-medium leading-relaxed normal-case tracking-wide">
                Zéro frais cachés, revente officielle instantanée pour contrer la spéculation et sélection pointue de la scène live. Réservez vos places en toute sérénité sur le web, l&apos;application mobile ou directement dans votre Apple Wallet.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#evenements"
                  className="h-14 px-9 bg-neutral-950 hover:bg-neutral-800 text-white font-grotesque font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center rounded-full shadow-sm cursor-pointer"
                >
                  Voir la programmation
                </a>
                <a
                  href="https://pro.tyks.fr"
                  className="h-14 px-9 bg-transparent hover:bg-neutral-100 border border-neutral-300 text-neutral-950 font-grotesque font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center rounded-full cursor-pointer"
                >
                  Espace Organisateur
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="relative w-full max-w-md bg-neutral-50 border border-neutral-200/80 p-6 sm:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-950 flex items-center justify-center text-white">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-lucidity tracking-wider text-neutral-950">APPLICATION TYKS</h3>
                      <p className="text-[10px] text-neutral-400 font-grotesque font-bold">IOS, ANDROID & WALLET</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 text-white font-grotesque text-[10px] font-bold tracking-wide uppercase">
                    <Sparkles className="w-3 h-3" /> Gratuit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-500 font-grotesque font-medium leading-relaxed normal-case">
                      Emportez vos billets partout avec vous et ajoutez vos passes en un clic dans Apple Wallet.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-neutral-900 font-grotesque font-bold bg-white border border-neutral-200 px-3 py-1.5 rounded-xl">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Wallet supporté</span>
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 p-3 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-20 h-20 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-center text-neutral-950">
                      <QrCode className="w-12 h-12 opacity-80" />
                    </div>
                    <span className="text-[9px] font-lucidity uppercase tracking-widest text-neutral-400">SCANNEZ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION ÉVÉNEMENTS */}
        <section id="evenements" className="h-screen w-full snap-start snap-always flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 shrink-0 relative overflow-hidden bg-neutral-50/60">
          
          <div className="hidden xl:flex items-center justify-center shrink-0 w-16 h-[460px] select-none self-center">
            <span className="text-neutral-950/[0.04] font-lucidity uppercase tracking-[0.3em] text-3xl [writing-mode:vertical-lr] rotate-180 whitespace-nowrap">
              PROCHAINS ÉVÉNEMENTS
            </span>
          </div>

          <div className="flex-1 relative w-full max-w-[1140px] mx-auto px-4 z-10 flex items-center justify-center">
            
            {loading ? (
              <div className="w-full bg-white border border-neutral-200 p-12 text-center text-xs text-neutral-400 rounded-[2rem] font-grotesque font-bold tracking-widest uppercase">
                Chargement des expériences en cours...
              </div>
            ) : fetchError ? (
              <div className="w-full bg-white border border-neutral-200 p-12 text-center space-y-3 rounded-[2rem]">
                <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-xs text-neutral-700 font-grotesque font-bold tracking-wide">
                  UNE ERREUR EST SURVENUE LORS DU CHARGEMENT. VEUILLEZ RÉESSAYER.
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="w-full bg-white border border-neutral-200 p-12 text-center space-y-3 rounded-[2rem]">
                <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-xs text-neutral-700 font-grotesque font-bold tracking-wide">
                  AUCUN ÉVÉNEMENT DISPONIBLE POUR LE MOMENT. REVENEZ TRÈS VITE !
                </p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => handleSlide('prev')}
                  className="hidden md:flex absolute -left-4 lg:-left-12 z-30 w-12 h-12 rounded-full bg-white border border-neutral-300 items-center justify-center text-neutral-950 hover:bg-neutral-950 hover:text-white transition-all shadow-sm cursor-pointer"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="w-full max-w-[1068px] overflow-hidden py-4 mx-auto">
                  <div 
                    className={`flex gap-6 items-center ${isTransitioning ? 'transition-transform duration-500 ease-out' : 'transition-none'}`}
                    style={{ transform: `translateX(-${currentIndex * cardWidthPx}px)` }}
                    onTransitionEnd={handleTransitionEnd}
                  >
                    {extendedEvents.map((evt, index) => {
                      const basePrice = Number(evt.price || evt.ticket_price || 0);
                      const finalPriceWithStripe = basePrice > 0 ? Math.round((basePrice * 1.015 + 0.25) * 100) / 100 : 0;
                      const eventImage = evt.image_url;
                      
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
                          key={`${evt.id}-${index}`}
                          onClick={() => router.push(eventUrl)}
                          className="group cursor-pointer flex flex-col bg-white text-neutral-950 border border-neutral-200 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shrink-0 w-[340px]"
                        >
                          <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden border-b border-neutral-100 flex items-center justify-center">
                            {eventImage && eventImage.trim() !== '' ? (
                              <img
                                src={eventImage}
                                alt={evt.title || 'Événement'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex flex-col items-center justify-center p-6 text-center space-y-2">
                                <span className="text-[10px] font-lucidity tracking-widest uppercase text-neutral-400">TYKS LIVE</span>
                                <span className="text-sm font-lucidity uppercase text-neutral-900 line-clamp-2">{evt.title}</span>
                              </div>
                            )}
                          </div>

                          <div className="p-6 flex-1 space-y-2.5 flex flex-col justify-center text-center">
                            {/* Titre de l'événement en Lucidity majuscules */}
                            <h3 className="text-lg font-lucidity uppercase text-neutral-950 group-hover:underline transition-colors line-clamp-1">
                              {evt.title}
                            </h3>
                            
                            {evt.location && (
                              <p className="text-xs text-neutral-500 font-grotesque font-medium truncate">
                                {evt.location}
                              </p>
                            )}

                            <p className="text-[11px] text-neutral-400 font-grotesque font-bold uppercase tracking-widest pt-1">
                              {dateStr} {timeStr ? `• ${timeStr}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center justify-center border-t border-neutral-100 p-4 bg-neutral-50/50">
                            <div className="w-full h-10 px-4 bg-neutral-950 group-hover:bg-neutral-800 text-white font-grotesque font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 rounded-xl shadow-xs">
                              <span>{basePrice > 0 ? `À partir de ${finalPriceWithStripe.toFixed(2).replace('.', ',')} €` : 'Entrée Libre'}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => handleSlide('next')}
                  className="hidden md:flex absolute -right-4 lg:-right-12 z-30 w-12 h-12 rounded-full bg-white border border-neutral-300 items-center justify-center text-neutral-950 hover:bg-neutral-950 hover:text-white transition-all shadow-sm cursor-pointer"
                  aria-label="Suivant"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="hidden xl:flex items-center justify-center shrink-0 w-16 h-[460px] select-none self-center">
            <span className="text-neutral-950/[0.04] font-lucidity uppercase tracking-[0.3em] text-3xl [writing-mode:vertical-lr] whitespace-nowrap">
              PROCHAINS ÉVÉNEMENTS
            </span>
          </div>

        </section>

        {/* SECTION VALEURS */}
        <section className="h-screen w-full snap-start snap-always flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 py-12 shrink-0">
          <div className="space-y-12 w-full">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-5xl font-lucidity uppercase text-neutral-950">
                UNE BILLETTERIE PENSÉE POUR LA CULTURE.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-grotesque font-medium normal-case tracking-wide">
                Nous remettons l&apos;humain et l&apos;équité au cœur de la billetterie live, en soutenant activement les artistes et les spectateurs passionnés.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-neutral-50 border border-neutral-200/80 p-8 rounded-[2.5rem] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-lucidity uppercase text-neutral-950 tracking-wide">ZÉRO FRAIS CACHÉS</h3>
                <p className="text-xs text-neutral-500 font-grotesque font-medium leading-relaxed normal-case">
                  Le prix affiché est le prix payé. Pas de frais de dossier surprise ou de majorations masquées au moment de régler.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 p-8 rounded-[2.5rem] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center">
                  <Ticket className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-lucidity uppercase text-neutral-950 tracking-wide">REVENTE SÉCURISÉE</h3>
                <p className="text-xs text-neutral-500 font-grotesque font-medium leading-relaxed normal-case">
                  Empêchez la spéculation et le marché noir. Revendez ou achetez des billets au prix juste avec intégration Apple Wallet.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 p-8 rounded-[2.5rem] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-lucidity uppercase text-neutral-950 tracking-wide">SÉLECTION POINTUE</h3>
                <p className="text-xs text-neutral-500 font-grotesque font-medium leading-relaxed normal-case">
                  Une programmation artistique rigoureuse, indépendante et de grande qualité pour des expériences authentiques.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DERNIÈRE SECTION + FOOTER GLOBAL */}
        <section className="h-screen w-full snap-end snap-always flex flex-col justify-between max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-6 shrink-0">
          <div className="grid lg:grid-cols-2 gap-10 items-center w-full my-auto">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-5xl font-lucidity uppercase text-neutral-950 leading-tight">
                UN VÉRITABLE OUTIL <br />
                DE CROISSANCE.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-grotesque font-medium leading-relaxed normal-case tracking-wide">
                Pour les spectateurs, c&apos;est la simplicité d&apos;accès à la culture. Pour les organisateurs, c&apos;est un écosystème sur-mesure combinant CRM et contrôle d&apos;accès ultra-rapide.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-950">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-lucidity uppercase text-neutral-950 tracking-wide">PROPRIÉTÉ DES DONNÉES</h4>
                  <p className="text-[10px] text-neutral-400 font-grotesque font-medium normal-case">Gardez le contact direct avec votre public.</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-950">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-lucidity uppercase text-neutral-950 tracking-wide">EXPÉRIENCE FLUIDE</h4>
                  <p className="text-[10px] text-neutral-400 font-grotesque font-medium normal-case">Encaissement instantané et passes Wallet.</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200/80 p-8 sm:p-10 rounded-[3rem] space-y-6 shadow-sm text-center lg:text-left">
              <h3 className="text-xl font-lucidity uppercase text-neutral-950">VOUS ORGANISEZ UN ÉVÉNEMENT ?</h3>
              <p className="text-xs sm:text-sm text-neutral-500 font-grotesque font-medium leading-relaxed normal-case">
                Rejoignez les collectifs, théâtres et petits festivals qui font confiance à TYKS pour simplifier leur gestion quotidienne.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="https://pro.tyks.fr"
                  className="h-14 px-9 bg-neutral-950 hover:bg-neutral-800 text-white font-grotesque font-bold text-xs uppercase tracking-widest transition-all duration-300 inline-flex items-center justify-center rounded-full shadow-sm cursor-pointer"
                >
                  Découvrir l&apos;espace Pro
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

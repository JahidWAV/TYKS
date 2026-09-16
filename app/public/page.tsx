'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowUpRight, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Ticket, 
  Sparkles, 
  Smartphone, 
  QrCode, 
  Users, 
  Zap, 
  Wallet,
  Search
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    // Conteneur global avec le snap magnétique actif qui gère tout le document
    <main className="h-screen overflow-y-auto snap-y snap-mandatory bg-[#0f0f0f] text-white selection:bg-white selection:text-black font-grotesque antialiased">
      
      {/* 0. HEADER / NAVBAR (devient le premier point d'ancrage du scroll) */}
      <header className="h-24 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between snap-start snap-always">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-wider text-white">TYKS</span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
          <a
            href="https://pro.tyks.app"
            className="h-10 px-5 border border-white/20 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full cursor-pointer"
          >
            SE CONNECTER / S&apos;INSCRIRE
          </a>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="min-h-[calc(100vh-6rem)] flex items-center max-w-7xl mx-auto px-6 lg:px-12 py-12 border-b border-white/15 snap-start snap-always">
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

      {/* 2. SECTION ÉVÉNEMENTS */}
      <section id="evenements" className="min-h-[calc(100vh-6rem)] flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 py-16 border-b border-white/15 snap-start snap-always">
        <div className="space-y-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/15 pb-5 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">PROCHAINS ÉVÉNEMENTS</h2>
            <span className="text-xs uppercase tracking-wider text-white font-bold px-4 py-1.5 rounded-full bg-neutral-900 border border-white/15 w-fit">
              {events.length} DISPONIBLE{events.length > 1 ? 'S' : ''}
            </span>
          </div>

          {loading ? (
            <div className="bg-neutral-900 border border-white/15 p-16 text-center text-xs text-white/60 rounded-[2.5rem] font-bold">
              CHARGEMENT DES EXPÉRIENCES EN COURS...
            </div>
          ) : events.length === 0 ? (
            <div className="bg-neutral-900 border border-white/15 p-16 text-center space-y-4 rounded-[2.5rem]">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-xs text-white/70 font-bold">
                AUCUN ÉVÉNEMENT DISPONIBLE POUR LE MOMENT. REVENEZ TRÈS VITE !
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 3).map((evt: any) => {
                const eventPrice = Number(evt.price || evt.ticket_price || 0);
                const eventImage = evt.image_url || evt.image;
                const dateStr = evt.starts_at
                  ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'DATE À VENIR';

                return (
                  <article
                    key={evt.id}
                    className="group flex flex-col bg-white text-black border border-white/15 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden border-b border-black/10 flex items-center justify-center">
                      {eventImage ? (
                        <img
                          src={eventImage}
                          alt={evt.title || 'Événement'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-black/30 space-y-2">
                          <Calendar className="w-8 h-8 stroke-[1.5]" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">TYKS SELECTION</span>
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 z-10">
                        <span className="text-[10px] font-bold px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white rounded-full shadow-xs">
                          {evt.organizations?.name || 'EXCLUSIVITÉ'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-black/50 uppercase tracking-wider block">
                          {dateStr}
                        </span>

                        <h3 className="text-lg font-bold text-black tracking-tight group-hover:underline transition-colors line-clamp-1">
                          {evt.title}
                        </h3>

                        {evt.description && (
                          <p className="line-clamp-2 text-xs text-black/70 font-normal leading-relaxed normal-case">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {evt.location && (
                        <div className="flex items-center gap-2 text-xs text-black/70 pt-2 border-t border-black/10 font-bold">
                          <MapPin className="h-3.5 w-3.5 text-black/50 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-black/10 px-6 py-3.5 bg-neutral-50">
                      <span className="text-sm font-bold tracking-wide text-black">
                        {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'ENTRÉE LIBRE'}
                      </span>
                      <Link
                        href={`/events/${evt.slug || evt.id}`}
                        className="h-9 px-5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 rounded-xl shadow-md group-hover:gap-3 cursor-pointer"
                      >
                        <span>RÉSERVER</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. SECTION VALEURS */}
      <section className="min-h-[calc(100vh-6rem)] flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 py-16 border-b border-white/15 snap-start snap-always">
        <div className="space-y-12 w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              UNE BILLETTERIE PENSÉE POUR LA CULTURE.
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-normal normal-case">
              Nous remettons l&apos;humain et l&apos;équité au cœur de la billetterie live, en soutenant activement les artistes et les spectateurs passionnés.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4 transition-all duration-300 hover:border-white hover:shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-white">ZÉRO FRAIS CACHÉS</h3>
              <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                Le prix affiché est le prix payé. Pas de frais de dossier surprise ou de majorations masquées au moment de régler.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4 transition-all duration-300 hover:border-white hover:shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Ticket className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-white">REVENTE SÉCURISÉE</h3>
              <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                Empêchez la spéculation et le marché noir. Revendez ou achetez des billets au prix juste avec intégration Apple Wallet.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4 transition-all duration-300 hover:border-white hover:shadow-xl">
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

      {/* 4. SECTION ORGANISATEURS & CTA FINAL */}
      <section className="min-h-[calc(100vh-6rem)] flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 py-16 snap-start snap-always">
        <div className="grid lg:grid-cols-2 gap-10 items-center w-full">
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
      </section>

    </main>
  );
}

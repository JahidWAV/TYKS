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
  Wallet 
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
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-grotesque antialiased pt-32 uppercase">
      
      <section className="relative overflow-hidden max-w-7xl mx-auto px-6 lg:px-12 pb-24 border-b border-black/15 grid lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-8 z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-black">
            L&apos;ART DU SPECTACLE, <br />
            SANS ARTIFICE.
          </h1>
          
          <p className="text-sm sm:text-base text-black/70 max-w-xl font-normal leading-relaxed normal-case">
            Zéro frais cachés, revente officielle instantanée pour contrer la spéculation et sélection pointue de la scène live. Réservez vos places en toute sérénité sur le web, l&apos;application mobile ou directement dans votre Apple Wallet.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#evenements"
              className="h-12 px-8 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg shadow-black/10 cursor-pointer"
            >
              VOIR LA PROGRAMMATION
            </a>
            <a
              href="https://pro.tyks.app"
              className="h-12 px-8 bg-transparent hover:bg-black/5 border border-black/20 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full cursor-pointer"
            >
              ESPACE ORGANISATEUR
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 z-10">
          <div className="relative bg-neutral-50 border border-black/15 p-8 sm:p-10 rounded-[2.5rem] shadow-xl space-y-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/15 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-black/10 border border-black/20 flex items-center justify-center text-black">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-black">APPLICATION TYKS</h3>
                  <p className="text-[10px] text-black/60 font-bold">IOS, ANDROID & WALLET</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                <Sparkles className="w-3 h-3" /> GRATUIT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <p className="text-xs text-black/70 font-normal leading-relaxed normal-case">
                  Emportez vos billets partout avec vous et ajoutez vos passes en un clic dans Apple Wallet.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-black font-bold bg-white border border-black/15 px-3 py-1.5 rounded-xl shadow-xs">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>APPLE WALLET PRIS EN CHARGE</span>
                </div>
              </div>

              <div className="bg-white border border-black/15 p-4 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs">
                <div className="w-24 h-24 bg-neutral-50 rounded-2xl border border-black/15 flex items-center justify-center text-black">
                  <QrCode className="w-14 h-14 opacity-80" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-black/50 font-bold">SCANNEZ POUR INSTALLER</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section id="evenements" className="max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-12 border-b border-black/15">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-black/15 pb-6 gap-4">
          <h2 className="text-3xl font-bold text-black">PROCHAINS ÉVÉNEMENTS</h2>
          <span className="text-xs uppercase tracking-wider text-black font-bold px-4 py-1.5 rounded-full bg-neutral-50 border border-black/15 w-fit">
            {events.length} DISPONIBLE{events.length > 1 ? 'S' : ''}
          </span>
        </div>

        {loading ? (
          <div className="bg-neutral-50 border border-black/15 p-20 text-center text-xs text-black/60 rounded-[2.5rem] font-bold">
            CHARGEMENT DES EXPÉRIENCES EN COURS...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-neutral-50 border border-black/15 p-20 text-center space-y-4 rounded-[2.5rem]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-black/10 flex items-center justify-center text-black">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-xs text-black/70 font-bold">
              AUCUN ÉVÉNEMENT DISPONIBLE POUR LE MOMENT. REVENEZ TRÈS VITE !
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt: any) => {
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
                  className="group flex flex-col bg-neutral-50 border border-black/15 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:border-black hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative w-full h-56 bg-neutral-100 overflow-hidden border-b border-black/15 flex items-center justify-center">
                    {eventImage ? (
                      <Image
                        src={eventImage}
                        alt={evt.title || 'Événement'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale contrast-125"
                        unoptimized={eventImage.startsWith('http')}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-black/30 space-y-2">
                        <Calendar className="w-8 h-8 stroke-[1.5]" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">TYKS SELECTION</span>
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4 z-10">
                      <span className="text-[11px] font-bold px-3 py-1 bg-white border border-black/15 text-black rounded-full shadow-xs">
                        {evt.organizations?.name || 'EXCLUSIVITÉ'}
                      </span>
                    </div>
                  </div>

                  <div className="p-7 flex-1 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-black/60 uppercase tracking-wider block">
                        {dateStr}
                      </span>

                      <h3 className="text-xl font-bold text-black tracking-tight group-hover:underline transition-colors line-clamp-1">
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
                        <MapPin className="h-3.5 w-3.5 text-black shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-black/15 px-7 py-4 bg-white">
                    <span className="text-sm font-bold tracking-wide text-black">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'ENTRÉE LIBRE'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-6 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 rounded-xl shadow-md group-hover:gap-3 cursor-pointer"
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
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-b border-black/15">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            UNE BILLETTERIE PENSÉE POUR LE PUBLIC ET LA CULTURE.
          </h2>
          <p className="text-xs sm:text-sm text-black/70 font-normal normal-case">
            Nous remettons l&apos;humain et l&apos;équité au cœur de la billetterie live, en soutenant activement les artistes et les spectateurs passionnés.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-neutral-50 border border-black/15 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-black hover:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-black/10 border border-black/25 flex items-center justify-center text-black">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-black">ZÉRO FRAIS CACHÉS</h3>
            <p className="text-xs sm:text-sm text-black/70 font-normal leading-relaxed normal-case">
              Le prix affiché est le prix payé. Pas de frais de dossier surprise ou de majorations masquées au moment de régler votre panier.
            </p>
          </div>

          <div className="bg-neutral-50 border border-black/15 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-black hover:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-black/10 border border-black/25 flex items-center justify-center text-black">
              <Ticket className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-black">REVENTE OFFICIELLE SÉCURISÉE</h3>
            <p className="text-xs sm:text-sm text-black/70 font-normal leading-relaxed normal-case">
              Empêchez la spéculation et le marché noir. Revendez ou achetez des billets en toute confiance entre particuliers au prix juste, avec intégration Apple Wallet.
            </p>
          </div>

          <div className="bg-neutral-50 border border-black/15 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-black hover:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-black/10 border border-black/25 flex items-center justify-center text-black">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-black">SÉLECTION POINTUE</h3>
            <p className="text-xs sm:text-sm text-black/70 font-normal leading-relaxed normal-case">
              Une programmation artistique rigoureuse, indépendante et de grande qualité pour vous offrir des expériences mémorables et authentiques.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-b border-black/15 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            BIEN PLUS QU&apos;UNE BILLETTERIE : UN VÉRITABLE OUTIL DE CROISSANCE.
          </h2>
          <p className="text-xs sm:text-sm text-black/70 font-normal leading-relaxed normal-case">
            Pour les spectateurs, c&apos;est la simplicité d&apos;accès à la culture. Pour les organisateurs, c&apos;est un écosystème sur-mesure combinant CRM, outils de relance ciblée et contrôle d&apos;accès ultra-rapide sur mobile.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/15 flex items-center justify-center text-black">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-black">PROPRIÉTÉ DES DONNÉES</h4>
              <p className="text-[11px] text-black/60 font-normal normal-case">Gardez le contact direct avec votre public et vos fidèles spectateurs.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/15 flex items-center justify-center text-black">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-black">EXPÉRIENCE FLUIDE</h4>
              <p className="text-[11px] text-black/60 font-normal normal-case">Encaissement instantané et génération automatique des e-billets et passes Wallet.</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 border border-black/15 p-8 sm:p-12 rounded-[3rem] space-y-6 shadow-inner">
          <h3 className="text-xl font-bold text-black">VOUS ORGANISEZ UN ÉVÉNEMENT ?</h3>
          <p className="text-xs sm:text-sm text-black/70 font-normal leading-relaxed normal-case">
            Rejoignez les collectifs, théâtres et petits festivals qui font confiance à TYKS pour simplifier leur gestion quotidienne sans contraintes superflues.
          </p>
          <div className="pt-2">
            <a
              href="https://pro.tyks.app"
              className="h-12 px-7 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center rounded-full shadow-lg shadow-black/10 cursor-pointer"
            >
              DÉCOUVRIR L&apos;ESPACE PRO
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="bg-neutral-50 border border-black/25 rounded-[3rem] p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-black">
              DONNEZ VIE À VOS PROJETS CULTURELS DÈS AUJOURD&apos;HUI.
            </h2>
            <p className="text-xs sm:text-sm text-black/70 font-normal leading-relaxed normal-case">
              Gérez votre billetterie, vos contrôles d’accès et vos ventes en toute simplicité avec la solution pro TYKS. Des outils sur-mesure pour les acteurs de la scène indépendante.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="h-12 px-9 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg shadow-black/10 shrink-0 cursor-pointer"
          >
            ACCÉDER À L&apos;ESPACE PRO
          </a>
        </div>
      </section>

    </main>
  );
}

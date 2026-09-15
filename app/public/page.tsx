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
  Crown,
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
    <main className="min-h-screen bg-[#08080a] text-[#f3e5ab] selection:bg-[#d4af37]/30 selection:text-[#f3e5ab] font-sans antialiased relative overflow-hidden">
      
      {/* ─── FOND AVEC HALO D'OR & EFFET DE GRAIN LEGER ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-[#d4af37]/10 via-[#08080a]/50 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-radial from-[#aa7c11]/5 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      {/* ─── HERO SECTION : ACCROCHE + VISUEL APP / WALLET ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-28 border-b border-[#d4af37]/15 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Colonne Gauche : Message principal & Proposition de valeur */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#121216] border border-[#d4af37]/30 text-xs font-medium uppercase tracking-[0.2em] text-[#e6ca65] shadow-lg shadow-[#d4af37]/5">
            <Crown className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Billetterie Officielle & Indépendante</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight leading-[1.08] text-white">
            L&apos;art du spectacle, <br />
            <span className="italic font-light bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] bg-clip-text text-transparent">
              dans son plus bel écrin.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-[#e6ca65]/70 max-w-xl font-light leading-relaxed">
            Zéro frais cachés, revente officielle instantanée pour contrer la spéculation et programmation culturelle exigeante. Accédez à vos places en un clic et ajoutez vos billets directement dans Apple Wallet.
          </p>

          {/* Boutons d'action retravaillés */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#evenements"
              className="h-13 px-8 bg-gradient-to-r from-[#d4af37] via-[#e6ca65] to-[#aa7c11] hover:brightness-110 text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg shadow-[#d4af37]/20 hover:shadow-xl hover:shadow-[#d4af37]/30 hover:-translate-y-0.5 cursor-pointer"
            >
              Voir la programmation
            </a>
            <a
              href="https://pro.tyks.app"
              className="h-13 px-8 bg-[#121216] hover:bg-[#1a1a22] border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#f3e5ab] font-medium text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              Espace Organisateur
            </a>
          </div>
        </div>

        {/* Colonne Droite : Encart Application Mobile & Apple Wallet */}
        <div className="lg:col-span-5">
          <div className="relative bg-gradient-to-b from-[#14141a] to-[#0e0e12] border border-[#d4af37]/25 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-[#000000]/80 space-y-6">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#08080a] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Application TYKS</h3>
                  <p className="text-xs text-[#e6ca65]/60">iOS, Android & Apple Wallet</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#e6ca65] text-[10px] font-semibold tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-[#d4af37]" /> Expérience Premium
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <p className="text-xs text-[#e6ca65]/70 font-light leading-relaxed">
                  Bénéficiez d&apos;un accès rapide aux portes avec vos billets sécurisés directement intégrés à votre smartphone.
                </p>
                
                <div className="inline-flex items-center gap-2 text-xs text-[#d4af37] font-medium bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-1.5 rounded-xl">
                  <Wallet className="w-4 h-4" />
                  <span>Passes Apple Wallet prêts</span>
                </div>
              </div>

              <div className="bg-[#08080a] border border-[#d4af37]/20 p-4 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2.5 shadow-inner">
                <div className="w-24 h-24 bg-[#14141a] rounded-2xl border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                  <QrCode className="w-14 h-14 opacity-90" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#e6ca65]/50 font-medium">Scannez pour installer</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── LISTE DES ÉVÉNEMENTS A L'AFFICHE ─── */}
      <section id="evenements" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-12 border-b border-[#d4af37]/15">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#d4af37]/15 pb-6 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Agenda Sélectionné</span>
            <h2 className="text-3xl font-serif text-white">Programmation à l&apos;affiche</h2>
          </div>
          <span className="text-xs uppercase tracking-wider text-[#e6ca65] font-medium px-4 py-1.5 rounded-full bg-[#14141a] border border-[#d4af37]/20 w-fit">
            {events.length} événement{events.length > 1 ? 's' : ''} disponible{events.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="bg-[#14141a] border border-[#d4af37]/15 p-20 text-center text-sm text-[#e6ca65]/60 rounded-[2.5rem]">
            Chargement de la programmation...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#14141a] border border-[#d4af37]/15 p-20 text-center space-y-4 rounded-[2.5rem]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#08080a] border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm text-[#e6ca65]/70 font-light">
              Aucun événement disponible pour le moment. La programmation arrive très vite !
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
                : 'Date à venir';

              return (
                <article
                  key={evt.id}
                  className="group flex flex-col bg-[#121216] border border-[#d4af37]/20 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[#d4af37]/60 hover:shadow-2xl hover:shadow-[#d4af37]/10 hover:-translate-y-1.5"
                >
                  {/* Image de l'événement avec Badge Or */}
                  <div className="relative w-full h-56 bg-[#08080a] overflow-hidden border-b border-[#d4af37]/15 flex items-center justify-center">
                    {eventImage ? (
                      <Image
                        src={eventImage}
                        alt={evt.title || 'Événement'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        unoptimized={eventImage.startsWith('http')}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#d4af37]/40 space-y-2">
                        <Calendar className="w-8 h-8 stroke-[1.5]" />
                        <span className="text-[10px] uppercase tracking-widest font-semibold">TYKS Selection</span>
                      </div>
                    )}
                    
                    {/* Badge Nom de l'organisation */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="text-[11px] font-medium px-3.5 py-1 bg-[#08080a]/85 backdrop-blur-md border border-[#d4af37]/30 text-[#f3e5ab] rounded-full shadow-sm">
                        {evt.organizations?.name || 'Exclusivité'}
                      </span>
                    </div>
                  </div>

                  {/* Détails du spectacle */}
                  <div className="p-7 flex-1 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-[#d4af37] uppercase tracking-wider block">
                        {dateStr}
                      </span>

                      <h3 className="text-xl font-serif font-normal text-white tracking-tight group-hover:text-[#f3e5ab] transition-colors line-clamp-1">
                        {evt.title}
                      </h3>

                      {evt.description && (
                        <p className="line-clamp-2 text-xs text-[#e6ca65]/65 font-light leading-relaxed">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    {evt.location && (
                      <div className="flex items-center gap-2 text-xs text-[#e6ca65]/70 pt-3 border-t border-[#d4af37]/10">
                        <MapPin className="h-3.5 w-3.5 text-[#d4af37] shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Ligne de séparation dorée subtile */}
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent" />

                  {/* Footer Carte / Prix & CTA */}
                  <div className="flex items-center justify-between px-7 py-4 bg-[#0e0e12]">
                    <span className="text-sm font-semibold tracking-wide text-white">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Entrée libre'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-6 bg-[#d4af37] hover:bg-[#e6ca65] text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 rounded-xl shadow-md shadow-[#d4af37]/10 group-hover:gap-3 cursor-pointer"
                    >
                      <span>Réserver</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── SECTION ENGAGEMENTS & ENGAGEMENT CLIENT ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 border-b border-[#d4af37]/15">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Valeurs & Engagements</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Une expérience de billetterie réinventée.
          </h2>
          <p className="text-sm text-[#e6ca65]/70 font-light">
            Nous combinons l&apos;élégance, la transparence des prix et la technologie moderne pour remettre les artistes et le public au centre.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#121216] border border-[#d4af37]/20 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#08080a] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-serif text-white">Zéro frais cachés</h3>
            <p className="text-xs sm:text-sm text-[#e6ca65]/70 font-light leading-relaxed">
              Le tarif affiché est le tarif final. Aucune commission abusive ou frais de service imprévus lors du paiement.
            </p>
          </div>

          <div className="bg-[#121216] border border-[#d4af37]/20 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#08080a] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Ticket className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-serif text-white">Revente officielle sécurisée</h3>
            <p className="text-xs sm:text-sm text-[#e6ca65]/70 font-light leading-relaxed">
              Dites adieu à la spéculation du marché noir. Échangez et revendez vos billets en toute sécurité au prix d&apos;origine, directement depuis l&apos;application.
            </p>
          </div>

          <div className="bg-[#121216] border border-[#d4af37]/20 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#08080a] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-serif text-white">Intégration Apple Wallet</h3>
            <p className="text-xs sm:text-sm text-[#e6ca65]/70 font-light leading-relaxed">
              Conservez tous vos billets au même endroit. Accès instantané à vos passes même hors ligne le jour de l&apos;événement.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION ÉCOSYSTÈME INTELLIGENT POUR ORGANISATEURS ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 border-b border-[#d4af37]/15 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Solution Pro All-In-One</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Un écosystème complet pour les créateurs de spectacles.
          </h2>
          <p className="text-sm text-[#e6ca65]/70 font-light leading-relaxed">
            Pour les organisateurs, TYKS met à disposition une suite d&apos;outils puissants : gestion du CRM, analyse des ventes en temps réel, relances ciblées et scannage des entrées ultra-rapide sur smartphone.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#121216] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base text-white">Propriété de la donnée</h4>
              <p className="text-xs text-[#e6ca65]/60 font-light">Gardez le contrôle et le lien direct avec votre communauté de spectateurs.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#121216] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base text-white">Encaissement Direct</h4>
              <p className="text-xs text-[#e6ca65]/60 font-light">Versement rapide de vos recettes et émission automatique des e-billets.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#14141a] to-[#0a0a0d] border border-[#d4af37]/25 p-8 sm:p-12 rounded-[3rem] space-y-6 shadow-2xl">
          <h3 className="text-xl font-serif text-white">Vous produisez ou organisez un spectacle ?</h3>
          <p className="text-xs sm:text-sm text-[#e6ca65]/70 font-light leading-relaxed">
            Rejoignez les salles indépendantes, producteurs et collectifs qui ont fait le choix d&apos;une billetterie moderne, éthique et performante.
          </p>
          <div className="pt-2">
            <a
              href="https://pro.tyks.app"
              className="h-12 px-7 bg-gradient-to-r from-[#d4af37] via-[#e6ca65] to-[#aa7c11] text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center rounded-full shadow-lg shadow-[#d4af37]/15 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              Découvrir la solution Pro
            </a>
          </div>
        </div>
      </section>

      {/* ─── ENCART FINAL ORGANISATEURS ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="bg-gradient-to-br from-[#121216] via-[#17171f] to-[#0c0c0f] border border-[#d4af37]/30 rounded-[3rem] p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-[#000000]/90">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Prêt à publier votre événement ?
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white">
              Lancez votre billetterie en quelques minutes.
            </h2>
            <p className="text-xs sm:text-sm text-[#e6ca65]/70 font-light leading-relaxed">
              Gérez votre programmation, votre contrôle d’accès et vos ventes en toute sérénité. Sans engagement et avec un accompagnement dédié.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="h-13 px-9 bg-gradient-to-r from-[#d4af37] via-[#e6ca65] to-[#aa7c11] hover:brightness-110 text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg shadow-[#d4af37]/20 hover:shadow-xl hover:-translate-y-0.5 shrink-0 cursor-pointer"
          >
            Accéder à l&apos;espace Pro
          </a>
        </div>
      </section>

    </main>
  );
}

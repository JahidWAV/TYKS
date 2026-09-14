'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar, MapPin, ShieldCheck, Ticket, Sparkles, Smartphone, QrCode } from 'lucide-react';
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
    <main className="min-h-screen bg-white text-[#1e3932] selection:bg-[#1e3932] selection:text-white font-sans">
      
      {/* ─── HERO SECTION : ACCROCHE + VISUEL APP / QR CODE ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-20 border-b border-[#1e3932]/10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Colonne Gauche : Message principal & Proposition de valeur */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-[#1e3932]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1e3932]"></span>
            Billetterie Officielle & Indépendante
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight leading-[1.1] text-[#1e3932]">
            L&apos;art du spectacle, <br />
            <span className="italic font-light text-[#1e3932]/70">sans artifice.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-[#1e3932]/70 max-w-xl font-light leading-relaxed">
            Zéro frais cachés, revente officielle instantanée et sélection pointue de la scène live. Réservez vos places en toute sérénité sur le web ou directement depuis notre application mobile.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#evenements"
              className="h-12 px-7 bg-[#1e3932] hover:bg-[#152a25] text-white font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center rounded-[2rem] shadow-lg cursor-pointer"
            >
              Voir la programmation
            </a>
            <a
              href="https://pro.tyks.app"
              className="h-12 px-7 bg-[#1e3932]/5 hover:bg-[#1e3932]/10 border border-[#1e3932]/15 text-[#1e3932] font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center rounded-[2rem] cursor-pointer"
            >
              Espace Organisateur
            </a>
          </div>
        </div>

        {/* Colonne Droite : Animation / Encart de téléchargement Application Mobile & QR Code */}
        <div className="lg:col-span-5">
          <div className="relative bg-[#f8faf9] border border-[#1e3932]/15 p-8 rounded-[2.5rem] shadow-xl space-y-6 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1e3932]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-[#1e3932]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/20 flex items-center justify-center text-[#1e3932]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1e3932]">Application TYKS</h3>
                  <p className="text-xs text-[#1e3932]/60">iOS & Android</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3932]/10 border border-[#1e3932]/20 text-[#1e3932] text-[10px] font-semibold tracking-wide uppercase">
                <Sparkles className="w-3 h-3" /> Gratuit
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Infos & Liens de téléchargement */}
              <div className="space-y-3">
                <p className="text-xs text-[#1e3932]/70 font-light leading-relaxed">
                  Emportez vos billets partout avec vous et accédez aux ventes exclusives en avant-première.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <a href="#" className="text-xs text-[#1e3932] hover:underline font-medium flex items-center gap-1">
                    → App Store (iOS)
                  </a>
                  <a href="#" className="text-xs text-[#1e3932] hover:underline font-medium flex items-center gap-1">
                    → Google Play (Android)
                  </a>
                </div>
              </div>

              {/* Simulation QR Code épurée */}
              <div className="bg-white border border-[#1e3932]/10 p-4 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
                <div className="w-24 h-24 bg-[#f8faf9] rounded-2xl border border-[#1e3932]/10 flex items-center justify-center text-[#1e3932]">
                  <QrCode className="w-16 h-16 opacity-90" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#1e3932]/50 font-medium">Scannez pour installer</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── LISTE DES ÉVÉNEMENTS (PLACÉE AU-DESSUS) ─── */}
      <section id="evenements" className="max-w-7xl mx-auto px-6 lg:px-12 py-20 space-y-10 border-b border-[#1e3932]/10">
        <div className="flex items-center justify-between border-b border-[#1e3932]/10 pb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1e3932]">
            Programmation à l&apos;affiche
          </h2>
          <span className="text-xs uppercase tracking-wider text-[#1e3932]/60 font-medium">
            {events.length} événement{events.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-16 text-center text-sm text-[#1e3932]/60 rounded-[2rem]">
            Chargement des expériences...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-16 text-center space-y-3 rounded-[2rem]">
            <Calendar className="mx-auto h-8 w-8 text-[#1e3932]" />
            <p className="text-sm text-[#1e3932]/70">
              Aucun événement disponible pour le moment.
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
                  className="group flex flex-col bg-[#f8faf9] border border-[#1e3932]/10 rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-[#1e3932]/40 hover:shadow-xl hover:shadow-[#1e3932]/5"
                >
                  {/* Encart Image / Affiche sécurisé */}
                  <div className="relative w-full h-48 bg-[#1e3932]/5 overflow-hidden border-b border-[#1e3932]/10 flex items-center justify-center">
                    {eventImage ? (
                      <Image
                        src={eventImage}
                        alt={evt.title || 'Événement'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={eventImage.startsWith('http')}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#1e3932]/30 space-y-1">
                        <Calendar className="w-8 h-8" />
                        <span className="text-[10px] uppercase tracking-wider font-medium">TYKS Live</span>
                      </div>
                    )}
                    
                    {/* Badge Organisation */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[11px] font-medium px-2.5 py-1 bg-white/90 backdrop-blur-md border border-[#1e3932]/10 text-[#1e3932]/80 rounded-full shadow-sm">
                        {evt.organizations?.name || 'Exclusivité'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#1e3932]/70 tracking-wide">
                        {dateStr}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-medium text-[#1e3932] tracking-tight group-hover:text-[#152a25] transition-colors">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs text-[#1e3932]/60 font-light leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 text-xs text-[#1e3932]/70 pt-2">
                        <MapPin className="h-3.5 w-3.5 text-[#1e3932] shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1e3932]/10 px-6 py-4 bg-white">
                    <span className="text-sm font-semibold tracking-wide text-[#1e3932]">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Entrée libre'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-5 bg-[#1e3932] hover:bg-[#152a25] text-white font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2 rounded-2xl shadow-md cursor-pointer"
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

      {/* ─── SECTION EXPLICATION & AVANTAGES ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-b border-[#1e3932]/10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1e3932]">
            Pourquoi choisir TYKS
          </h2>
          <p className="text-3xl font-serif text-[#1e3932]">
            Une billetterie pensée pour le public et la culture.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-8 rounded-[2rem] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/20 flex items-center justify-center text-[#1e3932]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#1e3932]">Zéro frais cachés</h3>
            <p className="text-xs text-[#1e3932]/70 font-light leading-relaxed">
              Le prix affiché est le prix payé. Pas de mauvaises surprises au moment de valider votre panier.
            </p>
          </div>

          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-8 rounded-[2rem] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/20 flex items-center justify-center text-[#1e3932]">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#1e3932]">Revente officielle sécurisée</h3>
            <p className="text-xs text-[#1e3932]/70 font-light leading-relaxed">
              Empêchez la spéculation. Revendez ou achetez des billets en toute confiance entre particuliers au prix juste.
            </p>
          </div>

          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-8 rounded-[2rem] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/20 flex items-center justify-center text-[#1e3932]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#1e3932]">Sélection pointue</h3>
            <p className="text-xs text-[#1e3932]/70 font-light leading-relaxed">
              Une programmation artistique rigoureuse, indépendante et de qualité pour des expériences mémorables.
            </p>
          </div>
        </div>
      </section>

      {/* ─── ENCART ORGANISATEURS (BAS DE PAGE) ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="bg-[#f8faf9] border border-[#1e3932]/20 rounded-[2.5rem] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1e3932]">
              Espace Professionnel
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1e3932]">
              Vous organisez des événements ?
            </h2>
            <p className="text-xs sm:text-sm text-[#1e3932]/70 font-light leading-relaxed">
              Gérez votre billetterie, vos contrôles d’accès et vos ventes en toute simplicité avec la solution pro TYKS. Commissions transparentes et outils sur-mesure.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="h-12 px-8 bg-[#1e3932] hover:bg-[#152a25] text-white font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center rounded-[2rem] shadow-lg shrink-0 cursor-pointer"
          >
            Accéder à l&apos;espace Pro
          </a>
        </div>
      </section>

    </main>
  );
}

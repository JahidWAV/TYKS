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
    <main className="min-h-screen bg-white text-[#1e3932] selection:bg-[#1e3932] selection:text-white font-sans antialiased">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-24 border-b border-[#1e3932]/10 grid lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-8 z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-grotesque font-normal tracking-tight leading-[1.08] text-[#1e3932]">
            L&apos;art du spectacle, <br />
            <span className="italic font-light text-[#1e3932]/60">sans artifice.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-[#1e3932]/70 max-w-xl font-light leading-relaxed">
            Zéro frais cachés, revente officielle instantanée pour contrer la spéculation et sélection pointue de la scène live. Réservez vos places en toute sérénité sur le web, l&apos;application mobile ou directement dans votre Apple Wallet.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#evenements"
              className="h-13 px-8 bg-[#1e3932] hover:bg-[#152a25] text-white font-medium text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg shadow-[#1e3932]/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              Voir la programmation
            </a>
            <a
              href="https://pro.tyks.app"
              className="h-13 px-8 bg-transparent hover:bg-[#1e3932]/5 border border-[#1e3932]/20 text-[#1e3932] font-medium text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full cursor-pointer"
            >
              Espace Organisateur
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 z-10">
          <div className="relative bg-gradient-to-b from-[#f8faf9] to-[#f0f4f2] border border-[#1e3932]/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-[#1e3932]/5 space-y-6 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#1e3932]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-[#1e3932]/10 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/15 flex items-center justify-center text-[#1e3932]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1e3932]">Application TYKS</h3>
                  <p className="text-xs text-[#1e3932]/60">iOS, Android & Wallet</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1e3932] text-white text-[10px] font-semibold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3 h-3" /> Gratuit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <p className="text-xs text-[#1e3932]/70 font-light leading-relaxed">
                  Emportez vos billets partout avec vous et ajoutez vos passes en un clic dans Apple Wallet.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-[#1e3932] font-medium bg-white border border-[#1e3932]/10 px-3 py-1.5 rounded-xl shadow-sm">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Apple Wallet pris en charge</span>
                </div>
              </div>

              <div className="bg-white border border-[#1e3932]/10 p-4 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2.5 shadow-sm">
                <div className="w-24 h-24 bg-[#f8faf9] rounded-2xl border border-[#1e3932]/10 flex items-center justify-center text-[#1e3932]">
                  <QrCode className="w-14 h-14 opacity-80" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#1e3932]/50 font-medium">Scannez pour installer</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── LISTE DES ÉVÉNEMENTS ─── */}
      <section id="evenements" className="max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-12 border-b border-[#1e3932]/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#1e3932]/10 pb-6 gap-4">
          <h2 className="text-3xl font-grotesque font-normal text-[#1e3932]">Programmation à l&apos;affiche</h2>
          <span className="text-xs uppercase tracking-wider text-[#1e3932]/70 font-medium px-4 py-1.5 rounded-full bg-[#1e3932]/5 border border-[#1e3932]/10 w-fit">
            {events.length} événement{events.length > 1 ? 's' : ''} disponible{events.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-20 text-center text-sm text-[#1e3932]/60 rounded-[2.5rem]">
            Chargement des expériences en cours...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-20 text-center space-y-4 rounded-[2.5rem]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1e3932]/10 flex items-center justify-center text-[#1e3932]">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm text-[#1e3932]/70 font-light">
              Aucun événement disponible pour le moment. Revenez très vite !
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
                  className="group flex flex-col bg-[#f8faf9] border border-[#1e3932]/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[#1e3932]/30 hover:shadow-2xl hover:shadow-[#1e3932]/10 hover:-translate-y-1"
                >
                  <div className="relative w-full h-56 bg-[#1e3932]/5 overflow-hidden border-b border-[#1e3932]/10 flex items-center justify-center">
                    {eventImage ? (
                      <Image
                        src={eventImage}
                        alt={evt.title || 'Événement'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        unoptimized={eventImage.startsWith('http')}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#1e3932]/30 space-y-2">
                        <Calendar className="w-8 h-8 stroke-[1.5]" />
                        <span className="text-[10px] uppercase tracking-widest font-semibold">TYKS Selection</span>
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4 z-10">
                      <span className="text-[11px] font-medium px-3 py-1 bg-white/90 backdrop-blur-md border border-[#1e3932]/10 text-[#1e3932] rounded-full shadow-sm">
                        {evt.organizations?.name || 'Exclusivité'}
                      </span>
                    </div>
                  </div>

                  <div className="p-7 flex-1 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-[#1e3932]/60 uppercase tracking-wider block">
                        {dateStr}
                      </span>

                      <h3 className="text-xl font-grotesque font-normal text-[#1e3932] tracking-tight group-hover:text-[#152a25] transition-colors line-clamp-1">
                        {evt.title}
                      </h3>

                      {evt.description && (
                        <p className="line-clamp-2 text-xs text-[#1e3932]/65 font-light leading-relaxed">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    {evt.location && (
                      <div className="flex items-center gap-2 text-xs text-[#1e3932]/70 pt-2 border-t border-[#1e3932]/5">
                        <MapPin className="h-3.5 w-3.5 text-[#1e3932] shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1e3932]/10 px-7 py-4 bg-white">
                    <span className="text-sm font-medium tracking-wide text-[#1e3932]">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Entrée libre'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-6 bg-[#1e3932] hover:bg-[#152a25] text-white font-medium text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 rounded-xl shadow-md shadow-[#1e3932]/10 group-hover:gap-3 cursor-pointer"
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

      {/* ─── SECTION ENGAGEMENTS & VALEURS ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-b border-[#1e3932]/10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-grotesque font-normal text-[#1e3932]">
            Une billetterie pensée pour le public et la culture.
          </h2>
          <p className="text-sm text-[#1e3932]/70 font-light">
            Nous remettons l&apos;humain et l&apos;équité au cœur de la billetterie live, en soutenant activement les artistes et les spectateurs passionnés.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-[#1e3932]/30 hover:shadow-xl hover:shadow-[#1e3932]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/15 flex items-center justify-center text-[#1e3932]">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-grotesque font-normal text-[#1e3932]">Zéro frais cachés</h3>
            <p className="text-xs sm:text-sm text-[#1e3932]/70 font-light leading-relaxed">
              Le prix affiché est le prix payé. Pas de frais de dossier surprise ou de majorations masquées au moment de régler votre panier.
            </p>
          </div>

          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-[#1e3932]/30 hover:shadow-xl hover:shadow-[#1e3932]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/15 flex items-center justify-center text-[#1e3932]">
              <Ticket className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-grotesque font-normal text-[#1e3932]">Revente officielle sécurisée</h3>
            <p className="text-xs sm:text-sm text-[#1e3932]/70 font-light leading-relaxed">
              Empêchez la spéculation et le marché noir. Revendez ou achetez des billets en toute confiance entre particuliers au prix juste, avec intégration Apple Wallet.
            </p>
          </div>

          <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-8 sm:p-10 rounded-[2.5rem] space-y-5 transition-all duration-300 hover:border-[#1e3932]/30 hover:shadow-xl hover:shadow-[#1e3932]/5">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3932]/10 border border-[#1e3932]/15 flex items-center justify-center text-[#1e3932]">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-grotesque font-normal text-[#1e3932]">Sélection pointue</h3>
            <p className="text-xs sm:text-sm text-[#1e3932]/70 font-light leading-relaxed">
              Une programmation artistique rigoureuse, indépendante et de grande qualité pour vous offrir des expériences mémorables et authentiques.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION ÉCOSYSTÈME INTELLIGENT ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-b border-[#1e3932]/15 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-grotesque font-normal text-[#1e3932]">
            Bien plus qu&apos;une billetterie : un véritable outil de croissance.
          </h2>
          <p className="text-sm text-[#1e3932]/70 font-light leading-relaxed">
            Pour les spectateurs, c&apos;est la simplicité d&apos;accès à la culture. Pour les organisateurs, c&apos;est un écosystème sur-mesure combinant CRM, outils de relance ciblée et contrôle d&apos;accès ultra-rapide sur mobile.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#1e3932]/5 border border-[#1e3932]/10 flex items-center justify-center text-[#1e3932]">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-grotesque text-base text-[#1e3932]">Propriété des données</h4>
              <p className="text-xs text-[#1e3932]/60 font-light">Gardez le contact direct avec votre public et vos fidèles spectateurs.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#1e3932]/5 border border-[#1e3932]/10 flex items-center justify-center text-[#1e3932]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-grotesque text-base text-[#1e3932]">Expérience fluide</h4>
              <p className="text-xs text-[#1e3932]/60 font-light">Encaissement instantané et génération automatique des e-billets et passes Wallet.</p>
            </div>
          </div>
        </div>
        <div className="bg-[#f8faf9] border border-[#1e3932]/10 p-8 sm:p-12 rounded-[3rem] space-y-6 shadow-inner">
          <h3 className="text-xl font-grotesque font-normal text-[#1e3932]">Vous organisez un événement ?</h3>
          <p className="text-xs sm:text-sm text-[#1e3932]/70 font-light leading-relaxed">
            Rejoignez les collectifs, théâtres et petits festivals qui font confiance à TYKS pour simplifier leur gestion quotidienne sans contraintes superflues.
          </p>
          <div className="pt-2">
            <a
              href="https://pro.tyks.app"
              className="h-12 px-7 bg-[#1e3932] hover:bg-[#152a25] text-white font-medium text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center rounded-full shadow-lg shadow-[#1e3932]/10 cursor-pointer"
            >
              Découvrir l&apos;espace Pro
            </a>
          </div>
        </div>
      </section>

      {/* ─── ENCART ORGANISATEURS (BAS DE PAGE) ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="bg-gradient-to-br from-[#f8faf9] to-[#f0f4f2] border border-[#1e3932]/15 rounded-[3rem] p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-[#1e3932]/5">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-grotesque font-normal text-[#1e3932]">
              Donnez vie à vos projets culturels dès aujourd&apos;hui.
            </h2>
            <p className="text-xs sm:text-sm text-[#1e3932]/70 font-light leading-relaxed">
              Gérez votre billetterie, vos contrôles d’accès et vos ventes en toute simplicité avec la solution pro TYKS. Des outils sur-mesure pour les acteurs de la scène indépendante.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="h-13 px-9 bg-[#1e3932] hover:bg-[#152a25] text-white font-medium text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg shadow-[#1e3932]/10 hover:shadow-xl hover:-translate-y-0.5 shrink-0 cursor-pointer"
          >
            Accéder à l&apos;espace Pro
          </a>
        </div>
      </section>

    </main>
  );
}

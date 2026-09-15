'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import {
  ArrowUpRight,
  ArrowRight,
  Calendar,
  MapPin,
  ShieldCheck,
  Ticket,
  Sparkles,
  Smartphone,
  QrCode,
  ChevronDown,
  Quote,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Trouvez votre spectacle',
    text: 'Parcourez une sélection de concerts, pièces et festivals choisis avec exigence, filtrés par ville, date ou genre.',
  },
  {
    n: '02',
    title: 'Réservez en deux minutes',
    text: 'Paiement sécurisé, prix affiché sans surprise. Votre billet arrive immédiatement dans votre compte.',
  },
  {
    n: '03',
    title: 'Présentez-vous à l’entrée',
    text: 'Un QR code suffit, depuis votre téléphone ou imprimé. Aucune file dédiée, aucune impression obligatoire.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'J’ai revendu deux places pour un concert complet la veille au soir, au prix exact du billet. Remboursée en quelques heures.',
    name: 'Camille R.',
    role: 'Spectatrice, Lyon',
  },
  {
    quote:
      'Le tableau de bord organisateur nous fait gagner un temps considérable sur le contrôle d’accès les soirs de représentation.',
    name: 'Théâtre des Ateliers',
    role: 'Salle partenaire, Marseille',
  },
  {
    quote:
      'Aucune ligne de frais cachés au moment de payer, pour une fois. Le prix annoncé est vraiment celui débité.',
    name: 'Julien M.',
    role: 'Abonné jazz, Paris',
  },
];

const FAQS = [
  {
    q: 'Le prix affiché inclut-il vraiment tous les frais ?',
    a: 'Oui. Le montant indiqué sur la fiche de l’événement est celui prélevé au paiement, sans frais de service ni de dossier ajoutés ensuite.',
  },
  {
    q: 'Comment fonctionne la revente entre particuliers ?',
    a: 'Si vous ne pouvez plus assister à un événement, vous pouvez remettre votre billet en vente directement depuis votre compte, au prix d’achat initial. L’acheteur reçoit un billet neuf, valable, et vous êtes remboursé dès la vente confirmée.',
  },
  {
    q: 'Sous quelle forme est-ce que je reçois mes billets ?',
    a: 'Vos billets sont disponibles instantanément dans votre compte TYKS et dans l’application mobile, sous forme de QR code. L’impression n’est jamais obligatoire.',
  },
  {
    q: 'Comment inscrire mon lieu ou mon festival sur TYKS ?',
    a: 'Rendez-vous sur l’espace professionnel pour créer un compte organisateur. La mise en ligne de votre billetterie prend généralement moins d’une journée.',
  },
];

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <main className={`${display.variable} ${mono.variable} min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans`}>

      {/* ─── HERO ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-28 grid lg:grid-cols-12 gap-16 items-center">

        <div className="lg:col-span-6 space-y-8">
          <h1 className={`${display.className} text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] text-white`}>
            L’art du spectacle,<br />
            <span className="font-medium text-white/50">sans artifice.</span>
          </h1>

          <p className="text-lg text-white/60 max-w-md font-light leading-relaxed">
            Zéro frais caché, revente officielle instantanée entre particuliers, et une sélection resserrée de la scène live. Vos places, en toute sérénité.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#evenements"
              className="h-13 px-7 py-3.5 bg-white hover:bg-white/90 text-black font-medium text-sm transition-colors flex items-center justify-center gap-2 rounded-full"
            >
              Voir la programmation
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://pro.tyks.app"
              className="h-13 px-7 py-3.5 border border-white/20 text-white font-medium text-sm hover:bg-white/10 transition-colors flex items-center justify-center rounded-full"
            >
              Je suis organisateur
            </a>
          </div>
        </div>

        {/* Visuel : billet stylisé */}
        <div className="lg:col-span-6">
          <div className="relative flex bg-white border border-black/10 rounded-[1.75rem] max-w-md mx-auto">
            <div className="flex-1 p-8 space-y-6">
              <div className={`${mono.className} flex items-center justify-between text-[11px] uppercase tracking-wider text-black/40`}>
                <span>Ven. 12 décembre</span>
                <span>20h30</span>
              </div>
              <div>
                <p className={`${display.className} font-bold text-2xl text-black leading-snug`}>
                  Nuit de Jazz<br />au Comptoir
                </p>
                <p className="text-sm text-black/50 mt-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Le Comptoir Bleu, Lyon
                </p>
              </div>
              <div className={`${mono.className} pt-4 border-t border-black/10 text-[11px] text-black/35`}>
                BILLET NOMINATIF · NON TRANSFÉRABLE SANS REVENTE OFFICIELLE
              </div>
            </div>

            <div className="relative w-28 shrink-0 border-l-2 border-dashed border-black/20 flex flex-col items-center justify-center gap-5 py-8">
              <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-black" />
              <span className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-black" />
              <p className={`${mono.className} [writing-mode:vertical-rl] text-[10px] tracking-[0.3em] text-black/40`}>
                RANG 3 · SIÈGE 12
              </p>
              <div className="flex flex-col gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-0.5 bg-black/25" style={{ width: `${16 + (i % 3) * 6}px` }} />
                ))}
              </div>
              <p className={`${display.className} font-bold text-sm text-black`}>32€</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ÉVÉNEMENTS ─── */}
      <section id="evenements" className="bg-black border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 space-y-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className={`${display.className} font-bold text-3xl text-white`}>
              Ce qui se joue en ce moment
            </h2>
            <span className={`${mono.className} text-xs uppercase tracking-wider text-white/40`}>
              {events.length} événement{events.length > 1 ? 's' : ''} à l’affiche
            </span>
          </div>

          {loading ? (
            <div className="bg-white border border-black/10 p-16 text-center text-sm text-black/50 rounded-[1.75rem]">
              Chargement de la programmation…
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white border border-black/10 p-16 text-center space-y-3 rounded-[1.75rem]">
              <Calendar className="mx-auto h-8 w-8 text-black/30" />
              <p className="text-sm text-black/60">
                Rien de programmé pour le moment. Revenez bientôt, la scène ne dort jamais longtemps.
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
                  <Link
                    key={evt.id}
                    href={`/events/${evt.slug || evt.id}`}
                    className="group flex flex-col bg-white border border-black/10 rounded-[1.75rem] transition-all duration-300 hover:border-black/30 hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <div className="relative w-full h-48 bg-black/5 overflow-hidden rounded-t-[1.75rem] border-b border-black/10 flex items-center justify-center">
                      {eventImage ? (
                        <Image
                          src={eventImage}
                          alt={evt.title || 'Événement'}
                          fill
                          className="object-cover"
                          unoptimized={eventImage.startsWith('http')}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-black/20 space-y-1">
                          <Ticket className="w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3">
                        <span className={`${mono.className} text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 bg-black text-white rounded-full`}>
                          {evt.organizations?.name || 'Exclusivité'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3 flex-1">
                      <span className={`${mono.className} text-[11px] uppercase tracking-wider text-black/40`}>{dateStr}</span>

                      <h3 className={`${display.className} font-bold text-xl text-black leading-snug`}>
                        {evt.title}
                      </h3>

                      {evt.description && (
                        <p className="line-clamp-2 text-sm text-black/50 font-light leading-relaxed">
                          {evt.description}
                        </p>
                      )}

                      {evt.location && (
                        <div className="flex items-center gap-2 text-xs text-black/60 pt-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="relative border-t border-dashed border-black/15 rounded-b-[1.75rem]">
                      <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black" />
                      <span className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black" />
                      <div className="flex items-center justify-between px-6 py-4">
                        <span className={`${display.className} font-bold text-sm text-black`}>
                          {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Entrée libre'}
                        </span>
                        <span className="h-10 px-5 bg-black group-hover:bg-black/80 text-white font-medium text-xs transition-colors flex items-center gap-2 rounded-full">
                          Réserver
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section id="comment-ca-marche" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <h2 className={`${display.className} font-bold text-3xl text-white max-w-lg mb-16`}>
          Trois étapes, aucune complication.
        </h2>

        <div className="grid md:grid-cols-3 gap-x-10 gap-y-14">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.n} className="relative pl-0">
              <p className={`${mono.className} text-5xl text-white/15 mb-4`}>{step.n}</p>
              <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed max-w-xs">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── POURQUOI TYKS ─── */}
      <section className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-5">
            <h2 className={`${display.className} font-bold text-3xl leading-tight`}>
              Une billetterie pensée pour le public, pas contre lui.
            </h2>
            <p className="text-sm text-black/60 font-light leading-relaxed max-w-xs">
              Nous avons conçu TYKS en réaction aux pratiques qui ont abîmé la confiance des spectateurs : frais opaques, reventes spéculatives, files d’attente inutiles.
            </p>
          </div>

          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-x-10 gap-y-12">
            <div className="space-y-3">
              <ShieldCheck className="w-6 h-6 text-black/70" />
              <h3 className="text-base font-medium">Zéro frais caché</h3>
              <p className="text-sm text-black/55 font-light leading-relaxed">
                Le prix affiché est le prix payé, point final. Pas de frais de dossier ni de service ajoutés au dernier écran.
              </p>
            </div>
            <div className="space-y-3">
              <Ticket className="w-6 h-6 text-black/70" />
              <h3 className="text-base font-medium">Revente au juste prix</h3>
              <p className="text-sm text-black/55 font-light leading-relaxed">
                Un billet revendu sur TYKS l’est toujours à son prix d’origine. La spéculation n’a pas sa place ici.
              </p>
            </div>
            <div className="space-y-3">
              <Sparkles className="w-6 h-6 text-black/70" />
              <h3 className="text-base font-medium">Sélection exigeante</h3>
              <p className="text-sm text-black/55 font-light leading-relaxed">
                Chaque salle et festival partenaire est vérifié avant sa mise en ligne, pour une programmation de confiance.
              </p>
            </div>
            <div className="space-y-3">
              <QrCode className="w-6 h-6 text-black/70" />
              <h3 className="text-base font-medium">Accès sans friction</h3>
              <p className="text-sm text-black/55 font-light leading-relaxed">
                Un QR code, un scan, c’est réglé. Aucune impression ni file d’attente séparée le soir de l’événement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid lg:grid-cols-3 gap-10">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="space-y-5">
              <Quote className="w-6 h-6 text-white/20" />
              <p className="text-white/75 font-light leading-relaxed">{t.quote}</p>
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className={`${mono.className} text-xs text-white/40`}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── APPLICATION MOBILE ─── */}
      <section id="application" className="bg-zinc-950 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-12 gap-16 items-center">

          <div className="lg:col-span-6 order-2 lg:order-1 space-y-6">
            <h2 className={`${display.className} font-bold text-3xl text-white max-w-md`}>
              Vos billets, toujours sur vous.
            </h2>
            <p className="text-white/60 font-light leading-relaxed max-w-md">
              L’application TYKS rassemble vos réservations, vos billets hors connexion et les ventes en avant-première réservées à ses membres. Disponible gratuitement sur iOS et Android.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href="#" className="h-12 px-5 bg-white text-black text-sm font-medium rounded-full flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> App Store
              </a>
              <a href="#" className="h-12 px-5 border border-white/20 text-white text-sm font-medium rounded-full flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Google Play
              </a>
            </div>

            <div className="flex items-center gap-3 pt-4 text-xs text-white/45">
              <QrCode className="w-8 h-8 text-white/30" />
              Ou scannez ce code depuis votre téléphone pour l’installer directement.
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
            <div className="relative w-[240px] rounded-[2.25rem] border-[6px] border-white bg-black p-3">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3" />
              <div className="bg-zinc-900 rounded-[1.5rem] h-[400px] p-3 space-y-2.5 overflow-hidden">
                <p className={`${mono.className} text-[10px] uppercase tracking-wider text-white/40 px-1 pt-1`}>Mes billets</p>
                {['Nuit de Jazz au Comptoir', 'Festival des Nuits Rives', 'Cie des Ombres — Théâtre'].map((label) => (
                  <div key={label} className="bg-black rounded-xl border border-white/10 p-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-white leading-tight">{label}</p>
                      <p className="text-[9px] text-white/40">Voir le billet</p>
                    </div>
                    <QrCode className="w-6 h-6 text-white/25 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
        <h2 className={`${display.className} font-bold text-3xl text-white mb-12`}>
          Questions fréquentes
        </h2>

        <div className="divide-y divide-white/10 border-t border-b border-white/10">
          {FAQS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-base font-medium text-white">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-6 text-sm text-white/55 font-light leading-relaxed max-w-2xl">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── ORGANISATEURS ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className={`${display.className} font-bold text-2xl sm:text-3xl text-white`}>
              Vous organisez des événements ?
            </h2>
            <p className="text-sm text-white/60 font-light leading-relaxed">
              Gérez votre billetterie, votre contrôle d’accès et vos ventes en toute simplicité avec la solution pro TYKS. Commissions transparentes, mise en ligne rapide.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="h-13 px-8 py-3.5 bg-white hover:bg-white/90 text-black font-medium text-sm transition-colors flex items-center justify-center gap-2 rounded-full shrink-0"
          >
            Accéder à l’espace Pro
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

    </main>
  );
}

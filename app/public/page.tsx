'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <main className="min-h-screen bg-[#121214] text-[#FDFBF7] selection:bg-[#D4AF37] selection:text-black font-sans">
      
      {/* ─── HERO SECTION : ACCROCHE + VISUEL APP / QR CODE ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-20 border-b border-white/10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Colonne Gauche : Message principal & Proposition de valeur */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Billetterie Officielle & Indépendante
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight leading-[1.1] text-[#FDFBF7]">
            L&apos;art du spectacle, <br />
            <span className="italic font-light text-[#D4AF37]">sans artifice.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-white/60 max-w-xl font-light leading-relaxed">
            Zéro frais cachés, revente officielle instantanée et sélection pointue de la scène live. Réservez vos places en toute sérénité sur le web ou directement depuis notre application mobile.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#evenements"
              className="h-12 px-7 bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center rounded-xl shadow-lg cursor-pointer"
            >
              Voir la programmation
            </a>
            <a
              href="https://pro.tyks.app"
              className="h-12 px-7 bg-white/5 hover:bg-white/10 border border-white/10 text-[#FDFBF7] font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center rounded-xl cursor-pointer"
            >
              Espace Organisateur
            </a>
          </div>
        </div>

        {/* Colonne Droite : Animation / Encart de téléchargement Application Mobile & QR Code */}
        <div className="lg:col-span-5">
          <div className="relative bg-gradient-to-b from-[#18181b] to-[#141416] border border-[#D4AF37]/30 p-8 rounded-3xl shadow-2xl space-y-6 overflow-hidden">
            {/* Lueur dorée d'ambiance */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#FDFBF7]">Application TYKS</h3>
                  <p className="text-xs text-white/50">iOS & Android</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-semibold tracking-wide uppercase">
                <Sparkles className="w-3 h-3" /> Gratuit
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Infos & Liens de téléchargement */}
              <div className="space-y-3">
                <p className="text-xs text-white/60 font-light leading-relaxed">
                  Emportez vos billets partout avec vous et accédez aux ventes exclusives en avant-première.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <a href="#" className="text-xs text-[#D4AF37] hover:underline font-medium flex items-center gap-1">
                    → App Store (iOS)
                  </a>
                  <a href="#" className="text-xs text-[#D4AF37] hover:underline font-medium flex items-center gap-1">
                    → Google Play (Android)
                  </a>
                </div>
              </div>

              {/* Simulation QR Code épurée */}
              <div className="bg-[#121214] border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[#D4AF37]">
                  <QrCode className="w-16 h-16 opacity-90" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Scannez pour installer</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── SECTION EXPLICATION & AVANTAGES ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-b border-white/10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Pourquoi choisir TYKS
          </h2>
          <p className="text-3xl font-serif text-[#FDFBF7]">
            Une billetterie pensée pour le public et la culture.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#18181b] border border-white/10 p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#FDFBF7]">Zéro frais cachés</h3>
            <p className="text-xs text-white/60 font-light leading-relaxed">
              Le prix affiché est le prix payé. Pas de mauvaises surprises au moment de valider votre panier.
            </p>
          </div>

          <div className="bg-[#18181b] border border-white/10 p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#FDFBF7]">Revente officielle sécurisée</h3>
            <p className="text-xs text-white/60 font-light leading-relaxed">
              Empêchez la spéculation. Revendez ou achetez des billets en toute confiance entre particuliers au prix juste.
            </p>
          </div>

          <div className="bg-[#18181b] border border-white/10 p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#FDFBF7]">Sélection pointue</h3>
            <p className="text-xs text-white/60 font-light leading-relaxed">
              Une programmation artistique rigoureuse, indépendante et de qualité pour des expériences mémorables.
            </p>
          </div>
        </div>
      </section>

      {/* ─── LISTE DES ÉVÉNEMENTS ─── */}
      <section id="evenements" className="max-w-7xl mx-auto px-6 lg:px-12 py-20 space-y-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Programmation à l&apos;affiche
          </h2>
          <span className="text-xs uppercase tracking-wider text-white/40 font-medium">
            {events.length} événement{events.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="bg-[#18181b] border border-white/10 p-16 text-center text-sm text-white/50 rounded-2xl">
            Chargement des expériences...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#18181b] border border-white/10 p-16 text-center space-y-3 rounded-2xl">
            <Calendar className="mx-auto h-8 w-8 text-[#D4AF37]" />
            <p className="text-sm text-white/60">
              Aucun événement disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
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
                  className="group flex flex-col bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-black/50"
                >
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#D4AF37] tracking-wide">
                        {dateStr}
                      </span>
                      <span className="text-[11px] font-medium px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 rounded-full">
                        {evt.organizations?.name || 'Exclusivité'}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-medium text-[#FDFBF7] tracking-tight group-hover:text-[#D4AF37] transition-colors">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="line-clamp-2 text-xs text-white/50 font-light leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 text-xs text-white/60 pt-2">
                        <MapPin className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#141416]">
                    <span className="text-sm font-semibold tracking-wide text-[#FDFBF7]">
                      {eventPrice > 0 ? `${eventPrice.toLocaleString('fr-FR')} €` : 'Entrée libre'}
                    </span>
                    <Link
                      href={`/events/${evt.slug || evt.id}`}
                      className="h-10 px-5 bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl shadow-md cursor-pointer"
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

      {/* ─── ENCART ORGANISATEURS (BAS DE PAGE) ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="bg-gradient-to-r from-[#18181b] via-[#1c1c21] to-[#18181b] border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Espace Professionnel
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#FDFBF7]">
              Vous organisez des événements ?
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              Gérez votre billetterie, vos contrôles d’accès et vos ventes en toute simplicité avec la solution pro TYKS. Commissions transparentes et outils sur-mesure.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="h-12 px-8 bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center rounded-xl shadow-lg shrink-0 cursor-pointer"
          >
            Accéder à l&apos;espace Pro
          </a>
        </div>
      </section>

    </main>
  );
}

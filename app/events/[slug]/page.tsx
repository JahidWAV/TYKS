"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, ShieldCheck, Minus, Plus, Users, Loader2, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PublicEventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [includeSupport, setIncludeSupport] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    const fetchEvent = async () => {
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error || !data) {
        setEvent(null);
      } else {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#111110]/60" />
      </main>
    );
  }

  if (!event) {
    return notFound();
  }

  const basePrice = Number(event.price) || 0;
  const supportDonation = includeSupport ? 2 : 0;
  const unitPrice = basePrice + supportDonation;
  const totalPrice = unitPrice * quantity;

  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const formattedDate = startDate
    ? startDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const formattedTime = startDate
    ? startDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-8 md:py-12 flex flex-col justify-between selection:bg-[#111110] selection:text-[#F7F5F0]">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Topbar navigation & Organisateur */}
        <div className="flex items-center justify-between border-b border-[#111110]/10 pb-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/60 hover:text-[#111110] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Agenda</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#111110]/60">
              {event.organizations?.name || 'Organisateur Indépendant'}
            </span>
          </div>
        </div>

        {/* SECTION HÉRO : Affiche + Carte Billetterie côte à côte */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-stretch">
          
          {/* Bloc Visual / Affiche (Hauteur ajustée pour matcher le widget) */}
          <div className="relative rounded-3xl overflow-hidden border border-[#111110]/15 bg-[#111110]/5 flex flex-col justify-between p-6 md:p-8 min-h-[420px] shadow-sm">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              /* Fallback design TYKS si pas d'image */
              <div className="absolute inset-0 bg-gradient-to-br from-[#111110] to-[#222220] text-[#F7F5F0] p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/50">
                    {event.organizations?.name || 'Production'}
                  </span>
                  <Sparkles className="w-5 h-5 text-[#F7F5F0]/40" />
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
                  {event.title}
                </h2>
              </div>
            )}

            {/* Overlay d'assombrissement léger en bas d'image si c'est une vraie photo */}
            {event.image_url && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            )}

            {/* Infos rapides overlay en bas d'affiche */}
            {event.image_url && (
              <div className="relative z-10 mt-auto space-y-2 text-[#F7F5F0]">
                <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight drop-shadow-md">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#F7F5F0]/80">
                  <span className="capitalize">{formattedDate}</span>
                  <span>•</span>
                  <span>Portes à {formattedTime || '20:00'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Widget de Billetterie Live (Carte Onyx) */}
          <div className="rounded-3xl bg-[#111110] text-[#F7F5F0] p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-2xl border border-[#111110]">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]/15">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#F7F5F0]/60" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/70">Billetterie Live</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#F7F5F0]/10 text-emerald-400 font-semibold">
                  Places dispo
                </span>
              </div>

              {/* Sélecteur de quantité */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#F7F5F0]/60">Sélectionner les places</span>
                  <span className="text-[#F7F5F0] font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {quantity} {quantity > 1 ? 'billets' : 'billet'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#F7F5F0]/5 border border-[#F7F5F0]/15 rounded-2xl p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-35 transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xl font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className="w-10 h-10 rounded-xl bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-35 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Option de soutien solidaire */}
              {basePrice > 0 && (
                <div className="bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 rounded-2xl p-3.5 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeSupport}
                      onChange={(e) => setIncludeSupport(e.target.checked)}
                      className="mt-0.5 rounded border-[#F7F5F0]/20 bg-transparent text-[#111110] focus:ring-0 cursor-pointer"
                    />
                    <div className="space-y-0.5 text-xs">
                      <p className="font-semibold text-[#F7F5F0]">Option solidaire (+2 € / billet)</p>
                      <p className="text-[#F7F5F0]/50 text-[11px]">Soutien direct au lieu et aux artistes.</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Prix & Action */}
            <div className="space-y-4 pt-4 border-t border-[#F7F5F0]/15">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#F7F5F0]/50 block">Total</span>
                  <span className="font-mono text-xs text-emerald-400">0% commission</span>
                </div>
                <p className="font-display text-4xl font-bold tracking-tight">
                  {basePrice === 0 ? 'Gratuit' : `${totalPrice.toFixed(2)} €`}
                </p>
              </div>

              <button className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xl">
                <span>{basePrice === 0 ? 'Obtenir mes places' : `Réserver (${totalPrice.toFixed(2)} €)`}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-[10px] text-[#F7F5F0]/40 font-mono pt-1">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Accès garanti</span>
                <span>QR Code instantané</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION DÉTAILS : Infos pratiques + Description développée en dessous */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 pt-4">
          
          {/* Colonne gauche : Description & Line-up */}
          <div className="space-y-6">
            {!event.image_url && (
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                {event.title}
              </h1>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">À propos de l'événement</h3>
              {event.description ? (
                <div className="text-sm md:text-base text-[#111110]/85 font-light leading-relaxed whitespace-pre-line bg-white/50 p-6 rounded-2xl border border-[#111110]/5">
                  {event.description}
                </div>
              ) : (
                <p className="text-xs text-[#111110]/40 italic font-light">Aucune description détaillée communiquée.</p>
              )}
            </div>
          </div>

          {/* Colonne droite : Fiche infos pratiques & Lieu */}
          <div className="space-y-6">
            <div className="bg-white/50 border border-[#111110]/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">Informations pratiques</h3>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#111110]/40 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[#111110]/50 text-[10px] uppercase">Date</span>
                    <span className="font-semibold capitalize">{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#111110]/40 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[#111110]/50 text-[10px] uppercase">Horaires</span>
                    <span className="font-semibold">Portes à {formattedTime || '20:00'}</span>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3 pt-1 border-t border-[#111110]/5">
                    <MapPin className="w-4 h-4 text-[#111110]/40 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[#111110]/50 text-[10px] uppercase">Lieu</span>
                      <span className="font-semibold text-sm">{event.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

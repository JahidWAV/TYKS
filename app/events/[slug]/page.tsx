"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, ShieldCheck, Minus, Plus, Users, Loader2, Sparkles } from 'lucide-react';
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
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-8 md:py-12 selection:bg-[#111110] selection:text-[#F7F5F0]">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        
        {/* Fil d'ariane / Topbar */}
        <div className="flex items-center justify-between border-b border-[#111110]/10 pb-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/60 hover:text-[#111110] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Agenda</span>
          </Link>
          <span className="text-xs font-mono uppercase tracking-widest text-[#111110]/60">
            {event.organizations?.name || 'Organisateur Indépendant'}
          </span>
        </div>

        {/* SECTION HÉRO : Infos + Bouton à gauche / Affiche à droite (Style Shotgun inversé harmonieux) */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
          
          {/* COLONNE DE GAUCHE : Titre, Infos pratiques & Widget d'achat */}
          <div className="space-y-6">
            
            {/* Titre & Organisateur */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#111110]/50 uppercase tracking-widest">
                Par {event.organizations?.name || 'Organisateur'}
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                {event.title}
              </h1>
            </div>

            {/* Infos pratiques épurées (Date, Heure, Lieu) */}
            <div className="space-y-3 pt-2 font-mono text-xs text-[#111110]/80">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#111110]/40 shrink-0" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#111110]/40 shrink-0" />
                <span>Portes à {formattedTime || '20:00'}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#111110]/40 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            {/* Bloc de Billetterie / Achat direct */}
            <div className="rounded-3xl bg-[#111110] text-[#F7F5F0] p-6 space-y-5 shadow-xl border border-[#111110]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7F5F0]/15">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#F7F5F0]/60" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#F7F5F0]/70">Billetterie</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F7F5F0]/10 text-emerald-400 font-semibold">
                  Dispo
                </span>
              </div>

              {/* Sélecteur de quantité */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-[#F7F5F0]/60">Places</span>
                  <span className="text-[#F7F5F0] font-bold flex items-center gap-1">
                    <Users className="w-3 h-3" /> {quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#F7F5F0]/5 border border-[#F7F5F0]/15 rounded-xl p-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-35 transition-all cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-base font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className="w-8 h-8 rounded-lg bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-35 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option solidaire */}
              {basePrice > 0 && (
                <div className="bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 rounded-xl p-3 space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeSupport}
                      onChange={(e) => setIncludeSupport(e.target.checked)}
                      className="mt-0.5 rounded border-[#F7F5F0]/20 bg-transparent text-[#111110] focus:ring-0 cursor-pointer"
                    />
                    <div className="space-y-0.5 text-[11px]">
                      <p className="font-semibold text-[#F7F5F0]">Option solidaire (+2 € / billet)</p>
                      <p className="text-[#F7F5F0]/50 text-[10px]">Soutien direct au lieu.</p>
                    </div>
                  </label>
                </div>
              )}

              {/* Prix & Action */}
              <div className="space-y-3 pt-3 border-t border-[#F7F5F0]/15">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#F7F5F0]/50 block">Total</span>
                    <span className="font-mono text-[10px] text-emerald-400">0% commission</span>
                  </div>
                  <p className="font-display text-3xl font-bold tracking-tight">
                    {basePrice === 0 ? 'Gratuit' : `${totalPrice.toFixed(2)} €`}
                  </p>
                </div>

                <button className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-3.5 px-5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                  <span>{basePrice === 0 ? 'Obtenir mes places' : `Réserver (${totalPrice.toFixed(2)} €)`}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center text-[10px] text-[#F7F5F0]/40 font-mono pt-0.5">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Garanti</span>
                  <span>QR Code instantané</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLONNE DE DROITE : Affiche grand format style Shotgun */}
          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-[#111110]/15 bg-[#111110]/5 shadow-sm">
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#111110] to-[#222220] text-[#F7F5F0] p-8 flex flex-col justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/50">
                    {event.organizations?.name || 'Production'}
                  </span>
                  <Sparkles className="w-6 h-6 text-[#F7F5F0]/40" />
                </div>
              )}
            </div>

            {/* Description détaillée en dessous de l'affiche */}
            <div className="space-y-3 pt-2">
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

        </div>

      </div>
    </main>
  );
}

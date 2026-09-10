"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, ShieldCheck, Minus, Plus, Users, Loader2 } from 'lucide-react';
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
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
        {/* Navigation & Organisateur */}
        <div className="flex items-center justify-between border-b border-[#111110]/10 pb-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/60 hover:text-[#111110] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Retour à l'agenda</span>
          </Link>
          <span className="text-xs font-mono uppercase tracking-widest text-[#111110]/60">
            {event.organizations?.name || 'Organisateur Indépendant'}
          </span>
        </div>

        {/* Grille principale */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-start">
          
          {/* Colonne gauche : Infos & Description */}
          <div className="space-y-6">
            {event.image_url && (
              <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-[#111110]/10 shadow-sm">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                {event.title}
              </h1>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 border-t border-b border-[#111110]/10 py-4 font-mono text-xs text-[#111110]/80">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-[#111110]/40 shrink-0" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#111110]/40 shrink-0" />
                <span>Portes à {formattedTime || '20:00'}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-[#111110]/40 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">À propos</h3>
              {event.description ? (
                <div className="text-sm md:text-base text-[#111110]/85 font-light leading-relaxed whitespace-pre-line space-y-3">
                  {event.description}
                </div>
              ) : (
                <p className="text-xs text-[#111110]/40 italic font-light">Aucune description détaillée.</p>
              )}
            </div>
          </div>

          {/* Colonne droite : Widget dynamique de billetterie moderne */}
          <div className="rounded-2xl bg-[#111110] text-[#F7F5F0] p-6 md:p-8 space-y-6 sticky top-6 shadow-2xl border border-[#111110]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]/15">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#F7F5F0]/60" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/70">Billetterie Live</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#F7F5F0]/10 text-emerald-400">Places dispo</span>
            </div>

            {/* Sélecteur de quantité */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#F7F5F0]/60">Nombre de places</span>
                <span className="text-[#F7F5F0] font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {quantity} {quantity > 1 ? 'billets' : 'billet'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#F7F5F0]/5 border border-[#F7F5F0]/15 rounded-xl p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-35 transition-all cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-lg font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                  className="w-10 h-10 rounded-lg bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-35 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Option de soutien solidaire */}
            {basePrice > 0 && (
              <div className="bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 rounded-xl p-3.5 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSupport}
                    onChange={(e) => setIncludeSupport(e.target.checked)}
                    className="mt-0.5 rounded border-[#F7F5F0]/20 bg-transparent text-[#111110] focus:ring-0 cursor-pointer"
                  />
                  <div className="space-y-0.5 text-xs">
                    <p className="font-semibold text-[#F7F5F0]">Option solidaire (+2 € / billet)</p>
                    <p className="text-[#F7F5F0]/50 text-[11px]">Soutien direct au lieu et aux artistes indépendants.</p>
                  </div>
                </label>
              </div>
            )}

            {/* Récapitulatif dynamique du prix */}
            <div className="pt-4 border-t border-[#F7F5F0]/15 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#F7F5F0]/50 block">Total estimé</span>
                <span className="font-mono text-xs text-emerald-400">0% de commission</span>
              </div>
              <p className="font-display text-4xl font-bold tracking-tight">
                {basePrice === 0 ? 'Gratuit' : `${totalPrice.toFixed(2)} €`}
              </p>
            </div>

            <div className="space-y-2 pt-2 text-[11px] text-[#F7F5F0]/70 font-light font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#F7F5F0]/40">Format</span>
                <span>QR Code instantané</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#F7F5F0]/40">Accès salle</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Garanti
                </span>
              </div>
            </div>

            <button className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xl">
              <span>{basePrice === 0 ? 'Obtenir mes places' : `Payer ${totalPrice.toFixed(2)} €`}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#F7F5F0]/40 font-mono leading-relaxed">
              Paiement direct sécurisé · Reçu immédiat par e-mail.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

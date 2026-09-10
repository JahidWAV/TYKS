"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, Minus, Plus, Users, Loader2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PublicEventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [includeSupport, setIncludeSupport] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);

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
        <Loader2 className="w-5 h-5 animate-spin text-[#111110]/50" />
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

  const handleInitCheckout = async () => {
    setIsInitializingPayment(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          unitPrice,
          includeSupport,
        }),
      });
      const data = await res.json();
      
      if (data.url) {
        // Cas gratuit
        window.location.href = data.url;
      } else if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        alert(data.error || "Erreur lors de l'initialisation du paiement");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-8 md:py-12 selection:bg-[#111110] selection:text-[#F7F5F0]">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Navigation & Orga */}
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

        {/* Section principale : Infos à gauche, Affiche 16:9 à droite */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
          
          {/* Colonne Gauche : Titre, Infos, CTA & Description */}
          <div className="space-y-8">
            
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#111110]/50 uppercase tracking-widest">
                Par {event.organizations?.name || 'Organisateur'}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                {event.title}
              </h1>
            </div>

            {/* Infos Pratiques */}
            <div className="space-y-2.5 font-mono text-xs text-[#111110]/80 bg-white/60 p-5 rounded-2xl border border-[#111110]/10 shadow-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#111110]/40 shrink-0" />
                <span>{formattedDate}</span>
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

            {/* Bouton d'action principal */}
            <div>
              <button
                onClick={() => {
                  setClientSecret(null);
                  setIsCheckoutOpen(true);
                }}
                className="w-full sm:w-auto rounded-full bg-[#111110] text-[#F7F5F0] py-4 px-8 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#222220] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer shadow-lg"
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>{basePrice === 0 ? 'Prendre une place (Gratuit)' : `Prendre une place • ${basePrice.toFixed(2)} €`}</span>
                <ArrowUpRight className="w-4 h-4 text-[#F7F5F0]/60" />
              </button>
            </div>

            {/* Description de l'événement */}
            <div className="space-y-3 pt-4 border-t border-[#111110]/10">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">À propos</h3>
              {event.description ? (
                <div className="text-sm md:text-base text-[#111110]/85 font-light leading-relaxed whitespace-pre-line bg-white/40 p-6 rounded-2xl border border-[#111110]/5">
                  {event.description}
                </div>
              ) : (
                <p className="text-xs text-[#111110]/40 italic font-light">Aucune description détaillée communiquée.</p>
              )}
            </div>

          </div>

          {/* Colonne Droite : Affiche 16:9 */}
          <div className="lg:sticky lg:top-8">
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-[#111110]/15 bg-[#111110]/5 shadow-sm">
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
          </div>

        </div>

      </div>

      {/* Modale de Billetterie White Label Embarquée */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#111110] text-[#F7F5F0] p-6 md:p-8 space-y-6 shadow-2xl border border-[#F7F5F0]/15 max-h-[90vh] overflow-y-auto">
            
            {/* Bouton fermer */}
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setClientSecret(null);
              }}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0]/70 hover:text-[#F7F5F0] hover:bg-[#F7F5F0]/20 transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {!clientSecret ? (
              <>
                {/* En-tête modale */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#F7F5F0]/50 block">Billetterie</span>
                  <h3 className="font-display text-xl font-bold tracking-tight line-clamp-1">{event.title}</h3>
                </div>

                {/* Quantité */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-mono text-[#F7F5F0]/60">
                    <span>Quantité</span>
                    <span className="text-[#F7F5F0] font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#F7F5F0]/5 border border-[#F7F5F0]/15 rounded-2xl p-1.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-xl bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-xl font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      className="w-10 h-10 rounded-xl bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0] hover:bg-[#F7F5F0]/20 disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Option solidaire optionnelle */}
                {basePrice > 0 && (
                  <div className="bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 rounded-2xl p-3.5">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeSupport}
                        onChange={(e) => setIncludeSupport(e.target.checked)}
                        className="mt-0.5 rounded border-[#F7F5F0]/20 bg-transparent text-[#111110] focus:ring-0 cursor-pointer"
                      />
                      <div className="space-y-0.5 text-xs">
                        <p className="font-semibold text-[#F7F5F0]">Option solidaire (+2 € / billet)</p>
                        <p className="text-[#F7F5F0]/50 text-[11px]">Soutien direct au lieu.</p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Total et Bouton */}
                <div className="space-y-4 pt-4 border-t border-[#F7F5F0]/15">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-[#F7F5F0]/50 uppercase tracking-wider">Total</span>
                    <p className="font-display text-3xl font-bold tracking-tight">
                      {basePrice === 0 ? 'Gratuit' : `${totalPrice.toFixed(2)} €`}
                    </p>
                  </div>

                  <button 
                    onClick={handleInitCheckout}
                    disabled={isInitializingPayment}
                    className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xl font-bold disabled:opacity-50"
                  >
                    {isInitializingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{basePrice === 0 ? 'Valider ma place' : 'Procéder au paiement'}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Tunnel de paiement Stripe 100% Embarqué (White Label) */
              <div className="pt-2">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout className="bg-[#111110]" />
                </EmbeddedCheckoutProvider>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}

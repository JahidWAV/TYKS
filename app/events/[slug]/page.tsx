"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { ArrowUpRight, Ticket, Minus, Plus, Users, X, CheckCircle2, ShieldAlert, Loader2, Calendar, MapPin, Clock, Building2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CustomCheckoutForm({ slug, eventTitle, quantity, totalPrice, onSuccess }: { slug: string; eventTitle: string; quantity: number; totalPrice: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || "Une erreur est survenue lors du paiement.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      const clientEmail = user?.email;

      try {
        await fetch('/api/send-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: clientEmail,
            eventTitle,
            quantity,
            totalPrice: totalPrice.toFixed(2),
          }),
        });
      } catch (err) {
        console.error("Erreur lors de l'appel de l'API email", err);
      }

      setIsProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <PaymentElement options={{ layout: 'tabs' }} />
      
      {errorMessage && (
        <div className="p-3 bg-[#f8faf9] text-red-600 text-xs font-medium border border-[#1e3932]/15 rounded-xl">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-12 bg-[#1e3932] text-white text-xs font-medium uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-[#152a25] rounded-xl shadow-md"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Payer et valider</span>
            <ArrowUpRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function PublicEventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSent, setAuthSent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    supabaseBrowser.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [slug]);

  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
      setIsCheckoutOpen(true);
      handleInitCheckout();
    }
  }, [user]);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: authEmail,
      options: {
        emailRedirectTo: window.location.href,
      },
    });

    setAuthLoading(false);
    if (!error) {
      setAuthSent(true);
    } else {
      alert("Erreur lors de l'envoi du lien de connexion.");
    }
  };

  const handleGoogleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
      },
    });
  };

  const handleAppleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.href,
      },
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-[#f8faf9] flex items-center justify-center font-sans text-xs uppercase tracking-widest text-[#1e3932]/60">
        Chargement...
      </div>
    );
  }

  if (!event) {
    return notFound();
  }

  const basePrice = Number(event.price) || 0;
  const platformFeePerTicket = basePrice > 0 ? 0.90 : 0;
  const organizerSharePerTicket = basePrice - platformFeePerTicket;
  const totalPrice = basePrice * quantity;

  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const formattedDate = startDate
    ? startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const formattedTime = startDate
    ? startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleInitCheckout = async () => {
    if (!user) {
      setIsCheckoutOpen(false);
      setShowAuthModal(true);
      return;
    }

    setIsInitializingPayment(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          unitPrice: basePrice,
        }),
      });
      const data = await res.json();
      
      if (data.clientSecret) {
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
    <main className="w-full bg-[#f8faf9] text-[#1e3932] font-sans selection:bg-[#1e3932] selection:text-white py-12 px-6 sm:px-12">
      <div className="w-full max-w-6xl mx-auto space-y-12">
        
        {/* Titre et infos centrés en haut */}
        <div className="flex flex-col items-center text-center space-y-6 border-b border-[#1e3932]/10 pb-10">
          {event.organizations?.name && (
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#1e3932]/60 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span>{event.organizations.name}</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase leading-[1.05] text-[#1e3932] max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs font-medium uppercase tracking-wider text-[#1e3932]/80">
            {formattedDate && (
              <div className="flex items-center gap-2 bg-white border border-[#1e3932]/15 px-4 py-2 rounded-full shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-[#1e3932]" />
                <span>{formattedDate}</span>
              </div>
            )}
            {formattedTime && (
              <div className="flex items-center gap-2 bg-white border border-[#1e3932]/15 px-4 py-2 rounded-full shadow-sm">
                <Clock className="w-3.5 h-3.5 text-[#1e3932]" />
                <span>{formattedTime}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 bg-white border border-[#1e3932]/15 px-4 py-2 rounded-full shadow-sm max-w-xs truncate">
                <MapPin className="w-3.5 h-3.5 text-[#1e3932]" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ligne complète : Affiche horizontale à gauche (65%) et Carte verticale à droite (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
          
          {/* Affiche au format horizontal (bannière) à gauche */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="w-full h-full min-h-[400px] border border-[#1e3932]/15 bg-white shadow-xl overflow-hidden rounded-3xl p-3 flex">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full p-8 flex flex-col justify-between bg-[#f8faf9] text-[#1e3932] rounded-2xl">
                  <span className="text-xs uppercase tracking-widest text-[#1e3932]/65">TYKS BANNER</span>
                  <span className="text-4xl font-bold tracking-tighter text-[#1e3932]">LIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* Carte au format vertical à droite */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="w-full h-full bg-white border border-[#1e3932]/15 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                {event.description && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1e3932]/40">À propos de l&apos;événement</h3>
                    <p className="text-xs leading-relaxed text-[#1e3932]/80 whitespace-pre-line font-light">
                      {event.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#1e3932]/10 pt-6 space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1e3932]/50 font-medium block">Tarif unique</span>
                  <span className="text-3xl font-bold tracking-tight text-[#1e3932]">
                    {basePrice === 0 ? 'Gratuit' : `${basePrice.toFixed(2)} €`}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setClientSecret(null);
                    setIsSuccess(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-4 border border-[#1e3932]/15 bg-[#1e3932] text-white text-xs uppercase tracking-widest hover:bg-[#152a25] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md font-medium rounded-2xl"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{basePrice === 0 ? 'Réserver ma place' : 'Réserver mes places'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ─── MODALES INTÉGRÉES ─── */}
      {mounted && createPortal(
        <>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white border border-[#1e3932]/15 p-8 max-w-md w-full space-y-6 relative shadow-2xl text-[#1e3932] rounded-3xl">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-5 right-5 w-8 h-8 border border-[#1e3932]/15 bg-[#f8faf9] text-[#1e3932]/60 flex items-center justify-center hover:bg-[#1e3932]/10 hover:text-[#1e3932] transition-colors cursor-pointer rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="inline-block text-[10px] uppercase tracking-widest bg-[#f8faf9] border border-[#1e3932]/15 text-[#1e3932] px-2.5 py-1 rounded-full font-medium">Sécurité</span>
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-[#1e3932]">Authentification</h3>
                  <p className="text-xs text-[#1e3932]/60 leading-relaxed font-light">
                    Connectez-vous pour sécuriser vos billets et les retrouver instantanément.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-12 border border-[#1e3932]/15 bg-[#f8faf9] hover:bg-[#1e3932]/5 text-[#1e3932] text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continuer avec Google</span>
                    </button>

                    <button
                      onClick={handleAppleLogin}
                      className="w-full h-12 border border-[#1e3932]/15 bg-[#f8faf9] hover:bg-[#1e3932]/5 text-[#1e3932] text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.01c.65-.79 1.09-1.89.97-2.99-.96.04-2.13.64-2.82 1.43-.6.68-1.13 1.78-.99 2.85 1.08.08 2.19-.53 2.84-1.29z"/>
                      </svg>
                      <span>Continuer avec Apple</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-[#1e3932]/15"></div>
                      <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-[#1e3932]/60 font-medium">ou</span>
                      <div className="flex-grow border-t border-[#1e3932]/15"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full h-12 border border-[#1e3932]/15 bg-[#f8faf9] px-4 text-xs uppercase placeholder:text-[#1e3932]/40 focus:outline-none focus:border-[#1e3932] text-[#1e3932] rounded-xl"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-12 border border-[#1e3932]/15 bg-[#1e3932] text-white text-xs font-medium uppercase tracking-widest hover:bg-[#152a25] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-md"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Recevoir le lien magique</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="border border-[#1e3932]/15 p-6 bg-[#f8faf9] text-center space-y-2 rounded-xl">
                    <p className="text-xs font-medium uppercase text-[#1e3932]">Lien envoyé avec succès</p>
                    <p className="text-[11px] text-[#1e3932]/60 leading-relaxed">
                      Vérifiez votre boîte mail pour finaliser votre accès.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCheckoutOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-lg bg-white border border-[#1e3932]/15 p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-[#1e3932] rounded-3xl">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="absolute top-5 right-5 w-8 h-8 border border-[#1e3932]/15 bg-[#f8faf9] text-[#1e3932]/60 flex items-center justify-center hover:bg-[#1e3932]/10 hover:text-[#1e3932] transition-colors cursor-pointer z-10 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>

                {isSuccess ? (
                  <div className="py-6 space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 rounded-2xl">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="inline-block text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">Confirmé</span>
                      <h3 className="text-2xl font-bold uppercase tracking-tight text-[#1e3932]">Places réservées</h3>
                      <p className="text-xs text-[#1e3932]/60 leading-relaxed">
                        Votre billet électronique a été envoyé par e-mail.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full h-12 border border-[#1e3932]/15 bg-[#1e3932] text-white text-xs font-medium uppercase tracking-widest hover:bg-[#152a25] transition-all cursor-pointer rounded-xl shadow-md"
                    >
                      Fermer
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] uppercase tracking-widest bg-[#f8faf9] border border-[#1e3932]/15 text-[#1e3932] px-2.5 py-1 rounded-full font-medium">Panier</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight pt-2 text-[#1e3932]">{event.title}</h3>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs text-[#1e3932]/60">
                        <span>Quantité</span>
                        <span className="text-[#1e3932] font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#1e3932]" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border border-[#1e3932]/15 p-1.5 bg-[#f8faf9] rounded-xl">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 border border-[#1e3932]/15 bg-white text-[#1e3932] flex items-center justify-center hover:bg-[#1e3932]/10 disabled:opacity-30 transition-all cursor-pointer rounded-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-[#1e3932]">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                          className="w-10 h-10 border border-[#1e3932]/15 bg-white text-[#1e3932] flex items-center justify-center hover:bg-[#1e3932]/10 disabled:opacity-30 transition-all cursor-pointer rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {basePrice > 0 && (
                      <div className="border border-[#1e3932]/15 p-4 bg-[#f8faf9] space-y-2 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase text-[#1e3932]">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Transparence tarifaire intégrale</span>
                        </div>
                        <div className="space-y-1 text-xs text-[#1e3932]/60 divide-y divide-[#1e3932]/10">
                          <div className="flex justify-between pt-1">
                            <span>Part artiste / organisateur</span>
                            <span className="text-[#1e3932] font-medium">{(organizerSharePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between pt-1.5">
                            <span>Frais de plateforme fixes</span>
                            <span className="text-[#1e3932] font-medium">{(platformFeePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-[#1e3932]/15">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-wider text-[#1e3932]/60">Total net</span>
                        <p className="text-3xl font-bold tracking-tight text-[#1e3932]">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full h-12 border border-[#1e3932]/15 bg-[#1e3932] text-white text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-medium disabled:opacity-50 hover:bg-[#152a25] rounded-xl"
                      >
                        {isInitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Procéder au paiement sécurisé</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1e3932]/15 pb-3">
                      <div>
                        <span className="inline-block text-[10px] uppercase tracking-widest bg-[#f8faf9] border border-[#1e3932]/15 text-[#1e3932] px-2.5 py-1 rounded-full font-medium mb-1">Paiement</span>
                        <h4 className="text-sm font-medium pt-1 text-[#1e3932]">{totalPrice.toFixed(2)} € • {quantity} place(s)</h4>
                      </div>
                      <button 
                        onClick={() => setClientSecret(null)}
                        className="text-xs underline text-[#1e3932]/60 hover:text-[#1e3932] cursor-pointer"
                      >
                        Modifier
                      </button>
                    </div>

                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        locale: 'fr',
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#1e3932',
                            colorBackground: '#ffffff',
                            colorText: '#1e3932',
                            colorDanger: '#ef4444',
                            fontFamily: 'sans-serif',
                            borderRadius: '12px',
                          },
                        },
                      }}
                    >
                      <CustomCheckoutForm 
                        slug={event.slug} 
                        eventTitle={event.title}
                        quantity={quantity}
                        totalPrice={totalPrice}
                        onSuccess={() => setIsSuccess(true)} 
                      />
                    </Elements>
                  </div>
                )}
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </main>
  );
}

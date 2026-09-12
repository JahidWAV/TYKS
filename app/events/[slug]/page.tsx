"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, Minus, Plus, Users, Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
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
        <p className="text-xs font-mono text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-500/20">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full rounded-xl bg-[#721120] text-white py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#881527] hover:shadow-[0_0_25px_rgba(114,17,32,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-medium disabled:opacity-50"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <>
            <span>Payer et valider ma place</span>
            <ArrowUpRight className="w-4 h-4 text-white/70" />
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
  const [includeSupport, setIncludeSupport] = useState<boolean>(false);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/50" />
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
    ? startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
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
          unitPrice,
          includeSupport,
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
    <>
      <main className="min-h-screen bg-[#09090B] text-white px-6 md:px-12 pt-32 pb-20 selection:bg-[#721120] selection:text-white relative overflow-hidden">
        {/* Effet lumineux d'ambiance tech en arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#721120]/15 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto w-full space-y-12 relative z-10">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors group px-3 py-1.5 rounded-full hover:bg-white/5 border border-white/5"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Accueil</span>
            </Link>
            <span className="text-xs font-mono uppercase tracking-widest text-white/50 bg-white/[0.03] px-3 py-1 rounded-full border border-white/10">
              {event.organizations?.name || 'Organisateur Indépendant'}
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#721120]/20 border border-[#721120]/40 text-[#ff7b90] text-xs font-mono uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff7b90] animate-pulse" />
                  <span>Événement Live</span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
                  {event.title}
                </h1>
              </div>

              <div className="space-y-3 font-mono text-xs text-white/80 bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <Calendar className="w-4 h-4 text-[#ff7b90] shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <Clock className="w-4 h-4 text-[#ff7b90] shrink-0" />
                  <span>Portes à {formattedTime || '20:00'}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3 pt-1">
                    <MapPin className="w-4 h-4 text-[#ff7b90] shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => {
                    setClientSecret(null);
                    setIsSuccess(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full sm:w-auto rounded-xl bg-[#721120] text-white py-4 px-8 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#881527] hover:shadow-[0_0_30px_rgba(114,17,32,0.5)] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer font-medium border border-[#ff7b90]/20"
                >
                  <Ticket className="w-4 h-4 text-white/80" />
                  <span>{basePrice === 0 ? 'Prendre une place (Gratuit)' : `Prendre une place • ${basePrice.toFixed(2)} €`}</span>
                  <ArrowUpRight className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            <div className="lg:sticky lg:top-32">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl group">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#721120]/40 to-black p-8 flex flex-col justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-white/50">
                      {event.organizations?.name || 'Production'}
                    </span>
                    <Sparkles className="w-6 h-6 text-white/40" />
                  </div>
                )}
                {/* Léger effet de vignettage interne */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rendu des modales via Portal */}
      {mounted && createPortal(
        <>
          {/* Modale d'authentification */}
          {showAuthModal && (
            <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#121215] border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6 relative shadow-2xl text-white">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff7b90] block">Authentification</span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">Connexion requise</h3>
                  <p className="text-xs font-mono text-white/50 leading-relaxed">
                    Connectez-vous pour finaliser votre commande et récupérer vos billets en toute sécurité.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 px-4 rounded-xl text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10 cursor-pointer font-medium"
                    >
                      <span>Continuer avec Google</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink mx-4 text-white/30 text-[10px] font-mono uppercase">ou par e-mail</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#721120] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-[#721120] text-white py-4 rounded-xl text-xs font-mono uppercase tracking-widest font-medium hover:bg-[#881527] transition-all disabled:opacity-50 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Recevoir mon lien magique</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#721120]/10 border border-[#721120]/30 rounded-xl p-6 text-center space-y-3">
                    <p className="text-sm font-mono font-medium text-[#ff7b90]">Lien de connexion envoyé !</p>
                    <p className="text-xs font-mono text-white/60 leading-relaxed">
                      Vérifiez vos e-mails. Votre session s'activera automatiquement dès que vous cliquerez sur le lien.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modale de Paiement Stripe */}
          {isCheckoutOpen && (
            <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-lg rounded-2xl bg-[#121215] text-white p-6 md:p-8 space-y-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
                
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-10 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                {isSuccess ? (
                  <div className="py-6 space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Paiement validé</span>
                      <h3 className="font-display text-2xl font-semibold tracking-tight">Vos places sont réservées !</h3>
                      <p className="text-xs text-white/50 font-mono leading-relaxed pt-1">
                        Merci pour votre achat. Un e-mail de confirmation vient de vous être envoyé.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full rounded-xl bg-[#721120] text-white py-4 px-6 text-xs font-mono uppercase tracking-widest font-medium shadow-lg hover:bg-[#881527] transition-all cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff7b90] block">Billetterie</span>
                      <h3 className="font-display text-xl font-semibold tracking-tight line-clamp-1">{event.title}</h3>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-mono text-white/50">
                        <span>Quantité</span>
                        <span className="text-white font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#ff7b90]" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-1.5 shadow-inner">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-xl font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                          className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Total</span>
                        <p className="font-display text-3xl font-semibold tracking-tight">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full rounded-xl bg-[#721120] text-white py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#881527] hover:shadow-[0_0_25px_rgba(114,17,32,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xl font-medium disabled:opacity-50"
                      >
                        {isInitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <>
                            <span>Procéder au paiement</span>
                            <ArrowUpRight className="w-4 h-4 text-white/70" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff7b90]">Stripe Secured</span>
                        <h4 className="font-display text-lg font-medium pt-0.5">{totalPrice.toFixed(2)} € • {quantity} place(s)</h4>
                      </div>
                      <button 
                        onClick={() => setClientSecret(null)}
                        className="text-xs font-mono text-white/50 hover:text-white cursor-pointer underline"
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
                          theme: 'night',
                          variables: {
                            colorPrimary: '#721120',
                            colorBackground: '#121215',
                            colorText: '#ffffff',
                            colorDanger: '#ef4444',
                            fontFamily: 'monospace, sans-serif',
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
    </>
  );
}

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
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-12 rounded-xl bg-[#721120] hover:bg-[#881527] text-white font-medium text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#721120]/20"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Payer et valider</span>
            <ArrowUpRight className="w-4 h-4 opacity-70" />
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
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
      </div>
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
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#721120] selection:text-white">
      {/* Navigation fixe ou haut de page */}
      <header className="border-b border-white/[0.08] bg-[#09090B]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour</span>
          </Link>
          <span className="text-xs font-mono uppercase tracking-wider text-white/40 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            {event.organizations?.name || 'TYKS Live'}
          </span>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Colonne gauche : Infos & Action */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#721120]/15 border border-[#721120]/30 text-[#ff7b90] text-xs font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7b90] animate-pulse" />
                <span>Disponible</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Carte métadonnées */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-3.5 text-sm text-white/80">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#ff7b90]" />
                </div>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3.5 text-sm text-white/80">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#ff7b90]" />
                </div>
                <span className="font-medium">Ouverture des portes à {formattedTime || '20:00'}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3.5 text-sm text-white/80">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#ff7b90]" />
                  </div>
                  <span className="font-medium truncate">{event.location}</span>
                </div>
              )}
            </div>

            {/* Bouton de réservation principal */}
            <div>
              <button
                onClick={() => {
                  setClientSecret(null);
                  setIsSuccess(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[#721120] hover:bg-[#881527] text-white font-medium text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-[#721120]/25 border border-[#ff7b90]/20"
              >
                <Ticket className="w-4 h-4 text-white/80" />
                <span>{basePrice === 0 ? 'Réserver ma place (Gratuit)' : `Réserver ma place • ${basePrice.toFixed(2)} €`}</span>
                <ArrowUpRight className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Colonne droite : Visuel */}
          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/[0.08] bg-black/40 shadow-2xl">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#721120]/30 to-black p-8 flex flex-col justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-white/40">
                    {event.organizations?.name || 'TYKS'}
                  </span>
                  <Sparkles className="w-6 h-6 text-white/30" />
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Modales gérées par Portal */}
      {mounted && createPortal(
        <>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 relative shadow-2xl">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff7b90]">Sécurité</span>
                  <h3 className="text-xl font-bold tracking-tight">Connexion requise</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-mono">
                    Connectez-vous pour finaliser votre commande et retrouver vos billets.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-3 border border-white/10 cursor-pointer font-medium"
                    >
                      <span>Continuer avec Google</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink mx-4 text-white/30 text-[10px] font-mono uppercase">ou</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#721120] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-12 bg-[#721120] text-white rounded-xl text-xs font-mono uppercase tracking-wider font-medium hover:bg-[#881527] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Recevoir mon lien magique</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#721120]/10 border border-[#721120]/30 rounded-xl p-6 text-center space-y-2">
                    <p className="text-sm font-mono font-medium text-[#ff7b90]">Lien envoyé !</p>
                    <p className="text-xs text-white/60 font-mono leading-relaxed">
                      Vérifiez vos e-mails pour activer votre session.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCheckoutOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="relative w-full max-w-lg rounded-2xl bg-[#121215] text-white p-6 sm:p-8 space-y-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-10"
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
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Succès</span>
                      <h3 className="text-xl font-bold tracking-tight">Places réservées avec succès !</h3>
                      <p className="text-xs text-white/50 font-mono leading-relaxed">
                        Un e-mail de confirmation vient de vous être envoyé.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full h-12 rounded-xl bg-[#721120] hover:bg-[#881527] text-white text-xs font-mono uppercase tracking-wider font-medium transition-all cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff7b90]">Panier</span>
                      <h3 className="text-lg font-bold tracking-tight line-clamp-1">{event.title}</h3>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs font-mono text-white/50">
                        <span>Quantité de places</span>
                        <span className="text-white font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#ff7b90]" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-1.5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-lg font-medium">{quantity}</span>
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
                        <p className="text-2xl font-bold tracking-tight">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full h-12 rounded-xl bg-[#721120] hover:bg-[#881527] text-white text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#721120]/20 font-medium disabled:opacity-50"
                      >
                        {isInitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Procéder au paiement</span>
                            <ArrowUpRight className="w-4 h-4 opacity-70" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff7b90]">Paiement sécurisé</span>
                        <h4 className="text-base font-medium pt-0.5">{totalPrice.toFixed(2)} € • {quantity} place(s)</h4>
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
    </div>
  );
}

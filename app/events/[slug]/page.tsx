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
        <p className="text-xs font-mono text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full rounded-full bg-[#721120] text-[#FAF7F2] py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#5c0e1a] hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50 shadow-lg"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
        ) : (
          <>
            <span>Payer et valider ma place</span>
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
      <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
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
      <main className="min-h-screen bg-[#FAF7F2] text-[#111110] px-6 md:px-12 pt-32 pb-16 selection:bg-[#721120] selection:text-[#FAF7F2]">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          
          <div className="flex items-center justify-between border-b border-[#111110]/10 pb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/60 hover:text-[#111110] transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Accueil</span>
            </Link>
            <span className="text-xs font-mono uppercase tracking-widest text-[#111110]/60">
              {event.organizations?.name || 'Organisateur Indépendant'}
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-mono text-[#721120] uppercase tracking-widest">
                  Par {event.organizations?.name || 'Organisateur'}
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                  {event.title}
                </h1>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-[#111110]/80 bg-white/60 p-5 rounded-2xl border border-[#111110]/10 shadow-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#721120] shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#721120] shrink-0" />
                  <span>Portes à {formattedTime || '20:00'}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#721120] shrink-0" />
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
                  className="w-full sm:w-auto rounded-full bg-[#721120] text-[#FAF7F2] py-4 px-8 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#5c0e1a] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer shadow-lg"
                >
                  <Ticket className="w-4 h-4 text-[#FAF7F2]" />
                  <span>{basePrice === 0 ? 'Prendre une place (Gratuit)' : `Prendre une place • ${basePrice.toFixed(2)} €`}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#FAF7F2]/60" />
                </button>
              </div>
            </div>

            <div className="lg:sticky lg:top-32">
              <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-[#111110]/15 bg-[#111110]/5 shadow-sm">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#721120] text-[#FAF7F2] p-8 flex flex-col justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#FAF7F2]/70">
                      {event.organizations?.name || 'Production'}
                    </span>
                    <Sparkles className="w-6 h-6 text-[#FAF7F2]/60" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rendu des modales via Portal pour échapper au contexte de la Navbar */}
      {mounted && createPortal(
        <>
          {/* Modale d'authentification rapide */}
          {showAuthModal && (
            <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#FAF7F2] border border-[#111110]/15 rounded-3xl p-8 max-w-md w-full space-y-6 relative shadow-2xl text-[#111110]">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#111110]/10 flex items-center justify-center text-[#111110]/70 hover:text-[#111110] hover:bg-[#111110]/20 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#721120] block">Sécurité & Billetterie</span>
                  <h3 className="font-display text-2xl font-bold tracking-tight">Connexion requise</h3>
                  <p className="text-xs font-mono text-[#111110]/60 leading-relaxed">
                    Connectez-vous pour finaliser votre commande et récupérer vos billets en toute sécurité.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-[#111110]/5 hover:bg-[#111110]/10 text-[#111110] py-3.5 px-4 rounded-full text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-[#111110]/15 cursor-pointer font-bold"
                    >
                      <span>Continuer avec Google</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-[#111110]/15"></div>
                      <span className="flex-shrink mx-4 text-[#111110]/40 text-[10px] font-mono uppercase">ou par e-mail</span>
                      <div className="flex-grow border-t border-[#111110]/15"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-white border border-[#111110]/15 rounded-xl px-4 py-3 text-sm font-mono text-[#111110] focus:outline-none focus:border-[#721120] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-[#721120] text-[#FAF7F2] py-4 rounded-full text-xs font-mono uppercase tracking-widest font-bold hover:bg-[#5c0e1a] transition-all disabled:opacity-50 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" /> : <span>Recevoir mon lien magique</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#721120]/5 border border-[#721120]/20 rounded-2xl p-6 text-center space-y-3">
                    <p className="text-sm font-mono font-bold text-[#721120]">Lien de connexion envoyé !</p>
                    <p className="text-xs font-mono text-[#111110]/60 leading-relaxed">
                      Vérifiez vos e-mails. Votre session s'activera automatiquement dès que vous cliquerez sur le lien.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modale de Paiement Stripe */}
          {isCheckoutOpen && (
            <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF7F2] text-[#111110] p-6 md:p-8 space-y-6 shadow-2xl border border-[#111110]/15 max-h-[90vh] overflow-y-auto">
                
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#111110]/10 flex items-center justify-center text-[#111110]/70 hover:text-[#111110] hover:bg-[#111110]/20 transition-all cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {isSuccess ? (
                  <div className="py-6 space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600">Paiement validé</span>
                      <h3 className="font-display text-2xl font-bold tracking-tight">Vos places sont réservées !</h3>
                      <p className="text-xs text-[#111110]/60 font-mono leading-relaxed pt-1">
                        Merci pour votre achat. Un e-mail de confirmation vient de vous être envoyé.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full rounded-full bg-[#721120] text-[#FAF7F2] py-4 px-6 text-xs font-mono uppercase tracking-widest font-bold shadow-lg hover:bg-[#5c0e1a] transition-all cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#721120] block">Billetterie</span>
                      <h3 className="font-display text-xl font-bold tracking-tight line-clamp-1">{event.title}</h3>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-mono text-[#111110]/60">
                        <span>Quantité</span>
                        <span className="text-[#111110] font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#721120]" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white border border-[#111110]/15 rounded-2xl p-1.5 shadow-sm">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-xl bg-[#111110]/5 flex items-center justify-center text-[#111110] hover:bg-[#111110]/10 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-xl font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                          className="w-10 h-10 rounded-xl bg-[#111110]/5 flex items-center justify-center text-[#111110] hover:bg-[#111110]/10 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#111110]/15">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-mono text-[#111110]/50 uppercase tracking-wider">Total</span>
                        <p className="font-display text-3xl font-bold tracking-tight">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full rounded-full bg-[#721120] text-[#FAF7F2] py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#5c0e1a] hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xl font-bold disabled:opacity-50"
                      >
                        {isInitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                        ) : (
                          <>
                            <span>Procéder au paiement</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#111110]/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#721120] block">Sécurisé par Stripe</span>
                        <h4 className="font-display text-lg font-bold">{totalPrice.toFixed(2)} € • {quantity} place(s)</h4>
                      </div>
                      <button 
                        onClick={() => setClientSecret(null)}
                        className="text-xs font-mono underline text-[#111110]/60 hover:text-[#111110] cursor-pointer"
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
                            colorPrimary: '#721120',
                            colorBackground: '#ffffff',
                            colorText: '#111110',
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

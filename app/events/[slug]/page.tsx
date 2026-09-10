"use client";

import { useState, useEffect } from 'react';
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
      
      // Récupération de l'e-mail directement depuis le compte Supabase de l'utilisateur connecté
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      const clientEmail = user?.email;

      // Déclenchement de l'envoi d'e-mail de confirmation via Resend
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
        <p className="text-xs font-mono text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50 shadow-lg"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#111110]" />
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

  // États pour la modale d'authentification "Shotgun-style"
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSent, setAuthSent] = useState(false);

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

    // Vérification de l'utilisateur connecté
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

  // Dès que l'utilisateur se connecte, on ferme l'auth, on rouvre le panier et on lance le paiement
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
    ? startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const formattedTime = startDate
    ? startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleInitCheckout = async () => {
    // Si l'utilisateur n'est pas connecté, on ferme la modale de quantité et on ouvre l'auth proprement
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
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-8 md:py-12 selection:bg-[#111110] selection:text-[#F7F5F0]">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
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

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#111110]/50 uppercase tracking-widest">
                Par {event.organizations?.name || 'Organisateur'}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                {event.title}
              </h1>
            </div>

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

            <div>
              <button
                onClick={() => {
                  setClientSecret(null);
                  setIsSuccess(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full sm:w-auto rounded-full bg-[#111110] text-[#F7F5F0] py-4 px-8 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#222220] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer shadow-lg"
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>{basePrice === 0 ? 'Prendre une place (Gratuit)' : `Prendre une place • ${basePrice.toFixed(2)} €`}</span>
                <ArrowUpRight className="w-4 h-4 text-[#F7F5F0]/60" />
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-[#111110]/15 bg-[#111110]/5 shadow-sm">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
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

      {/* Modale d'authentification rapide (Shotgun style) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111110] border border-[#F7F5F0]/15 rounded-3xl p-8 max-w-md w-full space-y-6 relative shadow-2xl text-[#F7F5F0]">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0]/70 hover:text-[#F7F5F0] hover:bg-[#F7F5F0]/20 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F7F5F0]/50 block">Sécurité & Billetterie</span>
              <h3 className="font-display text-2xl font-bold tracking-tight">Connexion requise</h3>
              <p className="text-xs font-mono text-[#F7F5F0]/60 leading-relaxed">
                Connectez-vous pour finaliser votre commande et récupérer vos billets en toute sécurité.
              </p>
            </div>

            {!authSent ? (
              <div className="space-y-4 pt-2">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-[#F7F5F0]/10 hover:bg-[#F7F5F0]/20 text-[#F7F5F0] py-3.5 px-4 rounded-full text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-[#F7F5F0]/15 cursor-pointer font-bold"
                >
                  <span>Continuer avec Google</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#F7F5F0]/10"></div>
                  <span className="flex-shrink mx-4 text-[#F7F5F0]/40 text-[10px] font-mono uppercase">ou par e-mail</span>
                  <div className="flex-grow border-t border-[#F7F5F0]/10"></div>
                </div>

                <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-[#F7F5F0]/5 border border-[#F7F5F0]/15 rounded-xl px-4 py-3 text-sm font-mono text-[#F7F5F0] focus:outline-none focus:border-[#F7F5F0] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#F7F5F0] text-[#111110] py-4 rounded-full text-xs font-mono uppercase tracking-widest font-bold hover:bg-white transition-all disabled:opacity-50 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#111110]" /> : <span>Recevoir mon lien magique</span>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#F7F5F0]/5 border border-[#F7F5F0]/15 rounded-2xl p-6 text-center space-y-3">
                <p className="text-sm font-mono font-bold text-[#F7F5F0]">Lien de connexion envoyé !</p>
                <p className="text-xs font-mono text-[#F7F5F0]/60 leading-relaxed">
                  Vérifiez vos e-mails. Votre session s'activera automatiquement dès que vous cliquerez sur le lien.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modale de Paiement Stripe */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#111110] text-[#F7F5F0] p-6 md:p-8 space-y-6 shadow-2xl border border-[#F7F5F0]/15 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setClientSecret(null);
                setIsSuccess(false);
              }}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F7F5F0]/10 flex items-center justify-center text-[#F7F5F0]/70 hover:text-[#F7F5F0] hover:bg-[#F7F5F0]/20 transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {isSuccess ? (
              <div className="py-6 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Paiement validé</span>
                  <h3 className="font-display text-2xl font-bold tracking-tight">Vos places sont réservées !</h3>
                  <p className="text-xs text-[#F7F5F0]/60 font-mono leading-relaxed pt-1">
                    Merci pour votre achat. Un e-mail de confirmation vient de vous être envoyé.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-mono uppercase tracking-widest font-bold shadow-lg hover:bg-white transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : !clientSecret ? (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#F7F5F0]/50 block">Billetterie</span>
                  <h3 className="font-display text-xl font-bold tracking-tight line-clamp-1">{event.title}</h3>
                </div>

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

                <div className="space-y-4 pt-4 border-t border-[#F7F5F0]/15">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-[#F7F5F0]/50 uppercase tracking-wider">Total</span>
                    <p className="font-display text-3xl font-bold tracking-tight">{totalPrice.toFixed(2)} €</p>
                  </div>

                  <button 
                    onClick={handleInitCheckout}
                    disabled={isInitializingPayment}
                    className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xl font-bold disabled:opacity-50"
                  >
                    {isInitializingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#111110]" />
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
                <div className="flex items-center justify-between border-b border-[#F7F5F0]/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#F7F5F0]/50 block">Sécurisé par Stripe</span>
                    <h4 className="font-display text-lg font-bold">{totalPrice.toFixed(2)} € • {quantity} place(s)</h4>
                  </div>
                  <button 
                    onClick={() => setClientSecret(null)}
                    className="text-xs font-mono underline text-[#F7F5F0]/60 hover:text-[#F7F5F0] cursor-pointer"
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
                        colorPrimary: '#F7F5F0',
                        colorBackground: '#111110',
                        colorText: '#F7F5F0',
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
    </main>
  );
}

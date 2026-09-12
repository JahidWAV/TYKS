"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { ArrowLeft, ArrowUpRight, Ticket, Minus, Plus, Users, X, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
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
        <div className="p-3 bg-black text-white text-xs font-mono border-2 border-black">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-14 bg-black text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-neutral-800"
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F7] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-black">
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
    <main className="fixed inset-0 w-full h-[100dvh] bg-[#F5F5F7] text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
      
      {/* ─── NAVIGATION FLOTTANTE MINIMALISTE (PAS DE COMPOSANT EXTERNE) ─── */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-60 transition-opacity bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour Index</span>
        </Link>
        <span className="font-mono text-xs uppercase tracking-widest font-bold bg-black text-white px-4 py-2">
          {event.organizations?.name || 'TYKS LIVE'}
        </span>
      </div>

      {/* ─── MISE EN PAGE CENTRÉE / PLEIN ÉCRAN TYPE FLYER ─── */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-8">
        
        {/* Visuel / Poster brut à gauche */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="relative w-full aspect-[4/5] max-w-md mx-auto border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover grayscale contrast-125" />
            ) : (
              <div className="w-full h-full p-8 flex flex-col justify-between bg-black text-white font-mono">
                <span className="text-xs uppercase tracking-widest text-neutral-400">TYKS POSTER</span>
                <span className="text-4xl font-bold tracking-tighter">LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Blocs d'informations et CTA à droite */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2 text-left">
          <div className="space-y-3">
            <div className="inline-block font-mono text-xs uppercase tracking-widest border-2 border-black px-3 py-1 bg-white">
              {formattedDate} — {formattedTime}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.95]">
              {event.title}
            </h1>
          </div>

          <div className="border-l-4 border-black pl-4 py-1 font-mono text-xs uppercase tracking-wider text-neutral-700">
            {event.location || 'Lieu communiqué après validation'}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setClientSecret(null);
                setIsSuccess(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-5 bg-black text-white font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none font-bold"
            >
              <Ticket className="w-4 h-4" />
              <span>{basePrice === 0 ? 'Réserver ma place (Gratuit)' : `Réserver • ${basePrice.toFixed(2)} €`}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </section>

      {/* ─── BAS DE PAGE INTÉGRÉ (DISCRET) ─── */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-500 gap-2 z-10 pt-4 border-t border-black/20">
        <div>TYKS Experience</div>
        <div className="flex items-center gap-4">
          <Link href="/legal" className="hover:text-black">Mentions Légales</Link>
          <Link href="/cgv" className="hover:text-black">CGV</Link>
        </div>
      </div>

      {/* ─── MODALES INTÉGRÉES ─── */}
      {mounted && createPortal(
        <>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border-2 border-black p-8 max-w-md w-full space-y-6 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="font-mono text-xs uppercase tracking-widest bg-black text-white px-2 py-0.5">Sécurité</span>
                  <h3 className="text-2xl font-bold uppercase tracking-tight">Authentification</h3>
                  <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                    Connectez-vous pour sécuriser vos billets et les retrouver instantanément.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-12 border-2 border-black hover:bg-black hover:text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer font-bold"
                    >
                      <span>Continuer avec Google</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t-2 border-black"></div>
                      <span className="flex-shrink mx-4 font-mono text-xs uppercase">ou</span>
                      <div className="flex-grow border-t-2 border-black"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full h-12 border-2 border-black px-4 font-mono text-xs placeholder:text-neutral-400 focus:outline-none bg-[#F5F5F7]"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-12 bg-black text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Recevoir le lien magique</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="border-2 border-black p-6 bg-neutral-100 text-center space-y-2 font-mono">
                    <p className="text-xs font-bold uppercase">Lien envoyé avec succès</p>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Vérifiez votre boîte mail pour finaliser votre accès.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCheckoutOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="relative w-full max-w-lg bg-white border-2 border-black p-8 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="absolute top-6 right-6 w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {isSuccess ? (
                  <div className="py-6 space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 border-2 border-black bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="space-y-2 font-mono">
                      <span className="text-xs uppercase tracking-widest bg-black text-white px-2 py-0.5">Confirmé</span>
                      <h3 className="text-2xl font-bold uppercase tracking-tight">Places réservées</h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Votre billet électronique a été envoyé par e-mail.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full h-14 bg-black text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="font-mono text-xs uppercase tracking-widest bg-black text-white px-2 py-0.5">Panier</span>
                      <h3 className="text-xl font-bold uppercase tracking-tight pt-2">{event.title}</h3>
                    </div>

                    <div className="space-y-3 pt-2 font-mono">
                      <div className="flex justify-between items-center text-xs text-neutral-600">
                        <span>Quantité</span>
                        <span className="text-black font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-2 border-black p-1 bg-[#F5F5F7]">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 border border-black bg-white flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-sm font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                          className="w-10 h-10 border border-black bg-white flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ─── VENTILATION TRANSPARENTE DU PRIX ─── */}
                    {basePrice > 0 && (
                      <div className="border-2 border-black p-4 bg-[#F5F5F7] space-y-2 font-mono">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-black">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Transparence tarifaire intégrale</span>
                        </div>
                        <div className="space-y-1 text-xs text-neutral-600 divide-y divide-black/10">
                          <div className="flex justify-between pt-1">
                            <span>Part artiste / organisateur</span>
                            <span className="text-black font-bold">{(organizerSharePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between pt-1.5">
                            <span>Frais de plateforme fixes</span>
                            <span className="text-black font-bold">{(platformFeePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t-2 border-black">
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="text-xs uppercase tracking-wider text-neutral-600">Total net</span>
                        <p className="text-3xl font-bold tracking-tight">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full h-14 bg-black text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold disabled:opacity-50 hover:bg-neutral-800"
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
                  <div className="space-y-4 font-mono">
                    <div className="flex items-center justify-between border-b-2 border-black pb-3">
                      <div>
                        <span className="text-xs uppercase tracking-widest bg-black text-white px-2 py-0.5">Paiement</span>
                        <h4 className="text-sm font-bold pt-1">{totalPrice.toFixed(2)} € • {quantity} place(s)</h4>
                      </div>
                      <button 
                        onClick={() => setClientSecret(null)}
                        className="text-xs underline hover:opacity-60 cursor-pointer"
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
                          theme: 'flat',
                          variables: {
                            colorPrimary: '#000000',
                            colorBackground: '#ffffff',
                            colorText: '#000000',
                            colorDanger: '#ef4444',
                            fontFamily: 'monospace',
                            borderRadius: '0px',
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

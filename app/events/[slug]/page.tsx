'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { ArrowUpRight, Ticket, Minus, Plus, Users, X, CheckCircle2, ShieldCheck, Loader2, Calendar, MapPin, Clock, Building2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface TyksEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  location?: string;
  starts_at?: string;
  price?: number;
  image_url?: string;
  organizations?: { name?: string };
}

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
      setErrorMessage(error.message || "UNE ERREUR EST SURVENUE LORS DU PAIEMENT.");
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
        console.error("ERREUR LORS DE L'APPEL DE L'API EMAIL", err);
      }

      setIsProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2 font-grotesque uppercase text-white">
      <PaymentElement options={{ layout: 'tabs' }} />
      
      {errorMessage && (
        <div className="p-3 bg-neutral-900 text-white text-xs font-bold border border-white/10 rounded-xl">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-12 bg-white text-black text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-neutral-200 rounded-xl shadow-md"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>PAYER ET VALIDER</span>
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

  const [event, setEvent] = useState<TyksEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
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
      subscription?.unsubscribe();
    };
  }, [slug]);

  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
      setIsCheckoutOpen(true);
      handleInitCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: window.location.href },
    });

    setAuthLoading(false);
    if (!error) setAuthSent(true);
    else alert("ERREUR LORS DE L'ENVOI DU LIEN.");
  };

  const handleGoogleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  };

  const handleAppleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.href },
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] flex items-center justify-center font-grotesque text-xs uppercase tracking-widest text-white/40">
        CHARGEMENT...
      </div>
    );
  }

  if (!event) return notFound();

  const basePrice = Number(event.price) || 0;
  const platformFeePerTicket = basePrice > 0 ? 0.90 : 0;
  const organizerSharePerTicket = basePrice - platformFeePerTicket;
  const totalPrice = basePrice * quantity;

  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const rawDate = startDate
    ? startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const formattedDate = rawDate ? rawDate.replace(/\b1\s/, '1ER ') : '';
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
        alert(data.error || "ERREUR LORS DE L'INITIALISATION DU PAIEMENT");
      }
    } catch (err) {
      console.error(err);
      alert("ERREUR RÉSEAU");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#0f0f0f] text-white font-grotesque selection:bg-white selection:text-black flex flex-col justify-center py-20 px-6 sm:px-12 uppercase">
      <div className="w-full max-w-5xl mx-auto">
        
        {/* MISE EN PAGE HARMONIEUSE : AFFICHE CARRÉE À GAUCHE / INFOS & DESCRIPTION À DROITE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* COLONNE GAUCHE : AFFICHE CARRÉE */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md aspect-square bg-neutral-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-2.5">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full p-8 flex flex-col justify-between bg-neutral-900 text-white rounded-2xl border border-white/10">
                  <span className="text-[10px] tracking-widest text-white/40 font-bold">VISUEL</span>
                  <span className="text-3xl font-normal tracking-tight">EVENT</span>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : TITRE, INFOS, BOUTON ET DESCRIPTION INTÉGRÉE */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="space-y-4">
              {event.organizations?.name && (
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-white/60 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{event.organizations.name}</span>
                </div>
              )}
              
              <h1 className="text-4xl sm:text-5xl font-normal tracking-tight leading-[1.1] text-white">
                {event.title}
              </h1>
            </div>

            {/* DATES & LIEUX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold tracking-wide">
              {formattedDate && (
                <div className="flex items-center gap-3 bg-neutral-900/80 border border-white/10 p-3.5 rounded-2xl">
                  <Calendar className="w-4 h-4 text-white/70 shrink-0" />
                  <span className="truncate">{formattedDate}</span>
                </div>
              )}
              {formattedTime && (
                <div className="flex items-center gap-3 bg-neutral-900/80 border border-white/10 p-3.5 rounded-2xl">
                  <Clock className="w-4 h-4 text-white/70 shrink-0" />
                  <span>{formattedTime}</span>
                </div>
              )}
              {event.location && (
                <div className="sm:col-span-2 flex items-center gap-3 bg-neutral-900/80 border border-white/10 p-3.5 rounded-2xl">
                  <MapPin className="w-4 h-4 text-white/70 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            {/* BOUTON D'ACTION */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setClientSecret(null);
                  setIsSuccess(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full h-14 bg-white text-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg font-bold rounded-2xl"
              >
                <Ticket className="w-4 h-4" />
                <span>{basePrice === 0 ? 'RÉSERVER GRATUITEMENT' : `RÉSERVER • ${basePrice.toFixed(2)} €`}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* DESCRIPTION INTÉGRÉE DANS LE FLUX DE DROITE */}
            {event.description && (
              <div className="bg-neutral-900/40 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">À PROPOS DE L&apos;ÉVÉNEMENT</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-white/80 whitespace-pre-line font-normal">
                  {event.description}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {mounted && createPortal(
        <>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-neutral-900 border border-white/15 p-8 max-w-md w-full space-y-6 relative shadow-2xl text-white rounded-3xl font-grotesque uppercase">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  aria-label="Fermer"
                  className="absolute top-5 right-5 w-8 h-8 border border-white/10 bg-neutral-800 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="inline-block text-[10px] uppercase tracking-widest bg-white/10 text-white px-2.5 py-1 rounded-full font-bold">SÉCURITÉ</span>
                  <h3 className="text-2xl font-normal tracking-tight">CONNEXION REQUISE</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-normal">
                    CONNECTEZ-VOUS POUR VALIDER VOTRE COMMANDE ET RETROUVER VOS BILLETS.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-12 border border-white/10 bg-neutral-900 hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>CONTINUER AVEC GOOGLE</span>
                    </button>

                    <button
                      onClick={handleAppleLogin}
                      className="w-full h-12 border border-white/10 bg-neutral-900 hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.01c.65-.79 1.09-1.89.97-2.99-.96.04-2.13.64-2.82 1.43-.6.68-1.13 1.78-.99 2.85 1.08.08 2.19-.53 2.84-1.29z"/>
                      </svg>
                      <span>CONTINUER AVEC APPLE</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink mx-4 text-[10px] tracking-widest text-white/40 font-bold">OU</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-3">
                      <input
                        type="email"
                        required
                        placeholder="VOTRE@EMAIL.COM"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full h-12 border border-white/10 bg-neutral-900 px-4 text-xs placeholder:text-white/30 focus:outline-none focus:border-white text-white rounded-xl font-bold"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-12 border border-white/25 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 rounded-xl"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>LIEN MAGIQUE PAR EMAIL</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="border border-white/10 p-6 bg-neutral-900 text-center space-y-2 rounded-2xl">
                    <p className="text-xs font-bold">LIEN ENVOYÉ</p>
                    <p className="text-[11px] text-white/50 font-normal">VÉRIFIEZ VOTRE BOÎTE DE RÉCEPTION.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCheckoutOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-lg bg-neutral-900 border border-white/15 p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-white rounded-3xl font-grotesque uppercase">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  aria-label="Fermer"
                  className="absolute top-5 right-5 w-8 h-8 border border-white/10 bg-neutral-800 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer z-10 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>

                {isSuccess ? (
                  <div className="py-6 space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 border border-white/15 bg-neutral-800 flex items-center justify-center text-white rounded-2xl">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="inline-block text-[10px] uppercase tracking-widest bg-white/10 text-white px-2.5 py-1 rounded-full font-bold">SUCCÈS</span>
                      <h3 className="text-2xl font-normal tracking-tight">PLACES CONFIRMÉES</h3>
                      <p className="text-xs text-white/50 font-normal">VOTRE BILLET VOUS A ÉTÉ ENVOYÉ PAR E-MAIL.</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full h-12 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer rounded-xl"
                    >
                      FERMER
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] uppercase tracking-widest bg-white/10 text-white px-2.5 py-1 rounded-full font-bold">PANIER</span>
                      <h3 className="text-xl font-normal tracking-tight pt-1">{event.title}</h3>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs text-white/50 font-bold">
                        <span>QUANTITÉ DE PLACES</span>
                        <span className="text-white flex items-center gap-1.5 font-bold">
                          <Users className="w-3.5 h-3.5" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border border-white/10 p-1.5 bg-neutral-950 rounded-2xl">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 border border-white/10 bg-neutral-900 text-white flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-30 transition-all cursor-pointer rounded-xl font-bold"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                          className="w-10 h-10 border border-white/10 bg-neutral-900 text-white flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-30 transition-all cursor-pointer rounded-xl font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {basePrice > 0 && (
                      <div className="border border-white/10 p-4 bg-neutral-950 space-y-2 rounded-2xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                          <ShieldCheck className="w-4 h-4" />
                          <span>DÉTAIL DU TARIF</span>
                        </div>
                        <div className="space-y-1 text-xs text-white/50">
                          <div className="flex justify-between">
                            <span>ORGANISATEUR</span>
                            <span className="text-white font-bold">{(organizerSharePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PLATEFORME</span>
                            <span className="text-white font-bold">{(platformFeePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-wider text-white/50 font-bold">TOTAL</span>
                        <p className="text-3xl font-normal tracking-tight">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full h-12 bg-white text-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-bold disabled:opacity-50 hover:bg-neutral-200 rounded-xl"
                      >
                        {isInitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>VALIDER LE PAIEMENT</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="inline-block text-[10px] uppercase tracking-widest bg-white/10 text-white px-2.5 py-1 rounded-full font-bold mb-1">PAIEMENT SÉCURISÉ</span>
                        <h4 className="text-sm font-bold pt-1">{totalPrice.toFixed(2)} € • {quantity} PLACE(S)</h4>
                      </div>
                      <button 
                        onClick={() => setClientSecret(null)}
                        className="text-xs underline text-white/50 hover:text-white cursor-pointer font-bold"
                      >
                        RETOUR
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
                            colorPrimary: '#ffffff',
                            colorBackground: '#0f0f0f',
                            colorText: '#ffffff',
                            colorDanger: '#ff4b4b',
                            fontFamily: 'inherit',
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

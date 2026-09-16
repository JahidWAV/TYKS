'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { ArrowUpRight, Ticket, Minus, Plus, Users, X, CheckCircle2, ShieldAlert, Loader2, Calendar, MapPin, Clock, Building2, Eye } from 'lucide-react';
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
        <div className="p-3 bg-neutral-900 text-white text-xs font-bold border border-white/20 rounded-xl">
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

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
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
      alert("ERREUR LORS DE L'ENVOI DU LIEN DE CONNEXION.");
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
      <div className="w-full min-h-[60vh] bg-black flex items-center justify-center font-grotesque text-xs uppercase tracking-widest text-white/60">
        CHARGEMENT...
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
    <main className="w-full bg-black text-white font-grotesque selection:bg-white selection:text-black py-12 px-6 sm:px-12 uppercase">
      <div className="w-full max-w-6xl mx-auto space-y-12">
        
        <div className="flex flex-col items-center text-center space-y-6 border-b border-white/10 pb-10">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-tight leading-[1.05] text-white max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs font-bold uppercase tracking-wider text-white">
            {event.organizations?.name && (
              <div className="flex items-center gap-2 bg-neutral-950 border border-white/15 px-4 py-2 rounded-full shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-white" />
                <span>{event.organizations.name}</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-2 bg-neutral-950 border border-white/15 px-4 py-2 rounded-full shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>{formattedDate}</span>
              </div>
            )}
            {formattedTime && (
              <div className="flex items-center gap-2 bg-neutral-950 border border-white/15 px-4 py-2 rounded-full shadow-xs">
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>{formattedTime}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 bg-neutral-950 border border-white/15 px-4 py-2 rounded-full shadow-xs max-w-xs truncate">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
          
          <div className="lg:col-span-8 flex flex-col">
            <div className="w-full h-full min-h-[400px] border border-white/10 bg-neutral-950 shadow-lg overflow-hidden rounded-3xl p-3 flex">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full p-8 flex flex-col justify-between bg-neutral-950 text-white rounded-2xl border border-white/10">
                  <span className="text-xs uppercase tracking-widest text-white/50 font-bold">VISUEL BANNER</span>
                  <span className="text-4xl font-normal tracking-tighter text-white">LIVE</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <div className="w-full h-full bg-neutral-950 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                {event.description && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">À PROPOS DE L&apos;ÉVÉNEMENT</h3>
                      <button
                        onClick={() => setIsDescriptionModalOpen(true)}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-white bg-black border border-white/15 hover:bg-white hover:text-black transition-all px-2.5 py-1 rounded-full cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>DÉTAILS</span>
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed text-white/70 line-clamp-4 font-normal">
                      {event.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">TARIF UNIQUE</span>
                  <span className="text-3xl font-normal tracking-tight text-white">
                    {basePrice === 0 ? 'GRATUIT' : `${basePrice.toFixed(2)} €`}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setClientSecret(null);
                    setIsSuccess(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-4 border border-white/20 bg-white text-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md font-bold rounded-2xl"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{basePrice === 0 ? 'RÉSERVER MA PLACE' : 'RÉSERVER MES PLACES'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {mounted && createPortal(
        <>
          {isDescriptionModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-neutral-950 border border-white/20 p-8 max-w-lg w-full space-y-6 relative shadow-2xl max-h-[85vh] overflow-y-auto text-white rounded-3xl font-grotesque uppercase">
                <button 
                  onClick={() => setIsDescriptionModalOpen(false)}
                  className="absolute top-5 right-5 w-8 h-8 border border-white/20 bg-black text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="inline-block text-[10px] uppercase tracking-widest bg-black border border-white/15 text-white px-2.5 py-1 rounded-full font-bold">DESCRIPTION COMPLÈTE</span>
                  <h3 className="text-2xl font-normal uppercase tracking-tight text-white">{event.title}</h3>
                </div>

                <div className="pt-2 text-xs leading-relaxed text-white/80 whitespace-pre-line font-normal border-t border-white/10">
                  {event.description}
                </div>
              </div>
            </div>
          )}

          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-neutral-950 border border-white/20 p-8 max-w-md w-full space-y-6 relative shadow-2xl text-white rounded-3xl font-grotesque uppercase">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-5 right-5 w-8 h-8 border border-white/20 bg-black text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="inline-block text-[10px] uppercase tracking-widest bg-black border border-white/15 text-white px-2.5 py-1 rounded-full font-bold">SÉCURITÉ</span>
                  <h3 className="text-2xl font-normal uppercase tracking-tight text-white">AUTHENTIFICATION</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-normal">
                    CONNECTEZ-VOUS POUR SÉCURISER VOS BILLETS ET LES RETROUVER INSTANTANÉMENT.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-12 border border-white/15 bg-black hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl shadow-xs"
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
                      className="w-full h-12 border border-white/15 bg-black hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl shadow-xs"
                    >
                      <svg className="w-4 h-4 fill-current text-white group-hover:text-black" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.01c.65-.79 1.09-1.89.97-2.99-.96.04-2.13.64-2.82 1.43-.6.68-1.13 1.78-.99 2.85 1.08.08 2.19-.53 2.84-1.29z"/>
                      </svg>
                      <span>CONTINUER AVEC APPLE</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/15"></div>
                      <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-white/50 font-bold">OU</span>
                      <div className="flex-grow border-t border-white/15"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                      <input
                        type="email"
                        required
                        placeholder="VOTRE@EMAIL.COM"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full h-12 border border-white/15 bg-black px-4 text-xs uppercase placeholder:text-white/30 focus:outline-none focus:border-white text-white rounded-xl font-bold"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-12 border border-white/20 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-md"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>RECEVOIR LE LIEN MAGIQUE</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="border border-white/15 p-6 bg-black text-center space-y-2 rounded-xl">
                    <p className="text-xs font-bold uppercase text-white">LIEN ENVOYÉ AVEC SUCCÈS</p>
                    <p className="text-[11px] text-white/60 leading-relaxed font-normal">
                      VÉRIFIEZ VOTRE BOÎTE MAIL POUR FINALISER VOTRE ACCÈS.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCheckoutOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-lg bg-neutral-950 border border-white/20 p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-white rounded-3xl font-grotesque uppercase">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="absolute top-5 right-5 w-8 h-8 border border-white/20 bg-black text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer z-10 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>

                {isSuccess ? (
                  <div className="py-6 space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 border border-white/20 bg-black flex items-center justify-center text-white rounded-2xl">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="inline-block text-[10px] uppercase tracking-widest bg-black text-white border border-white/15 px-2.5 py-1 rounded-full font-bold">CONFIRMÉ</span>
                      <h3 className="text-2xl font-normal uppercase tracking-tight text-white">PLACES RÉSERVÉES</h3>
                      <p className="text-xs text-white/60 leading-relaxed font-normal">
                        VOTRE BILLET ÉLECTRONIQUE A ÉTÉ ENVOYÉ PAR E-MAIL.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full h-12 border border-white/20 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer rounded-xl shadow-md"
                    >
                      FERMER
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] uppercase tracking-widest bg-black border border-white/15 text-white px-2.5 py-1 rounded-full font-bold">PANIER</span>
                      <h3 className="text-xl font-normal uppercase tracking-tight pt-2 text-white">{event.title}</h3>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs text-white/60 font-bold">
                        <span>QUANTITÉ</span>
                        <span className="text-white font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-white" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border border-white/15 p-1.5 bg-black rounded-xl">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 border border-white/15 bg-neutral-950 text-white flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-30 transition-all cursor-pointer rounded-lg font-bold"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-white">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                          className="w-10 h-10 border border-white/15 bg-neutral-950 text-white flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-30 transition-all cursor-pointer rounded-lg font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {basePrice > 0 && (
                      <div className="border border-white/15 p-4 bg-black space-y-2 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-white">
                          <ShieldAlert className="w-4 h-4" />
                          <span>TRANSPARENCE TARIFAIRE INTÉGRALE</span>
                        </div>
                        <div className="space-y-1 text-xs text-white/60 divide-y divide-white/10">
                          <div className="flex justify-between pt-1">
                            <span>PART ARTISTE / ORGANISATEUR</span>
                            <span className="text-white font-bold">{(organizerSharePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between pt-1.5">
                            <span>FRAIS DE PLATEFORME FIXES</span>
                            <span className="text-white font-bold">{(platformFeePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-wider text-white/60 font-bold">TOTAL NET</span>
                        <p className="text-3xl font-normal tracking-tight text-white">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full h-12 border border-white/20 bg-white text-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-bold disabled:opacity-50 hover:bg-neutral-200 rounded-xl"
                      >
                        {isInitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>PROCÉDER AU PAIEMENT SÉCURISÉ</span>
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
                        <span className="inline-block text-[10px] uppercase tracking-widest bg-black border border-white/15 text-white px-2.5 py-1 rounded-full font-bold mb-1">PAIEMENT</span>
                        <h4 className="text-sm font-bold pt-1 text-white">{totalPrice.toFixed(2)} € • {quantity} PLACE(S)</h4>
                      </div>
                      <button 
                        onClick={() => setClientSecret(null)}
                        className="text-xs underline text-white/60 hover:text-white cursor-pointer font-bold"
                      >
                        MODIFIER
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
                            colorBackground: '#0a0a0a',
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

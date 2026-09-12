'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { notFound, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, Minus, Plus, Users, Loader2, Sparkles, X, CheckCircle2, ShieldCheck } from 'lucide-react';
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
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-serif">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-12 rounded-full bg-[#721120] hover:bg-[#5c0e1a] text-[#FAF7F2] font-sans text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xl"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Confirmer et régler</span>
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
      <div className="min-h-screen bg-[#0A0507] flex items-center justify-center font-serif text-[#FAF7F2]/40 text-xs tracking-widest uppercase">
        Chargement...
      </div>
    );
  }

  if (!event) {
    return notFound();
  }

  const basePrice = Number(event.price) || 0;
  // Calcul de la ventilation transparente (Ex: 0.90€ de frais de plateforme fixes inclus, le reste pour l'orga)
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
    <main className="min-h-screen bg-[#0A0507] text-[#FAF7F2] font-serif flex flex-col justify-between p-6 sm:p-12 selection:bg-[#721120] selection:text-[#FAF7F2]">
      
      {/* ─── HEADER MINIMALISTE ─── */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto z-10">
        <Link
          href="/"
          className="font-sans text-xs tracking-widest uppercase text-[#FAF7F2]/60 hover:text-[#FAF7F2] transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour à l'accueil</span>
        </Link>
        <span className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#FAF7F2]/40">
          {event.organizations?.name || 'TYKS Live'}
        </span>
      </header>

      {/* ─── CONTENU PRINCIPAL ÉPURÉ ─── */}
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-12">
        
        {/* Infos de l'événement */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-2">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#721120] font-semibold block">
              {formattedDate} • {formattedTime}
            </span>
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[0.95]">
              {event.title}
            </h1>
          </div>

          <div className="space-y-2 font-sans text-xs text-[#FAF7F2]/60 font-light">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#721120]" />
              <span>{event.location || 'Lieu communiqué après réservation'}</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                setClientSecret(null);
                setIsSuccess(false);
                setIsCheckoutOpen(true);
              }}
              className="px-8 py-4 rounded-full bg-[#721120] text-[#FAF7F2] font-sans text-xs font-medium uppercase tracking-widest hover:bg-[#5c0e1a] transition-colors flex items-center gap-3 shadow-2xl cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>{basePrice === 0 ? 'Réserver ma place (Gratuit)' : `Réserver • ${basePrice.toFixed(2)} €`}</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

        {/* Visuel minimaliste */}
        <div className="lg:col-span-5">
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-[#FAF7F2]/10 bg-[#120A0E]">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full p-8 flex flex-col justify-between">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#FAF7F2]/30">TYKS</span>
                <Sparkles className="w-5 h-5 text-[#FAF7F2]/20" />
              </div>
            )}
          </div>
        </div>

      </section>

      {/* ─── FOOTER MINIMALISTE ─── */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-[11px] font-sans text-[#FAF7F2]/40 z-10 pt-4 border-t border-[#FAF7F2]/10">
        <div>TYKS Live Experience</div>
        <div className="flex items-center gap-6">
          <Link href="/legal" className="hover:text-[#FAF7F2] transition-colors">Mentions Légales</Link>
          <Link href="/cgv" className="hover:text-[#FAF7F2] transition-colors">CGV</Link>
        </div>
      </footer>

      {/* ─── MODALES DE PAIEMENT & AUTH ─── */}
      {mounted && createPortal(
        <>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-[#0A0507]/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#120A0E] border border-[#FAF7F2]/10 rounded-3xl p-8 max-w-md w-full space-y-6 relative shadow-2xl">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#FAF7F2]/5 flex items-center justify-center text-[#FAF7F2]/70 hover:text-[#FAF7F2] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#721120] font-semibold">Sécurité</span>
                  <h3 className="text-2xl font-light tracking-tight">Connexion requise</h3>
                  <p className="font-sans text-xs text-[#FAF7F2]/60 font-light leading-relaxed">
                    Identifiez-vous pour sécuriser vos billets dans votre espace personnel.
                  </p>
                </div>

                {!authSent ? (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-12 bg-[#FAF7F2]/5 hover:bg-[#FAF7F2]/10 text-[#FAF7F2] rounded-full font-sans text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 border border-[#FAF7F2]/10 cursor-pointer font-medium"
                    >
                      <span>Continuer avec Google</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-[#FAF7F2]/10"></div>
                      <span className="flex-shrink mx-4 text-[#FAF7F2]/30 font-sans text-[10px] uppercase">ou</span>
                      <div className="flex-grow border-t border-[#FAF7F2]/10"></div>
                    </div>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full h-12 bg-[#0A0507] border border-[#FAF7F2]/10 rounded-full px-5 font-sans text-xs text-[#FAF7F2] placeholder:text-[#FAF7F2]/30 focus:outline-none focus:border-[#721120] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-12 bg-[#721120] text-[#FAF7F2] rounded-full font-sans text-xs uppercase tracking-widest font-medium hover:bg-[#5c0e1a] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Recevoir le lien magique</span>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#721120]/10 border border-[#721120]/30 rounded-2xl p-6 text-center space-y-2 font-sans">
                    <p className="text-xs font-medium text-[#FAF7F2]">Lien de connexion envoyé</p>
                    <p className="text-[11px] text-[#FAF7F2]/60 leading-relaxed font-light">
                      Vérifiez votre boîte mail pour valider votre accès.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCheckoutOpen && (
            <div className="fixed inset-0 z-50 bg-[#0A0507]/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="relative w-full max-w-lg rounded-3xl bg-[#120A0E] text-[#FAF7F2] p-8 space-y-6 shadow-2xl border border-[#FAF7F2]/10 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    setIsSuccess(false);
                  }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#FAF7F2]/5 flex items-center justify-center text-[#FAF7F2]/70 hover:text-[#FAF7F2] transition-all cursor-pointer z-10"
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
                    <div className="space-y-2 font-sans">
                      <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">Validé</span>
                      <h3 className="text-2xl font-light tracking-tight font-serif">Places réservées avec succès</h3>
                      <p className="text-xs text-[#FAF7F2]/60 font-light leading-relaxed">
                        Retrouvez votre billet dans votre boîte mail.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setClientSecret(null);
                        setIsSuccess(false);
                      }}
                      className="w-full h-12 rounded-full bg-[#721120] hover:bg-[#5c0e1a] text-[#FAF7F2] font-sans text-xs uppercase tracking-widest font-medium transition-all cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <>
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-widest text-[#721120] font-semibold">Panier</span>
                      <h3 className="text-xl font-light tracking-tight line-clamp-1">{event.title}</h3>
                    </div>

                    <div className="space-y-3 pt-2 font-sans">
                      <div className="flex justify-between items-center text-xs text-[#FAF7F2]/60">
                        <span>Quantité</span>
                        <span className="text-[#FAF7F2] font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#721120]" /> {quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-[#0A0507] border border-[#FAF7F2]/10 rounded-full p-1.5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-full bg-[#FAF7F2]/5 flex items-center justify-center text-[#FAF7F2] hover:bg-[#FAF7F2]/10 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-sans text-sm font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                          className="w-10 h-10 rounded-full bg-[#FAF7F2]/5 flex items-center justify-center text-[#FAF7F2] hover:bg-[#FAF7F2]/10 disabled:opacity-30 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ─── VENTILATION TRANSPARENTE DU PRIX ─── */}
                    {basePrice > 0 && (
                      <div className="p-4 rounded-2xl bg-[#0A0507] border border-[#FAF7F2]/10 space-y-2.5 font-sans">
                        <div className="flex items-center gap-2 text-[11px] text-[#721120] font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Transparence tarifaire TYKS</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-[#FAF7F2]/60 font-light divide-y divide-[#FAF7F2]/5">
                          <div className="flex justify-between pt-1">
                            <span>Part artiste / organisateur</span>
                            <span className="text-[#FAF7F2] font-mono">{(organizerSharePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between pt-1.5">
                            <span>Frais de plateforme fixes</span>
                            <span className="text-[#FAF7F2] font-mono">{(platformFeePerTicket * quantity).toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-[#FAF7F2]/10">
                      <div className="flex items-baseline justify-between font-sans">
                        <span className="text-xs text-[#FAF7F2]/40 uppercase tracking-wider">Total</span>
                        <p className="text-2xl font-light tracking-tight">{totalPrice.toFixed(2)} €</p>
                      </div>

                      <button 
                        onClick={handleInitCheckout}
                        disabled={isInitializingPayment}
                        className="w-full h-12 rounded-full bg-[#721120] hover:bg-[#5c0e1a] text-[#FAF7F2] font-sans text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl font-medium disabled:opacity-50"
                      >
                        {isInitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Procéder au paiement sécurisé</span>
                            <ArrowUpRight className="w-4 h-4 opacity-70" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 font-sans">
                    <div className="flex items-center justify-between border-b border-[#FAF7F2]/10 pb-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#721120] font-semibold">Paiement</span>
                        <h4 className="text-sm font-medium pt-0.5">{totalPrice.toFixed(2)} € • {quantity} place(s)</h4>
                      </div>
                      <button 
                        onClick={() => setClientSecret(null)}
                        className="text-xs text-[#FAF7F2]/50 hover:text-[#FAF7F2] cursor-pointer underline"
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
                            colorBackground: '#0A0507',
                            colorText: '#FAF7F2',
                            colorDanger: '#ef4444',
                            fontFamily: 'serif',
                            borderRadius: '16px',
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

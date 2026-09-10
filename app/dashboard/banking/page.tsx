'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Euro, ShieldCheck, Building2, CreditCard, History, AlertCircle, X } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { ConnectEmbed } from '@stripe/react-connect-js';

export default function BankingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [initializingStripe, setInitializingStripe] = useState(false);
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  
  // États pour l'onboarding embarqué (Embedded Connect)
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [showEmbeddedStripe, setShowEmbeddedStripe] = useState(false);

  useEffect(() => {
    async function loadBankingData() {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session?.user) return;

        const { data: orgMember } = await supabaseBrowser
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (orgMember?.organization_id) {
          const { data: orgData } = await supabaseBrowser
            .from('organizations')
            .select('stripe_account_id, payout_enabled, balance_available, balance_pending')
            .eq('id', orgMember.organization_id)
            .single();

          if (orgData) {
            setHasBankAccount(Boolean(orgData.stripe_account_id && orgData.payout_enabled));
            setBalance({
              available: Number(orgData.balance_available || 0),
              pending: Number(orgData.balance_pending || 0),
            });
          }

          const { data: payoutsData } = await supabaseBrowser
            .from('payouts')
            .select('*')
            .eq('organization_id', orgMember.organization_id)
            .order('created_at', { ascending: false });

          if (payoutsData) {
            setPayouts(payoutsData);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données bancaires :', err);
      } finally {
        setLoading(false);
      }
    }

    loadBankingData();
  }, []);

  // Fonction pour initialiser l'Account Session et charger l'onboarding embarqué
  const handleOpenEmbeddedStripe = async () => {
    try {
      setInitializingStripe(true);
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.access_token) {
        alert("Session expirée, veuillez vous reconnecter.");
        setInitializingStripe(false);
        return;
      }

      // Appel à ton API backend qui génère l'account session (au lieu d'un account_link de redirection)
      const res = await fetch('/api/organizer/stripe-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.clientSecret && data.publishableKey) {
        setClientSecret(data.clientSecret);

        // Initialisation de l'instance Stripe Connect JS
        const instance = loadConnectAndInitialize({
          publishableKey: data.publishableKey,
          fetchClientSecret: async () => data.clientSecret,
          locale: 'fr-FR',
          appearance: {
            theme: 'light',
            variables: {
              colorPrimary: '#111110',
              colorBackground: '#F7F5F0',
              colorText: '#111110',
              borderRadius: '16px',
            },
          },
        });

        setStripeConnectInstance(instance);
        setShowEmbeddedStripe(true);
      } else {
        alert(data.error || "Erreur lors de l'initialisation du module bancaire.");
      }
    } catch (err) {
      console.error('Erreur Stripe Connect Embedded :', err);
    } finally {
      setInitializingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-8 relative">
      
      {/* Modal / Vue Embarquée Stripe */}
      {showEmbeddedStripe && stripeConnectInstance && (
        <div className="fixed inset-0 z-50 bg-[#111110]/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-[#F7F5F0] border border-[#111110]/15 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#111110]/10 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-display font-bold text-sm">Configuration sécurisée de votre compte</h3>
              </div>
              <button 
                onClick={() => setShowEmbeddedStripe(false)}
                className="w-8 h-8 rounded-full bg-[#111110]/5 flex items-center justify-center hover:bg-[#111110]/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ConnectEmbed 
                connectInstance={stripeConnectInstance} 
                component="account-onboarding"
              />
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#111110]/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Sécurisé par Stripe Connect
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Banking & Revenus</h1>
          <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Suivi de vos versements et de votre solde net</p>
        </div>

        <button
          onClick={handleOpenEmbeddedStripe}
          disabled={initializingStripe}
          className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-5 py-2.5 text-xs font-semibold text-[#F7F5F0] transition hover:opacity-95 shadow-sm disabled:opacity-50"
        >
          {initializingStripe ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          {hasBankAccount ? "Gérer mon compte bancaire" : "Configurer mon compte bancaire"}
        </button>
      </div>

      {/* Cartes de soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Solde disponible</p>
            <Euro className="w-5 h-5 opacity-70" />
          </div>
          <p className="font-display text-4xl font-bold tracking-tight">
            {balance.available.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs opacity-60 font-mono">Fonds prêts à être versés vers votre compte.</p>
        </div>

        <div className="p-8 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">En cours de traitement</p>
            <CreditCard className="w-5 h-5 opacity-70" />
          </div>
          <p className="font-display text-4xl font-bold tracking-tight">
            {balance.pending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs opacity-60 font-mono">Fonds liés aux ventes en cours.</p>
        </div>
      </div>

      {/* Alerte si pas de compte bancaire lié */}
      {!hasBankAccount && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900">Compte bancaire non configuré</p>
            <p className="text-xs text-amber-800/80">Associez vos coordonnées bancaires pour permettre les virements automatiques de vos ventes.</p>
          </div>
        </div>
      )}

      {/* Historique des versements */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 opacity-70" />
          <h2 className="font-display text-lg font-bold tracking-tight">Historique des virements</h2>
        </div>

        <div className="rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md overflow-hidden shadow-sm">
          {payouts.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono opacity-60">
              Aucun virement enregistré pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-[#111110]/10">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-6 hover:bg-white/40 transition">
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold">{payout.reference || payout.id}</p>
                    <p className="text-[11px] opacity-60">
                      {payout.created_at ? `Versé le ${new Date(payout.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-sm font-bold">
                      {Number(payout.amount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      {payout.status || 'Versé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

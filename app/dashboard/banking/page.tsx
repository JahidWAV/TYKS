'use client';

import { useState, useEffect } from 'react';
import { Loader2, Euro, Building2, CreditCard, History, AlertCircle } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function BankingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [hasBankAccount, setHasBankAccount] = useState(false);

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

  const handleStripeRedirect = async () => {
    try {
      setConnectingStripe(true);
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.access_token) {
        alert("Session expirée, veuillez vous reconnecter.");
        setConnectingStripe(false);
        return;
      }

      const res = await fetch('/api/organizer/stripe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur lors de la configuration du compte Stripe.");
        setConnectingStripe(false);
      }
    } catch (err) {
      console.error('Erreur de redirection Stripe :', err);
      setConnectingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] text-neutral-400 font-mono text-xs uppercase tracking-widest flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-10 space-y-8 font-sans text-white bg-[#0a0b0e] min-h-full">
      {/* Alerte si pas de compte bancaire lié avec bouton d'action intégré */}
      {!hasBankAccount && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 font-mono">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Compte bancaire non configuré</p>
              <p className="text-xs text-amber-400/80">Associez vos coordonnées bancaires pour permettre les virements automatiques de vos ventes.</p>
            </div>
          </div>
          <button
            onClick={handleStripeRedirect}
            disabled={connectingStripe}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E5D4B4] px-5 py-3 text-xs font-mono font-bold text-black uppercase tracking-widest transition hover:bg-[#d8c39e] shadow-lg disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {connectingStripe ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            Configurer mon compte bancaire
          </button>
        </div>
      )}

      {/* Si le compte est déjà configuré, on affiche le bouton de gestion en haut à droite */}
      {hasBankAccount && (
        <div className="flex items-center justify-end">
          <button
            onClick={handleStripeRedirect}
            disabled={connectingStripe}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E5D4B4] px-5 py-3 text-xs font-mono font-bold text-black uppercase tracking-widest transition hover:bg-[#d8c39e] shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {connectingStripe ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            Gérer mon compte bancaire
          </button>
        </div>
      )}

      {/* Cartes de soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Solde disponible</p>
            <Euro className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {balance.available.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Fonds prêts à être versés vers votre compte.</p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171f] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">En cours de traitement</p>
            <CreditCard className="w-4 h-4 text-[#E5D4B4]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">
            {balance.pending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[11px] text-neutral-500 uppercase">Fonds liés aux ventes en cours.</p>
        </div>
      </div>

      {/* Historique des versements */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#E5D4B4]" />
          <h2 className="text-xl font-bold uppercase tracking-tight text-white">Historique des virements</h2>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#14171f] overflow-hidden shadow-lg font-mono">
          {payouts.length === 0 ? (
            <div className="p-12 text-center text-xs uppercase tracking-wider text-neutral-400">
              Aucun virement enregistré pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-6 hover:bg-neutral-800/50 transition">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-white">{payout.reference || payout.id}</p>
                    <p className="text-[10px] text-neutral-500 uppercase">
                      {payout.created_at ? `Versé le ${new Date(payout.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-[#E5D4B4]">
                      {Number(payout.amount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
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

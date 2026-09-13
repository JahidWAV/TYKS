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
      <div className="min-h-screen bg-white text-[#1e3932]/60 font-mono text-xs flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-10 space-y-8 font-sans text-[#1e3932] bg-white min-h-full">
      {!hasBankAccount && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 font-mono">
              <p className="text-xs font-bold text-amber-900">Compte bancaire non configuré</p>
              <p className="text-xs text-amber-800/80">Associez vos coordonnées bancaires pour permettre les virements automatiques de vos ventes.</p>
            </div>
          </div>
          <button
            onClick={handleStripeRedirect}
            disabled={connectingStripe}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3932] px-5 py-3 text-xs font-mono font-bold text-white transition hover:bg-[#152a25] shadow-lg disabled:opacity-50 shrink-0 cursor-pointer"
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

      {hasBankAccount && (
        <div className="flex items-center justify-end">
          <button
            onClick={handleStripeRedirect}
            disabled={connectingStripe}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e3932] px-5 py-3 text-xs font-mono font-bold text-white transition hover:bg-[#152a25] shadow-lg disabled:opacity-50 cursor-pointer"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">Solde disponible</p>
            <Euro className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {balance.available.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Fonds prêts à être versés vers votre compte.</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#1e3932]/60 font-bold">En cours de traitement</p>
            <CreditCard className="w-4 h-4 text-[#1e3932]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1e3932]">
            {balance.pending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[11px] text-[#1e3932]/50">Fonds liés aux ventes en cours.</p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#1e3932]" />
          <h2 className="text-xl font-serif font-medium text-[#1e3932]">Historique des virements</h2>
        </div>

        <div className="rounded-2xl border border-[#1e3932]/10 bg-[#f8faf9] overflow-hidden shadow-xs font-mono">
          {payouts.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#1e3932]/60">
              Aucun virement enregistré pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-[#1e3932]/10">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-6 hover:bg-[#1e3932]/5 transition">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#1e3932]">{payout.reference || payout.id}</p>
                    <p className="text-[10px] text-[#1e3932]/50">
                      {payout.created_at ? `Versé le ${new Date(payout.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-[#1e3932]">
                      {Number(payout.amount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#1e3932]/10 text-[#1e3932] border border-[#1e3932]/20">
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

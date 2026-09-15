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
        console.error('ERREUR LORS DU CHARGEMENT DES DONNÉES BANCAIRES :', err);
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
        alert("SESSION EXPIRÉE, VEUILLEZ VOUS RECONNECTER.");
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
        alert(data.error || "ERREUR LORS DE LA CONFIGURATION DU COMPTE STRIPE.");
        setConnectingStripe(false);
      }
    } catch (err) {
      console.error('ERREUR DE REDIRECTION STRIPE :', err);
      setConnectingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black/60 font-grotesque text-xs flex items-center justify-center uppercase">
        CHARGEMENT...
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-4 space-y-8 font-grotesque text-black bg-white min-h-full uppercase">
      {!hasBankAccount && (
        <div className="p-6 rounded-2xl border border-black/25 bg-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-black shrink-0 mt-0.5" />
            <div className="space-y-1 font-grotesque">
              <p className="text-xs font-bold text-black">COMPTE BANCAIRE NON CONFIGURÉ</p>
              <p className="text-xs text-black/70">ASSOCIEZ VOS COORDONNÉES BANCAIRES POUR PERMETTRE LES VIREMENTS AUTOMATIQUES DE VOS VENTES.</p>
            </div>
          </div>
          <button
            onClick={handleStripeRedirect}
            disabled={connectingStripe}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-grotesque font-bold text-white transition hover:bg-neutral-800 shadow-lg disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {connectingStripe ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            CONFIGURER MON COMPTE BANCAIRE
          </button>
        </div>
      )}

      {hasBankAccount && (
        <div className="flex items-center justify-end">
          <button
            onClick={handleStripeRedirect}
            disabled={connectingStripe}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-grotesque font-bold text-white transition hover:bg-neutral-800 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {connectingStripe ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            GÉRER MON COMPTE BANCAIRE
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-grotesque">
        <div className="p-6 rounded-2xl border border-black/15 bg-neutral-50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-black/60 font-bold">SOLDE DISPONIBLE</p>
            <Euro className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-black">
            {balance.available.toLocaleString('fr-FR')} €
          </p>
          <p className="text-[11px] text-black/50">FONDS PRÊTS À ÊTRE VERSÉS VERS VOTRE COMPTE.</p>
        </div>

        <div className="p-6 rounded-2xl border border-black/15 bg-neutral-50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-black/60 font-bold">EN COURS DE TRAITEMENT</p>
            <CreditCard className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-black">
            {balance.pending.toLocaleString('fr-FR')} €
          </p>
          <p className="text-[11px] text-black/50">FONDS LIÉS AUX VENTES EN COURS.</p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-black" />
          <h2 className="text-xl font-grotesque font-normal text-black">HISTORIQUE DES VIREMENTS</h2>
        </div>

        <div className="rounded-2xl border border-black/15 bg-neutral-50 overflow-hidden shadow-xs font-grotesque">
          {payouts.length === 0 ? (
            <div className="p-12 text-center text-xs text-black/60">
              AUCUN VIREMENT ENREGISTRÉ POUR LE MOMENT.
            </div>
          ) : (
            <div className="divide-y divide-black/15">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-6 hover:bg-black/5 transition">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-black">{payout.reference || payout.id}</p>
                    <p className="text-[10px] text-black/50">
                      {payout.created_at ? `VERSÉ LE ${new Date(payout.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' }).toUpperCase()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-black">
                      {Number(payout.amount || 0).toLocaleString('fr-FR')} €
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/10 text-black border border-black/20">
                      {payout.status ? payout.status.toUpperCase() : 'VERSÉ'}
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

'use client';

import { useState, useEffect } from 'react';
import { Loader2, Euro, ArrowUpRight, ShieldCheck, Building2, CreditCard, History, AlertCircle } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function BankingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [hasBankAccount, setHasBankAccount] = useState(false);

  useEffect(() => {
    async function loadBankingData() {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session?.user) return;
        setUser(session.user);

        // Simulation ou appel de récupération des données financières liées à l'organisation
        // Tu pourras adapter ces tables selon ton schéma Supabase (ex: organization_bank_accounts, payouts)
        const { data: orgMember } = await supabaseBrowser
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (orgMember?.organization_id) {
          // Exemple de vérification d'un compte bancaire configuré
          const { data: bankInfo } = await supabaseBrowser
            .from('organizations')
            .select('stripe_account_id, payout_enabled')
            .eq('id', orgMember.organization_id)
            .single();

          if (bankInfo?.stripe_account_id) {
            setHasBankAccount(true);
          }
        }

        // Données fictives/statiques de secours pour l'UI si les tables de paiments s'initialisent
        setBalance({ available: 1245.50, pending: 480.00 });
        setPayouts([
          { id: 'po_1', date: '2026-08-31', amount: 950.00, status: 'paid', reference: 'VIR-2026-08' },
          { id: 'po_2', date: '2026-07-31', amount: 1420.00, status: 'paid', reference: 'VIR-2026-07' },
        ]);

      } catch (err) {
        console.error('Erreur lors du chargement des données bancaires :', err);
      } finally {
        setLoading(false);
      }
    }

    loadBankingData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
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
          onClick={() => alert("Redirection vers le portail de configuration bancaire Stripe...")}
          className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-5 py-2.5 text-xs font-semibold text-[#F7F5F0] transition hover:opacity-95 shadow-sm"
        >
          <Building2 className="h-4 w-4" />
          {hasBankAccount ? "Gérer mon compte bancaire" : "Configurer mon compte bancaire"}
        </button>
      </div>

      {/* Cartes de soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">Solde disponible (Prêt à être versé)</p>
            <Euro className="w-5 h-5 opacity-70" />
          </div>
          <p className="font-display text-4xl font-bold tracking-tight">
            {balance.available.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs opacity-60 font-mono">Prochain virement automatique prévu sous 48h.</p>
        </div>

        <div className="p-8 rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono opacity-60 uppercase tracking-wide">En cours de traitement / Billets futurs</p>
            <CreditCard className="w-5 h-5 opacity-70" />
          </div>
          <p className="font-display text-4xl font-bold tracking-tight">
            {balance.pending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs opacity-60 font-mono">Fonds bloqués pour les événements à venir.</p>
        </div>
      </div>

      {/* Alerte si pas de compte bancaire lié */}
      {!hasBankAccount && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900">Compte bancaire non configuré</p>
            <p className="text-xs text-amber-800/80">Vous devez associer un compte bancaire ou une structure juridique pour déclencher le versement automatique de vos ventes de billets.</p>
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
              Aucun virement effectué pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-[#111110]/10">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-6 hover:bg-white/40 transition">
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold">{payout.reference}</p>
                    <p className="text-[11px] opacity-60">Virement versé le {new Date(payout.date).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-sm font-bold">
                      {payout.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      Versé
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

'use client';

import { useState } from 'react';
import { ArrowUpRight, Loader2, DollarSign, ShieldCheck, Zap, Database, Check } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function ProLandingPage() {
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setAuthLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-28">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-onyx-line bg-onyx-raised px-4 py-1.5 text-xs text-bone-muted">
          <Zap className="w-3.5 h-3.5 text-bone" />
          <span>L&apos;alternative moderne à Shotgun et DICE</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold text-bone tracking-tight max-w-3xl">
          Reprenez le contrôle de votre billetterie et de vos marges.
        </h1>

        <p className="max-w-xl text-base text-bone-muted leading-relaxed">
          Fins de commissions abusives et de données captives. Tyks Pro vous offre une plateforme sur-mesure, des frais réduits et l&apos;accès direct à votre communauté.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="inline-flex items-center gap-3 rounded-full bg-bone px-8 py-4 text-sm font-semibold text-onyx transition hover:bg-white disabled:opacity-50 shadow-lg shadow-bone/5"
        >
          {authLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          <span>Accéder à mon espace Pro</span>
        </button>
      </div>

      {/* Grille Avantages */}
      <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-onyx-line">
        <div className="p-8 rounded-2xl bg-onyx-raised/40 border border-onyx-line space-y-4">
          <div className="w-10 h-10 rounded-xl bg-bone/10 flex items-center justify-center text-bone">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-bone">Marges maximales</h3>
          <p className="text-xs text-bone-muted leading-relaxed">
            Oubliez les grilles tarifaires rigides des grandes applications. Gardez un maximum de revenus sur chaque place vendue.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-onyx-raised/40 border border-onyx-line space-y-4">
          <div className="w-10 h-10 rounded-xl bg-bone/10 flex items-center justify-center text-bone">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-bone">Données 100% vous</h3>
          <p className="text-xs text-bone-muted leading-relaxed">
            Contrairement aux plateformes qui conservent vos spectateurs captifs, accédez en temps réel aux emails et contacts de votre public.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-onyx-raised/40 border border-onyx-line space-y-4">
          <div className="w-10 h-10 rounded-xl bg-bone/10 flex items-center justify-center text-bone">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-bone">Image de marque</h3>
          <p className="text-xs text-bone-muted leading-relaxed">
            Profitez d&apos;un sous-domaine dédié (`pro.tyks.app`) et d&apos;une interface aux couleurs de votre univers artistique ou de votre structure.
          </p>
        </div>
      </div>

      {/* Section Tarifs & Modèle Économique */}
      <div className="space-y-12 pt-10 border-t border-onyx-line">
        <div className="text-center space-y-3">
          <h2 className="font-display text-3xl font-bold text-bone">Des offres transparentes adaptées à votre volume</h2>
          <p className="text-sm text-bone-muted max-w-lg mx-auto">
            Choisissez la liberté totale du sans engagement ou supprimez définitivement les commissions avec notre offre partenaire exclusif.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan Standard */}
          <div className="p-8 rounded-2xl bg-onyx-raised/30 border border-onyx-line flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs text-bone-faint uppercase tracking-wider">Liberté totale</span>
                <h3 className="font-display text-2xl font-bold text-bone">Plan Standard</h3>
                <p className="text-xs text-bone-muted">Idéal pour tester ou pour les structures indépendantes sans exclusivité.</p>
              </div>

              <div className="py-4 border-y border-onyx-line">
                <span className="font-display text-4xl font-bold text-bone">Gratuit</span>
                <span className="text-xs text-bone-muted block mt-1">uniquement au succès</span>
              </div>

              <ul className="space-y-3 text-xs text-bone-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-bone flex-shrink-0" />
                  <span>Sans engagement, sans exclusivité</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-bone flex-shrink-0" />
                  <span>Frais Stripe : 1,5% + 0,25 € (payés par l&apos;acheteur)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-bone flex-shrink-0" />
                  <span>Commission plateforme : <strong className="text-bone">7,5 %</strong> par billet</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full rounded-full border border-onyx-line bg-onyx-raised py-3 text-xs font-semibold text-bone transition hover:bg-white/10"
            >
              Commencer gratuitement
            </button>
          </div>

          {/* Plan Pro Exclusif */}
          <div className="p-8 rounded-2xl bg-onyx-raised border-2 border-bone/20 flex flex-col justify-between space-y-8 relative shadow-xl">
            <div className="absolute -top-3 right-6 bg-bone text-onyx px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
              Recommandé
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs text-bone-muted uppercase tracking-wider">Partenaire Exclusif</span>
                <h3 className="font-display text-2xl font-bold text-bone">Plan Pro</h3>
                <p className="text-xs text-bone-muted">Pour les organisateurs réguliers qui veulent maximiser leurs profits.</p>
              </div>

              <div className="py-4 border-y border-onyx-line space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-bone">200 €</span>
                  <span className="text-xs text-bone-muted">/ mois ou 2 100 € / an</span>
                </div>
                <span className="text-[10px] text-bone-faint block">Engagement 1 an ferme</span>
              </div>

              <ul className="space-y-3 text-xs text-bone-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-bone flex-shrink-0" />
                  <span>Exclusivité totale sur vos événements (1 an)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-bone flex-shrink-0" />
                  <span>Frais Stripe : 1,5% + 0,25 € (payés par l&apos;acheteur)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-bone flex-shrink-0" />
                  <span>Commission plateforme : <strong className="text-bone">0 %</strong> (zéro frais cachés)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full rounded-full bg-bone py-3 text-xs font-semibold text-onyx transition hover:bg-white shadow-md"
            >
              Devenir Partenaire Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="mx-auto max-w-5xl px-6 pt-16 pb-24 space-y-28 bg-[#0f0f0f] text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-8 pt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/70 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>L&apos;alternative moderne à Shotgun et DICE</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight max-w-3xl leading-[1.1]">
          Reprenez le contrôle de votre billetterie et de vos marges.
        </h1>

        <p className="max-w-xl text-base text-white/70 leading-relaxed font-sans">
          Fins de commissions abusives et de données captives. Tyks Pro vous offre une plateforme sur-mesure, des frais réduits et l&apos;accès direct à votre communauté.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#0f0f0f] transition-all hover:bg-white/90 disabled:opacity-50 shadow-xl shadow-white/5"
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
      <div className="grid md:grid-cols-3 gap-6 pt-10 border-t border-white/10">
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Marges maximales</h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            Oubliez les grilles tarifaires rigides des grandes applications. Gardez un maximum de revenus sur chaque place vendue.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Données 100% vous</h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            Contrairement aux plateformes qui conservent vos spectateurs captifs, accédez en temps réel aux emails et contacts de votre public.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Image de marque</h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            Profitez d&apos;un sous-domaine dédié (<code className="font-mono text-white">pro.tyks.app</code>) et d&apos;une interface aux couleurs de votre univers artistique ou de votre structure.
          </p>
        </div>
      </div>

      {/* Section Tarifs & Modèle Économique */}
      <div className="space-y-12 pt-16 border-t border-white/10">
        <div className="text-center space-y-3">
          <h2 className="font-display text-3xl font-bold text-white">Des offres transparentes adaptées à votre volume</h2>
          <p className="text-sm text-white/70 max-w-lg mx-auto font-sans">
            Choisissez la liberté totale du sans engagement ou supprimez définitivement les commissions avec notre offre partenaire exclusif.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan Standard */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs text-white/40 uppercase tracking-wider">Liberté totale</span>
                <h3 className="font-display text-2xl font-bold text-white">Plan Standard</h3>
                <p className="text-xs text-white/70 font-sans">Idéal pour tester ou pour les structures indépendantes sans exclusivité.</p>
              </div>

              <div className="py-4 border-y border-white/10">
                <span className="font-display text-4xl font-bold text-white">Gratuit</span>
                <span className="text-xs text-white/70 block mt-1 font-sans">uniquement au succès</span>
              </div>

              <ul className="space-y-3 text-xs text-white/70 font-sans">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Sans engagement, sans exclusivité</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Frais Stripe : 1,5% + 0,25 € (payés par l&apos;acheteur)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Commission plateforme : <strong className="text-white">7,5 %</strong> par billet</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full rounded-full border border-white/20 bg-white/5 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Commencer gratuitement
            </button>
          </div>

          {/* Plan Pro Exclusif */}
          <div className="p-8 rounded-3xl bg-white/[0.04] border-2 border-white/20 flex flex-col justify-between space-y-8 relative shadow-2xl">
            <div className="absolute -top-3 right-6 bg-white text-[#0f0f0f] px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
              Recommandé
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs text-white/70 uppercase tracking-wider">Partenaire Exclusif</span>
                <h3 className="font-display text-2xl font-bold text-white">Plan Pro</h3>
                <p className="text-xs text-white/70 font-sans">Pour les organisateurs réguliers qui veulent maximiser leurs profits.</p>
              </div>

              <div className="py-4 border-y border-white/10 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-white">200 €</span>
                  <span className="text-xs text-white/70 font-sans">/ mois ou 2 100 € / an</span>
                </div>
                <span className="text-[10px] text-white/40 block">Engagement 1 an ferme</span>
              </div>

              <ul className="space-y-3 text-xs text-white/70 font-sans">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Exclusivité totale sur vos événements (1 an)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Frais Stripe : 1,5% + 0,25 € (payés par l&apos;acheteur)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Commission plateforme : <strong className="text-white">0 %</strong> (zéro frais cachés)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full rounded-full bg-white py-3 text-xs font-semibold text-[#0f0f0f] transition hover:bg-white/90 shadow-md"
            >
              Devenir Partenaire Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ArrowUpRight, DollarSign, ShieldCheck, Zap, Database, Check, Smartphone } from 'lucide-react';
import ProOnboardingModal from '@/components/ProOnboardingModal';
import CustomAuthModal from '@/components/CustomAuthModal';

export default function ProLandingPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('standard');

  const handleOpenProModal = (plan: 'standard' | 'pro') => {
    setSelectedPlan(plan);
    setIsProModalOpen(true);
  };

  const handleOpenAuthModal = (formData: any) => {
    // Ferme l'onboarding pro et ouvre la modale d'authentification personnalisée
    setIsProModalOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      
      {/* HERO SECTION PRO */}
      <section className="min-h-[calc(100vh-5rem)] flex items-center max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="w-full grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-neutral-900 px-4 py-1.5 text-xs text-white/80 w-fit shadow-xs">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>L&apos;alternative moderne à Shotgun et DICE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white">
              REPRENEZ LE CONTRÔLE DE VOTRE BILLETTERIE.
            </h1>

            <p className="text-xs sm:text-sm text-white/70 max-w-xl font-normal leading-relaxed normal-case">
              Fins de commissions abusives et de données captives. Tyks Pro vous offre une plateforme sur-mesure, des frais réduits et l&apos;accès direct à votre communauté.
            </p>

            <div className="pt-2">
              <button
                onClick={() => handleOpenProModal('standard')}
                className="h-12 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center rounded-full shadow-lg cursor-pointer"
              >
                <span>ACCÉDER À MON ESPACE PRO</span>
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-md bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">TYKS DASHBOARD</h3>
                    <p className="text-[10px] text-white/50 font-bold">PILOTAGE & CRM</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold tracking-wide uppercase shadow-xs">
                  PRO
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                  Suivez vos ventes en temps réel, gérez votre programmation et récupérez les contacts de vos spectateurs instantanément.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-neutral-800 border border-white/15 px-3 py-1.5 rounded-xl shadow-xs">
                  <Database className="w-3.5 h-3.5" />
                  <span>DONNÉES 100% VOUS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION AVANTAGES PRO */}
      <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="space-y-12 w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              POURQUOI PASSER SUR TYKS PRO ?
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-normal normal-case">
              Des outils taillés pour les organisateurs qui veulent maximiser leurs revenus et soigner leur image de marque.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <DollarSign className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-white">MARGES MAXIMALES</h3>
              <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                Oubliez les grilles tarifaires rigides des grandes applications. Gardez un maximum de revenus sur chaque place vendue.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Database className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-white">DONNÉES 100% VOUS</h3>
              <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                Contrairement aux plateformes qui conservent vos spectateurs captifs, accédez en temps réel aux emails et contacts de votre public.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/15 p-6 sm:p-8 rounded-[2.5rem] space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-white">IMAGE DE MARQUE</h3>
              <p className="text-xs text-white/70 font-normal leading-relaxed normal-case">
                Profitez d&apos;un sous-domaine dédié (<code className="font-mono text-white">pro.tyks.app</code>) et d&apos;une interface aux couleurs de votre structure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TARIFS & MODÈLE ÉCONOMIQUE */}
      <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="space-y-12 w-full">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              DES OFFRES TRANSPARENTES.
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-normal normal-case">
              Choisissez la liberté totale du sans engagement ou supprimez définitivement les commissions avec notre offre partenaire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Standard */}
            <div className="bg-neutral-900 border border-white/15 p-8 sm:p-10 rounded-[3rem] flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="font-mono text-xs text-white/50 uppercase tracking-wider">Liberté totale</span>
                  <h3 className="text-2xl font-bold text-white">Plan Standard</h3>
                  <p className="text-xs text-white/70 font-normal normal-case">Idéal pour tester ou pour les structures indépendantes sans exclusivité.</p>
                </div>

                <div className="py-4 border-y border-white/15">
                  <span className="text-4xl font-bold text-white">Gratuit</span>
                  <span className="text-xs text-white/70 block mt-1 font-normal normal-case">uniquement au succès</span>
                </div>

                <ul className="space-y-3 text-xs text-white/70 font-normal normal-case">
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
                    <span>Commission plateforme : <strong className="text-white font-bold">7,5 %</strong> par billet</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenProModal('standard')}
                className="w-full h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                COMMENCER GRATUITEMENT
              </button>
            </div>

            {/* Plan Pro Exclusif */}
            <div className="bg-neutral-900 border-2 border-white/30 p-8 sm:p-10 rounded-[3rem] flex flex-col justify-between space-y-8 relative shadow-2xl">
              <div className="absolute -top-3 right-8 bg-white text-black px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs">
                RECOMMANDÉ
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="font-mono text-xs text-white/70 uppercase tracking-wider">Partenaire Exclusif</span>
                  <h3 className="text-2xl font-bold text-white">Plan Pro</h3>
                  <p className="text-xs text-white/70 font-normal normal-case">Pour les organisateurs réguliers qui veulent maximiser leurs profits.</p>
                </div>

                <div className="py-4 border-y border-white/15 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">200 €</span>
                    <span className="text-xs text-white/70 font-normal normal-case">/ mois ou 2 100 € / an</span>
                  </div>
                  <span className="text-[10px] text-white/50 block font-normal normal-case">Engagement 1 an ferme</span>
                </div>

                <ul className="space-y-3 text-xs text-white/70 font-normal normal-case">
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
                    <span>Commission plateforme : <strong className="text-white font-bold">0 %</strong> (zéro frais cachés)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenProModal('pro')}
                className="w-full h-12 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center shadow-lg"
              >
                DEVENIR PARTENAIRE PRO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modale d'onboarding pro en plein écran */}
      <ProOnboardingModal 
        isOpen={isProModalOpen} 
        onClose={() => setIsProModalOpen(false)} 
        selectedPlan={selectedPlan}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Modale d'authentification personnalisée finale */}
      <CustomAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

    </div>
  );
}

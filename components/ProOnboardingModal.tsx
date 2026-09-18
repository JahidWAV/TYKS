'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Loader2, Building2, MapPin, Tag } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface ProOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'standard' | 'pro';
}

export default function ProOnboardingModal({ isOpen, onClose, selectedPlan }: ProOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    displayName: '',
    partnerType: 'Promoter',
    city: '',
  });

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.companyName.trim() || !formData.displayName.trim()) return;
      setStep(2);
    } else {
      handleGoogleLoginWithProfile();
    }
  };

  const handleGoogleLoginWithProfile = async () => {
    try {
      setLoading(true);
      localStorage.setItem('tyks_pro_onboarding', JSON.stringify({
        ...formData,
        plan: selectedPlan
      }));

      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?plan=${selectedPlan}`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Erreur lors de l\'authentification pro :', err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-neutral-950 text-white animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Bouton de fermeture en haut à droite */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center transition-colors cursor-pointer z-20"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Conteneur principal en deux colonnes (style DICE) sur grand écran */}
      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        
        {/* Colonne visuelle / ambiance à gauche */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-neutral-900 border-r border-white/10 p-12 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-widest uppercase">
              {selectedPlan === 'pro' ? 'Plan Pro Exclusif' : 'Plan Standard'}
            </span>
            <h2 className="text-3xl font-bold tracking-tight">ESPACE ORGANISATEUR</h2>
          </div>

          <div className="relative z-10 space-y-2">
            <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Étape {step} sur 2</p>
            <p className="text-sm text-white/70">
              {step === 1 
                ? "Renseignez l'identité légale et publique de votre structure pour configurer votre espace."
                : "Précisez votre activité et votre ancrage géographique pour finaliser la création."}
            </p>
          </div>
        </div>

        {/* Colonne formulaire à droite */}
        <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 max-w-2xl mx-auto w-full">
          
          <div className="space-y-6 mb-8 lg:hidden">
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
              Étape {step} sur 2 — {selectedPlan === 'pro' ? 'Plan Pro' : 'Plan Standard'}
            </span>
            <h2 className="text-2xl font-bold tracking-tight">CRÉATION ESPACE PRO</h2>
          </div>

          <form onSubmit={handleNext} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Company name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SAS Mon Festival"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full h-14 px-5 bg-neutral-900 border border-white/15 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                  />
                  <span className="text-xs text-white/40 block">Nom légal enregistré de la structure.</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Display name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mon Festival 2026"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full h-14 px-5 bg-neutral-900 border border-white/15 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                  />
                  <span className="text-xs text-white/40 block">Utilisé pour vos listes d&apos;événements publics.</span>
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    className="h-14 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Partner type
                  </label>
                  <select
                    value={formData.partnerType}
                    onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                    className="w-full h-14 px-5 bg-neutral-900 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                  >
                    <option value="Promoter">Promoter</option>
                    <option value="Venue">Venue / Salle</option>
                    <option value="Festival">Festival</option>
                    <option value="Club">Club</option>
                    <option value="Independent">Indépendant</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paris, Lyon, Lille..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-14 px-5 bg-neutral-900 border border-white/15 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-14 px-6 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-14 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continuer avec Google</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}

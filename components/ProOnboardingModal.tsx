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

  // Champs du formulaire inspirés de DICE
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
      // On sauvegarde temporairement les métadonnées pro dans le localStorage 
      // pour les récupérer et les insérer dans Supabase après le retour du callback OAuth
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/15 rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-white">
        
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
              Étape {step} sur 2 — {selectedPlan === 'pro' ? 'Plan Pro Exclusif' : 'Plan Standard'}
            </span>
            <h2 className="text-xl font-bold tracking-tight">CRÉATION ESPACE PRO</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Formulaire multi-étapes */}
        <form onSubmit={handleNext} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Company name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SAS Mon Festival"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full h-11 px-4 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                />
                <span className="text-[10px] text-white/40 block">Nom légal enregistré de la structure.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Display name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mon Festival 2026"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full h-11 px-4 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                />
                <span className="text-[10px] text-white/40 block">Utilisé pour vos listes d&apos;événements publics.</span>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="h-11 px-6 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Partner type
                </label>
                <select
                  value={formData.partnerType}
                  onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                  className="w-full h-11 px-4 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                >
                  <option value="Promoter">Promoter</option>
                  <option value="Venue">Venue / Salle</option>
                  <option value="Festival">Festival</option>
                  <option value="Club">Club</option>
                  <option value="Independent">Indépendant</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> City
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Paris, Lyon, Lille..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 px-4 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-6 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
  );
}

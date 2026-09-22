'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Building2, MapPin, Tag, ShieldCheck, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'standard' | 'pro';
  onOpenAuthModal: (formData: any) => void;
}

export default function ProOnboardingModal({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  onOpenAuthModal 
}: ProOnboardingModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    displayName: '',
    partnerType: 'Promoteur',
    city: '',
    licenseNumber: '',
  });

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [cityError, setCityError] = useState(false);
  const [isCityValid, setIsCityValid] = useState(false); // Suivi fiable de la sélection de la ville

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCityChange = async (value: string) => {
    setFormData({ ...formData, city: value });
    setCityError(false);
    setIsCityValid(false); // L'utilisateur modifie le texte, on invalide temporairement

    if (value.length < 2) {
      setCitySuggestions([]);
      return;
    }

    try {
      const searchTerm = value.trim().replace(/\s+/g, '%');

      const { data, error } = await supabase
        .from('french_cities')
        .select('Commune, "Département (numéro)"')
        .ilike('Commune', `%${searchTerm}%`)
        .limit(10);

      if (!error && data) {
        const formattedSuggestions = data.map(
          (item: any) => `${item.Commune} (${item['Département (numéro)']})`
        );
        setCitySuggestions(formattedSuggestions);
      } else {
        console.error('Erreur Supabase:', error);
      }
    } catch (err) {
      console.error('Erreur lors de la recherche de ville:', err);
    }
  };

  const handleSelectCity = (cityString: string) => {
    setFormData({ ...formData, city: cityString });
    setCitySuggestions([]);
    setCityError(false);
    setIsCityValid(true); // Validation explicite de la ville choisie
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.displayName.trim() || !formData.city.trim()) return;
    
    // Vérification de la validité via notre état dédié
    if (!isCityValid) {
      setCityError(true);
      return;
    }

    localStorage.setItem('tyks_pro_onboarding', JSON.stringify({
      ...formData,
      plan: selectedPlan
    }));

    onOpenAuthModal(formData);
  };

  return (
    <div className="fixed inset-0 z-[999] flex bg-neutral-950 text-white animate-in fade-in duration-200 overflow-y-auto">
      
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center transition-colors cursor-pointer z-20"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        
        <div className="hidden lg:flex lg:col-span-5 relative bg-neutral-900 border-r border-white/10 p-12 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-widest uppercase">
              {selectedPlan === 'pro' ? 'Plan Pro Exclusif' : 'Plan Standard'}
            </span>
            <h2 className="text-4xl font-bold tracking-tight">MIO PRO</h2>
            <p className="text-sm text-white/70 max-w-sm">
              Créez et gérez vos événements, vendez vos billets et développez votre communauté en toute liberté.
            </p>
          </div>

          <div className="relative z-10 space-y-2 pt-6">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Données 100% vous & paiements sécurisés</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-16 lg:px-20 py-12 max-w-3xl mx-auto w-full">
          
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuration de la structure</h2>
            <p className="text-xs text-white/50">Renseignez les informations officielles de votre entité.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SAS Mon Festival"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Nom d&apos;affichage
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mon Festival 2026"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Type de partenaire
              </label>
              <select
                value={formData.partnerType}
                onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
              >
                <option value="Promoteur">Promoteur</option>
                <option value="Venue">Salle de concert / Venue</option>
                <option value="Festival">Festival</option>
                <option value="Club">Club</option>
                <option value="Indépendant">Indépendant</option>
              </select>
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Ville
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                placeholder="Tapez le nom d'une ville (ex: Saint-Molf)..."
                value={formData.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className={`w-full h-12 px-4 bg-neutral-900 border rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none transition-colors ${
                  cityError ? 'border-red-500' : 'border-white/15 focus:border-white'
                }`}
              />

              {citySuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-[calc(100%+4px)] bg-neutral-900 border border-white/15 rounded-xl max-h-48 overflow-y-auto z-30 shadow-2xl">
                  {citySuggestions.map((cityString) => (
                    <li
                      key={cityString}
                      onClick={() => handleSelectCity(cityString)}
                      className="px-4 py-2.5 text-xs text-white hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-none flex justify-between items-center"
                    >
                      <span>{cityString}</span>
                    </li>
                  ))}
                </ul>
              )}

              {cityError && (
                <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> Veuillez sélectionner une ville valide dans la liste déroulante.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Numéro de licence (Optionnel)
              </label>
              <input
                type="text"
                placeholder="Numéro de licence d'entrepreneur de spectacles"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="h-12 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Continuer vers l&apos;authentification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

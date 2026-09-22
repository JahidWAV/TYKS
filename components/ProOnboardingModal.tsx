'use client';

import { useState } from 'react';
import { X, ArrowRight, Building2, MapPin, Tag, ShieldCheck } from 'lucide-react';

interface ProOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'standard' | 'pro';
  onOpenAuthModal: (formData: any) => void; // Permet de passer les données à ta modale d'auth custom
}

// Liste de villes françaises principales pour l'autocomplétion
const FRENCH_CITIES = [
  'Paris, France',
  'Marseille, France',
  'Lyon, France',
  'Toulouse, France',
  'Nice, France',
  'Nantes, France',
  'Montpellier, France',
  'Strasbourg, France',
  'Bordeaux, France',
  'Lille, France',
  'Rennes, France',
  'Reims, France',
  'Toulon, France',
  'Saint-Étienne, France',
  'Le Havre, France',
  'Grenoble, France',
  'Dijon, France',
  'Angers, France',
  'Nîmes, France',
  'Villeurbanne, France',
  'Clermont-Ferrand, France',
  'Le Mans, France',
  'Aix-en-Provence, France',
  'Brest, France',
  'Tours, France',
  'Amiens, France',
  'Limoges, France',
  'Annecy, France',
  'Perpignan, France',
  'Boulogne-Billancourt, France',
  'Metz, France',
  'Besançon, France',
  'Orléans, France',
  'Saint-Denis, France',
  'Rouen, France',
  'Argenteuil, France',
  'Mulhouse, France',
  'Montreuil, France',
  'Caen, France',
  'Nancy, France',
  'Saint-Paul, France',
  'Roubaix, France',
  'Tourcoing, France',
  'Nanterre, France',
  'Vitry-sur-Seine, France',
  'Créteil, France',
  'Dunkerque, France',
  'Pau, France',
  'Bayonne, France',
  'Biarritz, France'
];

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.displayName.trim() || !formData.city.trim()) return;
    
    // On sauvegarde temporairement et on déclenche la modale d'auth custom
    localStorage.setItem('tyks_pro_onboarding', JSON.stringify({
      ...formData,
      plan: selectedPlan
    }));

    onOpenAuthModal(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-neutral-950 text-white animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Bouton de fermeture */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center transition-colors cursor-pointer z-20"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Disposition en deux colonnes style DICE */}
      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        
        {/* Colonne gauche : Ambiance / Visuel */}
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

        {/* Colonne droite : Formulaire unique complet */}
        <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-16 lg:px-20 py-12 max-w-3xl mx-auto w-full">
          
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuration de la structure</h2>
            <p className="text-xs text-white/50">Renseignez les informations officielles de votre entité.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Ligne 1 : Company name & Display name */}
            <div className="grid sm:grid-cols-2 gap-4">
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
                  className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                />
                <span className="text-[10px] text-white/40 block">Nom légal enregistré.</span>
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
                  className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
                />
                <span className="text-[10px] text-white/40 block">Nom public sur la billetterie.</span>
              </div>
            </div>

            {/* Ligne 2 : Partner type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Partner type
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

            {/* Ligne 3 : City (avec liste de villes françaises) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> City
              </label>
              <input
                type="text"
                required
                list="french-cities-list"
                placeholder="Ex: Lille, France"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
              />
              <datalist id="french-cities-list">
                {FRENCH_CITIES.map((cityOption) => (
                  <option key={cityOption} value={cityOption} />
                ))}
              </datalist>
            </div>

            {/* Ligne 4 : License number (optionnel comme sur DICE) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> License number (Optionnel)
              </label>
              <input
                type="text"
                placeholder="Numéro de licence d'entrepreneur de spectacles"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full h-12 px-4 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* Bouton de validation final ouvrant la Custom Auth Modale */}
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

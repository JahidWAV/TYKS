'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, MapPin, FileText, Calendar, Euro, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    starts_at: '',
    ends_at: '',
    price: '0',
    capacity: '',
    image_url: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleNext = () => {
    setError(null);
    if (step === 1 && (!form.title.trim() || !form.location.trim())) {
      setError("Veuillez remplir le titre et le lieu de l'événement.");
      return;
    }
    if (step === 2 && !form.starts_at) {
      setError("Veuillez renseigner la date de début.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) {
        setError("Vous devez être connecté.");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de l'événement.");
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  const stepsMeta = [
    { number: 1, title: "Général", icon: FileText, desc: "Identité et lieu" },
    { number: 2, title: "Dates & Tarifs", icon: Calendar, desc: "Planning et jauge" },
    { number: 3, title: "Visuel", icon: Euro, desc: "Couverture" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] selection:bg-[#111110] selection:text-[#F7F5F0] py-12">
      <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
        
        {/* Bouton Retour */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>

        {/* En-tête & Indicateur d'étapes */}
        <div className="space-y-6 pb-6 border-b border-[#111110]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Créer un événement</h1>
              <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Publication d&apos;un nouvel événement</p>
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/80 border border-[#111110]/15 w-fit">
              Étape {step} sur 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stepsMeta.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isPassed = step > s.number;
              return (
                <div
                  key={s.number}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-[#111110] text-[#F7F5F0] border-[#111110] shadow-md scale-[1.01]"
                      : isPassed
                      ? "bg-white/80 border-[#111110]/15 text-[#111110]"
                      : "bg-white/40 border-[#111110]/10 opacity-50 text-[#111110]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F7F5F0]" : "opacity-60"}`} />
                  <div className="overflow-hidden hidden sm:block">
                    <p className="text-xs font-bold font-mono truncate">{s.title}</p>
                    <p className={`text-[10px] truncate ${isActive ? "text-[#F7F5F0]/70" : "opacity-50"}`}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs text-red-600">
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire principal englobé dans le panneau blanc texturé */}
        <div className="rounded-3xl border border-[#111110]/15 bg-white/70 p-6 md:p-8 backdrop-blur-md shadow-sm transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ÉTAPE 1 : GÉNÉRAL */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="border-b border-[#111110]/10 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Détails généraux</h2>
                  <p className="text-xs opacity-60">Définissez le nom, la description et la localisation.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono opacity-60">Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Nom de l'événement"
                    className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono opacity-60">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre événement..."
                    className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono opacity-60">Lieu / Adresse *</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-4 h-4 w-4 opacity-30 pointer-events-none" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Adresse ou nom du lieu"
                      className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 pl-11 text-xs focus:outline-none focus:border-[#111110]/65 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : DATES & BILLETTERIE */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="border-b border-[#111110]/10 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Dates & Billetterie</h2>
                  <p className="text-xs opacity-60">Indiquez les horaires et les conditions tarifaires.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono opacity-60">Début *</label>
                    <input
                      type="datetime-local"
                      name="starts_at"
                      value={form.starts_at}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 font-mono transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono opacity-60">Fin</label>
                    <input
                      type="datetime-local"
                      name="ends_at"
                      value={form.ends_at}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 font-mono transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono opacity-60">Prix (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 font-mono transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono opacity-60">Jauge max</label>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="Ex: 150"
                      className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : VISUEL */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="border-b border-[#111110]/10 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Visuel de l&apos;événement</h2>
                  <p className="text-xs opacity-60">Ajoutez une image d&apos;illustration pour votre couverture.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono opacity-60">URL de l&apos;image de couverture</label>
                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 transition-colors"
                  />
                </div>

                {form.image_url && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-[#111110]/15 h-48 bg-[#F7F5F0] relative">
                    <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-[#111110]/10 mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 rounded-full border border-[#111110]/20 bg-white/60 hover:bg-white px-5 py-2.5 text-xs font-semibold text-[#111110] transition-transform hover:scale-[1.02]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Précédent</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-6 py-2.5 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02] ml-auto"
                >
                  <span>Suivant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-6 py-2.5 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02] disabled:opacity-50 ml-auto"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{loading ? 'Création...' : "Créer l'événement"}</span>
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

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
    <div className="w-full px-6 lg:px-12 py-10 space-y-8 font-sans text-white bg-[#0a0b0e] min-h-full">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Bouton Retour */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au dashboard</span>
          </Link>
        </div>

        {/* En-tête & Indicateur d'étapes */}
        <div className="space-y-6 pb-6 border-b border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight uppercase leading-none text-white">Créer un événement</h1>
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">Publication d&apos;un nouvel événement</p>
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#14171f] border border-neutral-800 text-[#E5D4B4] w-fit">
              Étape {step} sur 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono">
            {stepsMeta.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isPassed = step > s.number;
              return (
                <div
                  key={s.number}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-[#E5D4B4] text-black border-[#E5D4B4] shadow-lg"
                      : isPassed
                      ? "bg-[#14171f] border-neutral-800 text-white"
                      : "bg-[#14171f]/50 border-neutral-800 opacity-50 text-neutral-400"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-[#E5D4B4]"}`} />
                  <div className="overflow-hidden hidden sm:block">
                    <p className="text-xs font-bold uppercase tracking-wider truncate">{s.title}</p>
                    <p className={`text-[10px] uppercase truncate ${isActive ? "text-black/70" : "text-neutral-500"}`}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-800 bg-red-950 px-5 py-3 font-mono text-xs text-red-300 uppercase tracking-wider">
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire principal */}
        <div className="rounded-2xl border border-neutral-800 bg-[#14171f] p-6 md:p-8 shadow-xl transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ÉTAPE 1 : GÉNÉRAL */}
            {step === 1 && (
              <div className="space-y-5 font-mono">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">Détails généraux</h2>
                  <p className="text-[11px] text-neutral-500 uppercase">Définissez le nom, la description et la localisation.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Nom de l'événement"
                    className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 text-xs uppercase text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#E5D4B4] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre événement..."
                    className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 text-xs uppercase text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#E5D4B4] transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Lieu / Adresse *</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-4 h-4 w-4 text-[#E5D4B4] pointer-events-none" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Adresse ou nom du lieu"
                      className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 pl-11 text-xs uppercase text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#E5D4B4] transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : DATES & BILLETTERIE */}
            {step === 2 && (
              <div className="space-y-5 font-mono">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">Dates & Billetterie</h2>
                  <p className="text-[11px] text-neutral-500 uppercase">Indiquez les horaires et les conditions tarifaires.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Début *</label>
                    <input
                      type="datetime-local"
                      name="starts_at"
                      value={form.starts_at}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 text-xs uppercase text-white focus:outline-none focus:border-[#E5D4B4] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Fin</label>
                    <input
                      type="datetime-local"
                      name="ends_at"
                      value={form.ends_at}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 text-xs uppercase text-white focus:outline-none focus:border-[#E5D4B4] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Prix (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 text-xs uppercase text-white focus:outline-none focus:border-[#E5D4B4] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Jauge max</label>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="Ex: 150"
                      className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 text-xs uppercase text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#E5D4B4] transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : VISUEL */}
            {step === 3 && (
              <div className="space-y-5 font-mono">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">Visuel de l&apos;événement</h2>
                  <p className="text-[11px] text-neutral-500 uppercase">Ajoutez une image d&apos;illustration pour votre couverture.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">URL de l&apos;image de couverture</label>
                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-neutral-800 bg-[#101319] px-4 py-3 text-xs uppercase text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#E5D4B4] transition-colors"
                  />
                </div>

                {form.image_url && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-neutral-800 h-48 bg-[#101319] relative">
                    <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-800 mt-8 font-mono">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-[#14171f] hover:bg-neutral-800 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-200 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Précédent</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E5D4B4] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-[#d8c39e] ml-auto cursor-pointer shadow-lg"
                >
                  <span>Suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E5D4B4] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-[#d8c39e] disabled:opacity-50 ml-auto cursor-pointer shadow-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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

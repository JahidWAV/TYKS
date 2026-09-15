'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, MapPin, FileText, Calendar, Euro, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  // Fonction d'upload d'image vers Supabase Storage corrigée
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      // Correction de la syntaxe ici : Math.random().toString(36).substring(2)
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `event-covers/${fileName}`;

      const { error: uploadError } = await supabaseBrowser.storage
        .from('events')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabaseBrowser.storage
        .from('events')
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      console.error("ERREUR LORS DE L'UPLOAD DE L'IMAGE :", err);
      setError(err.message || "ÉCHEC DE L'ENVOI DE L'IMAGE. VÉRIFIEZ LE FORMAT.");
    } finally {
      setUploadingImage(false);
    }
  }

  const handleNext = () => {
    setError(null);
    if (step === 1 && (!form.title.trim() || !form.location.trim())) {
      setError("VEUILLEZ REMPLIR LE TITRE ET LE LIEU DE L'ÉVÉNEMENT.");
      return;
    }
    if (step === 2 && !form.starts_at) {
      setError("VEUILLEZ RENSEIGNER LA DATE DE DÉBUT.");
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
        setError("VOUS DEVEZ ÊTRE CONNECTÉ.");
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
        throw new Error(data.error || "ERREUR LORS DE LA CRÉATION DE L'ÉVÉNEMENT.");
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "UNE ERREUR EST SURVENUE.");
    } finally {
      setLoading(false);
    }
  }

  const stepsMeta = [
    { number: 1, title: "GÉNÉRAL", icon: FileText, desc: "IDENTITÉ ET LIEU" },
    { number: 2, title: "DATES & TARIFS", icon: Calendar, desc: "PLANNING ET JAUGE" },
    { number: 3, title: "VISUEL", icon: ImageIcon, desc: "COUVERTURE" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 py-8 space-y-8 font-grotesque text-white bg-[#0f0f0f] min-h-full uppercase">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETOUR AU DASHBOARD</span>
          </Link>
        </div>

        <div className="space-y-6 pb-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-normal tracking-tight leading-none text-white">CRÉER UN ÉVÉNEMENT</h1>
              <p className="text-xs text-white/60 font-bold">PUBLICATION D&apos;UN NOUVEL ÉVÉNEMENT</p>
            </div>
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/15 text-white w-fit shadow-xs">
              ÉTAPE {step} SUR 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 font-grotesque">
            {stepsMeta.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isPassed = step > s.number;
              return (
                <div
                  key={s.number}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-white text-black border-white shadow-md font-bold"
                      : isPassed
                      ? "bg-neutral-900 border-white/15 text-white"
                      : "bg-neutral-900/50 border-white/10 opacity-50 text-white/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-white"}`} />
                  <div className="overflow-hidden hidden sm:block">
                    <p className="text-xs font-bold truncate">{s.title}</p>
                    <p className={`text-[10px] truncate ${isActive ? "text-black/70" : "text-white/50"}`}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-white/30 bg-neutral-900 px-5 py-3 text-xs text-white font-bold tracking-wider shadow-xs">
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 md:p-8 shadow-xs transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-5 font-grotesque">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xs font-bold text-white">DÉTAILS GÉNÉRAUX</h2>
                  <p className="text-[11px] text-white/50">DÉFINISSEZ LE NOM, LA DESCRIPTION ET LA LOCALISATION.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-bold">TITRE *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="NOM DE L'ÉVÉNEMENT"
                    className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-bold">DESCRIPTION</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="DÉCRIVEZ VOTRE ÉVÉNEMENT..."
                    className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors resize-none shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-bold">LIEU / ADRESSE *</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-4 h-4 w-4 text-white pointer-events-none" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="ADRESSE OU NOM DU LIEU"
                      className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 pl-11 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 font-grotesque">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xs font-bold text-white">DATES & BILLETTERIE</h2>
                  <p className="text-[11px] text-white/50">INDIQUEZ LES HORAIRES ET LES CONDITIONS TARIFAIRES.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 font-bold">DÉBUT *</label>
                    <input
                      type="datetime-local"
                      name="starts_at"
                      value={form.starts_at}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors shadow-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 font-bold">FIN</label>
                    <input
                      type="datetime-local"
                      name="ends_at"
                      value={form.ends_at}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 font-bold">PRIX (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors shadow-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/60 font-bold">JAUGE MAX</label>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="EX: 150"
                      className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 font-grotesque">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xs font-bold text-white">VISUEL DE L&apos;ÉVÉNEMENT</h2>
                  <p className="text-[11px] text-white/50">TÉLÉCHARGEZ UNE IMAGE DE COUVERTURE OU INDIQUEZ UNE URL.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/60 font-bold">FICHIER IMAGE (RECOMMANDÉ)</label>
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/20 rounded-2xl bg-neutral-950 hover:border-white transition cursor-pointer shadow-xs">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-white mb-2" />
                          <p className="text-xs text-white/60">TÉLÉCHARGEMENT EN COURS...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-white mb-2" />
                          <p className="text-xs font-bold text-white mb-1">CLIQUEZ POUR SÉLECTIONNER UN FICHIER</p>
                          <p className="text-[10px] text-white/40">PNG, JPG, WEBP (MAX. 5MO)</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs text-white/60 font-bold">OU URL DE L&apos;IMAGE</label>
                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-white/15 bg-neutral-950 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-xs"
                  />
                </div>

                {form.image_url && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/20 h-48 bg-neutral-950 relative shadow-xs">
                    <img src={form.image_url} alt="APERÇU" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-8 font-grotesque">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-neutral-900 hover:bg-neutral-800 px-5 py-3 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>PRÉCÉDENT</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold text-black transition-all hover:bg-neutral-200 ml-auto cursor-pointer shadow-lg"
                >
                  <span>SUIVANT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold text-black transition-all hover:bg-neutral-200 disabled:opacity-50 ml-auto cursor-pointer shadow-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{loading ? 'CRÉATION...' : "CRÉER L'ÉVÉNEMENT"}</span>
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

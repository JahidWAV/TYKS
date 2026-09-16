'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, MapPin, FileText, Calendar, Euro, Loader2, Upload, Image as ImageIcon, Clock } from 'lucide-react';
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
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
      setError("❌ OUPSS ! IL MANQUE LE TITRE OU LE LIEU DE L'ÉVÉNEMENT.");
      return;
    }
    if (step === 2) {
      if (!form.starts_at || !form.ends_at) {
        setError("❌ IL FAUT IMPÉRATIVEMENT METTRE UNE HEURE DE DÉBUT ET UNE HEURE DE FIN !");
        return;
      }
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

      // CORRECTION DU DÉCALAGE HORAIRE : Force JavaScript à interpréter l'heure comme locale
      const toLocalISOString = (dateTimeLocalString: string) => {
        if (!dateTimeLocalString) return '';
        const [datePart, timePart] = dateTimeLocalString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        
        const localDate = new Date(year, month - 1, day, hours, minutes);
        return localDate.toISOString();
      };

      const payload = {
        ...form,
        starts_at: toLocalISOString(form.starts_at),
        ends_at: toLocalISOString(form.ends_at),
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ERREUR LORS DE LA CRÉATION DE L'ÉVÉNEMENT.");
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "UNE ERREUR EST SURVENUE.");
    } finally {
      setLoading(false);
    }
  }

  const stepsMeta = [
    { number: 1, title: "1. LES BASES", icon: FileText, desc: "NOM & LIEU" },
    { number: 2, title: "2. HORAIRES & PRIX", icon: Clock, desc: "DÉBUT, FIN & TARIF" },
    { number: 3, title: "3. PHOTO", icon: ImageIcon, desc: "IMAGE" },
  ];

  return (
    <div className="w-full px-4 lg:px-12 py-8 space-y-8 font-grotesque text-white bg-[#0f0f0f] min-h-screen uppercase">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white bg-neutral-900 px-4 py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>← RETOUR AU TABLEAU DE BORD</span>
          </Link>
        </div>

        <div className="space-y-6 pb-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-5xl font-normal tracking-tight leading-none text-white">CRÉER UN ÉVÉNEMENT</h1>
              <p className="text-sm text-white/70 font-bold">LAISSEZ-VOUS GUIDER ÉTAPE PAR ÉTAPE</p>
            </div>
            <span className="text-sm font-bold px-4 py-2 rounded-2xl bg-white text-black w-fit shadow-md">
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
                      ? "bg-white text-black border-white shadow-lg font-bold scale-105"
                      : isPassed
                      ? "bg-neutral-900 border-white/30 text-white"
                      : "bg-neutral-900/50 border-white/10 opacity-60 text-white/60"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-black" : "text-white"}`} />
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm font-bold truncate">{s.title}</p>
                    <p className={`text-[10px] truncate ${isActive ? "text-black/75" : "text-white/50"}`}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-red-500 bg-red-950/80 px-6 py-4 text-sm text-white font-bold tracking-wider shadow-lg animate-bounce">
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-3xl border-2 border-white/20 bg-neutral-900 p-6 md:p-10 shadow-2xl transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-6 font-grotesque">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-base font-bold text-white">QU'EST-CE QUE C'EST ?</h2>
                  <p className="text-xs text-white/60">DONNEZ UN TITRE CLAIR ET INDIQUEZ OÙ ÇA SE PASSE.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white font-bold flex items-center justify-between">
                    <span>TITRE DE L&apos;ÉVÉNEMENT *</span>
                    <span className="text-[10px] text-white/40">OBLIGATOIRE</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="EX : CONCERT DE ROCK, ANNIVERSAIRE..."
                    className="w-full rounded-2xl border-2 border-white/20 bg-neutral-950 px-5 py-4 text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-inner font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white font-bold">PETITE DESCRIPTION (OPTIONNEL)</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="EXPLIQUEZ EN QUELQUES MOTS CE QUI VA S'Y PASSER..."
                    className="w-full rounded-2xl border-2 border-white/20 bg-neutral-950 px-5 py-4 text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors resize-none shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white font-bold flex items-center justify-between">
                    <span>LIEU OU ADRESSE *</span>
                    <span className="text-[10px] text-white/40">OBLIGATOIRE</span>
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-4 h-5 w-5 text-white pointer-events-none" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="EX : 12 RUE DE LA PAIX, PARIS"
                      className="w-full rounded-2xl border-2 border-white/20 bg-neutral-950 px-5 py-4 pl-12 text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-inner font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 font-grotesque">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-base font-bold text-white">QUAND ET COMBIEN ?</h2>
                  <p className="text-xs text-white/60">INDIQUEZ BIEN L'HEURE DE DÉBUT ET DE FIN POUR QUE TOUT LE MONDE SACHE.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-950 p-6 rounded-2xl border-2 border-white/20">
                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span>DÉBUT (HEURE DE LANCEMENT) *</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="starts_at"
                      value={form.starts_at}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-white/30 bg-neutral-900 px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span>FIN (HEURE DE SORTIE) *</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="ends_at"
                      value={form.ends_at}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-white/30 bg-neutral-900 px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold">PRIX DU BILLET (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-white/20 bg-neutral-950 px-5 py-4 text-base font-bold text-white focus:outline-none focus:border-white transition-colors shadow-inner"
                    />
                    <p className="text-[10px] text-white/50">Mettez 0 si c'est gratuit.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold">NOMBRE DE PLACES MAX (OPTIONNEL)</label>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="EX: 100"
                      className="w-full rounded-2xl border-2 border-white/20 bg-neutral-950 px-5 py-4 text-base font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 font-grotesque">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-base font-bold text-white">AJOUTER UNE IMAGE</h2>
                  <p className="text-xs text-white/60">CHOISISSEZ UNE BELLE PHOTO POUR ILLUSTRER VOTRE ÉVÉNEMENT.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white font-bold">CLIQUEZ POUR CHOISIR UNE PHOTO DEPUIS VOTRE APPAREIL</label>
                  <label className="flex flex-col items-center justify-center w-full h-44 border-3 border-dashed border-white/30 rounded-2xl bg-neutral-950 hover:border-white transition cursor-pointer shadow-inner">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                          <p className="text-sm font-bold text-white">CHARGEMENT DE LA PHOTO...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-white mb-3" />
                          <p className="text-sm font-bold text-white mb-1">APPUYEZ ICI POUR IMPORTER UNE IMAGE</p>
                          <p className="text-xs text-white/50">FORMATS ACCEPTÉS : JPG, PNG, WEBP</p>
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

                {form.image_url && (
                  <div className="mt-4 rounded-2xl overflow-hidden border-2 border-white/30 h-56 bg-neutral-950 relative shadow-md">
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
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-neutral-900 hover:bg-neutral-800 px-6 py-4 text-sm font-bold text-white transition-all cursor-pointer shadow-md"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>PRÉCÉDENT</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:bg-neutral-200 ml-auto cursor-pointer shadow-xl scale-105"
                >
                  <span>ÉTAPE SUIVANTE</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:bg-neutral-200 disabled:opacity-50 ml-auto cursor-pointer shadow-xl scale-105"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  <span>{loading ? 'CRÉATION EN COURS...' : "PUBLIER L'ÉVÉNEMENT 🎉"}</span>
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

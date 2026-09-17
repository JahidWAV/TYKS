'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, MapPin, Loader2, Upload, X, ZoomIn, Clock, DollarSign, Users, FileText } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { supabaseBrowser } from '@/lib/supabase-browser';

async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Impossible d\'initialiser le contexte canvas');
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    status: 'published',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropperModal, setShowCropperModal] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowCropperModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      setUploading(true);
      setError(null);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const tempSlug = form.title 
        ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
        : 'event';

      const file = new File([croppedBlob], `${tempSlug}-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', tempSlug);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      const uploadedUrl = data.url || data.imageUrl || data.fileUrl;
      if (!uploadedUrl) {
        throw new Error("L'API n'a pas renvoyé d'URL valide.");
      }

      setForm((prev) => ({ ...prev, image_url: uploadedUrl }));
      setShowCropperModal(false);
      setImageSrc(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload de l'image.");
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!form.image_url) {
        setError("L'affiche de l'événement est obligatoire.");
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) {
        setError("Vous devez être connecté.");
        setLoading(false);
        return;
      }

      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        price: parseFloat(form.price) || 0,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        image_url: form.image_url,
        status: 'published',
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
        throw new Error(data.error || "Erreur lors de la création de l'événement.");
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full min-h-screen bg-[#0f0f0f] text-white font-grotesque flex flex-col p-8 lg:p-12 overflow-hidden">
      <div className="w-full flex-1 flex flex-col justify-between space-y-6 max-w-[1600px] mx-auto">
        
        {/* En-tête visible et bien dimensionné */}
        <div className="flex items-center justify-between shrink-0 pb-4 border-b border-white/10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wider bg-neutral-900 px-5 py-3 rounded-2xl border border-white/10 shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au tableau de bord</span>
          </Link>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white uppercase">Créer un événement</h1>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/60 px-6 py-4 text-sm text-red-300 font-bold shrink-0 shadow-lg">
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire grand format en 2 colonnes parfaitement proportionnées */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Colonne Gauche */}
            <div className="space-y-6 bg-neutral-900/60 border border-white/15 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white/70" /> Titre de l&apos;événement *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Concert exceptionnel"
                    className="w-full rounded-2xl border-2 border-white/20 bg-black px-5 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/70" /> Lieu / Adresse *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Le Zénith, Paris"
                    className="w-full rounded-2xl border-2 border-white/20 bg-black px-5 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/70" /> Début *
                    </label>
                    <input
                      type="datetime-local"
                      name="starts_at"
                      value={form.starts_at}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-4 text-sm text-white focus:outline-none focus:border-white transition-colors shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/70" /> Fin
                    </label>
                    <input
                      type="datetime-local"
                      name="ends_at"
                      value={form.ends_at}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-white/20 bg-black px-4 py-4 text-sm text-white focus:outline-none focus:border-white transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-white/70" /> Prix (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-white/20 bg-black px-5 py-4 text-base text-white focus:outline-none focus:border-white transition-colors shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-white/70" /> Jauge max
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="Illimitée"
                      className="w-full rounded-2xl border-2 border-white/20 bg-black px-5 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Droite */}
            <div className="space-y-6 bg-neutral-900/60 border border-white/15 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
              <div className="space-y-4 flex-1 flex flex-col">
                <label className="text-sm text-white font-bold uppercase tracking-wider">Description de l&apos;événement</label>
                <textarea
                  name="description"
                  rows={7}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Détails, programme, informations importantes..."
                  className="w-full flex-1 rounded-2xl border-2 border-white/20 bg-black p-5 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors resize-none shadow-inner"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm text-white font-bold uppercase tracking-wider">Affiche de l&apos;événement (Carré 1:1) *</label>
                <div className="flex items-center gap-5">
                  {form.image_url ? (
                    <div className="relative w-28 h-28 rounded-2xl border-2 border-white/30 overflow-hidden bg-black shrink-0 shadow-lg">
                      <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-white/30 bg-black flex items-center justify-center text-white/30 shrink-0">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-16 px-6 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold uppercase tracking-wider rounded-2xl border-2 border-white/20 transition-colors inline-flex items-center gap-3 cursor-pointer w-full justify-center shadow-md"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{form.image_url ? 'Changer l\'image' : 'Importer une affiche'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end pt-4 shrink-0">
            <button
              type="submit"
              disabled={loading || uploading || !form.image_url}
              className="h-16 px-12 bg-white hover:bg-neutral-200 text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-3 rounded-full shadow-2xl disabled:opacity-50 cursor-pointer justify-center w-full lg:w-auto"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              <span>{loading ? 'Création en cours...' : 'Publier l\'événement'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de recadrage */}
      {showCropperModal && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#141414] border-2 border-white/20 w-full max-w-xl rounded-[2.5rem] p-8 space-y-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Recadrer l&apos;image (Carré 1:1)</h3>
              <button
                onClick={() => { setShowCropperModal(false); setImageSrc(null); }}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-96 bg-black rounded-3xl overflow-hidden border-2 border-white/15 shadow-inner">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1 / 1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-white/80 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2"><ZoomIn className="w-5 h-5" /> Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom de l'image"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-white cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => { setShowCropperModal(false); setImageSrc(null); }}
                className="h-14 px-8 bg-transparent hover:bg-white/5 border-2 border-white/25 text-white font-bold text-sm uppercase tracking-wider rounded-full transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={handleConfirmCrop}
                className="h-14 px-10 bg-white hover:bg-neutral-200 text-black font-extrabold text-sm uppercase tracking-wider rounded-full transition-all shadow-xl flex items-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>Valider le recadrage</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

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
    <main className="w-full h-full min-h-[calc(100vh-2rem)] bg-[#0f0f0f] text-white font-grotesque flex flex-col p-6 overflow-hidden">
      <div className="w-full h-full flex flex-col justify-between space-y-4 max-w-7xl mx-auto">
        
        {/* En-tête plein écran */}
        <div className="flex items-center justify-between shrink-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider bg-neutral-900 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <h1 className="text-base md:text-lg font-bold tracking-tight text-white uppercase">Créer un événement</h1>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-950/40 px-4 py-2 text-xs text-red-400 font-bold shrink-0">
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire plein écran en 2 colonnes bien réparties */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
            
            {/* Colonne Gauche */}
            <div className="space-y-4 bg-neutral-900/40 border border-white/10 p-6 rounded-3xl backdrop-blur-sm h-full flex flex-col justify-around">
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Titre *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Concert exceptionnel"
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Lieu / Adresse *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Le Zénith, Paris"
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Début *
                  </label>
                  <input
                    type="datetime-local"
                    name="starts_at"
                    value={form.starts_at}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Fin
                  </label>
                  <input
                    type="datetime-local"
                    name="ends_at"
                    value={form.ends_at}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Jauge max
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="Illimitée"
                    className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Colonne Droite */}
            <div className="space-y-6 bg-neutral-900/40 border border-white/10 p-6 rounded-3xl backdrop-blur-sm h-full flex flex-col justify-between">
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  rows={6}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Détails de l'événement..."
                  className="w-full flex-1 rounded-xl border border-white/15 bg-black p-4 text-sm text-white focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Affiche (Carré 1:1) *</label>
                <div className="flex items-center gap-4">
                  {form.image_url ? (
                    <div className="relative w-20 h-20 rounded-2xl border border-white/15 overflow-hidden bg-black shrink-0">
                      <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border border-dashed border-white/20 bg-black flex items-center justify-center text-white/30 shrink-0">
                      <Upload className="w-6 h-6" />
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
                      className="h-12 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/15 transition-colors inline-flex items-center gap-2 cursor-pointer w-full justify-center"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{form.image_url ? 'Changer l\'image' : 'Importer une affiche'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end pt-2 shrink-0">
            <button
              type="submit"
              disabled={loading || uploading || !form.image_url}
              className="h-12 px-10 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2 rounded-full shadow-lg disabled:opacity-50 cursor-pointer justify-center w-full md:w-auto"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{loading ? 'Création...' : 'Publier l\'événement'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de recadrage */}
      {showCropperModal && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/15 w-full max-w-md rounded-[2rem] p-6 space-y-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recadrer l&apos;image (Carré 1:1)</h3>
              <button
                onClick={() => { setShowCropperModal(false); setImageSrc(null); }}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full h-72 bg-black rounded-2xl overflow-hidden border border-white/10">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><ZoomIn className="w-4 h-4" /> Zoom</span>
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
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowCropperModal(false); setImageSrc(null); }}
                className="h-10 px-5 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={handleConfirmCrop}
                className="h-10 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Valider</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

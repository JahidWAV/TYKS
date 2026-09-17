'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, MapPin, Loader2, Upload, X, ZoomIn } from 'lucide-react';
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

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventSlug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const { data, error } = await supabaseBrowser
          .from('events')
          .select('*')
          .eq('slug', eventSlug)
          .single();

        if (error) throw error;

        if (data) {
          setForm({
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            starts_at: data.starts_at ? data.starts_at.slice(0, 16) : '',
            ends_at: data.ends_at ? data.ends_at.slice(0, 16) : '',
            price: String(data.price || data.ticket_price || 0),
            capacity: data.capacity ? String(data.capacity) : '',
            image_url: data.image_url || '',
            status: data.status || 'published',
          });
        }
      } catch (err: any) {
        setError("Impossible de charger l'événement.");
      } finally {
        setLoading(false);
      }
    }

    if (eventSlug) {
      fetchEvent();
    }
  }, [eventSlug]);

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
      setSaving(true);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `event-${Date.now()}.jpg`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabaseBrowser.storage
        .from('events')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseBrowser.storage
        .from('events')
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: publicUrlData.publicUrl }));
      setShowCropperModal(false);
      setImageSrc(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload de l'image.");
    } finally {
      setSaving(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) {
        setError("Vous devez être connecté.");
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabaseBrowser
        .from('events')
        .update({
          title: form.title,
          description: form.description,
          location: form.location,
          starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
          ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
          price: parseFloat(form.price) || 0,
          capacity: form.capacity ? parseInt(form.capacity, 10) : null,
          image_url: form.image_url,
          status: form.status,
        })
        .eq('slug', eventSlug);

      if (updateError) throw updateError;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white/50 font-grotesque text-xs uppercase tracking-widest flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black py-12 font-grotesque antialiased">
      <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au tableau de bord</span>
          </Link>
        </div>

        <div className="space-y-2 pb-6 border-b border-white/10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Modifier l&apos;événement</h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Mise à jour des informations</p>
        </div>

        {error && (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-950/40 px-5 py-3 text-xs text-red-400 font-bold">
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-[2.5rem] border border-white/15 bg-[#0a0a0a] p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Titre *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Lieu / Adresse *</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 h-4 w-4 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 pl-11 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Début *</label>
                  <input
                    type="datetime-local"
                    name="starts_at"
                    value={form.starts_at}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-grotesque transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Fin</label>
                  <input
                    type="datetime-local"
                    name="ends_at"
                    value={form.ends_at}
                    onChange={handleChange}
                    className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-grotesque transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-grotesque transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Jauge max</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-grotesque transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Statut</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-[1.5rem] border border-white/15 bg-black px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-grotesque transition-colors"
                  >
                    <option value="published" className="bg-black text-white">Publié</option>
                    <option value="draft" className="bg-black text-white">Brouillon</option>
                    <option value="cancelled" className="bg-black text-white">Annulé</option>
                  </select>
                </div>
              </div>

              {/* Upload image + aperçu */}
              <div className="space-y-2">
                <label className="text-xs text-white/70 font-bold uppercase tracking-wider">Affiche de l&apos;événement (Format Carré)</label>
                <div className="flex items-center gap-4">
                  {form.image_url ? (
                    <div className="relative w-20 h-20 rounded-[1.25rem] border border-white/15 overflow-hidden bg-black shrink-0">
                      <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-[1.25rem] border border-dashed border-white/20 bg-black flex items-center justify-center text-white/30 shrink-0">
                      <Upload className="w-5 h-5" />
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
                      className="h-10 px-5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/15 transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.image_url ? 'Changer l\'image' : 'Télécharger une image'}</span>
                    </button>
                    <p className="text-[10px] text-white/40 mt-1.5 font-bold uppercase">
                      L&apos;outil de recadrage s&apos;ouvrira pour ajuster l&apos;image au format carré 1:1.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="h-12 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2 rounded-full shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de recadrage */}
      {showCropperModal && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/15 w-full max-w-xl rounded-[2.5rem] p-6 space-y-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recadrer l&apos;image (Carré 1:1)</h3>
              <button
                onClick={() => { setShowCropperModal(false); setImageSrc(null); }}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full h-80 bg-black rounded-[1.5rem] overflow-hidden border border-white/10">
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
                className="h-10 px-6 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmCrop}
                className="h-10 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Valider le recadrage</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

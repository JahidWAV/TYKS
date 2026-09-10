'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, MapPin, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

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
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] selection:bg-[#111110] selection:text-[#F7F5F0] py-12">
      <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au tableau de bord</span>
          </Link>
        </div>

        <div className="space-y-2 pb-6 border-b border-[#111110]/10">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Modifier l&apos;événement</h1>
          <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Mise à jour des informations</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs text-red-600">
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-3xl border border-[#111110]/15 bg-white/70 p-6 md:p-8 backdrop-blur-md shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono opacity-60">Titre *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
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
                    required
                    className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 pl-11 text-xs focus:outline-none focus:border-[#111110]/65 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono opacity-60">Début *</label>
                  <input
                    type="datetime-local"
                    name="starts_at"
                    value={form.starts_at}
                    onChange={handleChange}
                    required
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 font-mono transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono opacity-60">Statut</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 font-mono transition-colors"
                  >
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono opacity-60">URL de l&apos;image</label>
                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/65 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-[#111110]/10">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-6 py-2.5 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

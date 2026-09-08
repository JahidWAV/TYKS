'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Save, Trash2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    status: 'draft',
  });

  const loadEvent = useCallback(async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      if (!data) {
        setError('Événement introuvable.');
        return;
      }

      setForm({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        starts_at: data.starts_at ? new Date(data.starts_at).toISOString().slice(0, 16) : '',
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 16) : '',
        price: data.price?.toString() || '0',
        capacity: data.capacity?.toString() || '',
        image_url: data.image_url || '',
        status: data.status || 'draft',
      });
    } catch (err: any) {
      setError(err.message || 'Impossible de charger cet événement.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabaseBrowser
        .from('events')
        .update(form)
        .eq('id', eventId);

      if (error) {
        setError(error.message || 'Erreur lors de la mise à jour.');
        return;
      }

      router.push('/organisateur');
      router.refresh();
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Es-tu sûr de vouloir supprimer définitivement cet événement ?')) return;
    setDeleting(true);
    try {
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      router.push('/organisateur');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-onyx text-bone flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-cobalt/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx bg-night-glow text-bone pt-8 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/organisateur"
            className="inline-flex items-center gap-2 text-xs text-bone-faint hover:text-bone transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer l'événement</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-bone">Modifier l'événement</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Statut de publication</h2>
            <div>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
              >
                <option value="draft">Brouillon (non visible des clients)</option>
                <option value="published">Publié (visible et disponible à la vente)</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Détails généraux</h2>
            <div>
              <label className="block text-xs text-bone-faint mb-1.5">Titre *</label>
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-bone-faint mb-1.5">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-bone-faint mb-1.5">Lieu / Adresse *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-bone-faint absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="location"
                  required
                  value={form.location}
                  onChange={handleChange}
                  className="w-full bg-onyx border border-onyx-line rounded-xl pl-10 pr-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Dates & Billetterie</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Début *</label>
                <input
                  type="datetime-local"
                  name="starts_at"
                  required
                  value={form.starts_at}
                  onChange={handleChange}
                  className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Fin</label>
                <input
                  type="datetime-local"
                  name="ends_at"
                  value={form.ends_at}
                  onChange={handleChange}
                  className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Jauge max</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-cobalt hover:bg-cobalt-soft text-bone font-semibold px-7 py-3 rounded-full transition-colors text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

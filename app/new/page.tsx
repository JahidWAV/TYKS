'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, MapPin } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function NewEventPage() {
  const router = useRouter();
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

      router.push('/organisateur');
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-onyx bg-night-glow text-bone pt-8 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-6">
          <Link
            href="/organisateur"
            className="inline-flex items-center gap-2 text-xs text-bone-faint hover:text-bone transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-bone">Créer un événement</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Nom de l'événement"
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
                placeholder="Décrivez votre événement..."
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
                  placeholder="Adresse ou nom du lieu"
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
                  placeholder="Ex: 150"
                  className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-cobalt/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-cobalt hover:bg-cobalt-soft text-bone font-semibold px-7 py-3 rounded-full transition-colors text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Création...' : "Créer l'événement"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

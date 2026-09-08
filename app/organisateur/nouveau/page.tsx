'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Euro, Users, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();

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
      const token = await getAccessToken();
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la création de l'événement.");
        return;
      }

      router.push('/organisateur');
      router.refresh();
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-onyx text-bone pt-8 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/organisateur"
          className="inline-flex items-center gap-2 text-xs text-bone-faint hover:text-bone transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-bone">Créer un événement</h1>
          <p className="text-sm text-bone-faint mt-1">
            Remplis les détails ci-dessous pour publier ton pass sur TYKS.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Détails généraux</h2>
            
            <div>
              <label className="block text-xs text-bone-faint mb-1.5">Titre de l'événement *</label>
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Ex : Nuit Blanche Electro #4"
                className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-bone-faint mb-1.5">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Présentation du lineup, ambiance, consignes d'accès..."
                className="w-full bg-onyx border border-onyx-line rounded-xl px-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors resize-none"
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
                  placeholder="Ex : Le Rex Club, 5 Bd Poissonnière, 75002 Paris"
                  className="w-full bg-onyx border border-onyx-line rounded-xl pl-10 pr-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Dates & Horaires */}
          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Dates & Horaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Début de l'événement *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-bone-faint absolute left-3.5 top-3.5" />
                  <input
                    type="datetime-local"
                    name="starts_at"
                    required
                    value={form.starts_at}
                    onChange={handleChange}
                    className="w-full bg-onyx border border-onyx-line rounded-xl pl-10 pr-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Fin de l'événement</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-bone-faint absolute left-3.5 top-3.5" />
                  <input
                    type="datetime-local"
                    name="ends_at"
                    value={form.ends_at}
                    onChange={handleChange}
                    className="w-full bg-onyx border border-onyx-line rounded-xl pl-10 pr-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billetterie */}
          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Billetterie & Jauge</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Prix du Pass (€)</label>
                <div className="relative">
                  <Euro className="w-4 h-4 text-bone-faint absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0 pour gratuit"
                    className="w-full bg-onyx border border-onyx-line rounded-xl pl-10 pr-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-bone-faint mb-1.5">Jauge max (places)</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-bone-faint absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="Ex : 500"
                    className="w-full bg-onyx border border-onyx-line rounded-xl pl-10 pr-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visuel */}
          <div className="bg-onyx-raised border border-onyx-line rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-bone border-b border-onyx-line pb-3">Affiche / Image</h2>
            <div>
              <label className="block text-xs text-bone-faint mb-1.5">URL de l'image de couverture</label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-bone-faint absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-onyx border border-onyx-line rounded-xl pl-10 pr-4 py-3 text-sm text-bone outline-none focus:border-bone/40 transition-colors"
                />
              </div>
            </div>

            {form.image_url && (
              <div className="mt-4 rounded-xl overflow-hidden border border-onyx-line max-h-48">
                <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/organisateur"
              className="px-5 py-3 rounded-full text-xs font-semibold text-bone-muted hover:text-bone transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-bone hover:bg-white text-onyx font-semibold px-7 py-3 rounded-full transition-colors text-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Création...' : 'Publier le brouillon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

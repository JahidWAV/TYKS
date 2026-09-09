import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PublicEventPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = params;

  // Récupérer l'événement publié par son slug
  const { data: event, error } = await supabaseServer
    .from('events')
    .select('*, organizations(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-onyx text-bone px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-bone-faint hover:text-bone transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </Link>

        {/* En-tête */}
        <div className="space-y-3">
          <p className="font-mono text-xs text-bone-faint uppercase tracking-wider">
            {event.organizations?.name || 'Organisateur'}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-bone md:text-5xl">
            {event.title}
          </h1>
        </div>

        {/* Infos clés */}
        <div className="flex flex-wrap gap-6 py-4 border-y border-onyx-line text-xs font-mono text-bone-muted">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-bone-faint" />
            <span>
              {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-bone-faint" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="text-sm leading-relaxed text-bone-muted whitespace-pre-line">
            {event.description}
          </div>
        )}

        {/* Bloc Billetterie */}
        <div className="rounded-2xl border border-onyx-line bg-onyx-raised p-6 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs text-bone-faint">Tarif</p>
            <p className="font-display text-2xl font-bold text-bone">
              {Number(event.price) === 0 ? 'Gratuit' : `${event.price} €`}
            </p>
          </div>
          <button className="rounded-full bg-bone px-7 py-3 text-sm font-semibold text-onyx transition hover:bg-white">
            Réserver ma place
          </button>
        </div>
      </div>
    </main>
  );
}

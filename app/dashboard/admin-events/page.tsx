import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket } from 'lucide-react';
import Link from 'next/link';

interface PublicEventPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = params;

  const { data: event, error } = await supabaseServer
    .from('events')
    .select('*, organizations(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const formattedDate = startDate
    ? startDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const formattedTime = startDate
    ? startDate.toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const priceFormatted = Number(event.price) === 0 ? 'Gratuit' : `${event.price} €`;

  return (
    <main className="min-h-screen bg-[#0a0b0e] text-white px-6 md:px-12 py-12 md:py-20 flex flex-col justify-between font-sans">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Navigation & Fil d'Ariane */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6 font-mono">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;agenda</span>
          </Link>
          <span className="text-xs uppercase tracking-widest text-[#E5D4B4] font-bold">
            {event.organizations?.name || 'Organisateur Indépendant'}
          </span>
        </div>

        {/* Grille principale */}
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-20 items-start">
          
          {/* Colonne gauche */}
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="inline-block text-xs font-mono px-3 py-1.5 rounded-full border border-neutral-800 bg-[#14171f] text-[#E5D4B4] uppercase tracking-widest font-bold">
                Événement officiel
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.02] text-white">
                {event.title}
              </h1>
            </div>

            {/* Lignes d'informations métadonnées */}
            <div className="border-t border-b border-neutral-800 py-6 space-y-4 font-mono text-xs text-neutral-300">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#E5D4B4]" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#E5D4B4]" />
                <span>Ouverture des portes à {formattedTime}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#E5D4B4]" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">À propos</h3>
              {event.description ? (
                <div className="text-base text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 italic font-light">Aucune description détaillée fournie.</p>
              )}
            </div>
          </div>

          {/* Colonne droite : Carte de billetterie */}
          <div className="rounded-2xl bg-[#14171f] border border-neutral-800 text-white p-8 md:p-10 space-y-8 sticky top-8 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Tarif unique</span>
              <Ticket className="w-5 h-5 text-[#E5D4B4]" />
            </div>

            <div className="space-y-2">
              <p className="text-5xl font-bold tracking-tight text-white">
                {priceFormatted}
              </p>
              <p className="text-xs text-neutral-500">Taxes et frais de service inclus</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-800 text-xs text-neutral-300 font-light">
              <div className="flex justify-between">
                <span>Format</span>
                <span className="text-white font-bold">Pass numérique instantané</span>
              </div>
              <div className="flex justify-between">
                <span>Politique</span>
                <span className="text-white font-bold">Garantie salle</span>
              </div>
            </div>

            <button className="w-full rounded-xl bg-[#E5D4B4] text-black py-4 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <span>Réserver ma place</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-neutral-500">
              Paiement direct · Soutien aux artistes et lieux
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

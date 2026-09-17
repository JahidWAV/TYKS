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
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-12 md:py-20 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Navigation & Fil d'Ariane */}
        <div className="flex items-center justify-between border-b border-[#111110]/10 pb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/50 hover:text-[#111110] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'agenda</span>
          </Link>
          <span className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">
            {event.organizations?.name || 'Organisateur Indépendant'}
          </span>
        </div>

        {/* Grille principale inspirée de la DA */}
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-20 items-start">
          
          {/* Colonne gauche : Titre & Description éditoriale */}
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="inline-block text-xs font-mono px-3 py-1 rounded-full border border-[#111110]/20 text-[#111110]/70 uppercase tracking-widest">
                Événement officiel
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.02]">
                {event.title}
              </h1>
            </div>

            {/* Lignes d'informations métadonnées */}
            <div className="border-t border-b border-[#111110]/10 py-6 space-y-4 font-mono text-xs text-[#111110]/70">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#111110]/40" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#111110]/40" />
                <span>Ouverture des portes à {formattedTime}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#111110]/40" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">À propos</h3>
              {event.description ? (
                <div className="text-base text-[#111110]/80 font-light leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              ) : (
                <p className="text-sm text-[#111110]/40 italic font-light">Aucune description détaillée fournie.</p>
              )}
            </div>
          </div>

          {/* Colonne droite : Carte de billetterie style "Onyx Box" */}
          <div className="rounded-2xl bg-[#111110] text-[#F7F5F0] p-8 md:p-10 space-y-8 sticky top-8 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-[#F7F5F0]/10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/50">Tarif unique</span>
              <Ticket className="w-5 h-5 text-[#F7F5F0]/40" />
            </div>

            <div className="space-y-2">
              <p className="font-display text-5xl font-bold tracking-tight">
                {priceFormatted}
              </p>
              <p className="text-xs font-mono text-[#F7F5F0]/50">Taxes et frais de service inclus</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#F7F5F0]/10 text-xs text-[#F7F5F0]/70 font-light">
              <div className="flex justify-between">
                <span>Format</span>
                <span className="font-mono text-[#F7F5F0]">Pass numérique instantané</span>
              </div>
              <div className="flex justify-between">
                <span>Politique</span>
                <span className="font-mono text-[#F7F5F0]">Garantie salle</span>
              </div>
            </div>

            <button className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
              <span>Réserver ma place</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-[#F7F5F0]/40 font-mono">
              Paiement direct · Soutien aux artistes et lieux
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface PublicEventPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = params;

  // Récupérer l'événement publié par son slug avec son organisation
  const { data: event, error } = await supabaseServer
    .from('events')
    .select('*, organizations(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  const formattedDate = event.starts_at
    ? new Date(event.starts_at).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const priceFormatted = Number(event.price) === 0 ? 'Gratuit' : `${event.price} €`;

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation retour */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/50 hover:text-[#111110] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'agenda</span>
        </Link>

        {/* En-tête de l'événement */}
        <div className="space-y-6 pb-12 border-b border-[#111110]/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs font-mono px-3 py-1 rounded-full border border-[#111110]/15 text-[#111110]/70 uppercase tracking-widest">
              {event.organizations?.name || 'Organisateur Indépendant'}
            </span>
            <span className="text-xs font-mono font-semibold text-[#111110]/60 uppercase tracking-wider">
              Événement officiel TYKS
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            {event.title}
          </h1>

          {/* Infos clés (Date & Lieu) */}
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#111110]/10">
              <Calendar className="w-5 h-5 text-[#111110]/40 shrink-0" />
              <span className="text-sm font-mono capitalize">{formattedDate}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#111110]/10">
                <MapPin className="w-5 h-5 text-[#111110]/40 shrink-0" />
                <span className="text-sm font-mono">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Corps de la page : Description + Bloc Billetterie */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          
          {/* Description détaillée */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/50">À propos de l'événement</h3>
            {event.description ? (
              <div className="text-base text-[#111110]/80 font-light leading-relaxed whitespace-pre-line space-y-4">
                {event.description}
              </div>
            ) : (
              <p className="text-sm text-[#111110]/40 italic">Aucune description détaillée fournie pour cet événement.</p>
            )}
          </div>

          {/* Encadré / Widget de réservation minimaliste */}
          <div className="rounded-2xl bg-[#111110] text-[#F7F5F0] p-8 space-y-8 sticky top-8 shadow-xl">
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-[#F7F5F0]/50">Tarif unique</p>
              <p className="font-display text-4xl font-bold tracking-tight">
                {priceFormatted}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#F7F5F0]/10 text-xs text-[#F7F5F0]/70 font-light">
              <div className="flex justify-between">
                <span>Frais de service</span>
                <span className="font-mono text-[#F7F5F0]">0,00 € (Inclus)</span>
              </div>
              <div className="flex justify-between">
                <span>Accès</span>
                <span className="font-mono text-[#F7F5F0]">Pass numérique instantané</span>
              </div>
            </div>

            <button className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] flex items-center justify-center gap-2">
              <span>Réserver ma place</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-[#F7F5F0]/40 font-mono">
              Paiement sécurisé · Zéro commission cachée
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

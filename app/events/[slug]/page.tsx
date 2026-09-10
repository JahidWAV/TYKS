import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, ShieldCheck } from 'lucide-react';
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
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const formattedTime = startDate
    ? startDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const priceFormatted = Number(event.price) === 0 ? 'Gratuit' : `${event.price} €`;

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-8 md:py-12 flex flex-col justify-between selection:bg-[#111110] selection:text-[#F7F5F0]">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
        {/* Navigation & Organisateur */}
        <div className="flex items-center justify-between border-b border-[#111110]/10 pb-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/60 hover:text-[#111110] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Retour à l'agenda</span>
          </Link>
          <span className="text-xs font-mono uppercase tracking-widest text-[#111110]/60">
            {event.organizations?.name || 'Organisateur Indépendant'}
          </span>
        </div>

        {/* Grille principale compacte */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-start">
          
          {/* Colonne gauche : Visuel optionnel, Titre & Description */}
          <div className="space-y-6">
            
            {event.image_url && (
              <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-[#111110]/10 shadow-sm">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                {event.title}
              </h1>
            </div>

            {/* Infos clés compactes */}
            <div className="grid sm:grid-cols-2 gap-3 border-t border-b border-[#111110]/10 py-4 font-mono text-xs text-[#111110]/80">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-[#111110]/40 shrink-0" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#111110]/40 shrink-0" />
                <span>Portes à {formattedTime || '20:00'}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-[#111110]/40 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">À propos</h3>
              {event.description ? (
                <div className="text-sm md:text-base text-[#111110]/85 font-light leading-relaxed whitespace-pre-line space-y-3">
                  {event.description}
                </div>
              ) : (
                <p className="text-xs text-[#111110]/40 italic font-light">Aucune description détaillée.</p>
              )}
            </div>
          </div>

          {/* Colonne droite : Carte de billetterie compacte */}
          <div className="rounded-2xl bg-[#111110] text-[#F7F5F0] p-6 md:p-8 space-y-6 sticky top-6 shadow-xl border border-[#111110]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]/15">
              <span className="text-xs font-mono text-[#F7F5F0]/70">Billet Standard</span>
              <Ticket className="w-4 h-4 text-[#F7F5F0]/40" />
            </div>

            <div className="space-y-1">
              <p className="font-display text-4xl font-bold tracking-tight">
                {priceFormatted}
              </p>
              <p className="text-[11px] font-mono text-[#F7F5F0]/50">0% de commission · Direct artiste</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#F7F5F0]/15 text-xs text-[#F7F5F0]/80 font-light">
              <div className="flex justify-between items-center">
                <span className="text-[#F7F5F0]/50">Format</span>
                <span className="font-mono text-[#F7F5F0]">QR Code instantané</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#F7F5F0]/50">Accès</span>
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Garanti
                </span>
              </div>
            </div>

            <button className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <span>Réserver ma place</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#F7F5F0]/40 font-mono leading-relaxed">
              Paiement sécurisé · Reçu immédiat par e-mail.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

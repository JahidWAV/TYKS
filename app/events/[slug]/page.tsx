import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { Calendar, MapPin, ArrowLeft, ArrowUpRight, Clock, Ticket, ShieldCheck, Sparkles, Music } from 'lucide-react';
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
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] px-6 md:px-12 py-10 md:py-16 flex flex-col justify-between selection:bg-[#111110] selection:text-[#F7F5F0]">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Navigation & Fil d'Ariane */}
        <div className="flex items-center justify-between border-b border-[#111110]/10 pb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/60 hover:text-[#111110] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Retour à l'agenda</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#111110]/60">
              {event.organizations?.name || 'Organisateur Indépendant'}
            </span>
          </div>
        </div>

        {/* Grille principale ultra-léchée */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-start">
          
          {/* Colonne gauche : Visuel/Image (si dispo) & Contenu Éditorial */}
          <div className="space-y-10">
            
            {/* Visuel de l'événement si présent ou placeholder stylé DA Tyks */}
            {event.image_url ? (
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#111110]/10 shadow-lg relative group">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-full aspect-[21/9] rounded-2xl bg-gradient-to-br from-[#111110]/5 to-[#111110]/10 border border-[#111110]/10 p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-5">
                  <Music className="w-64 h-64 text-[#111110]" />
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#111110]/50">
                  <Sparkles className="w-3.5 h-3.5" /> Scène Indépendante
                </span>
                <span className="font-mono text-xs text-[#111110]/40 uppercase">TYKS Experience</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-block text-xs font-mono px-3.5 py-1.5 rounded-full border border-[#111110]/20 bg-[#111110]/5 text-[#111110]/80 uppercase tracking-widest">
                  Événement officiel
                </span>
                {Number(event.price) === 0 && (
                  <span className="inline-block text-xs font-mono px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 uppercase tracking-widest font-semibold">
                    Entrée Libre
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                {event.title}
              </h1>
            </div>

            {/* Lignes d'informations métadonnées repensées */}
            <div className="grid sm:grid-cols-2 gap-4 border-t border-b border-[#111110]/10 py-6 font-mono text-xs text-[#111110]/80">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-[#111110]/5 text-[#111110]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[#111110]/40 uppercase tracking-wider text-[10px]">Date</p>
                  <p className="font-semibold capitalize mt-0.5">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-[#111110]/5 text-[#111110]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[#111110]/40 uppercase tracking-wider text-[10px]">Horaires</p>
                  <p className="font-semibold mt-0.5">Ouverture à {formattedTime || '20:00'}</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3.5 sm:col-span-2 pt-2">
                  <div className="p-2 rounded-xl bg-[#111110]/5 text-[#111110] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[#111110]/40 uppercase tracking-wider text-[10px]">Lieu de l'événement</p>
                    <p className="font-semibold mt-0.5 text-sm">{event.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description détaillée */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#111110]/40">À propos de l'événement</h3>
              {event.description ? (
                <div className="text-base text-[#111110]/85 font-light leading-relaxed whitespace-pre-line space-y-4">
                  {event.description}
                </div>
              ) : (
                <p className="text-sm text-[#111110]/40 italic font-light">Aucune description détaillée fournie pour cet événement.</p>
              )}
            </div>
          </div>

          {/* Colonne droite : Carte de billetterie style "Onyx Box" optimisée conversion */}
          <div className="rounded-3xl bg-[#111110] text-[#F7F5F0] p-8 md:p-10 space-y-8 sticky top-8 shadow-2xl border border-[#111110]">
            <div className="flex items-center justify-between pb-6 border-b border-[#F7F5F0]/15">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F7F5F0]/50 block">Sélection</span>
                <span className="text-xs font-mono text-[#F7F5F0] font-semibold">Billet Standard</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#F7F5F0]/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#F7F5F0]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <p className="font-display text-5xl font-bold tracking-tight">
                  {priceFormatted}
                </p>
              </div>
              <p className="text-xs font-mono text-[#F7F5F0]/50">0% de commission abusive · Tout pour l'artiste</p>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[#F7F5F0]/15 text-xs text-[#F7F5F0]/80 font-light">
              <div className="flex justify-between items-center">
                <span className="text-[#F7F5F0]/50">Format billet</span>
                <span className="font-mono text-[#F7F5F0] font-medium">QR Code instantané</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#F7F5F0]/50">Garantie</span>
                <span className="font-mono text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Accès salle garanti
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#F7F5F0]/50">Annulation</span>
                <span className="font-mono text-[#F7F5F0] font-medium">Sécurisée</span>
              </div>
            </div>

            <button className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer shadow-xl">
              <span>Réserver ma place</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#F7F5F0]/40 font-mono leading-relaxed">
                Paiement direct sécurisé · Reçu instantanément par e-mail et dans votre espace TYKS.
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

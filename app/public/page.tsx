'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Ticket, MapPin, Smile, Zap } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const VALEURS = [
  {
    icon: Smile,
    title: 'Billets ultra-frais',
    text: 'Une expérience d’achat simple, rapide et sans aucune mauvaise surprise au moment de payer.',
    color: 'bg-[#FFF4CC]', // Jaune beurre doux
    textColor: 'text-[#1A1A1A]'
  },
  {
    icon: Ticket,
    title: 'Propriété des lieux',
    text: 'Les collectifs et les salles gardent la main sur leurs données et leur billetterie.',
    color: 'bg-[#E6F7FF]', // Bleu ciel glacier
    textColor: 'text-[#1A1A1A]'
  },
  {
    icon: Zap,
    title: 'Zéro prise de tête',
    text: 'Plus d’excuses pour ne pas sortir. Votre soirée en un seul geste, un pass direct.',
    color: 'bg-[#FFE6F0]', // Rose poudré bonbon
    textColor: 'text-[#1A1A1A]'
  },
];

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      const { data, error } = await supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true })
        .limit(4);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  // Fonction pour les couleurs alternées des cartes événements
  const getEventCardColor = (index: number) => {
    const colors = ['bg-[#E6F7FF]', 'bg-[#FFE6F0]', 'bg-[#FFF4CC]', 'bg-[#E6FFF5]']; // Bleu, Rose, Jaune, Vert menthe
    return colors[index % colors.length];
  };

  return (
    // Fond crème très clair, doux pour les yeux
    <div className="flex-1 flex flex-col bg-[#FDFCF8] text-[#1A1A1A] selection:bg-[#FF66A1] selection:text-white font-sans">
      
      {/* ─── HERO SECTION ─── */}
      <section className="pt-24 pb-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-16 items-center">
          <div className="space-y-8">
            
            {/* Badge "Édition 2026" version ludique */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#1A1A1A] text-white border-2 border-[#1A1A1A]">
              <Smile className="w-5 h-5 text-[#FFF4CC]" />
              <span className="text-xs font-bold uppercase tracking-widest">Billetterie Indépendante — 2026</span>
            </div>

            {/* Titre ultra-gras et rond */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9]">
              La fête <br/>
              <span className="underline decoration-[#FF66A1] decoration-8 underline-offset-8">simple</span>.
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-[#1A1A1A]/80 font-normal leading-relaxed">
              Une nouvelle billetterie pour la culture vivante. Fini les frais abusifs et les designs compliqués. Ici, c'est clair, net et sans bavure.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="#events" 
                className="px-9 py-5 rounded-3xl bg-[#1A1A1A] text-white font-bold text-base hover:bg-[#333] transition-colors flex items-center gap-2 group"
              >
                Découvrir les soirées
                <ArrowUpRight className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </a>
            </div>
          </div>

          {/* COLONNE DE DROITE : Carte visuelle App */}
          <div className="relative p-10 rounded-[40px] bg-[#E6F7FF] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A]">
            <div className="flex items-center justify-between mb-12">
              <div className="w-16 h-16 rounded-3xl bg-white border-4 border-[#1A1A1A] grid place-content-center">
                <Zap className="w-8 h-8 text-[#1A1A1A] fill-[#FFF4CC]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/70 border border-[#1A1A1A]/30 px-4 py-1.5 rounded-full bg-white/50">En approche</span>
            </div>

            <div className="space-y-4 mb-10">
              <h3 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Votre pass dans la poche.</h3>
              <p className="text-base text-[#1A1A1A]/70 leading-relaxed font-normal">
                Retrouvez tous vos billets au même endroit. Accédez à vos événements préférés en un seul flash. Bientôt sur iOS et Android.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 rounded-2xl bg-white border-2 border-[#1A1A1A] grid place-content-center text-sm font-bold text-[#1A1A1A]/40">iOS Store</div>
              <div className="h-16 rounded-2xl bg-white border-2 border-[#1A1A1A] grid place-content-center text-sm font-bold text-[#1A1A1A]/40">Play Store</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCHAINS ÉVÉNEMENTS ─── */}
      <section id="events" className="py-32 border-t-4 border-[#1A1A1A] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter">Prochaines ondes</h2>
            <Link 
              href="/events"
              className="inline-flex items-center gap-2 text-base font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
            >
              Voir tout l'agenda
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-[#1A1A1A]/40">Chargement des événements...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-[#1A1A1A]/20 rounded-[32px] text-[#1A1A1A]/40 font-bold text-sm">
              Aucun événement publié pour le moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {events.map((item, index) => {
                const startDate = item.starts_at ? new Date(item.starts_at) : null;
                const formattedDateDay = startDate
                  ? startDate.toLocaleDateString('fr-FR', { day: '2-digit' })
                  : '';
                const formattedDateMonth = startDate
                  ? startDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
                  : '';
                const priceLabel = Number(item.price) === 0 ? 'GRATUIT' : `${Number(item.price).toFixed(2)} €`;

                // Couleur de fond alternée pour les cartes
                const cardBgColor = getEventCardColor(index);

                return (
                  <Link 
                    key={item.id} 
                    href={`/events/${item.slug}`}
                    className={`group p-8 rounded-[32px] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] ${cardBgColor} flex flex-col justify-between h-[380px] transition-transform hover:-translate-y-2`}
                  >
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/80 border-2 border-[#1A1A1A] text-[#1A1A1A] uppercase tracking-wider">
                          {item.organizations?.name || 'Event'}
                        </span>
                        <div className="text-center flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-[#1A1A1A] font-black leading-tight">
                          <span className="block text-2xl text-[#1A1A1A]">{formattedDateDay}</span>
                          <span className="block text-xs text-[#1A1A1A]/60">{formattedDateMonth}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A] leading-snug group-hover:underline decoration-[#FF66A1] decoration-4">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-4 text-[#1A1A1A]/60 font-medium text-sm">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <p className="truncate">{item.location || 'Lieu secret'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t-2 border-[#1A1A1A]/10 flex items-center justify-between">
                      <span className="text-2xl font-black text-[#1A1A1A]">{priceLabel}</span>
                      <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white grid place-content-center transition-transform group-hover:rotate-45">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── VALEURS GRILLE ─── */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto w-full border-t-4 border-[#1A1A1A] bg-[#FDFCF8]">
        <div className="grid md:grid-cols-3 gap-8">
          {VALEURS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`p-10 rounded-[32px] border-4 border-[#1A1A1A] ${item.color} space-y-8`}>
                <div className="w-16 h-16 rounded-3xl bg-white border-4 border-[#1A1A1A] grid place-content-center">
                  <Icon className="w-8 h-8 text-[#1A1A1A]" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-3xl font-bold tracking-tight ${item.textColor}`}>{item.title}</h3>
                  <p className={`text-base leading-relaxed font-normal ${item.textColor}/80`}>
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── BANDEAU CTA PRO (Style ludique) ─── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 w-full pb-32">
        <div className="relative rounded-[40px] p-12 md:p-20 bg-[#FFF4CC] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          
          {/* Éléments graphiques de fond (cercles géométriques) */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border-[30px] border-[#1A1A1A]/5 pointer-events-none" />
          <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-[#FF66A1] pointer-events-none" />

          <div className="space-y-6 max-w-2xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/70 bg-white px-4 py-2 rounded-full border-2 border-[#1A1A1A]">Pour les organisateurs</span>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-[#1A1A1A]">Vous gérez un lieu ou un collectif ?</h2>
            <p className="text-lg text-[#1A1A1A]/80 font-normal leading-relaxed">
              Reprenez la main sur votre billetterie. Créez votre espace en quelques minutes, gardez le contrôle sur vos données et proposez une expérience d'achat irréprochable à votre public.
            </p>
          </div>

          <a
            href="https://pro.tyks.app"
            className="relative z-10 px-10 py-7 rounded-[24px] bg-[#1A1A1A] text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shrink-0 border-4 border-[#1A1A1A]"
          >
            Lancer mon compte pro
          </a>
        </div>
      </section>

    </div>
  );
}

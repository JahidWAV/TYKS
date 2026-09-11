'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Search, 
  SlidersHorizontal, 
  Ticket, 
  Music2, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Smartphone,
  Heart
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

// Données de filtrage et catégories réelles pour la structure
const CATEGORIES = ['Tous', 'Concerts', 'Clubbing', 'Festivals', 'Live & Showcase', 'Underground'];
const VILLES = ['Toutes les villes', 'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nantes'];

export default function PublicHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedCity, setSelectedCity] = useState('Toutes les villes');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      setLoading(true);
      let query = supabaseBrowser
        .from('events')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .order('starts_at', { ascending: true });

      const { data, error } = await query;

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchPublishedEvents();
  }, []);

  // Filtrage dynamique côté client pour une fluidité totale de la landing
  const filteredEvents = events.filter((item) => {
    const matchCity = selectedCity === 'Toutes les villes' || (item.location && item.location.toLowerCase().includes(selectedCity.toLowerCase()));
    const matchSearch = searchQuery === '' || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organizations?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#FAF7F2] text-[#2D2220] selection:bg-[#5C1D24] selection:text-[#FAF7F2] font-serif min-h-screen">
      
      {/* ─── 1. HERO SECTION : ACCROCHE FORTE & MOTEUR DE RECHERCHE INTÉGRÉ ─── */}
      <section className="relative px-6 md:px-16 pt-20 pb-20 max-w-7xl mx-auto w-full border-b border-[#E4DCD0]">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2.5 text-xs font-sans tracking-[0.25em] uppercase px-4 py-2 rounded-full bg-[#F0EBE3] text-[#5C1D24] font-medium border border-[#E4DCD0]">
            <span className="w-2 h-2 rounded-full bg-[#5C1D24] animate-ping" />
            <span>La billetterie indépendante et transparente</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95]">
            Vivez le live, <br />
            <span className="italic font-normal text-[#5C1D24]">sans compromis</span>.
          </h1>

          <p className="text-lg md:text-xl font-sans font-light text-[#2D2220]/75 max-w-2xl leading-relaxed">
            Découvrez les meilleurs concerts, soirées et performances underground près de chez vous. Zéro frais cachés, revente sécurisée et accès instantané.
          </p>

          {/* Barre de recherche interactive intégrée au Hero */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch gap-3 bg-white p-3 rounded-2xl md:rounded-full border border-[#E4DCD0] shadow-sm max-w-3xl">
            <div className="flex items-center gap-3 px-4 py-3 flex-1 border-b sm:border-b-0 sm:border-r border-[#E4DCD0]">
              <Search className="w-5 h-5 text-[#2D2220]/40 shrink-0" />
              <input 
                type="text"
                placeholder="Artiste, salle, événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent font-sans text-sm focus:outline-none w-full text-[#2D2220] placeholder:text-[#2D2220]/40"
              />
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 sm:w-52">
              <MapPin className="w-5 h-5 text-[#2D2220]/40 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent font-sans text-sm focus:outline-none w-full text-[#2D2220] cursor-pointer"
              >
                {VILLES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <a 
              href="#agenda" 
              className="px-8 py-3.5 bg-[#5C1D24] text-[#FAF7F2] rounded-xl sm:rounded-full font-sans text-xs font-medium uppercase tracking-widest hover:bg-[#43141A] transition-all flex items-center justify-center gap-2"
            >
              <span>Chercher</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Indicateurs rassurants immédiats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-[#E4DCD0]/60 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Zéro frais cachés</div>
              <div className="text-xs text-[#2D2220]/60">Le prix affiché est le prix final</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Billets garantis</div>
              <div className="text-xs text-[#2D2220]/60">Anti-contrefaçon certifié</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">100% Mobile</div>
              <div className="text-xs text-[#2D2220]/60">Accès direct sans imprimer</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Revente officielle</div>
              <div className="text-xs text-[#2D2220]/60">Cédez votre place en 1 clic</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. SECTION AGENDA & FILTRES OPÉRATIONNELS ─── */}
      <section id="agenda" className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Programmation live</span>
            <h2 className="text-4xl md:text-5xl font-light mt-2">Prochains Événements</h2>
          </div>

          {/* Filtres de catégories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none font-sans">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#5C1D24] text-[#FAF7F2]' 
                    : 'bg-[#F2ECE4] text-[#2D2220]/70 hover:bg-[#E4DCD0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des événements */}
        {loading ? (
          <div className="py-24 text-center font-sans text-xs tracking-widest uppercase text-[#2D2220]/40">
            Chargement de la programmation en cours...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-24 text-center border border-[#E4DCD0] rounded-[2.5rem] bg-[#F2ECE4]/50 space-y-3 font-sans">
            <p className="text-sm font-medium text-[#2D2220]/70">Aucun événement ne correspond à vos critères de recherche.</p>
            <p className="text-xs text-[#2D2220]/40">Essayez de modifier votre recherche ou de réinitialiser les filtres.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCity('Toutes les villes'); setSelectedCategory('Tous'); }}
              className="mt-4 px-6 py-2.5 bg-[#5C1D24] text-white rounded-full text-xs uppercase tracking-widest"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((item, index) => {
              const startDate = item.starts_at ? new Date(item.starts_at) : null;
              const formattedDate = startDate
                ? startDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
                : '';
              const formattedTime = startDate
                ? startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';
              const priceLabel = Number(item.price) === 0 ? 'Gratuit' : `${Number(item.price).toFixed(2)} €`;

              return (
                <Link
                  key={item.id}
                  href={`/events/${item.slug}`}
                  className="group bg-[#F2ECE4] border border-[#E4DCD0] hover:border-[#5C1D24] rounded-[2.5rem] p-8 flex flex-col justify-between h-[440px] transition-all duration-300 shadow-2xs hover:shadow-md relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-sans tracking-wider text-[#2D2220]/60">
                      <span className="font-semibold text-[#5C1D24] uppercase tracking-widest truncate max-w-[160px]">
                        {item.organizations?.name || 'Organisateur'}
                      </span>
                      <span className="flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full border border-[#E4DCD0]">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h3 className="text-2xl md:text-3xl font-normal group-hover:italic transition-all leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs font-sans font-light text-[#2D2220]/60 flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.location || 'Lieu communiqué après réservation'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-[#E4DCD0]">
                    <div className="flex items-center justify-between text-xs font-sans text-[#2D2220]/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formattedTime || 'Ouverture des portes'}
                      </span>
                      <span className="font-medium text-[#2D2220] px-3 py-1 bg-white rounded-full border border-[#E4DCD0]">
                        {priceLabel}
                      </span>
                    </div>

                    <div className="w-full py-3.5 rounded-full bg-[#FAF7F2] group-hover:bg-[#5C1D24] group-hover:text-[#FAF7F2] transition-colors flex items-center justify-center gap-2 text-xs font-sans font-medium uppercase tracking-widest border border-[#E4DCD0] group-hover:border-[#5C1D24]">
                      <span>Réserver ma place</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 3. SECTION VALEUR AJOUTÉE : POURQUOI CHOISIR NOTRE PLATEFORME ─── */}
      <section className="py-24 px-6 md:px-16 bg-[#F2ECE4]/60 border-t border-b border-[#E4DCD0]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#5C1D24] font-semibold">Notre engagement</span>
            <h2 className="text-4xl md:text-5xl font-light leading-tight">Repenser l'expérience de la billetterie live.</h2>
            <p className="text-sm md:text-base font-sans font-light text-[#2D2220]/75 leading-relaxed">
              Nous redonnons le pouvoir au public et aux créateurs d'événements. Fini les frais de service exorbitants au moment de payer et la spéculation abusive sur les billets.
            </p>
            <div className="pt-2 space-y-3 font-sans text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5C1D24] shrink-0" />
                <span>Transparence totale sur les tarifs pratiqués</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5C1D24] shrink-0" />
                <span>Bourse d'échange officielle anti-arnaque</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5C1D24] shrink-0" />
                <span>Support réactif et humain 7j/7</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 font-sans">
            <div className="p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-normal">Revente sécurisée</h3>
              <p className="text-xs font-light text-[#2D2220]/70 leading-relaxed">
                Un empêchement de dernière minute ? Revendez votre billet en un clic au prix d'achat initial directement sur la plateforme. Zéro risque, zéro spéculation.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#FAF7F2] border border-[#E4DCD0] space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-normal">Accès instantané</h3>
              <p className="text-xs font-light text-[#2D2220]/70 leading-relaxed">
                Retrouvez l'ensemble de vos billets centralisés dans votre espace personnel. Vos QR codes dynamiques fonctionnent même hors connexion à l'entrée des salles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. CALL TO ACTION FINAL OPÉRATIONNEL ─── */}
      <section className="py-24 px-6 md:px-16 bg-[#5C1D24] text-[#FAF7F2] text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#FAF7F2]/60">Rejoignez le mouvement</span>
          <h2 className="text-5xl md:text-7xl font-light leading-tight">
            Prêt à vivre votre <br />
            <span className="italic">prochain concert</span> ?
          </h2>
          <p className="max-w-xl mx-auto text-base font-sans font-light text-[#FAF7F2]/80 leading-relaxed">
            Explorez notre agenda, sélectionnez vos artistes et réservez vos places en toute simplicité.
          </p>
          <div className="pt-4">
            <a
              href="#agenda"
              className="px-8 py-4 rounded-full bg-[#FAF7F2] text-[#5C1D24] hover:bg-white transition-colors text-xs font-sans font-medium uppercase tracking-widest shadow-md inline-block"
            >
              Explorer tous les événements
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

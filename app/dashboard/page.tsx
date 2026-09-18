'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, Calendar, Search, Edit3, Trash2, AlertTriangle, X
} from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import { supabaseBrowser } from '@/lib/supabase-browser';
import CustomAuthModal from '@/components/CustomAuthModal';

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<IortiEvent[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<IortiEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      setUser(session?.user ?? null);
      setReady(true);
    }
    getSession();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDashboard = useCallback(async (userId: string) => {
    try {
      setLoading(true);

      const { data: eventsData, error } = await supabaseBrowser
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('starts_at', { ascending: true });

      if (error) {
        console.error('Erreur Supabase :', error.message);
        return;
      }

      if (eventsData) {
        setEvents(eventsData);
      }
    } catch (err) {
      console.error('Erreur de chargement du dashboard :', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && user?.id) {
      loadDashboard(user.id);
    } else if (ready && !user) {
      setLoading(false);
    }
  }, [ready, user, loadDashboard]);

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert("Impossible de supprimer l'événement en raison d'une contrainte technique.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white/60 font-grotesque text-xs flex items-center justify-center uppercase">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col lg:flex-row w-full overflow-hidden selection:bg-white selection:text-black font-grotesque uppercase">
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 z-10 bg-[#0f0f0f] border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center">
            <Image 
              src="/tyks.svg" 
              alt="TYKS" 
              width={140} 
              height={44} 
              priority 
              className="h-9 w-auto object-contain brightness-0 invert" 
            />
          </div>

          <div className="space-y-6 my-auto py-12">
            <span className="inline-flex items-center justify-center font-grotesque text-[11px] bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-full font-bold">
              TYKS PRO · Espace organisateur
            </span>
            <h1 className="text-4xl lg:text-6xl font-grotesque font-normal tracking-tight text-white leading-[1.05]">
              Reprenez le contrôle de votre billetterie et de vos marges.
            </h1>
            <p className="font-grotesque text-xs leading-relaxed text-white/70 max-w-md normal-case">
              Fins de commissions abusives et de données captives. Tyks Pro vous offre une plateforme sur-mesure, des frais réduits et l&apos;accès direct à votre communauté.
            </p>
            <div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 h-12 bg-white text-black font-grotesque text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-3 cursor-pointer font-bold rounded-full shadow-lg"
              >
                <span>Accéder à mon espace pro</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="font-grotesque text-xs text-white/40">
            © TYKS INC.
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 bg-neutral-900 p-12 relative overflow-hidden items-center justify-center select-none pointer-events-none">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/15 rounded-3xl p-6 space-y-6 shadow-xl font-grotesque">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white/20"></span>
                <span className="h-3 w-3 rounded-full bg-white/20"></span>
                <span className="h-3 w-3 rounded-full bg-white/20"></span>
              </div>
              <span className="text-xs font-grotesque text-white/50 lowercase">dashboard.tyks.app</span>
            </div>
          </div>
        </div>

        <CustomAuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white/60 font-grotesque text-xs flex items-center justify-center uppercase">
        Chargement...
      </div>
    );
  }

  const filteredEvents = events.filter((evt: any) => {
    return evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           evt.location?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full px-6 lg:px-12 pt-4 pb-12 space-y-8 font-grotesque text-white bg-[#0f0f0f] min-h-full">
      
      {/* Barre unifiée (Recherche + Compte) intégrée dans une grille à 3 colonnes pour épouser exactement la largeur de la carte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center pt-2">
        <div className="lg:col-start-2 lg:col-span-1 w-full">
          <div className="w-full h-11 rounded-full border border-white/15 bg-neutral-900 flex items-center justify-between px-4 shadow-md">
            
            {/* Partie gauche : Champ de recherche */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="h-4 w-4 text-white/40 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher par titre ou lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-grotesque text-xs text-white placeholder:text-white/40 focus:outline-none truncate"
              />
            </div>

            {/* Séparateur vertical */}
            <div className="h-4 w-[1px] bg-white/15 mx-3 shrink-0" />

            {/* Partie droite : Compteur d'événements */}
            <span className="font-grotesque text-xs text-white/70 whitespace-nowrap shrink-0">
              {filteredEvents.length} ÉVÉNEMENT(S)
            </span>

          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-white/15 bg-neutral-900 p-16 text-center space-y-4 shadow-xs font-grotesque">
            <Calendar className="mx-auto h-8 w-8 text-white" />
            <p className="font-grotesque text-xs text-white/60">
              {events.length === 0 
                ? "Vous n'avez pas encore créé d'événement." 
                : "Aucun événement ne correspond à votre recherche."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt: any) => {
              const eventPrice = Number(evt.price || evt.ticket_price || 0);
              
              const rawImage = evt.image_url || evt.cover_image || evt.flyer_url || evt.poster_url;
              let imageUrl = '';
              
              if (rawImage) {
                if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
                  imageUrl = rawImage;
                } else if (rawImage.startsWith('/')) {
                  imageUrl = rawImage;
                } else {
                  const cleanPath = rawImage.startsWith('events/') ? rawImage.replace('events/', '') : rawImage;
                  const { data } = supabaseBrowser.storage.from('events').getPublicUrl(cleanPath);
                  imageUrl = data.publicUrl;
                }
              }

              const formattedDate = evt.starts_at ? new Date(evt.starts_at).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }).toUpperCase().replace(/\./g, '') : '';

              return (
                <article
                  key={evt.id}
                  className="group relative flex flex-col rounded-3xl border border-white/15 bg-neutral-950 overflow-hidden shadow-xl transition-all hover:border-white font-grotesque"
                >
                  <div className="relative w-full aspect-square bg-neutral-900 overflow-hidden">
                    {imageUrl ? (
                      <Image 
                        src={imageUrl} 
                        alt={evt.title || 'Event Flyer'} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center brightness-90 group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                        <span className="text-white/30 text-xs font-bold uppercase">Aucune affiche</span>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent pointer-events-none z-10" />
                  </div>

                  <div className="p-5 space-y-4 bg-neutral-950 flex-1 flex flex-col justify-between border-t border-white/10">
                    <div className="space-y-1">
                      <h3 className="text-xl font-normal text-white tracking-wide uppercase">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-white/70 uppercase">
                        {formattedDate}{evt.location ? `, ${evt.location}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-white tracking-wider">
                        {eventPrice > 0 ? `€${eventPrice.toLocaleString('fr-FR')}` : 'GRATUIT'}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/events/${evt.slug || evt.id}/edit`}
                          className="w-9 h-9 rounded-full border border-white/20 bg-neutral-900 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs"
                          title="Modifier"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          key={`delete-${evt.id}`}
                          onClick={() => setEventToDelete(evt)}
                          className="w-9 h-9 rounded-full border border-white/20 bg-neutral-900 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP DE SUPPRESSION PERSONNALISÉ (DA #0f0f0f, full rounded, grotesque, texte en casse normale) */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0f0f0f] p-8 space-y-6 shadow-2xl font-grotesque text-white relative">
            
            <button 
              onClick={() => setEventToDelete(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold tracking-wide">
                Supprimer l'événement
              </h3>
            </div>

            <p className="text-xs text-white/70 leading-relaxed normal-case">
              Êtes-vous sûr de vouloir supprimer définitivement l'événement <span className="text-white font-medium">&ldquo;{eventToDelete.title}&rdquo;</span> ? Cette action est irréversible et supprimera toutes les données associées.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className="px-5 h-11 rounded-full border border-white/20 bg-transparent text-xs text-white hover:bg-white/10 transition-colors cursor-pointer font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                disabled={isDeleting}
                className="px-6 h-11 rounded-full bg-red-600 text-xs text-white hover:bg-red-500 transition-colors cursor-pointer font-bold shadow-lg flex items-center gap-2"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

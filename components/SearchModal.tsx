"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, ArrowUpRight, X, Building2, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Gestion du focus à l'ouverture et reset
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      performSearch("");
    } else {
      document.body.style.overflow = "auto";
      setSearchQuery("");
      setFilteredEvents([]);
      setFilteredOrgs([]);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Fonction de recherche dynamique optimisée sur Supabase
  const performSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const cleanQuery = query.trim();

      // 1. Recherche des événements (par titre, lieu, ou description)
      let eventsQuery = supabaseBrowser
        .from("events")
        .select("*, organizations(id, name, logo_url, slug)")
        .order("starts_at", { ascending: true });

      if (cleanQuery !== "") {
        eventsQuery = eventsQuery.or(
          `title.ilike.%${cleanQuery}%,location.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`
        );
      } else {
        eventsQuery = eventsQuery.limit(6); // Tendance par défaut
      }

      const { data: eventsData, error: eventsError } = await eventsQuery.limit(50);
      if (eventsError) console.error("Erreur événements:", eventsError);

      // 2. Recherche des organisations
      let orgsQuery = supabaseBrowser
        .from("organizations")
        .select("*");

      if (cleanQuery !== "") {
        orgsQuery = orgsQuery.ilike("name", `%${cleanQuery}%`);
      } else {
        orgsQuery = orgsQuery.limit(0); // Pas d'orgs par défaut si pas de recherche
      }

      const { data: orgsData, error: orgsError } = await orgsQuery.limit(20);
      if (orgsError) console.error("Erreur organisations:", orgsError);

      setFilteredEvents(eventsData || []);
      setFilteredOrgs(orgsData || []);
    } catch (err) {
      console.error("Erreur globale recherche :", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce (300ms) pour déclencher la recherche serveur sans saturer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, performSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col font-grotesque uppercase text-white animate-in fade-in duration-200">
      
      {/* HEADER DE RECHERCHE PLEIN ÉCRAN */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-8 pb-6 flex items-center gap-4 border-b border-white/10">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-6 h-5 w-5 text-white pointer-events-none" strokeWidth={2.5} style={{ color: '#ffffff' }} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="RECHERCHER UN ÉVÉNEMENT, UN ARTISTE, UN ORGANISATEUR OU UNE VILLE..."
            className="w-full h-16 bg-neutral-900 border border-white/15 pl-14 pr-6 text-sm font-bold placeholder:text-white/30 focus:outline-none focus:border-white text-white rounded-full shadow-inner uppercase tracking-wider"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-5 text-xs text-white/50 hover:text-white cursor-pointer"
            >
              EFFACER
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="h-16 px-6 shrink-0 bg-neutral-900 hover:bg-white hover:text-black border border-white/15 text-white rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs tracking-wider"
        >
          <X className="w-5 h-5" strokeWidth={2.5} style={{ color: 'currentColor' }} />
          <span className="hidden sm:inline">FERMER</span>
        </button>
      </div>

      {/* CONTENU DES RÉSULTATS */}
      <div className="flex-1 overflow-y-auto max-w-5xl w-full mx-auto px-6 py-8 space-y-10">
        
        {isLoading ? (
          <div className="py-24 text-center text-white/40 text-xs font-bold tracking-widest animate-pulse">
            RECHERCHE EN COURS...
          </div>
        ) : (
          <>
            {/* SECTION ORGANISATEURS (Si trouvés) */}
            {filteredOrgs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-white/50 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-white" /> ORGANISATEURS & COLLECTIFS ({filteredOrgs.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredOrgs.map((org) => {
                    const orgLogo = org.logo_url || org.image_url;
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          onClose();
                          router.push(`/organizations/${org.slug || org.id}`);
                        }}
                        className="p-4 bg-neutral-900 hover:bg-white hover:text-black border border-white/15 rounded-3xl transition-all duration-300 flex items-center gap-4 group cursor-pointer text-left"
                      >
                        <div className="relative w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-neutral-800 border border-white/10 flex items-center justify-center">
                          {orgLogo ? (
                            <img src={orgLogo} alt={org.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-white/50 group-hover:text-black" />
                          )}
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-xs font-bold tracking-wider truncate">{org.name}</p>
                          <span className="text-[10px] text-white/50 group-hover:text-black/70 font-semibold">ORGANISATEUR</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-black shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION ÉVÉNEMENTS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-white/50 flex items-center gap-2">
                {searchQuery.trim() === "" ? <Sparkles className="w-4 h-4 text-white" /> : <Calendar className="w-4 h-4 text-white" />}
                {searchQuery.trim() === "" ? "ÉVÉNEMENTS EN TENDANCE" : `ÉVÉNEMENTS (${filteredEvents.length})`}
              </h3>

              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((evt) => {
                    const priceFormatted = evt.price && parseFloat(evt.price) > 0
                      ? `${parseFloat(evt.price).toFixed(2)} €`
                      : evt.price_cents && evt.price_cents > 0
                      ? `${(evt.price_cents / 100).toFixed(2)} €`
                      : 'GRATUIT';

                    const flyer = evt.image_url || evt.flyer || evt.poster || evt.cover_image;
                    const orgName = evt.organizations?.name;

                    return (
                      <button
                        key={evt.id}
                        onClick={() => {
                          onClose();
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="group text-left bg-neutral-900 hover:bg-neutral-800 border border-white/15 rounded-[2rem] p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-4 shadow-xl"
                      >
                        {/* Affiche de l'événement */}
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-800 border border-white/10 shadow-md">
                          {flyer ? (
                            <img 
                              src={flyer} 
                              alt={evt.title || "Événement"} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30">
                              TYKS
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                            {priceFormatted}
                          </div>
                        </div>

                        {/* Infos de l'événement */}
                        <div className="space-y-2 flex-1">
                          <p className="text-xs font-bold tracking-wide line-clamp-1 group-hover:text-white">
                            {evt.title}
                          </p>

                          <div className="space-y-1 text-[10px] text-white/60 font-bold">
                            {evt.starts_at && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 shrink-0 text-white/40" />
                                {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            )}
                            {evt.location && (
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3 h-3 shrink-0 text-white/40" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                            {orgName && (
                              <div className="flex items-center gap-1.5 truncate text-white/80">
                                <Building2 className="w-3 h-3 shrink-0 text-white/40" />
                                <span className="truncate">{orgName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer de la carte */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40 group-hover:text-white font-bold transition-colors">
                          <span>VOIR LA BILLETTERIE</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center text-white/40 text-xs font-bold tracking-widest">
                  AUCUN RÉSULTAT TROUVÉ POUR &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

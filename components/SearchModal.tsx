"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, ArrowUpRight, X, Building2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      fetchEvents();
    } else {
      setSearchQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseBrowser
        .from("events")
        .select("*, organizations(name)")
        .order("starts_at", { ascending: true })
        .limit(100);

      if (!error && data) {
        setAllEvents(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des événements :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const filtered = allEvents.filter((evt) => {
      const titleMatch = evt.title?.toLowerCase().includes(q);
      const locationMatch = evt.location?.toLowerCase().includes(q);
      const orgMatch = evt.organizations?.name?.toLowerCase().includes(q);

      return titleMatch || locationMatch || orgMatch;
    });

    setResults(filtered);
  }, [searchQuery, allEvents]);

  if (!isOpen) return null;

  return (
    /* Centrage parfait avec flex items-center justify-center p-4 */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-grotesque uppercase">
      <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-2xl border border-black/15 p-6 md:p-8 shadow-2xl text-black rounded-[2.5rem] animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 pb-6 border-b border-black/10 shrink-0">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-5 h-4 w-4 text-black/60 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="RECHERCHER UN ÉVÉNEMENT, UNE VILLE, UN ORGANISATEUR..."
              className="w-full h-14 bg-white/60 border border-black/15 pl-12 pr-4 text-xs font-bold placeholder:text-black/40 focus:outline-none focus:border-black text-black rounded-full shadow-inner uppercase"
            />
          </div>

          <button
            onClick={onClose}
            className="h-14 w-14 shrink-0 border border-black/15 bg-white/80 hover:bg-black text-black hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer rounded-full shadow-sm"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Résultats */}
        <div className="mt-6 overflow-y-auto space-y-3 pr-1 flex-1">
          {searchQuery.trim().length === 0 ? (
            <div className="py-16 text-center text-black/40 text-xs font-bold tracking-wider">
              TAPEZ UN TITRE, UNE VILLE OU UN ORGANISATEUR...
            </div>
          ) : isLoading ? (
            <div className="py-16 text-center text-black/40 text-xs font-bold tracking-wider animate-pulse">
              CHARGEMENT...
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {results.map((evt) => {
                const priceFormatted = evt.price && parseFloat(evt.price) > 0
                  ? `${parseFloat(evt.price).toFixed(2)} €`
                  : evt.price_cents && evt.price_cents > 0
                  ? `${(evt.price_cents / 100).toFixed(2)} €`
                  : 'GRATUIT';

                // Vérification élargie de toutes les clés possibles pour l'image
                const flyer = evt.image_url || evt.flyer || evt.poster || evt.cover_image || evt.image;
                const orgName = evt.organizations?.name;

                return (
                  <button
                    key={evt.id}
                    onClick={() => {
                      onClose();
                      router.push(`/events/${evt.slug || evt.id}`);
                    }}
                    className="w-full text-left p-4 bg-white/70 hover:bg-black hover:text-white border border-black/15 rounded-3xl transition-all duration-300 flex items-center justify-between group cursor-pointer shadow-sm gap-4"
                  >
                    <div className="flex items-center gap-4 truncate">
                      {/* Affiche de l'événement avec balise img standard */}
                      <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-black/10 bg-neutral-100 shadow-sm flex items-center justify-center">
                        {flyer ? (
                          <img 
                            src={flyer} 
                            alt={evt.title || "Événement"} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-black/40 bg-neutral-200">
                            TYKS
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="space-y-1.5 truncate pr-2">
                        <p className="text-xs font-bold tracking-wide truncate">
                          {evt.title}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-black/60 group-hover:text-white/70 font-bold">
                          {evt.starts_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 shrink-0" />
                              {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                          {evt.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {evt.location}
                            </span>
                          )}
                          {orgName && (
                            <span className="flex items-center gap-1 truncate text-black/80 group-hover:text-white/90">
                              <Building2 className="w-3 h-3 shrink-0" />
                              {orgName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold px-3.5 py-2 border border-black/15 bg-white group-hover:bg-neutral-800 group-hover:text-white group-hover:border-white/20 text-black rounded-full transition-colors shadow-xs">
                        {priceFormatted}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-black/40 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-black/50 text-xs font-bold tracking-wider">
              AUCUN RÉSULTAT TROUVÉ POUR &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

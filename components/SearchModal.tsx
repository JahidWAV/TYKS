"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, ArrowUpRight, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus automatique à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Logique de recherche en temps réel
  useEffect(() => {
    if (!isOpen) return;

    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabaseBrowser
          .from("events")
          .select("*")
          .ilike("title", `%${searchQuery}%`)
          .limit(6);

        if (!error && data) {
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Erreur de recherche :", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 font-grotesque uppercase">
      <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-2xl border border-black/15 p-6 md:p-8 shadow-2xl text-black rounded-[2.5rem] animate-in zoom-in-95 duration-200">
        
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 pb-6 border-b border-black/10">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-5 h-4 w-4 text-black/60 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="RECHERCHER UN ÉVÉNEMENT, UN ARTISTE, UN LIEU..."
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
        <div className="mt-6 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {searchQuery.trim().length === 0 ? (
            <div className="py-16 text-center text-black/40 text-xs font-bold tracking-wider">
              TAPEZ QUELQUES CARACTÈRES POUR LANCER LA RECHERCHE...
            </div>
          ) : isSearching ? (
            <div className="py-16 text-center text-black/40 text-xs font-bold tracking-wider animate-pulse">
              RECHERCHE EN COURS...
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {results.map((evt) => {
                const priceFormatted = evt.price && parseFloat(evt.price) > 0
                  ? `${parseFloat(evt.price).toFixed(2)} €`
                  : 'GRATUIT';

                const flyer = evt.image_url || evt.cover_image || evt.flyer_url || evt.poster;

                return (
                  <button
                    key={evt.id}
                    onClick={() => {
                      onClose();
                      router.push(`/events/${evt.slug || evt.id}`);
                    }}
                    className="w-full text-left p-3.5 bg-white/60 hover:bg-black hover:text-white border border-black/15 rounded-3xl transition-all duration-300 flex items-center justify-between group cursor-pointer shadow-sm gap-4"
                  >
                    <div className="flex items-center gap-4 truncate">
                      <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden border border-black/10 bg-neutral-100">
                        {flyer ? (
                          <Image 
                            src={flyer} 
                            alt={evt.title || "Événement"} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-black/40 bg-neutral-200">
                            TYKS
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 truncate pr-2">
                        <p className="text-xs font-bold truncate">
                          {evt.title}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-black/60 group-hover:text-white/70 font-bold">
                          {evt.starts_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 shrink-0" />
                              {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </span>
                          )}
                          {evt.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold px-3 py-1.5 border border-black/15 bg-white group-hover:bg-neutral-800 group-hover:text-white group-hover:border-white/20 text-black rounded-full transition-colors shadow-xs">
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
              AUCUN ÉVÉNEMENT TROUVÉ POUR &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [rawOrgs, setRawOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      fetchAllData();
    } else {
      document.body.style.overflow = "auto";
      setSearchQuery("");
      setDebouncedQuery("");
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const { data: eventsData, error: eventsError } = await supabaseBrowser
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true })
        .limit(300);

      if (eventsError) console.error("Erreur events:", eventsError.message);

      const { data: orgsData, error: orgsError } = await supabaseBrowser
        .from("organizations")
        .select("*")
        .limit(100);

      if (orgsError) console.error("Erreur orgs:", orgsError.message);

      const orgsMap = new Map((orgsData || []).map(org => [org.id, org]));
      const enrichedEvents = (eventsData || []).map(evt => ({
        ...evt,
        organizations: evt.organization_id ? orgsMap.get(evt.organization_id) : null
      }));

      setRawEvents(enrichedEvents);
      setRawOrgs(orgsData || []);
    } catch (err) {
      console.error("Erreur chargement global :", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const normalizeString = (str: string) => {
    return str
      ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  };

  const q = normalizeString(debouncedQuery.trim());

  const filteredEvents = rawEvents.filter((evt) => {
    if (q === "") return true;
    const title = normalizeString(evt.title);
    const location = normalizeString(evt.location);
    const description = normalizeString(evt.description);
    const orgName = normalizeString(evt.organizations?.name);

    return (
      title.includes(q) ||
      location.includes(q) ||
      description.includes(q) ||
      orgName.includes(q)
    );
  });

  const filteredOrgs = q === "" ? [] : rawOrgs.filter((org) => {
    return normalizeString(org.name).includes(q);
  });

  const displayedEvents = debouncedQuery.trim() === "" ? rawEvents.slice(0, 6) : filteredEvents;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans text-neutral-950 animate-in fade-in duration-200 overflow-y-auto">
      
      {/* HEADER DE RECHERCHE - Ajusté pour épouser la taille exacte des bulles de la navbar */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-8 pb-6 flex items-center gap-3 border-b border-neutral-200">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-5 h-4 w-4 text-neutral-400 pointer-events-none" strokeWidth={2} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un événement, un artiste, un organisateur..."
            className="w-full h-11 bg-neutral-50 border border-neutral-950 pl-12 pr-12 text-[15px] font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white text-neutral-950 rounded-full shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 text-[15px] text-neutral-400 hover:text-neutral-950 cursor-pointer font-medium"
            >
              Effacer
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="h-11 px-6 shrink-0 bg-white hover:bg-neutral-950 hover:text-white border border-neutral-950 text-neutral-950 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-medium text-[15px]"
        >
          <X className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Fermer</span>
        </button>
      </div>

      {/* RÉSULTATS */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-10">
        
        {isLoading ? (
          <div className="py-24 text-center text-neutral-400 text-[15px] font-medium animate-pulse">
            Chargement des données...
          </div>
        ) : (
          <>
            {/* SECTION ORGANISATEURS */}
            {filteredOrgs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[15px] font-semibold text-neutral-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-950" /> Organisateurs & collectifs ({filteredOrgs.length})
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
                        className="p-4 bg-white hover:bg-neutral-50 border border-neutral-950 rounded-3xl transition-all duration-300 flex items-center gap-4 group cursor-pointer text-left shadow-sm"
                      >
                        <div className="relative w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                          {orgLogo ? (
                            <img src={orgLogo} alt={org.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-[15px] font-semibold truncate text-neutral-950">{org.name}</p>
                          <span className="text-[13px] text-neutral-500 font-medium">Organisateur</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION ÉVÉNEMENTS */}
            <div className="space-y-4">
              <h3 className="text-[15px] font-semibold text-neutral-500 flex items-center gap-2">
                {debouncedQuery.trim() === "" ? <Sparkles className="w-4 h-4 text-neutral-950" /> : <Calendar className="w-4 h-4 text-neutral-950" />}
                {debouncedQuery.trim() === "" ? "Événements en tendance" : `Événements (${displayedEvents.length})`}
              </h3>

              {displayedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedEvents.map((evt) => {
                    const priceFormatted = evt.price && parseFloat(evt.price) > 0
                      ? `${parseFloat(evt.price).toFixed(2)} €`
                      : evt.price_cents && evt.price_cents > 0
                      ? `${(evt.price_cents / 100).toFixed(2)} €`
                      : 'Gratuit';

                    const flyer = evt.image_url || evt.flyer || evt.poster || evt.cover_image;
                    const orgName = evt.organizations?.name;

                    return (
                      <button
                        key={evt.id}
                        onClick={() => {
                          onClose();
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="group text-left bg-white hover:bg-neutral-50 border border-neutral-950 rounded-[2rem] p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-4 shadow-sm"
                      >
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                          {flyer ? (
                            <img 
                              src={flyer} 
                              alt={evt.title || "Événement"} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[15px] font-semibold text-neutral-400">
                              TYKS
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-neutral-950 text-neutral-950 text-[13px] font-semibold px-3 py-1 rounded-full shadow-sm">
                            {priceFormatted}
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          <p className="text-[15px] font-semibold line-clamp-1 text-neutral-950">
                            {evt.title}
                          </p>

                          <div className="space-y-1 text-[13px] text-neutral-600 font-medium">
                            {evt.starts_at && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                                {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            )}
                            {evt.location && (
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                            {orgName && (
                              <div className="flex items-center gap-1.5 truncate text-neutral-800">
                                <Building2 className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                                <span className="truncate">{orgName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-[13px] text-neutral-500 group-hover:text-neutral-950 font-semibold transition-colors">
                          <span>Voir la billetterie</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center text-neutral-400 text-[15px] font-medium">
                  Aucun résultat trouvé pour &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

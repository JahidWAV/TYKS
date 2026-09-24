"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Building2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
}

const RECENT_EVENTS_KEY = "tyks_recent_events";

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [rawOrgs, setRawOrgs] = useState<any[]>([]);
  const [recentEventIds, setRecentEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Charger l'historique récent du localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_EVENTS_KEY);
      if (stored) {
        setRecentEventIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erreur lecture localStorage :", e);
    }
  }, []);

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

  // Fonction pour enregistrer un événement vu récemment
  const handleSelectEvent = (evt: any) => {
    try {
      const updatedIds = [evt.id, ...recentEventIds.filter(id => id !== evt.id)].slice(0, 5);
      setRecentEventIds(updatedIds);
      localStorage.setItem(RECENT_EVENTS_KEY, JSON.stringify(updatedIds));
    } catch (e) {
      console.error("Erreur écriture localStorage :", e);
    }

    onClose();
    router.push(`/events/${evt.slug || evt.id}`);
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

  // Détermination des événements à afficher (Max 5)
  let displayedEvents: any[] = [];
  if (debouncedQuery.trim() === "") {
    if (recentEventIds.length > 0) {
      const recentMap = new Map(rawEvents.map(evt => [evt.id, evt]));
      const matchedRecent = recentEventIds.map(id => recentMap.get(id)).filter(Boolean);
      const remainingEvents = rawEvents.filter(evt => !recentEventIds.includes(evt.id));
      displayedEvents = [...matchedRecent, ...remainingEvents].slice(0, 5);
    } else {
      displayedEvents = rawEvents.slice(0, 5);
    }
  } else {
    displayedEvents = filteredEvents.slice(0, 5);
  }

  const sectionTitle = debouncedQuery.trim() === "" 
    ? (recentEventIds.length > 0 ? "Récemment consultés" : "Recommandations")
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FFFFFF]/80 backdrop-blur-md flex flex-col items-center justify-center p-4 font-sans text-[#000000] animate-in fade-in duration-200 overflow-y-auto">
      
      {/* CONTENEUR GLOBAL CENTRÉ */}
      <div className="w-full max-w-2xl space-y-3 my-auto">
        
        {/* HEADER DE RECHERCHE */}
        <div className="relative flex items-center bg-[#FFFFFF] border border-[#000000] rounded-3xl shadow-xl overflow-hidden">
          <Search className="absolute left-4 h-4 w-4 text-[#000000]/40 pointer-events-none" strokeWidth={2} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un événement, un lieu ou un·e artiste..."
            className="w-full h-12 bg-transparent pl-11 pr-12 text-[15px] font-['Grotesque'] font-medium placeholder:text-[#000000]/40 focus:outline-none text-[#000000]"
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 p-1 text-[#000000]/40 hover:text-[#000000] cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="absolute right-4 p-1 text-[#000000]/40 hover:text-[#000000] cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* BLOC DES RÉSULTATS */}
        <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-3xl shadow-2xl overflow-hidden p-3 space-y-2">
          
          {isLoading ? (
            <div className="py-16 text-center text-[#000000]/40 text-[15px] font-['Grotesque'] font-medium animate-pulse">
              Chargement...
            </div>
          ) : (
            <>
              {/* SECTION ORGANISATEURS */}
              {filteredOrgs.length > 0 && (
                <div className="space-y-1 mb-3">
                  <div className="px-3 py-1.5 text-[13px] font-['Lucidity'] uppercase tracking-widest text-[#000000]/40">
                    ORGANISATEURS
                  </div>
                  {filteredOrgs.slice(0, 3).map((org) => {
                    const orgLogo = org.logo_url || org.image_url;
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          onClose();
                          router.push(`/organizations/${org.slug || org.id}`);
                        }}
                        className="w-full p-2.5 hover:bg-[#000000]/5 rounded-2xl transition-all duration-200 flex items-center gap-3 cursor-pointer text-left group"
                      >
                        <div className="relative w-10 h-10 shrink-0 rounded-2xl overflow-hidden bg-[#000000]/5 border border-[#000000]/10 flex items-center justify-center">
                          {orgLogo ? (
                            <img src={orgLogo} alt={org.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4 text-[#000000]/40" />
                          )}
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-[15px] font-['Lucidity'] uppercase truncate text-[#000000]">{org.name}</p>
                          <span className="text-[13px] font-['Grotesque'] text-[#000000]/50 font-medium">Organisateur</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SECTION ÉVÉNEMENTS EN LISTE (MAX 5) */}
              <div className="space-y-1">
                {displayedEvents.length > 0 ? (
                  <div className="space-y-1">
                    {sectionTitle && (
                      <div className="px-3 py-1 text-[11px] font-['Lucidity'] uppercase tracking-widest text-[#000000]/30">
                        {sectionTitle}
                      </div>
                    )}
                    {displayedEvents.map((evt) => {
                      const flyer = evt.image_url || evt.flyer || evt.poster || evt.cover_image;
                      const orgName = evt.organizations?.name;

                      return (
                        <button
                          key={evt.id}
                          onClick={() => handleSelectEvent(evt)}
                          className="w-full p-2.5 hover:bg-[#000000]/5 rounded-2xl transition-all duration-200 flex items-center gap-3.5 cursor-pointer text-left group"
                        >
                          {/* Miniature carrée */}
                          <div className="relative w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-[#000000]/5 border border-[#000000]/10">
                            {flyer ? (
                              <img 
                                src={flyer} 
                                alt={evt.title || "Événement"} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[11px] font-['Grotesque'] font-semibold text-[#000000]/40">
                                TYKS
                              </div>
                            )}
                          </div>

                          {/* Infos textuelles */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-['Lucidity'] uppercase truncate text-[#000000]">
                              {evt.title}
                            </p>
                            <div className="flex items-center gap-2 text-[13px] font-['Grotesque'] text-[#000000]/50 font-medium truncate mt-0.5">
                              {evt.starts_at && (
                                <span>
                                  {new Date(evt.starts_at).toLocaleDateString("fr-FR", { weekday: 'short', day: "numeric", month: "short" })}
                                </span>
                              )}
                              {evt.starts_at && evt.location && <span>•</span>}
                              {evt.location && (
                                <span className="truncate">{evt.location}</span>
                              )}
                              {orgName && !evt.location && (
                                <span className="truncate">({orgName})</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#000000]/40 text-[15px] font-['Grotesque'] font-medium">
                    Aucun résultat trouvé pour &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

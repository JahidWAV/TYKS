"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, ArrowUpRight, X, Menu } from "lucide-react";
import CustomAuthModal from "@/components/CustomAuthModal";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface NavbarProps {
  isPro?: boolean;
  isDarkMode?: boolean;
}

export default function Navbar({ isPro = false, isDarkMode = false }: NavbarProps) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");

  // États pour la recherche (pilule expansible)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "MON COMPTE";
        setUserName(metaName.toUpperCase());
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "MON COMPTE";
        setUserName(metaName.toUpperCase());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  useEffect(() => {
    if (isPro) return;

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
          .select("id, slug, title, location, starts_at, price")
          .ilike("title", `%${searchQuery}%`)
          .limit(5);

        if (!error && data) {
          setResults(data);
        }
      } catch (err) {
        console.error("Erreur de recherche :", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, isPro]);

  const handleMainButtonClick = () => {
    if (user) {
      router.push("/settings");
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      {/* NAVBAR FLOTTANTE DANS LE VIDE */}
      <div className="fixed top-6 left-0 right-0 z-50 max-w-7xl mx-auto px-6 font-grotesque uppercase">
        <header className="w-full flex items-center justify-between gap-4">

          {/* 1. LOGO FLOTTANT */}
          <Link href="/" className="flex items-center justify-start shrink-0 px-3 py-2 bg-white/80 backdrop-blur-md border border-black/15 rounded-full shadow-lg shadow-black/5">
            <Image 
              src="/tyks.svg" 
              alt="TYKS" 
              width={340} 
              height={110} 
              priority 
              className="h-7 sm:h-9 w-auto object-contain text-black" 
            />
          </Link>

          {/* 2. ZONE DROITE FLOTTANTE */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* LOUPE DE RECHERCHE */}
            {!isPro && (
              <div className="relative" ref={searchRef}>
                <div 
                  className={`flex items-center transition-all duration-300 bg-black text-white rounded-full h-11 shadow-lg shadow-black/10 ${
                    isSearchExpanded || searchQuery.trim() ? 'w-64 px-4' : 'w-11 px-0 justify-center cursor-pointer hover:bg-neutral-800'
                  }`}
                  onClick={() => {
                    if (!isSearchExpanded) {
                      setIsSearchExpanded(true);
                    }
                  }}
                >
                  <Search className={`h-4 w-4 text-white/80 shrink-0 ${!isSearchExpanded && !searchQuery.trim() ? 'mx-auto' : 'mr-2'}`} />
                  
                  {(isSearchExpanded || searchQuery.trim()) && (
                    <input
                      type="text"
                      autoFocus={isSearchExpanded}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!showDropdown) setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="RECHERCHER..."
                      className="w-full bg-transparent text-[11px] font-bold placeholder:text-white/60 focus:outline-none text-white truncate pr-1 uppercase"
                    />
                  )}

                  {searchQuery && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        setResults([]);
                      }}
                      className="p-1 text-white/60 hover:text-white shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {showDropdown && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full right-0 w-80 mt-3 bg-white border border-black/15 rounded-[2rem] divide-y divide-black/10 z-50 text-black shadow-xl overflow-hidden">
                    {results.length > 0 ? (
                      <div className="py-2">
                        {results.map((evt) => {
                          const priceFormatted = evt.price && parseFloat(evt.price) > 0
                            ? `${parseFloat(evt.price).toFixed(2)} €`
                            : 'GRATUIT';

                          return (
                            <button
                              key={evt.id}
                              onClick={() => {
                                setShowDropdown(false);
                                setSearchQuery("");
                                setIsSearchExpanded(false);
                                router.push(`/events/${evt.slug || evt.id}`);
                              }}
                              className="w-full text-left px-5 py-3 transition-all flex items-center justify-between group hover:bg-neutral-50 cursor-pointer"
                            >
                              <div className="space-y-1 pr-3 truncate">
                                <p className="text-xs font-bold truncate text-black">
                                  {evt.title}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-black/60 font-bold">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-black" />
                                    {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3 text-black" />
                                    {evt.location}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold px-2.5 py-1 border border-black/15 bg-neutral-50 text-black rounded-full">
                                  {priceFormatted}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-black/40 group-hover:text-black transition-colors" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-[10px] font-bold tracking-wider text-black/50">AUCUN RÉSULTAT POUR &quot;{searchQuery}&quot;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BOUTON DYNAMIQUE : PRÉNOM OU SE CONNECTER */}
            <button
              onClick={handleMainButtonClick}
              className="h-11 px-7 bg-black hover:bg-neutral-800 transition-all text-white text-xs tracking-wider font-bold rounded-full shadow-lg shadow-black/10 flex items-center justify-center shrink-0 cursor-pointer"
            >
              {user ? userName : "SE CONNECTER / S'INSCRIRE"}
            </button>

          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center md:hidden">
            <button
              className="inline-flex items-center justify-center bg-black text-white p-3 rounded-full shadow-lg cursor-pointer"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* MOBILE PANEL */}
        {mobileOpen && (
          <div className="px-6 py-6 md:hidden space-y-4 bg-white border border-black/15 rounded-[2.5rem] mt-3 shadow-2xl text-black">
            {!isPro && (
              <>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-4 w-4 pointer-events-none text-black/60 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="RECHERCHER UN ÉVÉNEMENT..."
                    className="w-full h-11 bg-neutral-50 pl-11 pr-4 text-xs font-bold placeholder:text-black/50 focus:outline-none text-black rounded-full border border-black/15 shadow-inner uppercase"
                  />
                </div>
                {searchQuery.trim().length > 0 && results.length > 0 && (
                  <div className="border border-black/15 bg-neutral-50 rounded-2xl divide-y divide-black/10 overflow-hidden shadow-sm">
                    {results.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setMobileOpen(false);
                          setSearchQuery("");
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="p-4 text-xs flex justify-between items-center cursor-pointer hover:bg-white text-black font-bold"
                      >
                        <span className="truncate">{evt.title}</span>
                        <span className="text-black/80">{evt.price ? `${evt.price} €` : "GRATUIT"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => {
                setMobileOpen(false);
                handleMainButtonClick();
              }}
              className="w-full h-12 bg-black text-white hover:bg-neutral-800 text-xs tracking-wider font-bold rounded-full shadow-md flex items-center justify-center cursor-pointer"
            >
              {user ? userName : "SE CONNECTER / S'INSCRIRE"}
            </button>
          </div>
        )}
      </div>

      <CustomAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

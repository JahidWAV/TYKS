"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Menu, X, Search, Calendar, MapPin, ArrowUpRight, User as UserIcon } from "lucide-react";
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
      setUser(session?.user ?? null);
    };

    fetchUserData();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  // Si l'utilisateur est connecté -> lien vers /settings, sinon -> ouvre la modale de connexion.
  // Le rendu est direct sans passer par un état de chargement visuel qui fait clignoter l'icône.
  const handleProfileClick = () => {
    if (user) {
      router.push("/settings");
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      {/* Utilisation de relative pour qu'elle défile avec la page */}
      <header className="relative z-50 bg-transparent font-sans text-[#1e3932] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">

          {/* 1. LOGO AGRANDI */}
          <Link href="/" className="flex items-center justify-start shrink-0 px-2">
            <Image 
              src="/tyks.svg" 
              alt="TYKS" 
              width={340} 
              height={110} 
              priority 
              className="h-12 sm:h-16 w-auto object-contain text-[#1e3932]" 
              style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(21%) saturate(1210%) hue-rotate(124deg) brightness(94%) contrast(92%)' }}
            />
          </Link>

          {/* 2. ZONE DROITE : LES ÉLÉMENTS CÔTE À CÔTE */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* LOUPE (À gauche) */}
            {!isPro && (
              <div className="relative" ref={searchRef}>
                <div 
                  className={`flex items-center transition-all duration-300 bg-[#1e3932] text-white rounded-full h-10 shadow-md ${
                    isSearchExpanded || searchQuery.trim() ? 'w-64 px-3.5' : 'w-10 px-0 justify-center cursor-pointer hover:bg-[#152a25]'
                  }`}
                  onClick={() => {
                    if (!isSearchExpanded) {
                      setIsSearchExpanded(true);
                    }
                  }}
                >
                  <Search className={`h-3.5 w-3.5 text-white/80 shrink-0 ${!isSearchExpanded && !searchQuery.trim() ? 'mx-auto' : 'mr-2'}`} />
                  
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
                      placeholder="Rechercher..."
                      className="w-full bg-transparent text-xs placeholder:text-white/60 focus:outline-none text-white truncate pr-1"
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
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {showDropdown && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full right-0 w-80 mt-2 bg-white border border-[#1e3932]/15 rounded-3xl divide-y divide-[#1e3932]/10 z-50 text-[#1e3932] shadow-xl overflow-hidden">
                    {results.length > 0 ? (
                      <div className="py-2">
                        {results.map((evt) => {
                          const priceFormatted = evt.price && parseFloat(evt.price) > 0
                            ? `${parseFloat(evt.price).toFixed(2)} €`
                            : 'Gratuit';

                          return (
                            <button
                              key={evt.id}
                              onClick={() => {
                                setShowDropdown(false);
                                setSearchQuery("");
                                setIsSearchExpanded(false);
                                router.push(`/events/${evt.slug || evt.id}`);
                              }}
                              className="w-full text-left px-5 py-3 transition-all flex items-center justify-between group hover:bg-[#f8faf9]"
                            >
                              <div className="space-y-1 pr-3 truncate">
                                <p className="text-xs font-medium truncate text-[#1e3932]">
                                  {evt.title}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-[#1e3932]/60">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#1e3932]" />
                                    {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3 text-[#1e3932]" />
                                    {evt.location}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-medium px-2.5 py-1 border border-[#1e3932]/15 bg-[#f8faf9] text-[#1e3932] rounded-full">
                                  {priceFormatted}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#1e3932]/40 group-hover:text-[#1e3932] transition-colors" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-[10px] font-medium tracking-wide text-[#1e3932]/50">Aucun résultat pour &quot;{searchQuery}&quot;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BOUTON PROFIL (Sans flash de chargement) */}
            <button
              onClick={handleProfileClick}
              className="w-10 h-10 bg-[#1e3932] hover:bg-[#152a25] transition-all flex items-center justify-center text-white rounded-full shadow-md shrink-0 cursor-pointer"
              title={user ? "Paramètres / Profil" : (isPro ? "Connexion Pro" : "Connexion")}
            >
              <UserIcon className="w-3.5 h-3.5 text-white/80" />
            </button>

          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center md:hidden">
            <button
              className="inline-flex items-center justify-center bg-[#1e3932] text-white p-2.5 rounded-full shadow-md"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* MOBILE PANEL */}
        {mobileOpen && (
          <div className="px-6 py-4 md:hidden space-y-3 bg-[#1e3932] text-white border border-white/10 rounded-3xl mx-4 mt-2 shadow-xl">
            {!isPro && (
              <>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-3.5 w-3.5 pointer-events-none text-white/60 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un événement..."
                    className="w-full h-10 bg-black/20 pl-10 pr-4 text-xs placeholder:text-white/60 focus:outline-none text-white rounded-full border border-white/10 shadow-inner"
                  />
                </div>
                {searchQuery.trim().length > 0 && results.length > 0 && (
                  <div className="border border-white/10 bg-black/20 rounded-3xl divide-y divide-white/10 overflow-hidden">
                    {results.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setMobileOpen(false);
                          setSearchQuery("");
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="p-3.5 text-xs flex justify-between items-center cursor-pointer hover:bg-white/10 text-white"
                      >
                        <span className="font-medium truncate">{evt.title}</span>
                        <span className="font-medium text-white/80">{evt.price ? `${evt.price} €` : "Gratuit"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {user ? (
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="w-full h-10 bg-white/10 hover:bg-white/20 text-white text-xs tracking-wider font-medium rounded-full shadow-md flex items-center justify-center gap-2"
              >
                <UserIcon className="h-3.5 w-3.5 text-white/80" />
                Paramètres
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsAuthOpen(true);
                }}
                className="w-full h-10 bg-white text-[#1e3932] hover:bg-white/90 text-xs tracking-wider font-medium rounded-full shadow-md"
              >
                {isPro ? "Connexion Pro" : "Connexion"}
              </button>
            )}
          </div>
        )}
      </header>

      <CustomAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, Menu, X, Search, Calendar, MapPin, ArrowUpRight, User as UserIcon, Settings, ChevronDown } from "lucide-react";
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
  const [firstName, setFirstName] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState(true);

  // États pour le menu utilisateur
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
        const { data: profile } = await supabaseBrowser
          .from("profiles")
          .select("first_name")
          .eq("id", currentUser.id)
          .single();

        if (profile?.first_name) {
          setFirstName(profile.first_name);
        }
      }
      setLoadingUser(false);
    };

    fetchUserData();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabaseBrowser
          .from("profiles")
          .select("first_name")
          .eq("id", currentUser.id)
          .single();

        if (profile?.first_name) {
          setFirstName(profile.first_name);
        }
      } else {
        setFirstName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setFirstName("");
    router.refresh();
  };

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md font-sans text-[#1e3932] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">

          {/* 1. LOGO */}
          <Link href="/" className="flex items-center justify-start shrink-0 px-2">
            <Image 
              src="/tyks.svg" 
              alt="TYKS" 
              width={220} 
              height={70} 
              priority 
              className="h-8 sm:h-9 w-auto object-contain text-[#1e3932]" 
              style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(21%) saturate(1210%) hue-rotate(124deg) brightness(94%) contrast(92%)' }}
            />
          </Link>

          {/* 2. ZONE DROITE : PILULE DE RECHERCHE & BOUTON CONNEXION / COMPTE */}
          <div className="hidden md:flex items-center gap-2">
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

            {/* Bouton Compte / Connexion ultra-arrondi */}
            {loadingUser ? (
              <div className="h-10 w-28 border border-[#1e3932]/15 bg-[#f8faf9] rounded-full flex items-center justify-center">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1e3932]/60" />
              </div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex h-10 items-center justify-between gap-2 border border-[#1e3932]/15 bg-[#f8faf9] px-4 text-xs font-medium tracking-wide transition-all hover:border-[#1e3932]/40 cursor-pointer text-[#1e3932] rounded-full shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <UserIcon className="w-3.5 h-3.5 shrink-0 text-[#1e3932]" />
                    <span className="truncate text-left max-w-[100px]">
                      {firstName || user.email.split('@')[0]}
                    </span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform shrink-0 text-[#1e3932]/60 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#1e3932]/15 rounded-3xl py-2 shadow-xl z-50 text-[#1e3932] overflow-hidden">
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-5 py-2.5 text-xs tracking-wide flex items-center gap-2 transition-colors hover:bg-[#f8faf9] font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#1e3932]" />
                      Paramètres
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-2.5 text-xs tracking-wide flex items-center gap-2 transition-colors hover:bg-red-50 font-medium text-red-600"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex h-10 px-5 bg-[#1e3932] hover:bg-[#152a25] text-white text-xs tracking-wider transition-all items-center justify-center font-medium cursor-pointer rounded-full shadow-md"
              >
                <span className="truncate">{isPro ? "Connexion Pro" : "Connexion"}</span>
              </button>
            )}
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
          <div className="px-6 py-4 md:hidden space-y-3 bg-white/95 backdrop-blur-md border border-[#1e3932]/10 rounded-3xl mx-4 mt-2 shadow-xl text-[#1e3932]">
            {!isPro && (
              <>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-3.5 w-3.5 pointer-events-none text-white/60 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un événement..."
                    className="w-full h-10 bg-[#1e3932] pl-10 pr-4 text-xs placeholder:text-white/60 focus:outline-none text-white rounded-full shadow-md"
                  />
                </div>
                {searchQuery.trim().length > 0 && results.length > 0 && (
                  <div className="border border-[#1e3932]/15 bg-[#f8faf9] rounded-3xl divide-y divide-[#1e3932]/10 overflow-hidden">
                    {results.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setMobileOpen(false);
                          setSearchQuery("");
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="p-3.5 text-xs flex justify-between items-center cursor-pointer hover:bg-white text-[#1e3932]"
                      >
                        <span className="font-medium truncate">{evt.title}</span>
                        <span className="font-medium text-[#1e3932]">{evt.price ? `${evt.price} €` : "Gratuit"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {loadingUser ? (
              <div className="flex h-10 items-center justify-center border border-[#1e3932]/15 bg-[#f8faf9] rounded-full">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1e3932]/60" />
              </div>
            ) : user ? (
              <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between border border-[#1e3932]/15 bg-[#f8faf9] px-4 py-2.5 text-xs font-medium text-[#1e3932] rounded-full">
                  <div className="flex items-center gap-2 truncate">
                    <UserIcon className="w-3.5 h-3.5 shrink-0 text-[#1e3932]" />
                    <span className="truncate">{firstName || user.email}</span>
                  </div>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 border border-[#1e3932]/15 bg-[#f8faf9] px-4 py-2.5 text-xs font-medium tracking-wide hover:bg-white transition-colors rounded-full"
                >
                  <Settings className="h-3.5 w-3.5 text-[#1e3932]" />
                  Paramètres
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 border border-[#1e3932]/15 bg-[#f8faf9] text-red-600 px-4 py-2.5 text-xs font-medium tracking-wide hover:bg-red-50 transition-colors rounded-full"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsAuthOpen(true);
                }}
                className="w-full h-10 bg-[#1e3932] text-white text-xs tracking-wider font-medium rounded-full shadow-md"
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

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

  // États pour la recherche
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
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <header className="sticky top-0 z-50 bg-white border-b-2 border-black font-sans text-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-6">

          {/* 1. BARRE DE RECHERCHE (À GAUCHE) */}
          <div className="w-64 sm:w-72 hidden md:block">
            {!isPro ? (
              <div className="relative" ref={searchRef}>
                <div className="relative flex items-center w-full">
                  <Search className="absolute left-3.5 h-3.5 w-3.5 pointer-events-none text-black" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!showDropdown) setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Rechercher..."
                    className="w-full h-11 border-2 border-black bg-[#F5F5F7] px-4 pl-10 pr-8 font-mono text-xs uppercase placeholder:text-neutral-400 focus:outline-none text-black"
                  />

                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setResults([]);
                      }}
                      className="absolute right-3 p-1 text-black transition-colors hover:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {showDropdown && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 w-80 mt-2 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-black z-50 font-mono text-black">
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
                                router.push(`/events/${evt.slug || evt.id}`);
                              }}
                              className="w-full text-left px-4 py-3 transition-all flex items-center justify-between group hover:bg-neutral-100"
                            >
                              <div className="space-y-1 pr-3 truncate">
                                <p className="text-xs font-bold uppercase truncate text-black">
                                  {evt.title}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-neutral-500">
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
                                <span className="font-mono text-[10px] font-bold px-2 py-1 border border-black bg-[#F5F5F7] text-black">
                                  {priceFormatted}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity text-black" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Aucun résultat pour &quot;{searchQuery}&quot;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : <div />}
          </div>

          {/* 2. LOGO (AU CENTRE) */}
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/tyks.svg" alt="TYKS" width={80} height={28} priority className="h-6 w-auto object-contain" />
          </Link>

          {/* 3. BOUTON COMPTE / CONNEXION (À DROITE DESKTOP) */}
          <div className="w-64 sm:w-72 hidden md:flex justify-end">
            {loadingUser ? (
              <div className="h-11 w-full max-w-[200px] border-2 border-black bg-white" />
            ) : user ? (
              <div className="relative w-full max-w-[200px]" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex h-11 w-full items-center gap-2 border-2 border-black bg-white px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer text-black"
                >
                  <UserIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate flex-1 text-left">
                    {firstName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-full bg-white border-2 border-black py-1.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 font-mono text-black">
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 transition-colors hover:bg-black hover:text-white font-bold"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Paramètres
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 transition-colors hover:bg-red-600 hover:text-white font-bold text-red-600"
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
                className="inline-flex h-11 w-full max-w-[200px] px-6 border-2 border-black bg-white hover:bg-black hover:text-white font-mono text-xs uppercase tracking-widest transition-all items-center justify-center font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer text-black"
              >
                <span>{isPro ? "Connexion Pro" : "Connexion"}</span>
              </button>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center md:hidden">
            <button
              className="inline-flex items-center justify-center border-2 border-black bg-white p-2.5 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE PANEL */}
        {mobileOpen && (
          <div className="px-6 py-6 md:hidden space-y-4 bg-white border-t-2 border-black text-black">
            {!isPro && (
              <>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 pointer-events-none text-black" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un événement..."
                    className="w-full h-11 border-2 border-black bg-[#F5F5F7] pl-10 pr-4 font-mono text-xs uppercase placeholder:text-neutral-400 focus:outline-none text-black"
                  />
                </div>
                {searchQuery.trim().length > 0 && results.length > 0 && (
                  <div className="border-2 border-black bg-white divide-y-2 divide-black">
                    {results.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setMobileOpen(false);
                          setSearchQuery("");
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="p-3 text-xs font-mono uppercase flex justify-between items-center cursor-pointer hover:bg-neutral-100 text-black"
                      >
                        <span className="font-bold truncate">{evt.title}</span>
                        <span className="font-bold">{evt.price ? `${evt.price} €` : "Gratuit"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {loadingUser ? (
              <div className="flex h-11 items-center justify-center border-2 border-black bg-white">
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              </div>
            ) : user ? (
              <div className="flex flex-col gap-3 pt-2 font-mono">
                <div className="flex items-center gap-2 border-2 border-black bg-[#F5F5F7] px-4 py-3 text-xs font-bold uppercase text-black">
                  <UserIcon className="w-4 h-4" />
                  <span className="truncate">{firstName || user.email}</span>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 border-2 border-black bg-white text-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsAuthOpen(true);
                }}
                className="w-full h-11 border-2 border-black bg-black text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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

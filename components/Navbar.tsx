"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
      <header className={`fixed inset-x-0 top-0 z-20 bg-transparent transition-colors duration-300 ${
        isDarkMode ? 'text-[#F7F5F0]' : 'text-[#111110]'
      }`}>
        <div className="mx-auto flex items-center justify-between max-w-7xl px-6 py-4 md:px-12">

          {/* 1. BARRE DE RECHERCHE (À GAUCHE) */}
          <div className="w-48 hidden md:block">
            {!isPro ? (
              <div className="relative" ref={searchRef}>
                <div className="relative flex items-center w-full">
                  <Search className="absolute left-3.5 h-3.5 w-3.5 pointer-events-none text-[#FAF7F2]/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!showDropdown) setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Rechercher..."
                    className="w-full h-10 rounded-full border border-[#721120] bg-[#721120] px-4 pl-9 pr-8 text-xs font-medium text-[#FAF7F2] placeholder:text-[#FAF7F2]/50 focus:outline-none focus:border-[#FAF7F2]/60 transition-all shadow-sm"
                  />

                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setResults([]);
                      }}
                      className="absolute right-3 p-1 text-[#FAF7F2]/60 transition-colors hover:text-[#FAF7F2]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {showDropdown && searchQuery.trim().length > 0 && (
                  <div className={`absolute top-full left-0 w-80 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl border ${
                    isDarkMode ? 'bg-[#111110] border-[#F7F5F0]/15 divide-y divide-[#F7F5F0]/10 text-[#F7F5F0]' : 'bg-[#F7F5F0] border-[#111110]/15 divide-y divide-[#111110]/10 text-[#111110]'
                  }`}>
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
                              className={`w-full text-left px-4 py-3 transition-all flex items-center justify-between group ${
                                isDarkMode ? 'hover:bg-[#F7F5F0]/5' : 'hover:bg-[#111110]/5'
                              }`}
                            >
                              <div className="space-y-1 pr-3 truncate">
                                <p className="text-xs font-bold truncate">
                                  {evt.title}
                                </p>
                                <div className={`flex items-center gap-3 text-[10px] font-mono ${isDarkMode ? 'text-[#F7F5F0]/50' : 'text-[#111110]/50'}`}>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#721120]" />
                                    {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3 text-[#721120]" />
                                    {evt.location}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`font-mono text-[10px] font-bold px-2 py-1 rounded-md border shadow-sm ${
                                  isDarkMode ? 'bg-[#111110] border-[#F7F5F0]/10 text-[#F7F5F0]' : 'bg-[#F7F5F0] border-[#111110]/10 text-[#111110]'
                                }`}>
                                  {priceFormatted}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#F7F5F0]/40' : 'text-[#111110]/40'}`}>Aucun résultat pour &quot;{searchQuery}&quot;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : <div />}
          </div>

          {/* 2. LOGO (AU CENTRE) */}
          <Link href={isPro ? "/" : "/"} className="group flex items-center absolute left-1/2 -translate-x-1/2">
            <span
              role="img"
              aria-label="TYKS"
              className="w-12 h-12 shrink-0 bg-[#721120] transition-transform group-hover:scale-105"
              style={{
                WebkitMaskImage: "url(/tyks.svg)",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                WebkitMaskPosition: "center",
                maskImage: "url(/tyks.svg)",
                maskRepeat: "no-repeat",
                maskSize: "contain",
                maskPosition: "center",
              }}
            />
          </Link>

          {/* 3. BOUTON COMPTE / CONNEXION (À DROITE DESKTOP) */}
          <div className="w-48 hidden sm:flex justify-end">
            {loadingUser ? (
              <div className={`flex h-10 w-40 items-center justify-center rounded-full border ${isDarkMode ? 'border-[#F7F5F0]/20 bg-[#111110]' : 'border-[#111110]/20 bg-[#F7F5F0]'}`}>
                <Loader2 className="h-3.5 w-3.5 animate-spin opacity-60" />
              </div>
            ) : user ? (
              <div className="relative w-44" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex h-10 w-full items-center gap-2 rounded-full border border-[#721120] bg-[#721120] px-3.5 text-xs font-medium text-[#FAF7F2] transition-colors hover:bg-[#5c0e1a]"
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-[#FAF7F2] text-[#721120] shrink-0">
                    <UserIcon className="w-2.5 h-2.5" />
                  </div>
                  <span className="font-mono truncate flex-1 text-left">
                    {firstName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 opacity-70 transition-transform shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-[#721120] bg-[#721120] py-1.5 text-[#FAF7F2] shadow-xl z-50">
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-[#FAF7F2]/10"
                    >
                      <Settings className="w-3.5 h-3.5 opacity-80" />
                      Paramètres
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-[#FAF7F2]/10"
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
                className="inline-flex h-10 w-40 items-center justify-center rounded-full bg-[#721120] px-4 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#5c0e1a]"
              >
                {isPro ? "Connexion Pro" : "Connexion"}
              </button>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center sm:hidden">
            <button
              className={`inline-flex items-center justify-center rounded-full border p-2 shrink-0 ${isDarkMode ? 'border-[#F7F5F0]/20 text-[#F7F5F0]' : 'border-[#111110]/20 text-[#111110]'}`}
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE PANEL */}
        {mobileOpen && (
          <div className="px-6 py-4 sm:hidden space-y-4 bg-transparent backdrop-blur-md">
            {!isPro && (
              <>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 pointer-events-none text-[#FAF7F2]/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un événement..."
                    className="w-full rounded-full border border-[#721120] bg-[#721120] pl-10 pr-4 py-2.5 text-xs text-[#FAF7F2] placeholder:text-[#FAF7F2]/50 focus:outline-none focus:border-[#FAF7F2]/60"
                  />
                </div>
                {searchQuery.trim().length > 0 && results.length > 0 && (
                  <div className={`border rounded-2xl overflow-hidden divide-y ${isDarkMode ? 'border-[#F7F5F0]/10 divide-[#F7F5F0]/10 bg-[#111110]' : 'border-[#111110]/10 divide-[#111110]/10 bg-[#F7F5F0]'}`}>
                    {results.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setMobileOpen(false);
                          setSearchQuery("");
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="p-3 text-xs flex justify-between items-center cursor-pointer"
                      >
                        <span className="font-semibold truncate">{evt.title}</span>
                        <span className="font-mono opacity-60">{evt.price ? `${evt.price} €` : "Gratuit"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {loadingUser ? (
              <div className={`flex h-10 items-center justify-center rounded-full border ${isDarkMode ? 'border-[#F7F5F0]/20' : 'border-[#111110]/20'}`}>
                <Loader2 className="h-4 w-4 animate-spin opacity-60" />
              </div>
            ) : user ? (
              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center gap-2 rounded-full border border-[#721120] bg-[#721120] px-4 py-2.5 text-xs font-mono text-[#FAF7F2]">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="truncate">{firstName || user.email}</span>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium ${isDarkMode ? 'border-[#F7F5F0]/20' : 'border-[#111110]/20'}`}
                >
                  <Settings className="h-3.5 h-3.5 opacity-70" />
                  Paramètres
                </Link>
                <button
                  onClick={handleLogout}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 text-red-500 px-4 py-2.5 text-xs font-medium bg-red-500/5`}
                >
                  <LogOut className="h-3.5 h-3.5" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsAuthOpen(true);
                }}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#721120] px-5 py-2.5 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#5c0e1a]"
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

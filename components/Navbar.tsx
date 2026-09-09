"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, Menu, X, Search, Calendar, MapPin, ArrowUpRight, Sun, Moon } from "lucide-react";
import CustomAuthModal from "@/components/CustomAuthModal";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Navbar({ isPro = false }: { isPro?: boolean }) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // État du mode sombre / clair
  const [isDarkMode, setIsDarkMode] = useState(false);

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      setUser(session?.user ?? null);
      setLoadingUser(false);
    };

    getSession();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    router.refresh();
  };

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
          .select("id, title, location, starts_at, price")
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'bg-[#111110] text-[#F7F5F0]' : 'bg-[#F7F5F0] text-[#111110]'}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-[#111110]/70 border-[#F7F5F0]/10' 
          : 'bg-[#F7F5F0]/70 border-[#111110]/10'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12 gap-4">

          {/* Logo */}
          <Link href={isPro ? "/" : "/"} className="group shrink-0">
            <span className="font-display text-xl font-bold tracking-tighter">
              TYKS{isPro && <span className="opacity-60"> Pro</span>}
            </span>
          </Link>

          {/* BARRE DE RECHERCHE CENTRÉE — masquée sur pro.tyks.app */}
          {!isPro && (
            <div className="relative hidden md:flex flex-1 max-w-md mx-auto items-center" ref={searchRef}>
              <div className="relative flex items-center w-full">
                <Search className={`absolute left-4 h-4 w-4 pointer-events-none ${isDarkMode ? 'text-[#F7F5F0]/40' : 'text-[#111110]/40'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showDropdown) setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Rechercher un événement, un lieu..."
                  className={`w-full rounded-full border px-4 py-2.5 pl-11 pr-10 text-xs focus:outline-none transition-all shadow-sm ${
                    isDarkMode 
                      ? 'bg-[#111110]/50 border-[#F7F5F0]/15 text-[#F7F5F0] placeholder:text-[#F7F5F0]/30 focus:border-[#F7F5F0]/50' 
                      : 'bg-[#F7F5F0]/50 border-[#111110]/15 text-[#111110] placeholder:text-[#111110]/30 focus:border-[#111110]/50'
                  }`}
                />

                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setResults([]);
                    }}
                    className={`absolute right-3.5 transition-colors p-1 ${isDarkMode ? 'text-[#F7F5F0]/40 hover:text-[#F7F5F0]' : 'text-[#111110]/40 hover:text-[#111110]'}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {showDropdown && searchQuery.trim().length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-3 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl border ${
                  isDarkMode ? 'bg-[#111110] border-[#F7F5F0]/15 divide-y divide-[#F7F5F0]/10' : 'bg-[#F7F5F0] border-[#111110]/15 divide-y divide-[#111110]/10'
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
                              router.push(`/events/${evt.id}`);
                            }}
                            className={`w-full text-left px-5 py-3.5 transition-all flex items-center justify-between group ${
                              isDarkMode ? 'hover:bg-[#F7F5F0]/5' : 'hover:bg-[#111110]/5'
                            }`}
                          >
                            <div className="space-y-1.5 pr-4 truncate">
                              <p className="text-sm font-bold truncate">
                                {evt.title}
                              </p>
                              <div className={`flex items-center gap-4 text-xs font-mono ${isDarkMode ? 'text-[#F7F5F0]/50' : 'text-[#111110]/50'}`}>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1.5 truncate">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {evt.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`font-mono text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm ${
                                isDarkMode ? 'bg-[#111110] border-[#F7F5F0]/10 text-[#F7F5F0]' : 'bg-[#F7F5F0] border-[#111110]/10 text-[#111110]'
                              }`}>
                                {priceFormatted}
                              </span>
                              <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#F7F5F0]/40' : 'text-[#111110]/40'}`}>Aucun événement trouvé pour &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop right side */}
          <div className="hidden items-center gap-4 sm:flex shrink-0 ml-auto">
            
            {/* Bouton Dark / Light Mode */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-full border transition-transform hover:scale-105 ${
                isDarkMode ? 'border-[#F7F5F0]/20 text-[#F7F5F0]' : 'border-[#111110]/20 text-[#111110]'
              }`}
              aria-label="Changer le thème"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {loadingUser ? (
              <div className={`flex h-10 w-32 items-center justify-center rounded-full border ${isDarkMode ? 'border-[#F7F5F0]/20 bg-[#111110]' : 'border-[#111110]/20 bg-[#F7F5F0]'}`}>
                <Loader2 className="h-4 w-4 animate-spin opacity-60" />
              </div>
            ) : user ? (
              <>
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-xs font-medium opacity-80">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                    isDarkMode ? 'border-[#F7F5F0]/20 hover:border-[#F7F5F0]/50 hover:bg-[#F7F5F0]/5' : 'border-[#111110]/20 hover:border-[#111110]/50 hover:bg-[#111110]/5'
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`inline-flex items-center rounded-full px-5 py-2 text-xs font-semibold transition-transform hover:scale-[1.02] ${
                  isDarkMode ? 'bg-[#F7F5F0] text-[#111110] hover:bg-white' : 'bg-[#111110] text-[#F7F5F0] hover:opacity-90'
                }`}
              >
                {isPro ? "Connexion Pro" : "Connexion"}
              </button>
            )}
          </div>

          {/* Mobile toggle & Theme switcher mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full border ${isDarkMode ? 'border-[#F7F5F0]/20 text-[#F7F5F0]' : 'border-[#111110]/20 text-[#111110]'}`}
              aria-label="Changer le thème"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              className={`inline-flex items-center justify-center rounded-full border p-2 shrink-0 ${isDarkMode ? 'border-[#F7F5F0]/20 text-[#F7F5F0]' : 'border-[#111110]/20 text-[#111110]'}`}
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className={`border-t px-6 py-4 sm:hidden space-y-4 ${isDarkMode ? 'border-[#F7F5F0]/10 bg-[#111110]' : 'border-[#111110]/10 bg-[#F7F5F0]'}`}>
            {!isPro && (
              <>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 opacity-40 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un événement..."
                    className={`w-full border rounded-full pl-10 pr-4 py-2.5 text-xs focus:outline-none ${
                      isDarkMode ? 'bg-[#111110] border-[#F7F5F0]/20 text-[#F7F5F0]' : 'bg-[#F7F5F0] border-[#111110]/20 text-[#111110]'
                    }`}
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
                          router.push(`/events/${evt.id}`);
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
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-xs font-medium opacity-80">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium ${isDarkMode ? 'border-[#F7F5F0]/20' : 'border-[#111110]/20'}`}
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
                className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold ${isDarkMode ? 'bg-[#F7F5F0] text-[#111110]' : 'bg-[#111110] text-[#F7F5F0]'}`}
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
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, Menu, X, Search, Calendar, MapPin, ArrowUpRight } from "lucide-react";
import CustomAuthModal from "@/components/CustomAuthModal";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Navbar({ isPro = false }: { isPro?: boolean }) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // États pour la recherche (inutilisés sur pro.tyks.app)
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

  // Recherche en temps réel — ne s'exécute jamais côté pro (isPro=true)
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
    <>
      <header className="sticky top-0 z-50 glass-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 gap-4">

          {/* Logo */}
          <Link href={isPro ? "/" : "/"} className="group shrink-0">
            <span className="font-display text-2xl font-extrabold tracking-tightest text-bone transition-colors group-hover:text-bone-muted">
              TYKS{isPro && <span className="text-bone-muted"> Pro</span>}
            </span>
          </Link>

          {/* BARRE DE RECHERCHE CENTRALE — masquée sur pro.tyks.app */}
          {!isPro && (
            <div className="relative hidden md:block flex-1 max-w-lg mx-6" ref={searchRef}>
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-bone font-bold pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showDropdown) setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Rechercher un événement, un lieu..."
                  className="w-full bg-onyx-raised border-2 border-onyx-line rounded-2xl pl-11 pr-10 py-3 text-sm font-medium text-bone placeholder:text-bone-faint focus:outline-none focus:border-bone/65 transition-all shadow-xl"
                />

                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setResults([]);
                    }}
                    className="absolute right-3.5 text-bone-faint hover:text-bone transition-colors p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-onyx-raised border-2 border-onyx-line rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl divide-y divide-onyx-line">
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
                              router.push(`/evenements/${evt.id}`);
                            }}
                            className="w-full text-left px-5 py-3.5 hover:bg-onyx transition-all flex items-center justify-between group"
                          >
                            <div className="space-y-1.5 pr-4 truncate">
                              <p className="text-sm font-bold text-bone group-hover:text-white transition-colors truncate">
                                {evt.title}
                              </p>
                              <div className="flex items-center gap-4 text-xs font-mono text-bone-faint">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-bone" />
                                  {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1.5 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-bone" />
                                  {evt.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono text-xs font-bold text-bone bg-onyx px-3 py-1.5 rounded-lg border border-onyx-line shadow-sm">
                                {priceFormatted}
                              </span>
                              <ArrowUpRight className="w-4 h-4 text-bone-faint group-hover:text-bone transition-colors" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-xs text-bone-faint font-semibold uppercase tracking-wider">Aucun événement trouvé pour &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop right side */}
          <div className="hidden items-center gap-4 sm:flex shrink-0 ml-auto">
            {loadingUser ? (
              <div className="flex h-10 w-40 items-center justify-center rounded-full border border-onyx-line bg-onyx-raised">
                <Loader2 className="h-4 w-4 animate-spin text-bone-muted" />
              </div>
            ) : user ? (
              <>
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-sm font-medium text-bone">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-onyx-line px-4 py-2 text-sm font-medium text-bone transition hover:border-bone/40 hover:bg-onyx-raised"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx transition hover:bg-white"
              >
                {isPro ? "Connexion Pro" : "Connexion"}
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="inline-flex items-center justify-center rounded-full border border-onyx-line p-2 text-bone sm:hidden shrink-0"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="border-t border-onyx-line bg-onyx px-6 py-4 sm:hidden fade-rise space-y-4">
            {!isPro && (
              <>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-bone pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un événement..."
                    className="w-full bg-onyx-raised border border-onyx-line rounded-2xl pl-10 pr-4 py-3 text-xs text-bone placeholder:text-bone-faint focus:outline-none"
                  />
                </div>
                {searchQuery.trim().length > 0 && results.length > 0 && (
                  <div className="bg-onyx-raised border border-onyx-line rounded-2xl overflow-hidden divide-y divide-onyx-line">
                    {results.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setMobileOpen(false);
                          setSearchQuery("");
                          router.push(`/evenements/${evt.id}`);
                        }}
                        className="p-3 text-xs text-bone flex justify-between items-center"
                      >
                        <span className="font-semibold truncate">{evt.title}</span>
                        <span className="font-mono text-bone-faint">{evt.price ? `${evt.price} €` : "Gratuit"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {loadingUser ? (
              <div className="flex h-10 items-center justify-center rounded-full border border-onyx-line bg-onyx-raised">
                <Loader2 className="h-4 w-4 animate-spin text-bone-muted" />
              </div>
            ) : user ? (
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-sm font-medium text-bone">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-onyx-line px-4 py-2.5 text-sm font-medium text-bone"
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
                className="inline-flex w-full items-center justify-center rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx"
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
    </>
  );
}

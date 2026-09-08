"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { LogOut, Loader2, Menu, X, Search, Calendar, MapPin, ArrowUpRight } from "lucide-react";
import CustomAuthModal from "@/components/CustomAuthModal";
import { supabaseBrowser } from "@/lib/supabase-browser";

function truncateAddress(address: string) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}···${address.slice(-4)}`;
}

export default function Navbar() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const solanaWallet = wallets[0];
  const email = user?.email?.address ?? user?.google?.email ?? null;

  // Recherche en temps réel fluide (sans faire disparaître le conteneur)
  useEffect(() => {
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
  }, [searchQuery]);

  // Fermer le dropdown en cliquant à l'extérieur
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
          <Link href="/" className="group shrink-0">
            <span className="font-display text-2xl font-extrabold tracking-tightest text-bone transition-colors group-hover:text-bone-muted">
              TYKS
            </span>
          </Link>

          {/* BARRE DE RECHERCHE CENTRALE OPTIMISÉE */}
          <div className="relative hidden md:block flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-bone-faint pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!showDropdown) setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Rechercher un événement, un lieu..."
                className="w-full bg-onyx-raised/80 border border-onyx-line rounded-full pl-10 pr-10 py-2.5 text-xs text-bone placeholder:text-bone-faint focus:outline-none focus:border-bone/40 transition-all shadow-inner"
              />
              
              {/* Indicateur de chargement discret (ne décale rien) */}
              <div className="absolute right-3.5 flex items-center">
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-bone-faint" />
                ) : searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setResults([]);
                    }}
                    className="text-bone-faint hover:text-bone transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Dropdown stable et lisible */}
            {showDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2.5 bg-onyx-raised/95 border border-onyx-line rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl divide-y divide-onyx-line/60">
                {results.length > 0 ? (
                  <div className="py-1.5">
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
                          className="w-full text-left px-4 py-3 hover:bg-onyx/80 transition-all flex items-center justify-between group"
                        >
                          <div className="space-y-1 pr-3 truncate">
                            <p className="text-xs font-bold text-bone group-hover:text-white transition-colors truncate">
                              {evt.title}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-bone-faint">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-bone-faint" />
                                {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </span>
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-bone-faint" />
                                {evt.location}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-xs font-semibold text-bone bg-onyx px-2.5 py-1 rounded-md border border-onyx-line">
                              {priceFormatted}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-bone-faint group-hover:text-bone transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-bone-faint font-medium">Aucun événement trouvé pour &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop right side */}
          <div className="hidden items-center gap-4 sm:flex shrink-0">
            {!ready ? (
              <div className="flex h-10 w-40 items-center justify-center rounded-full border border-onyx-line bg-onyx-raised">
                <Loader2 className="h-4 w-4 animate-spin text-bone-muted" />
              </div>
            ) : authenticated ? (
              <>
                <div className="flex flex-col items-end leading-tight">
                  {email && <span className="text-sm font-medium text-bone">{email}</span>}
                  {solanaWallet && (
                    <span className="font-mono text-xs text-bone-faint">
                      {truncateAddress(solanaWallet.address)}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
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
                Connexion
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
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-bone-faint pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un événement..."
                className="w-full bg-onyx-raised border border-onyx-line rounded-full pl-10 pr-4 py-2.5 text-xs text-bone placeholder:text-bone-faint focus:outline-none"
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

            {!ready ? (
              <div className="flex h-10 items-center justify-center rounded-full border border-onyx-line bg-onyx-raised">
                <Loader2 className="h-4 w-4 animate-spin text-bone-muted" />
              </div>
            ) : authenticated ? (
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-col leading-tight">
                  {email && <span className="text-sm font-medium text-bone">{email}</span>}
                  {solanaWallet && (
                    <span className="font-mono text-xs text-bone-faint">
                      {truncateAddress(solanaWallet.address)}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
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
                Connexion
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

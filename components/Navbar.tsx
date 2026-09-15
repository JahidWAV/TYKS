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

  // États pour la modale de recherche dédiée
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus automatique sur l'input de recherche quand la modale s'ouvre
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchModalOpen]);

  // Logique de recherche en temps réel
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
          .limit(6);

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
      {/* NAVBAR FLOTTANTE NON FIXE */}
      <div className="absolute top-6 left-0 right-0 z-50 max-w-7xl mx-auto px-6 font-grotesque uppercase">
        <header className="w-full flex items-center justify-between gap-4">

          {/* 1. LOGO FLOTTANT GLASS -> HOVER NOIR (Hauteur calée à h-11) */}
          <Link 
            href="/" 
            className="group flex items-center justify-center shrink-0 h-11 px-5 bg-white/80 hover:bg-black backdrop-blur-md border border-black/15 rounded-full shadow-lg shadow-black/5 transition-all duration-300"
          >
            <Image 
              src="/tyks.svg" 
              alt="TYKS" 
              width={340} 
              height={110} 
              priority 
              className="h-6 sm:h-7 w-auto object-contain text-black group-hover:brightness-0 group-hover:invert transition-all duration-300" 
            />
          </Link>

          {/* 2. ZONE DROITE FLOTTANTE */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* BOUTON DE RECHERCHE DÉCLENCHEUR DE MODALE */}
            {!isPro && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="h-11 px-5 bg-white/80 hover:bg-black text-black hover:text-white backdrop-blur-md border border-black/15 transition-all duration-300 text-xs tracking-wider font-bold rounded-full shadow-lg shadow-black/5 flex items-center gap-2.5 shrink-0 cursor-pointer group"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>RECHERCHER...</span>
              </button>
            )}

            {/* BOUTON DYNAMIQUE GLASS -> HOVER NOIR */}
            <button
              onClick={handleMainButtonClick}
              className="h-11 px-7 bg-white/80 hover:bg-black text-black hover:text-white backdrop-blur-md border border-black/15 transition-all duration-300 text-xs tracking-wider font-bold rounded-full shadow-lg shadow-black/5 flex items-center justify-center shrink-0 cursor-pointer"
            >
              {user ? userName : "SE CONNECTER / S'INSCRIRE"}
            </button>

          </div>

          {/* MOBILE TOGGLE GLASS -> HOVER NOIR */}
          <div className="flex items-center md:hidden">
            <button
              className="inline-flex items-center justify-center bg-white/80 hover:bg-black text-black hover:text-white backdrop-blur-md border border-black/15 p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* MOBILE PANEL */}
        {mobileOpen && (
          <div className="px-6 py-6 md:hidden space-y-4 bg-white/90 backdrop-blur-xl border border-black/15 rounded-[2.5rem] mt-3 shadow-2xl text-black">
            {!isPro && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className="w-full h-11 bg-neutral-50 px-4 text-xs font-bold text-black/60 flex items-center justify-between rounded-full border border-black/15 shadow-inner"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  RECHERCHER UN ÉVÉNEMENT...
                </span>
              </button>
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

      {/* MODALE DE RECHERCHE SMOOTH AVEC EFFET GLASS */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 font-grotesque uppercase">
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl border border-black/15 p-6 md:p-8 shadow-2xl text-black rounded-[2.5rem] animate-in zoom-in-95 duration-200">
            
            {/* En-tête de la modale avec barre de recherche active */}
            <div className="flex items-center gap-3 pb-6 border-b border-black/10">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-black/60 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="RECHERCHER UN ÉVÉNEMENT, UN LIEU..."
                  className="w-full h-13 bg-white/60 border border-black/15 pl-12 pr-4 text-xs font-bold placeholder:text-black/40 focus:outline-none focus:border-black text-black rounded-full shadow-inner uppercase"
                />
              </div>

              <button
                onClick={() => {
                  setIsSearchModalOpen(false);
                  setSearchQuery("");
                  setResults([]);
                }}
                className="h-13 w-13 shrink-0 border border-black/15 bg-white/80 hover:bg-black text-black hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer rounded-full shadow-sm"
                aria-label="Fermer la recherche"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Résultats de recherche */}
            <div className="mt-6 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {searchQuery.trim().length === 0 ? (
                <div className="py-12 text-center text-black/40 text-xs font-bold tracking-wider">
                  COMMENCEZ À TAPER POUR LANCER LA RECHERCHE...
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((evt) => {
                    const priceFormatted = evt.price && parseFloat(evt.price) > 0
                      ? `${parseFloat(evt.price).toFixed(2)} €`
                      : 'GRATUIT';

                    return (
                      <button
                        key={evt.id}
                        onClick={() => {
                          setIsSearchModalOpen(false);
                          setSearchQuery("");
                          setResults([]);
                          router.push(`/events/${evt.slug || evt.id}`);
                        }}
                        className="w-full text-left px-5 py-4 bg-white/50 hover:bg-black hover:text-white border border-black/15 rounded-2xl transition-all duration-300 flex items-center justify-between group cursor-pointer shadow-sm"
                      >
                        <div className="space-y-1 pr-3 truncate">
                          <p className="text-xs font-bold truncate">
                            {evt.title}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] text-black/60 group-hover:text-white/70 font-bold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(evt.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3" />
                              {evt.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-bold px-3 py-1.5 border border-black/15 bg-white group-hover:bg-neutral-800 group-hover:text-white group-hover:border-white/20 text-black rounded-full transition-colors">
                            {priceFormatted}
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-black/40 group-hover:text-white transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-black/50 text-xs font-bold tracking-wider">
                  AUCUN RÉSULTAT TROUVÉ POUR &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <CustomAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

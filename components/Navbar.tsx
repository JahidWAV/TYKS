"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Menu } from "lucide-react";
import CustomAuthModal from "@/components/CustomAuthModal";
import SearchModal from "@/components/SearchModal";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface NavbarProps {
  isPro?: boolean;
  isDarkMode?: boolean;
}

export default function Navbar({ isPro = false, isDarkMode = false }: NavbarProps) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "MON COMPTE";
        setUserName(metaName.toUpperCase());
      }
      setIsInitialized(true);
    };

    fetchUserData();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "MON COMPTE";
        setUserName(metaName.toUpperCase());
      }
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMainButtonClick = () => {
    if (user) {
      router.push("/settings");
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      <div className="w-full bg-white z-50 max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-4 font-sans shrink-0">
        <header className="w-full flex items-center justify-between gap-4">

          {/* 1. BLOC GAUCHE (Logo TYKS grand format) */}
          <div className="flex items-center justify-start">
            <Link 
              href="/" 
              className="group flex items-center justify-center shrink-0 transition-opacity duration-300 hover:opacity-75"
            >
              <div className="w-[160px] sm:w-[200px] md:w-[240px] flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="TYKS" 
                  width={600} 
                  height={200} 
                  priority 
                  className="w-full h-auto object-contain" 
                />
              </div>
            </Link>
          </div>

          {/* 2. BLOC DROITE (Recherche + Compte / Connexion - Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {!isPro && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="h-11 w-11 bg-transparent hover:bg-neutral-100 text-neutral-950 border border-neutral-300 transition-all duration-300 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
              </button>
            )}

            <button
              onClick={handleMainButtonClick}
              className={`h-11 px-7 bg-transparent hover:bg-neutral-100 text-neutral-950 border border-neutral-300 transition-all duration-300 text-xs tracking-wider font-bold rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs ${
                !isInitialized ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {user ? userName : "SE CONNECTER / S'INSCRIRE"}
            </button>
          </div>

          {/* MENU MOBILE (DROITE) */}
          <div className="flex items-center justify-end gap-2 md:hidden">
            {!isPro && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="h-11 w-11 bg-transparent hover:bg-neutral-100 text-neutral-950 border border-neutral-300 transition-all duration-300 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
              </button>
            )}

            <button
              className="inline-flex items-center justify-center bg-transparent text-neutral-950 border border-neutral-300 p-3 rounded-full transition-all duration-300 cursor-pointer hover:bg-neutral-100 shadow-xs"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="px-6 py-6 md:hidden space-y-4 bg-white border border-neutral-200 rounded-[2.5rem] mt-3 shadow-xl text-neutral-950">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleMainButtonClick();
              }}
              className={`w-full h-12 bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-wider font-bold rounded-full shadow-md flex items-center justify-center cursor-pointer ${
                !isInitialized ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {user ? userName : "SE CONNECTER / S'INSCRIRE"}
            </button>
          </div>
        )}
      </div>

      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />

      <CustomAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

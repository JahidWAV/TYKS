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
  
  // Initialisation paresseuse (lazy state) pour récupérer la session immédiatement et éviter le sursaut
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

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
      <div className="absolute top-6 left-0 right-0 z-50 max-w-7xl mx-auto px-6 lg:px-12 font-grotesque uppercase">
        <header className="w-full grid grid-cols-3 items-center gap-4">

          {/* COLONNE GAUCHE : RECHERCHE */}
          <div className="flex items-center justify-start">
            {!isPro && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="h-11 w-11 bg-transparent hover:bg-white/10 text-white border border-white/15 transition-all duration-300 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4 shrink-0" />
              </button>
            )}
          </div>

          {/* COLONNE CENTRE : LOGO */}
          <div className="flex items-center justify-center">
            <Link 
              href="/" 
              className="group flex items-center justify-center shrink-0 transition-opacity duration-300 hover:opacity-75"
            >
              <Image 
                src="/tyks.svg" 
                alt="TYKS" 
                width={340} 
                height={110} 
                priority 
                className="h-8 sm:h-10 w-auto object-contain brightness-0 invert transition-all duration-300" 
              />
            </Link>
          </div>

          {/* COLONNE DROITE : COMPTE / CONNEXION */}
          <div className="hidden md:flex items-center justify-end">
            <button
              onClick={handleMainButtonClick}
              className={`h-11 px-7 bg-transparent hover:bg-white/10 text-white border border-white/15 transition-all duration-300 text-xs tracking-wider font-bold rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                !isInitialized ? "opacity-0" : "opacity-100"
              }`}
            >
              {user ? userName : "SE CONNECTER / S'INSCRIRE"}
            </button>
          </div>

          {/* MENU MOBILE (DROITE) */}
          <div className="flex items-center justify-end md:hidden">
            <button
              className="inline-flex items-center justify-center bg-transparent text-white border border-white/15 p-3 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/10"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="px-6 py-6 md:hidden space-y-4 bg-neutral-900 border border-white/15 rounded-[2.5rem] mt-3 shadow-2xl text-white">
            {!isPro && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className="w-full h-11 bg-neutral-950 px-4 text-xs font-bold text-white/60 flex items-center justify-center gap-2 rounded-full border border-white/15 shadow-inner"
              >
                <Search className="h-4 w-4" />
                <span>RECHERCHER UN ÉVÉNEMENT...</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileOpen(false);
                handleMainButtonClick();
              }}
              className="w-full h-12 bg-white text-black hover:bg-neutral-200 text-xs tracking-wider font-bold rounded-full shadow-md flex items-center justify-center cursor-pointer"
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

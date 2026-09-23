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
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "mon compte";
        setUserName(metaName.toLowerCase());
      }
      setIsInitialized(true);
    };

    fetchUserData();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "mon compte";
        setUserName(metaName.toLowerCase());
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
      {/* Navbar fixée en haut avec transparence, flou et sans bordure */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 backdrop-blur-md shrink-0 font-sans">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-6">

          {/* 1. LOGO */}
          <div className="flex items-center justify-start">
            <Link 
              href="/" 
              className="group flex items-center justify-center shrink-0 transition-opacity duration-300 hover:opacity-75"
            >
              <div className="w-[130px] sm:w-[150px] flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="TYKS" 
                  width={500} 
                  height={160} 
                  priority 
                  className="w-full h-auto object-contain brightness-0" 
                />
              </div>
            </Link>
          </div>

          {/* 2. LIENS / ACTIONS DESKTOP (Textes en minuscules) */}
          <div className="hidden md:flex items-center gap-3">
            {!isPro && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="h-11 px-5 bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-950 transition-all duration-300 rounded-full flex items-center gap-2 text-xs font-grotesque font-bold cursor-pointer"
              >
                <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                <span>rechercher</span>
              </button>
            )}

            <button
              onClick={handleMainButtonClick}
              className={`h-11 px-6 bg-neutral-950 hover:bg-neutral-800 text-white transition-all duration-300 text-xs tracking-wide font-grotesque font-bold rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-sm ${
                !isInitialized ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {user ? userName : "se connecter / s'inscrire"}
            </button>
          </div>

          {/* MENU MOBILE (BOUTON) */}
          <div className="flex items-center justify-end gap-2 md:hidden">
            {!isPro && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="h-10 w-10 bg-neutral-100/80 text-neutral-950 rounded-full flex items-center justify-center cursor-pointer"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4" strokeWidth={2} />
              </button>
            )}

            <button
              className="inline-flex items-center justify-center bg-neutral-100/80 text-neutral-950 p-2.5 rounded-full cursor-pointer"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* MENU MOBILE DÉPLIÉ */}
        {mobileOpen && (
          <div className="px-6 py-4 md:hidden bg-white/95 backdrop-blur-md space-y-3">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleMainButtonClick();
              }}
              className={`w-full h-12 bg-neutral-950 text-white text-xs tracking-wide font-bold rounded-full flex items-center justify-center ${
                !isInitialized ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {user ? userName : "se connecter / s'inscrire"}
            </button>
          </div>
        )}
      </header>

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

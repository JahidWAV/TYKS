"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Menu } from "lucide-react";
import CustomAuthModal from "@/components/CustomAuthModal";
import SearchModal from "@/components/SearchModal";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Ajout de isPro?: boolean ici pour corriger l'erreur de build
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

  const handleMainButtonClick = () => {
    if (user) {
      router.push("/settings");
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      <div className="absolute top-6 left-0 right-0 z-50 max-w-7xl mx-auto px-6 font-grotesque uppercase">
        <header className="w-full flex items-center justify-between gap-4">

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
              className="h-8 sm:h-10 w-auto object-contain text-black group-hover:brightness-0 group-hover:invert transition-all duration-300" 
            />
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {!isPro && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="h-11 w-11 bg-white/80 hover:bg-black text-black hover:text-white backdrop-blur-md border border-black/15 transition-all duration-300 rounded-full shadow-lg shadow-black/5 flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4 shrink-0" />
              </button>
            )}

            <button
              onClick={handleMainButtonClick}
              className="h-11 px-7 bg-white/80 hover:bg-black text-black hover:text-white backdrop-blur-md border border-black/15 transition-all duration-300 text-xs tracking-wider font-bold rounded-full shadow-lg shadow-black/5 flex items-center justify-center shrink-0 cursor-pointer"
            >
              {user ? userName : "SE CONNECTER / S'INSCRIRE"}
            </button>
          </div>

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

        {mobileOpen && (
          <div className="px-6 py-6 md:hidden space-y-4 bg-white/90 backdrop-blur-xl border border-black/15 rounded-[2.5rem] mt-3 shadow-2xl text-black">
            {!isPro && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className="w-full h-11 bg-neutral-50 px-4 text-xs font-bold text-black/60 flex items-center justify-center gap-2 rounded-full border border-black/15 shadow-inner"
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
              className="w-full h-12 bg-black text-white hover:bg-neutral-800 text-xs tracking-wider font-bold rounded-full shadow-md flex items-center justify-center cursor-pointer"
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

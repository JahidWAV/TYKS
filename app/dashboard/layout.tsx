'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      setUser(session?.user ?? null);
    }
    checkAuth();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { label: "ÉVÉNEMENTS", href: '/' },
    { label: 'STATISTIQUES', href: '/stats' },
    { label: 'FINANCES', href: '/banking' },
  ];

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white/60 font-grotesque text-xs tracking-wider flex items-center justify-center uppercase">
        CHARGEMENT...
      </div>
    );
  }

  if (!user) {
    return <main className="min-h-screen w-full bg-[#0f0f0f]">{children}</main>;
  }

  const isProfileActive = pathname === '/settings'; 
  const isSettingsActive = pathname.startsWith('/settings');

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-white selection:text-black flex flex-col uppercase overflow-x-hidden">

      {/* Barre de navigation horizontale : Logo à gauche, liens et bulles à droite */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/10 bg-[#0f0f0f] flex items-center justify-between px-6 lg:px-12 z-50 select-none">
        
        {/* 1. Logo à gauche (taille augmentée) */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group py-2">
            <Image 
              src="/tyks.svg" 
              alt="TYKS" 
              width={280} 
              height={88} 
              priority 
              className="h-[4.5rem] w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105" 
            />
          </Link>
        </div>

        {/* 2. Navigation et actions à droite */}
        <div className="hidden lg:flex items-center gap-6">
          
          {/* Liens de pages (Événements, Statistiques, Finances) */}
          <nav className="flex items-center gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
                    isActive
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Séparateur visuel discret */}
          <div className="h-6 w-[1px] bg-white/15" />

          {/* Bulles de profil et paramètres/déconnexion */}
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className={`h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
                isProfileActive
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              PROFIL
            </Link>
            <Link
              href="/settings"
              className={`h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
                isSettingsActive
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              PARAMÈTRES
            </Link>
            <button
              onClick={handleLogout}
              className="h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              DÉCONNEXION
            </button>
          </div>

        </div>

      </header>

      {/* Menu mobile (écrans petits) */}
      <div className="flex lg:hidden items-center justify-around bg-neutral-950 border-b border-white/10 px-4 py-3 fixed top-20 left-0 right-0 z-40 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full border text-[10px] font-bold transition-all whitespace-nowrap ${
                isActive ? 'bg-white text-black border-white' : 'bg-transparent text-white/80 border-white/15'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Conteneur principal */}
      <main className="flex-1 w-full pt-28 lg:pt-32 pb-12 bg-[#0f0f0f] font-grotesque text-white">
        {children}
      </main>

    </div>
  );
}

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

      {/* Barre de navigation horizontale */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/10 bg-[#0f0f0f] grid grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-12 z-50 select-none">
        
        {/* 1. Menu de gauche : 3 bulles occupant la largeur d'une carte */}
        <nav className="hidden lg:grid grid-cols-3 gap-3 font-grotesque w-full max-w-[420px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-11 w-full flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
                  isActive
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 2. Bloc milieu : Logo centré et agrandi par 2 */}
        <div className="flex items-center justify-center">
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

        {/* 3. Bloc droite : 3 bulles occupant la largeur d'une carte */}
        <div className="hidden lg:grid grid-cols-3 gap-3 font-grotesque w-full max-w-[420px] justify-self-end">
          <Link
            href="/settings"
            className={`h-11 w-full flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
              isProfileActive
                ? 'bg-white text-black border-white font-bold'
                : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
            }`}
          >
            PROFIL
          </Link>
          <Link
            href="/settings"
            className={`h-11 w-full flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
              isSettingsActive
                ? 'bg-white text-black border-white font-bold'
                : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
            }`}
          >
            PARAMÈTRES
          </Link>
          <button
            onClick={handleLogout}
            className="h-11 w-full flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            SE DÉCONNECTER
          </button>
        </div>

      </header>

      {/* Menu mobile (écrans petits) */}
      <div className="flex lg:hidden items-center justify-around bg-neutral-950 border-b border-white/10 px-4 py-3 fixed top-20 left-0 right-0 z-40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full border text-[10px] font-bold transition-all ${
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

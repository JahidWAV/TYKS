'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LogOut, Shield, Sliders 
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState<string>("MON COMPTE");
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const metaName = currentUser.user_metadata?.first_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "MON COMPTE";
        setUserName(metaName.toUpperCase());
      }
    }
    checkAuth();

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const metaName = currentUser.user_metadata?.first_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "MON COMPTE";
        setUserName(metaName.toUpperCase());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-white selection:text-black flex flex-col uppercase overflow-x-hidden">

      {/* Barre de navigation horizontale */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/10 bg-[#0f0f0f] flex items-center justify-between px-8 z-50 select-none">
        
        {/* 1. Bloc gauche */}
        <div className="flex items-center justify-start w-48 shrink-0">
          <Link href="/" className="flex items-center group py-2">
            <Image 
              src="/tyks.svg" 
              alt="TYKS" 
              width={140} 
              height={44} 
              priority 
              className="h-9 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105" 
            />
          </Link>
        </div>

        {/* 2. Menu du milieu : 3 bulles de taille rigoureusement identique (w-40) */}
        <nav className="hidden lg:flex items-center justify-center gap-3 font-grotesque absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-11 w-40 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
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

        {/* 3. Bloc droite */}
        <div className="flex items-center justify-end w-48 shrink-0">
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="h-11 px-7 bg-transparent hover:bg-white/10 text-white border border-white/15 transition-all text-xs tracking-wider font-grotesque font-bold rounded-full shadow-md flex items-center justify-center shrink-0 cursor-pointer"
            >
              {userName}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-neutral-900 border border-white/15 shadow-2xl rounded-3xl py-2 z-50 font-grotesque text-xs text-white">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-neutral-950/50">
                  <div className="min-w-0">
                    <p className="font-bold truncate text-white">{userName}</p>
                    <p className="text-[10px] text-white/50 truncate lowercase">{user.email}</p>
                  </div>
                </div>

                <div className="py-2 space-y-1 px-2">
                  <Link 
                    href="/settings" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors tracking-wide font-bold text-white/80"
                  >
                    <span>PROFIL</span>
                  </Link>

                  <Link 
                    href="/settings/security" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors tracking-wide font-bold text-white/80"
                  >
                    <Shield className="w-4 h-4 text-white" />
                    <span>SÉCURITÉ</span>
                  </Link>

                  <Link 
                    href="/settings/preferences" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors tracking-wide font-bold text-white/80"
                  >
                    <Sliders className="w-4 h-4 text-white" />
                    <span>PRÉFÉRENCES</span>
                  </Link>
                </div>

                <div className="border-t border-white/10 pt-2 px-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-neutral-800 transition-colors tracking-wide font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>SE DÉCONNECTER</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
      <main className="flex-1 w-full pt-20 lg:pt-20 p-8 bg-[#0f0f0f] font-grotesque text-white">
        {children}
      </main>

    </div>
  );
}
```[cite: 1]

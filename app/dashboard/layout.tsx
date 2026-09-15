'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, 
  Wallet, LogOut, Shield, Sliders, ChevronRight 
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const SIDEBAR_STORAGE_KEY = 'tyks_sidebar_open';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) setIsOpen(stored === 'true');
    } catch {
      // stockage indisponible
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
    } catch {
      // stockage indisponible
    }
  }, [isOpen, mounted]);

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
    { label: "Vue d'ensemble", href: '/', icon: LayoutDashboard },
    { label: 'Événements', href: '/admin-events', icon: Calendar },
    { label: 'Statistiques', href: '/stats', icon: BarChart3 },
    { label: 'Finances & Paiements', href: '/banking', icon: Wallet },
  ];

  const getBreadcrumbs = () => {
    if (pathname === '/') return ["Vue d'ensemble"];
    const segments = pathname.split('/').filter(Boolean);
    
    return segments.map(seg => {
      const match = navItems.find(item => item.href === `/${seg}`);
      if (match) return match.label;
      return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    });
  };

  const breadcrumbs = getBreadcrumbs();

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-white text-[#1e3932]/60 font-grotesque text-xs tracking-wider flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <main className="min-h-screen w-full bg-white">{children}</main>;
  }

  const SIDEBAR_WIDTH = isOpen ? 'w-64' : 'w-16';
  const CONTENT_MARGIN = isOpen ? 'ml-64' : 'ml-16';

  return (
    <div className="min-h-screen bg-white text-[#1e3932] font-sans selection:bg-[#1e3932] selection:text-white flex overflow-x-hidden">

      {/* Barre supérieure fixe */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-[#1e3932]/10 bg-white flex items-center justify-between shrink-0 z-50 select-none shadow-xs px-6">
        <div className="flex items-center h-full">
          <div className="w-16 h-full flex items-center justify-center shrink-0 border-r border-[#1e3932]/10 bg-[#f8faf9] -ml-6 mr-6">
            <Link href="/" className="w-9 h-9 flex items-center justify-center group">
              <span className="h-8 w-8 rounded-lg bg-[#1e3932] text-white flex items-center justify-center font-grotesque font-bold text-xs transition-transform group-hover:scale-105">
                T
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-grotesque tracking-wide">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#1e3932]/40" />}
                <span className={`flex items-center ${index === breadcrumbs.length - 1 ? "bg-[#1e3932]/10 text-[#1e3932] border border-[#1e3932]/20 px-3 py-1 font-bold rounded-full" : "text-[#1e3932]/60"}`}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOUTON UTILISATEUR AVEC POLICE GROTESQUE */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="h-10 px-6 bg-[#1e3932] hover:bg-[#152a25] transition-all text-white text-xs tracking-wider font-grotesque font-normal rounded-full shadow-md flex items-center justify-center shrink-0 cursor-pointer"
          >
            {userName}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-[#1e3932]/15 shadow-2xl rounded-3xl py-2 z-50 font-grotesque text-xs text-[#1e3932]">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1e3932]/10 bg-[#f8faf9]">
                <div className="min-w-0">
                  <p className="font-bold truncate text-[#1e3932]">{userName}</p>
                  <p className="text-[10px] text-[#1e3932]/60 truncate">{user.email}</p>
                </div>
              </div>

              <div className="py-2 space-y-1 px-2">
                <Link 
                  href="/settings" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1e3932]/5 hover:text-[#1e3932] transition-colors tracking-wide font-bold text-[#1e3932]/80"
                >
                  <span>Profil</span>
                </Link>

                <Link 
                  href="/settings/security" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1e3932]/5 hover:text-[#1e3932] transition-colors tracking-wide font-bold text-[#1e3932]/80"
                >
                  <Shield className="w-4 h-4 text-[#1e3932]" />
                  <span>Sécurité</span>
                </Link>

                <Link 
                  href="/settings/preferences" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1e3932]/5 hover:text-[#1e3932] transition-colors tracking-wide font-bold text-[#1e3932]/80"
                >
                  <Sliders className="w-4 h-4 text-[#1e3932]" />
                  <span>Préférences</span>
                </Link>
              </div>

              <div className="border-t border-[#1e3932]/10 pt-2 px-2">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors tracking-wide font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-20 left-0 h-[calc(100vh-5rem)] ${SIDEBAR_WIDTH} border-r border-[#1e3932]/10 bg-white flex flex-col py-6 z-40 select-none overflow-hidden ${
        mounted ? 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''
      }`}>

        <div className="flex-1 w-full flex flex-col justify-center gap-3 px-3 font-grotesque">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isOpen ? undefined : item.label}
                className={`flex items-center h-12 transition-all font-grotesque text-xs tracking-wide group rounded-xl ${
                  isOpen ? 'px-3 gap-3 border shadow-xs' : 'justify-center border border-transparent'
                } ${
                  isActive
                    ? 'bg-[#1e3932] text-white border-[#1e3932] font-bold shadow-md'
                    : 'bg-[#f8faf9] text-[#1e3932]/80 border-[#1e3932]/10 hover:bg-[#1e3932]/5 hover:text-[#1e3932]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#1e3932]'}`} />
                <span
                  className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className={`w-full flex items-center border-t border-[#1e3932]/10 pt-4 px-3 ${isOpen ? '' : 'justify-center'}`}>
          <button
            onClick={() => setIsOpen(prev => !prev)}
            title={isOpen ? 'Réduire le menu' : 'Déployer le menu'}
            aria-label={isOpen ? 'Réduire le menu' : 'Déployer le menu'}
            aria-pressed={isOpen}
            className="w-10 h-10 rounded-xl border border-[#1e3932]/15 bg-[#f8faf9] text-[#1e3932] flex items-center justify-center hover:bg-[#1e3932] hover:text-white transition-all shrink-0 cursor-pointer shadow-sm"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Conteneur principal */}
      <div 
        className={`flex-1 min-w-0 flex flex-col h-screen pt-20 overflow-hidden ${CONTENT_MARGIN} ${
          mounted ? 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''
        }`}
      >
        <main className="flex-1 overflow-y-auto p-8 bg-white font-grotesque">
          {children}
        </main>
      </div>
    </div>
  );
}

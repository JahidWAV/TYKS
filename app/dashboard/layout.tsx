'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, Megaphone, 
  Users, Wallet, Globe, LogOut, Loader2, User, ChevronRight, Shield, Sliders 
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  const [isHovered, setIsHovered] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  // Fermer le menu profil si on clique en dehors
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
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Events', href: '/admin-events', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Marketing', href: '/marketing', icon: Megaphone },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Banking & Payouts', href: '/banking', icon: Wallet },
    { label: 'My Page', href: '/page', icon: Globe },
  ];

  // Génération dynamique du fil d'Ariane
  const getBreadcrumbs = () => {
    if (pathname === '/') return ['Overview'];
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
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  if (!user) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex selection:bg-[#111110] selection:text-[#F7F5F0] overflow-x-hidden">
      
      {/* 1. Barre d'icônes fixe à gauche (w-16) */}
      <aside className="fixed top-0 left-0 h-screen w-16 border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col items-center justify-between py-6 z-40 select-none">
        
        {/* Logo icône du haut */}
        <div className="flex items-center justify-center">
          <Link href="/" className="w-10 h-10 flex items-center justify-center group">
            <img 
              src="/icon.svg" 
              alt="TYKS" 
              className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Liens icônes centraux */}
        <div className="space-y-2 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`w-12 h-10 mx-auto flex items-center justify-center rounded-xl transition-all group ${
                  isActive
                    ? 'bg-[#111110] text-[#F7F5F0] shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-[#F7F5F0]' : 'opacity-70'}`} />
              </Link>
            );
          })}
        </div>

        {/* Bas de sidebar */}
        <div className="space-y-2 w-full px-2 border-t border-[#111110]/10 pt-4 bg-[#F7F5F0]">
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="w-12 h-10 mx-auto flex items-center justify-center rounded-xl text-red-600 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-70" />
          </button>
        </div>
      </aside>

      {/* 2. Panneau textuel contextuel au survol */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-16 h-screen bg-[#F7F5F0] border-r border-[#111110]/10 flex flex-col justify-between z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden select-none ${
          isHovered ? 'w-56 opacity-100 shadow-xl' : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* En-tête parfaitement aligné en hauteur (h-14) avec le header principal */}
        <div className="h-14 px-5 flex items-center border-b border-[#111110]/10 shrink-0 whitespace-nowrap">
          <img src="/tyks.svg" alt="TYKS" className="h-4 w-auto object-contain" />
        </div>

        {/* Navigation textuelle */}
        <div className="space-y-1 w-full px-3 flex-1 pt-4">
          <p className="text-[10px] font-mono uppercase tracking-wider opacity-40 px-3 pb-2">
            Workspace
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center h-10 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#111110] text-[#F7F5F0] font-semibold shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Bas du panneau */}
        <div className="px-3 space-y-1 border-t border-[#111110]/10 py-4">
          <Link 
            href="/settings" 
            className={`flex items-center h-10 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              pathname === '/settings'
                ? 'bg-[#111110] text-[#F7F5F0]'
                : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
            }`}
          >
            Réglages
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center h-10 px-3 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 whitespace-nowrap transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {/* 3. Contenu principal et Header dynamique */}
      <div 
        className={`flex-1 min-w-0 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHovered ? 'ml-72' : 'ml-16'
        }`}
      >
        {/* Header avec fil d'ariane typographié et menu profil */}
        <header className="h-14 border-b border-[#111110]/10 bg-[#F7F5F0] px-6 flex items-center justify-between shrink-0 z-20">
          
          {/* Fil d'ariane centré verticalement, police grossie et lisible */}
          <div className="flex items-center gap-2.5 text-sm tracking-tight font-medium text-[#111110]/60">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2.5">
                {index > 0 && <ChevronRight className="w-4 h-4 opacity-30" />}
                <span className={index === breadcrumbs.length - 1 ? "text-[#111110] font-bold text-base" : ""}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>

          {/* Icône de profil avec menu déroulant */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-full bg-[#111110]/5 border border-[#111110]/10 flex items-center justify-center hover:bg-[#111110]/10 transition"
              title="Mon profil"
            >
              <User className="w-4 h-4 opacity-70" />
            </button>

            {/* Menu déroulant profil */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#F7F5F0] border border-[#111110]/10 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#111110]/10 mb-1">
                  <p className="text-xs font-semibold truncate">{user.email}</p>
                  <p className="text-[10px] opacity-50 uppercase tracking-wider">Compte personnel</p>
                </div>

                <Link 
                  href="/settings" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition"
                >
                  <User className="w-4 h-4" />
                  Profil
                </Link>

                <Link 
                  href="/settings/security" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition"
                >
                  <Shield className="w-4 h-4" />
                  Sécurité
                </Link>

                <Link 
                  href="/settings/preferences" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition"
                >
                  <Sliders className="w-4 h-4" />
                  Préférences
                </Link>

                <div className="border-t border-[#111110]/10 my-1 pt-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Zone de contenu scrollable */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

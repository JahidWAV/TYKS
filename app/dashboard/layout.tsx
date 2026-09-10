'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, Megaphone, 
  Users, Wallet, Globe, Settings, LogOut, Loader2, ChevronDown, Cpu 
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  const [isHovered, setIsHovered] = useState(false);

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
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Events', href: '/admin-events', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Marketing', href: '/marketing', icon: Megaphone },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Banking & Payouts', href: '/banking', icon: Wallet },
    { label: 'My Page', href: '/page', icon: Globe },
  ];

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
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex selection:bg-[#111110] selection:text-[#F7F5F0]">
      
      {/* Sidebar globale avec effet hover */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex sticky top-0 h-screen shrink-0 select-none z-25"
      >
        {/* 1. Colonne fixe des icônes à gauche */}
        <div className="w-16 border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col items-center justify-between py-4 z-10">
          
          {/* Logo / Icône fixe en haut */}
          <div className="flex items-center justify-center">
            <Link href="/" className="w-10 h-10 flex items-center justify-center group">
              <img 
                src="/icon.svg" 
                alt="TYKS" 
                className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Icônes de navigation centrales */}
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

          {/* Bas de sidebar (Réglages & Déconnexion) */}
          <div className="space-y-2 w-full px-2 border-t border-[#111110]/10 pt-3 bg-[#F7F5F0]">
            <Link 
              href="/settings" 
              title="Réglages"
              className={`w-12 h-10 mx-auto flex items-center justify-center rounded-xl transition ${
                pathname === '/settings'
                  ? 'bg-[#111110] text-[#F7F5F0]'
                  : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
              }`}
            >
              <Settings className="w-5 h-5 opacity-70" />
            </Link>

            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="w-12 h-10 mx-auto flex items-center justify-center rounded-xl text-red-600 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5 opacity-70" />
            </button>
          </div>
        </div>

        {/* 2. Panneau contextuel coulissant (S'ouvre au survol) */}
        <div className={`bg-[#F7F5F0] border-r border-[#111110]/10 flex flex-col justify-between py-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isHovered ? 'w-56 opacity-100' : 'w-0 opacity-0 pointer-events-none'
        }`}>
          
          {/* En-tête du panneau (Similaire au breadcrumb Supabase) */}
          <div className="px-4 flex items-center justify-between whitespace-nowrap h-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-tight">TYKS Workspace</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </div>
          </div>

          {/* Liste des liens de navigation du panneau */}
          <div className="space-y-1 w-full px-3 flex-1 pt-2">
            <p className="text-[10px] font-mono uppercase tracking-wider opacity-40 px-3 pb-2">
              Navigation
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

          {/* Bas du panneau secondaire */}
          <div className="px-3 space-y-1 border-t border-[#111110]/10 pt-3">
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
      </aside>

      {/* Contenu principal avec sa barre du haut intégrée */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Barre supérieure du dashboard (reliée au design system) */}
        <header className="h-14 border-b border-[#111110]/10 bg-[#F7F5F0] px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 text-xs font-medium opacity-70">
            <span>Projet</span>
            <span>/</span>
            <span className="text-[#111110] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Production
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#111110]/5 opacity-80">
              v2.0-stable
            </span>
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

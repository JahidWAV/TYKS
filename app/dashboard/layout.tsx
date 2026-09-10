'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, Megaphone, 
  Users, Wallet, Globe, Settings, LogOut, Loader2 
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
      
      {/* Sidebar globale */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex sticky top-0 h-screen shrink-0 select-none z-30"
      >
        {/* 1. Colonne fixe des icônes (Toujours visible, largeur w-16) */}
        <div className="w-16 border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col items-center justify-between py-6 z-20">
          
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

          {/* Icônes de navigation */}
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
          <div className="space-y-2 w-full px-2 border-t border-[#111110]/10 pt-4 bg-[#F7F5F0]">
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

        {/* 2. Panneau flottant en ABSOLU (Se superpose sans tout décaler) */}
        <div className={`absolute top-0 left-16 h-full bg-[#F7F5F0] border-r border-[#111110]/15 shadow-2xl flex flex-col justify-between py-6 transition-all duration-200 ease-out overflow-hidden z-40 ${
          isHovered ? 'w-56 opacity-100 pointer-events-auto' : 'w-0 opacity-0 pointer-events-none'
        }`}>
          
          {/* En-tête du panneau avec le logo texte */}
          <div className="px-5 flex items-center h-10 whitespace-nowrap">
            <img src="/tyks.svg" alt="TYKS" className="h-4 w-auto object-contain" />
          </div>

          {/* Liens de navigation avec texte */}
          <div className="space-y-1 w-full px-3 flex-1 pt-2">
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

          {/* Bas du panneau secondaire */}
          <div className="px-3 space-y-1 border-t border-[#111110]/10 pt-4">
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

      {/* Contenu principal et sa barre du haut */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[#111110]/10 bg-[#F7F5F0] px-6 flex items-center justify-between shrink-0 z-10">
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

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

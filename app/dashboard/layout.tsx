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
  
  // État gérant l'ouverture du panneau secondaire au survol de la sidebar
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
      
      {/* Sidebar globale (Conteneur du survol) */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex sticky top-0 h-screen shrink-0 select-none z-25"
      >
        {/* 1. Barre fixe des icônes (Largeur w-16 stricte) */}
        <div className="w-16 border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col items-center justify-between py-6 z-10">
          
          {/* Logo / Icône fixe */}
          <div className="flex items-center justify-center pt-1">
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

          {/* Bas de sidebar (Réglages & Déconnexion en icônes) */}
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

        {/* 2. Panneau secondaire contextuel coulissant (Apparaît au survol) */}
        <div className={`bg-[#F7F5F0] border-r border-[#111110]/10 flex flex-col justify-between py-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isHovered ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'
        }`}>
          
          {/* En-tête du panneau (Nom du projet / Marque) */}
          <div className="px-4 pt-1 whitespace-nowrap">
            <span className="text-xs font-mono font-semibold tracking-wider opacity-40 uppercase">
              Workspace
            </span>
          </div>

          {/* Libellés de navigation */}
          <div className="space-y-2 w-full px-3">
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
          <div className="px-3 space-y-2 border-t border-transparent pt-4">
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

      {/* Contenu principal */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

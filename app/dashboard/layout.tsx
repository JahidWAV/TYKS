'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, Megaphone, 
  Users, Wallet, Globe, Settings, LogOut, Loader2, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  
  // 1. État pour gérer l'ouverture/fermeture (réduction) du menu latéral
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      
      {/* 2. Barre latérale adaptative : largeur dynamique (w-20 si réduit, w-64 si ouvert) */}
      <aside className={`border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col justify-between sticky top-0 h-screen shrink-0 select-none z-25 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* En-tête & Navigation */}
        <div className={`p-6 space-y-8 overflow-y-auto ${isCollapsed ? 'px-4' : 'px-6'}`}>
          
          {/* Logo agrandi (passé de w-7 h-7 à w-10 h-10) et mis en valeur */}
          <div className="flex items-center justify-between group pt-1">
            <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 512 512" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-10 h-10 transition-transform group-hover:scale-105 shrink-0"
              >
                <rect width="512" height="512" fill="transparent" />
                <path 
                  d="M160 160 H352 A20 20 0 0 1 372 180 V220 A20 20 0 0 0 372 260 V300 A20 20 0 0 1 352 320 H160 A20 20 0 0 1 140 300 V260 A20 20 0 0 0 140 220 V180 A20 20 0 0 1 160 160 Z" 
                  fill="none" 
                  stroke="#111110" 
                  strokeWidth="16" 
                  strokeLinejoin="round"
                />
                <circle cx="215" cy="220" r="12" fill="#111110" />
                <circle cx="295" cy="220" r="12" fill="#111110" />
                <path 
                  d="M210 255 Q256 285 302 255" 
                  fill="none" 
                  stroke="#111110" 
                  strokeWidth="14" 
                  strokeLinecap="round"
                />
              </svg>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-display font-bold text-base tracking-tight leading-none">
                    TYKS Pro
                  </span>
                  <span className="text-[10px] font-mono opacity-50 mt-1">Workspace v2.0</span>
                </div>
              )}
            </Link>
          </div>

          {/* 3. Curseur / Bouton interactif pour basculer l'ouverture/fermeture du menu */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-2 w-full py-2 rounded-xl text-xs font-medium border border-[#111110]/10 bg-[#111110]/5 hover:bg-[#111110]/10 transition-colors ${
              isCollapsed ? 'justify-center px-0' : 'px-3'
            }`}
            title={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 opacity-70" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 opacity-70" />
                <span className="opacity-70">Réduire le menu</span>
              </>
            )}
          </button>

          {/* Liens de navigation : masquent le texte et centrent les icônes en mode réduit */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-[10px] font-mono uppercase tracking-wider opacity-40 px-3 pb-2">Workspace</p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined} // Infobulle native au survol en mode réduit
                  className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isCollapsed ? 'justify-center px-2' : 'px-3'
                  } ${
                    isActive
                      ? 'bg-[#111110] text-[#F7F5F0] font-semibold shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 shrink-0 ${isActive ? 'text-[#F7F5F0]' : 'opacity-70'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pied de sidebar : Réglages & Déconnexion adaptés au mode réduit */}
        <div className={`p-4 border-t border-[#111110]/10 space-y-1 bg-[#F7F5F0]/50 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <Link 
            href="/settings" 
            title={isCollapsed ? "Réglages" : undefined}
            className={`flex items-center gap-2.5 py-2.5 rounded-xl text-xs font-medium transition ${
              isCollapsed ? 'justify-center px-2' : 'px-3'
            } ${
              pathname === '/settings'
                ? 'bg-[#111110] text-[#F7F5F0]'
                : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
            }`}
          >
            <Settings className="w-4 h-4 opacity-70 shrink-0" />
            {!isCollapsed && <span>Réglages</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Se déconnecter" : undefined}
            className={`w-full flex items-center gap-2.5 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors ${
              isCollapsed ? 'justify-center px-2' : 'px-3'
            }`}
          >
            <LogOut className="w-4 h-4 opacity-70 shrink-0" />
            {!isCollapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

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
      
      {/* Sidebar avec transition fluide */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col justify-between sticky top-0 h-screen shrink-0 select-none z-25 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isHovered ? 'w-64' : 'w-16'
        }`}
      >
        
        {/* En-tête & Navigation */}
        <div className="py-6 px-3 space-y-8 overflow-y-auto overflow-x-hidden">
          
          {/* Logo agrandi et bien mis en valeur */}
          <div className="flex items-center pt-1">
            <Link href="/" className="flex items-center gap-3 w-full">
              <div className="w-20 h-20 flex items-center justify-center shrink-0">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 512 512" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-20 h-20 transition-transform hover:scale-105"
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
              </div>
              
              <div className={`flex flex-col whitespace-nowrap transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <span className="font-display font-bold text-base tracking-tight leading-none">
                  TYKS Pro
                </span>
                <span className="text-[10px] font-mono opacity-50 mt-1">Workspace v2.0</span>
              </div>
            </Link>
          </div>

          {/* Liens de navigation avec icônes agrandies (w-5 h-5) */}
          <div className="space-y-1">
            <div className={`transition-opacity duration-200 ${
              isHovered ? 'opacity-100 pb-2' : 'opacity-0 pointer-events-none h-0'
            }`}>
              <p className="text-[10px] font-mono uppercase tracking-wider opacity-40 px-3 whitespace-nowrap">
                Workspace
              </p>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!isHovered ? item.label : undefined}
                  className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#111110] text-[#F7F5F0] font-semibold shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
                  }`}
                >
                  <div className="w-10 h-5 flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-[#F7F5F0]' : 'opacity-70'}`} />
                  </div>
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${
                    isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pied de sidebar : Réglages & Déconnexion */}
        <div className="p-3 border-t border-[#111110]/10 space-y-1 bg-[#F7F5F0]/50 overflow-x-hidden">
          <Link 
            href="/settings" 
            title={!isHovered ? "Réglages" : undefined}
            className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-medium transition ${
              pathname === '/settings'
                ? 'bg-[#111110] text-[#F7F5F0]'
                : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
            }`}
          >
            <div className="w-10 h-5 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 opacity-70" />
            </div>
            <span className={`whitespace-nowrap transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              Réglages
            </span>
          </Link>

          <button
            onClick={handleLogout}
            title={!isHovered ? "Se déconnecter" : undefined}
            className="w-full flex items-center gap-3 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"
          >
            <div className="w-10 h-5 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 opacity-70" />
            </div>
            <span className={`whitespace-nowrap transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              Se déconnecter
            </span>
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

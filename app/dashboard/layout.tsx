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

  // Tant qu'on ne sait pas si l'utilisateur est connecté, on évite le flash visuel
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  // Si l'utilisateur n'est PAS connecté, on affiche uniquement les enfants (la page de login) sans la sidebar
  if (!user) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  // Si l'utilisateur est connecté, on affiche le layout complet avec la barre latérale
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex selection:bg-[#111110] selection:text-[#F7F5F0]">
      
      {/* Menu Latéral Pro (Affiché uniquement si connecté) */}
      <aside className="w-64 border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col justify-between sticky top-0 h-screen shrink-0 select-none z-20">
        
        {/* En-tête & Navigation */}
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center justify-between group pt-1">
            <div className="flex items-center gap-2.5">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 512 512" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-7 h-7 transition-transform group-hover:scale-105"
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
              <span className="font-display font-bold text-sm tracking-tight">
                TYKS Pro
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111110]/5 opacity-60">
              v2.0
            </span>
          </Link>

          {/* Liens de navigation */}
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider opacity-40 px-3 pb-2">Workspace</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#111110] text-[#F7F5F0] font-semibold shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-[#F7F5F0]' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pied de sidebar : Réglages & Déconnexion */}
        <div className="p-4 border-t border-[#111110]/10 space-y-1 bg-[#F7F5F0]/50">
          <Link 
            href="/settings" 
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              pathname === '/settings'
                ? 'bg-[#111110] text-[#F7F5F0]'
                : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 opacity-70" />
            <span>Réglages</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 opacity-70" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Contenu dynamique injecté selon l'URL */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

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
                className="w-7 h-7" 
                viewBox="0 0 32 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6 4C4.89543 4 4 4.89543 4 6V12C5.10457 12 6 12.8954 6 14C6 15.1046 5.10457 16 4 16V26C4 27.1046 4.89543 28 6 28H26C27.1046 28 28 27.1046 28 26V16C26.8954 16 26 15.1046 26 14C26 12.8954 26.8954 12 28 12V6C28 4.89543 27.1046 4 26 4H6Z" 
                  fill="currentColor" 
                  fillOpacity="0.1" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <circle cx="4" cy="14" r="2" fill="#F7F5F0" />
                <circle cx="28" cy="14" r="2" fill="#F7F5F0" />
                <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                <circle cx="20" cy="13" r="1.5" fill="currentColor" />
                <path 
                  d="M13 18C13 18 14.5 19.5 16 19.5C17.5 19.5 19 18 19 18" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
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
```[cite: 5]

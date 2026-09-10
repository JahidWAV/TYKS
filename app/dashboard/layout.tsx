'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, Megaphone, 
  Users, Wallet, Globe, Settings, LogOut, ArrowUpRight 
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Marketing', href: '/marketing', icon: Megaphone },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Banking & Payouts', href: '/banking', icon: Wallet },
    { label: 'My Page', href: '/page', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex selection:bg-[#111110] selection:text-[#F7F5F0]">
      
      {/* Menu Latéral Pro (Style Minimaliste & Aéré) */}
      <aside className="w-64 border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col justify-between sticky top-0 h-screen shrink-0 select-none z-20">
        
        {/* En-tête & Navigation */}
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center justify-between group pt-1">
            <div className="flex items-center gap-2.5">
              <span className="h-7 w-7 rounded-lg bg-[#111110] text-[#F7F5F0] flex items-center justify-center font-bold text-xs tracking-wider transition-transform group-hover:scale-105">
                T
              </span>
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

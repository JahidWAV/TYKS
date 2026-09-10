'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, Megaphone, 
  Users, Wallet, Globe, Settings, LogOut, Sparkles 
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
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', href: '/dashboard/events', icon: Calendar },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
    { label: 'Community', href: '/dashboard/community', icon: Users },
    { label: 'Banking & Payouts', href: '/dashboard/banking', icon: Wallet },
    { label: 'My Page', href: '/dashboard/page', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex selection:bg-[#111110] selection:text-[#F7F5F0]">
      
      {/* Menu Latéral Pro Amélioré */}
      <aside className="w-64 border-r border-[#111110]/10 bg-white/60 backdrop-blur-xl flex flex-col justify-between sticky top-0 h-screen shrink-0 select-none z-20">
        
        {/* En-tête & Navigation */}
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <span className="h-7 w-7 rounded-xl bg-[#111110] text-[#F7F5F0] flex items-center justify-center font-bold text-xs tracking-wider transition-transform group-hover:scale-105">
              T
            </span>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight flex items-center gap-1.5">
                TYKS Pro
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider">Organizer Suite</span>
            </div>
          </Link>

          {/* Raccourci Création Rapide */}
          <div className="pt-1">
            <Link
              href="/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-[#111110] text-[#F7F5F0] text-xs font-semibold shadow-sm hover:opacity-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Créer un événement</span>
            </Link>
          </div>

          {/* Liens de navigation */}
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider opacity-40 px-3 pb-2">Menu Principal</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#111110] text-[#F7F5F0] shadow-sm font-semibold'
                      : 'opacity-70 hover:opacity-100 hover:bg-[#111110]/5 text-[#111110]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F7F5F0]' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pied de sidebar : Réglages & Déconnexion */}
        <div className="p-4 border-t border-[#111110]/10 space-y-2 bg-white/40 backdrop-blur-md">
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
              pathname === '/dashboard/settings'
                ? 'bg-[#111110] text-[#F7F5F0]'
                : 'border border-[#111110]/10 bg-white/60 hover:bg-white text-[#111110]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 opacity-70" />
            <span>Réglages & Compte</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
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

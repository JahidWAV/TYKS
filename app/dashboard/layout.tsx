'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, BarChart3, Megaphone, 
  Users, Wallet, Globe, LogOut, Loader2, User, ChevronRight, Shield, Sliders 
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const SIDEBAR_STORAGE_KEY = 'tyks_sidebar_open';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  // Charge l'état ouvert/fermé du menu depuis le stockage local (persiste au reload, connexion, déconnexion)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) setIsOpen(stored === 'true');
    } catch {
      // stockage indisponible, on garde la valeur par défaut
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
    } catch {
      // stockage indisponible, on ignore
    }
  }, [isOpen, mounted]);

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
    { label: "Vue d'ensemble", href: '/', icon: LayoutDashboard },
    { label: 'Événements', href: '/admin-events', icon: Calendar },
    { label: 'Analytique', href: '/analytics', icon: BarChart3 },
    { label: 'Marketing', href: '/marketing', icon: Megaphone },
    { label: 'Communauté', href: '/community', icon: Users },
    { label: 'Finances & Paiements', href: '/banking', icon: Wallet },
    { label: 'Ma Page', href: '/page', icon: Globe },
  ];

  const getBreadcrumbs = () => {
    if (pathname === '/') return ["Vue d'ensemble"];
    const segments = pathname.split('/').filter(Boolean);
    
    return segments.map(seg => {
      const match = navItems.find(item => item.href === `/${seg}`);
      if (match) return match.label;
      return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    });
  };

  const breadcrumbs = getBreadcrumbs();

  // Nom affiché : prénom + nom si disponibles dans les métadonnées Supabase, sinon repli sur l'email
  // Adapte les clés (first_name/last_name/full_name) au schéma réellement utilisé à l'inscription
  const getDisplayName = () => {
    const meta = user?.user_metadata || {};
    if (meta.first_name && meta.last_name) return `${meta.first_name} ${meta.last_name}`;
    if (meta.full_name) return meta.full_name;
    if (meta.name) return meta.name;
    return user?.email ?? 'Utilisateur';
  };

  const getInitials = () => {
    const meta = user?.user_metadata || {};
    const first = meta.first_name || meta.given_name;
    const last = meta.last_name || meta.family_name;
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    const full = meta.full_name || meta.name;
    if (full) {
      const parts = full.trim().split(/\s+/);
      return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    return user?.email ? user.email.slice(0, 2).toUpperCase() : '?';
  };

  const displayName = getDisplayName();
  const initials = getInitials();

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

      {/* 0. Barre horizontale fixe en haut : logo + fil d'ariane + profil */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-[#111110]/10 bg-[#F7F5F0] flex items-center justify-between shrink-0 z-50 select-none">
        <div className="flex items-center h-full">
          {/* Colonne de largeur identique à la barre d'icônes (w-16), avec la même bordure droite : la ligne verticale continue sans rupture jusque dans le menu latéral */}
          <div className="w-16 h-full flex items-center justify-center shrink-0 border-r border-[#111110]/10">
            <Link href="/" className="w-9 h-9 flex items-center justify-center group">
              <img
                src="/icon.svg"
                alt="TYKS"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2.5 text-sm tracking-tight font-medium text-[#111110]/60 pl-4">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2.5">
                {index > 0 && <ChevronRight className="w-4 h-4 opacity-30" />}
                <span className={`flex items-center ${index === breadcrumbs.length - 1 ? "text-[#111110] font-bold text-base" : ""}`}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative pr-4" ref={profileMenuRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-9 h-9 rounded-full bg-[#111110] text-[#F7F5F0] flex items-center justify-center hover:opacity-90 transition text-[11px] font-bold tracking-tight"
            title="Mon profil"
          >
            {initials}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-[#F7F5F0] border border-[#111110]/10 rounded-2xl shadow-2xl shadow-black/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#111110]/10">
                <div className="w-10 h-10 rounded-full bg-[#111110] text-[#F7F5F0] flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-[11px] opacity-50 truncate">{user.email}</p>
                </div>
              </div>

              <div className="py-1.5">
                <Link 
                  href="/settings" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 mx-2 px-2.5 py-2 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#111110]/5 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  Profil
                </Link>

                <Link 
                  href="/settings/security" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 mx-2 px-2.5 py-2 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#111110]/5 flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                  Sécurité
                </Link>

                <Link 
                  href="/settings/preferences" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 mx-2 px-2.5 py-2 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#111110]/5 flex items-center justify-center shrink-0">
                    <Sliders className="w-3.5 h-3.5" />
                  </span>
                  Préférences
                </Link>
              </div>

              <div className="border-t border-[#111110]/10 pt-1.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 mx-2 px-2.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"
                  style={{ width: 'calc(100% - 1rem)' }}
                >
                  <span className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <LogOut className="w-3.5 h-3.5" />
                  </span>
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 1. Barre d'icônes fixe à gauche (w-16), sous la barre horizontale */}
      <aside className="fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-16 border-r border-[#111110]/10 bg-[#F7F5F0] flex flex-col items-center justify-between py-6 z-40 select-none">

        <div className="flex flex-col items-center gap-2 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all group ${
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

        {/* Interrupteur pour ouvrir/fermer le menu et afficher les titres des pages */}
        <div className="w-full flex flex-col items-center gap-2 border-t border-[#111110]/10 pt-4">
          <button
            onClick={() => setIsOpen(prev => !prev)}
            title={isOpen ? 'Réduire le menu' : 'Déployer le menu'}
            aria-label={isOpen ? 'Réduire le menu' : 'Déployer le menu'}
            aria-pressed={isOpen}
            className="w-10 h-10 flex items-center justify-center rounded-xl opacity-60 hover:opacity-100 hover:bg-[#111110]/5 transition-all"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* 2. Panneau textuel contextuel, ouvert/fermé via l'interrupteur (état mémorisé) */}
      <div 
        className={`fixed top-14 left-16 h-[calc(100vh-3.5rem)] bg-[#F7F5F0] border-r border-[#111110]/10 flex flex-col z-30 overflow-hidden select-none ${
          mounted ? 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''
        } ${
          isOpen ? 'w-56 opacity-100 shadow-xl' : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="space-y-2 w-full px-3 flex-1 pt-6">
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
      </div>

      {/* 3. Contenu principal, sous la barre horizontale */}
      <div 
        className={`flex-1 min-w-0 flex flex-col h-screen pt-14 overflow-hidden ${
          mounted ? 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''
        } ${
          isOpen ? 'ml-72' : 'ml-16'
        }`}
      >
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

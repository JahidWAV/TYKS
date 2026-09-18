'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { DeleteModalContext } from './DeleteModalContext'; // <-- Import depuis le nouveau fichier

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);

  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openDeleteModal = (event: { id: string; title: string }, onDeleteSuccess: () => void) => {
    setEventToDelete(event);
    setOnSuccessCallback(() => onDeleteSuccess);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabaseBrowser
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      setEventToDelete(null);
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert("Impossible de supprimer l'événement en raison d'une contrainte technique.");
    } finally {
      setIsDeleting(false);
    }
  };

  const navItems = [
    { label: "ÉVÉNEMENTS", href: '/' },
    { label: 'STATISTIQUES', href: '/stats' },
    { label: 'FINANCES', href: '/banking' },
  ];

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white/60 font-grotesque text-xs tracking-wider flex items-center justify-center uppercase">
        CHARGEMENT...
      </div>
    );
  }

  if (!user) {
    return <main className="min-h-screen w-full bg-[#0f0f0f]">{children}</main>;
  }

  const isProfileActive = pathname === '/settings'; 
  const isSettingsActive = pathname.startsWith('/settings');

  return (
    <DeleteModalContext.Provider value={{ openDeleteModal }}>
      <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-white selection:text-black flex flex-col uppercase overflow-x-hidden relative">

        <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/10 bg-[#0f0f0f] flex items-center justify-between px-6 lg:px-12 z-40 select-none">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group py-2">
              <Image 
                src="/tyks.svg" 
                alt="TYKS" 
                width={280} 
                height={88} 
                priority 
                className="h-[4.5rem] w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105" 
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
                      isActive
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="h-6 w-[1px] bg-white/15" />

            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className={`h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
                  isProfileActive
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
                }`}
              >
                PROFIL
              </Link>
              <Link
                href="/settings"
                className={`h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none ${
                  isSettingsActive
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
                }`}
              >
                PARAMÈTRES
              </Link>
              <button
                onClick={handleLogout}
                className="h-11 px-5 flex items-center justify-center rounded-full transition-all font-grotesque text-xs tracking-wider border whitespace-nowrap shadow-md leading-none bg-transparent text-white/80 border-white/15 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                DÉCONNEXION
              </button>
            </div>
          </div>
        </header>

        <div className="flex lg:hidden items-center justify-around bg-neutral-950 border-b border-white/10 px-4 py-3 fixed top-20 left-0 right-0 z-30 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full border text-[10px] font-bold transition-all whitespace-nowrap ${
                  isActive ? 'bg-white text-black border-white' : 'bg-transparent text-white/80 border-white/15'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 w-full pt-28 lg:pt-32 pb-12 bg-[#0f0f0f] font-grotesque text-white">
          {children}
        </main>

        {eventToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 w-screen h-screen">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0f0f0f] p-8 space-y-6 shadow-2xl font-grotesque text-white relative">
              
              <button 
                onClick={() => setEventToDelete(null)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-1 cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  ⚠️
                </div>
                <h3 className="text-base font-bold tracking-wide uppercase">
                  Supprimer l'événement
                </h3>
              </div>

              <p className="text-xs text-white/70 leading-relaxed normal-case">
                Êtes-vous sûr de vouloir supprimer définitivement l'événement <span className="text-white font-medium">&ldquo;{eventToDelete.title}&rdquo;</span> ? Cette action est irréversible et supprimera toutes les données associées.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEventToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 h-11 rounded-full border border-white/20 bg-transparent text-xs text-white hover:bg-white/10 transition-colors cursor-pointer font-medium uppercase"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-6 h-11 rounded-full bg-red-600 text-xs text-white hover:bg-red-500 transition-colors cursor-pointer font-bold shadow-lg flex items-center gap-2 uppercase"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DeleteModalContext.Provider>
  );
}

'use client';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { ready, authenticated, login, logout } = usePrivy();

  return (
    <header className="w-full border-b border-onyx-line bg-onyx/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo -> Retour à l'accueil */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl font-bold tracking-tightest text-bone group-hover:text-cobalt transition-colors">
            TYKS
          </span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-cobalt/10 text-cobalt border border-cobalt/20 font-mono">
            PRO
          </span>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/organisateur"
            className="text-xs font-semibold text-bone-muted hover:text-bone transition-colors hidden sm:block"
          >
            Tableau de bord
          </Link>

          {ready && (
            <>
              {authenticated ? (
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-bone-faint hover:text-red-400 transition-colors"
                >
                  Déconnexion
                </button>
              ) : (
                <button
                  onClick={login}
                  className="inline-flex items-center gap-2 bg-cobalt hover:bg-cobalt-soft text-bone text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  <span>Connexion</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

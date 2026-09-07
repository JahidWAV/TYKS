"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { ShieldCheck, LogOut, Loader2, Menu, X } from "lucide-react";

function truncateAddress(address: string) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}···${address.slice(-4)}`;
}

export default function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [mobileOpen, setMobileOpen] = useState(false);

  const solanaWallet = wallets[0];
  const email = user?.email?.address ?? user?.google?.email ?? null;

  return (
    <header className="sticky top-0 z-50 glass-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo + badge */}
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold tracking-tightest text-ink">
            iorti
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-gold/25 bg-gold/5 px-2.5 py-1 text-[11px] font-medium text-gold-soft sm:inline-flex">
            <ShieldCheck className="h-3 w-3" />
            Pass sécurisé
          </span>
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 sm:flex">
          {!ready ? (
            <div className="flex h-10 w-40 items-center justify-center rounded-full border border-surface-hair bg-surface">
              <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
            </div>
          ) : authenticated ? (
            <>
              <div className="flex flex-col items-end leading-tight">
                {email && (
                  <span className="text-sm font-medium text-ink">{email}</span>
                )}
                {solanaWallet && (
                  <span className="font-mono text-xs text-ink-faint">
                    {truncateAddress(solanaWallet.address)}
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-surface-hair px-4 py-2 text-sm font-medium text-ink transition hover:border-white/20 hover:bg-surface-raised"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-void transition hover:bg-white"
            >
              Connexion / Inscription
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-full border border-surface-hair p-2 text-ink sm:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Ouvrir le menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-surface-hair bg-void px-6 py-4 sm:hidden fade-rise">
          {!ready ? (
            <div className="flex h-10 items-center justify-center rounded-full border border-surface-hair bg-surface">
              <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
            </div>
          ) : authenticated ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col leading-tight">
                {email && (
                  <span className="text-sm font-medium text-ink">{email}</span>
                )}
                {solanaWallet && (
                  <span className="font-mono text-xs text-ink-faint">
                    {truncateAddress(solanaWallet.address)}
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-surface-hair px-4 py-2.5 text-sm font-medium text-ink"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-void"
            >
              Connexion / Inscription
            </button>
          )}
        </div>
      )}
    </header>
  );
}

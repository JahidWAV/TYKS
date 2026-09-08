"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { LogOut, Loader2, Menu, X } from "lucide-react";
import CustomAuthModal from "@/components/CustomAuthModal";

function truncateAddress(address: string) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}···${address.slice(-4)}`;
}

export default function Navbar() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const solanaWallet = wallets[0];
  const email = user?.email?.address ?? user?.google?.email ?? null;

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl font-extrabold tracking-tightest text-bone">
            TYKS
          </span>

          {/* Desktop right side */}
          <div className="hidden items-center gap-4 sm:flex">
            {!ready ? (
              <div className="flex h-10 w-40 items-center justify-center rounded-full border border-onyx-line bg-onyx-raised">
                <Loader2 className="h-4 w-4 animate-spin text-bone-muted" />
              </div>
            ) : authenticated ? (
              <>
                <div className="flex flex-col items-end leading-tight">
                  {email && <span className="text-sm font-medium text-bone">{email}</span>}
                  {solanaWallet && (
                    <span className="font-mono text-xs text-bone-faint">
                      {truncateAddress(solanaWallet.address)}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-onyx-line px-4 py-2 text-sm font-medium text-bone transition hover:border-bone/40 hover:bg-onyx-raised"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx transition hover:bg-white"
              >
                Connexion
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="inline-flex items-center justify-center rounded-full border border-onyx-line p-2 text-bone sm:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="border-t border-onyx-line bg-onyx px-6 py-4 sm:hidden fade-rise">
            {!ready ? (
              <div className="flex h-10 items-center justify-center rounded-full border border-onyx-line bg-onyx-raised">
                <Loader2 className="h-4 w-4 animate-spin text-bone-muted" />
              </div>
            ) : authenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col leading-tight">
                  {email && <span className="text-sm font-medium text-bone">{email}</span>}
                  {solanaWallet && (
                    <span className="font-mono text-xs text-bone-faint">
                      {truncateAddress(solanaWallet.address)}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-onyx-line px-4 py-2.5 text-sm font-medium text-bone"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsAuthOpen(true);
                }}
                className="inline-flex w-full items-center justify-center rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-onyx"
              >
                Connexion
              </button>
            )}
          </div>
        )}
      </header>

      {/* Modale d'authentification sur mesure */}
      <CustomAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}

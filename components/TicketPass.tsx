'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useWallets, useCreateWallet } from '@privy-io/react-auth/solana';
import QRCode from 'qrcode.react';
import { ShieldCheck, LogOut, Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function TicketPass() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const [copied, setCopied] = useState(false);

  // L'app ne provisionne que des wallets embarqués Solana (voir providers.tsx),
  // donc on lit directement le premier wallet connecté depuis le hook Solana
  // plutôt que de fouiller dans user.linkedAccounts avec le type EVM.
  const walletAddress = wallets[0]?.address;

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}···${walletAddress.slice(-4)}`
    : 'Non activé';

  // Utilisé uniquement comme numéro de série visible imprimé sur le talon —
  // aucune valeur fonctionnelle, purement une convention d'affichage de billet.
  const serial = walletAddress ? walletAddress.slice(-6).toUpperCase() : '——————';

  const userEmail = user?.email?.address || user?.google?.email || 'Membre TYKS';

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-sm mx-auto my-4">
      {/* Corps du pass */}
      <div className="metal-card relative bg-gradient-to-br from-onyx-raised via-[#131217] to-onyx border border-bone/10 border-b-0 rounded-t-[28px] pt-7 px-7 pb-9 shadow-2xl shadow-black/60">
        <div className="absolute -top-20 -left-16 w-56 h-56 bg-cobalt/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex items-center justify-between pb-5 mb-6 border-b border-bone/10">
          <div className="leading-none">
            <p className="font-display text-lg font-extrabold tracking-tightest text-bone">TYKS</p>
            <p className="text-[10px] tracking-[0.14em] text-bone-faint mt-1">Pass membre</p>
          </div>
          <div
            className="ink-stamp flex items-center justify-center w-11 h-11 text-cobalt-soft shrink-0"
            aria-label="Pass vérifié"
            title="Pass vérifié"
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="relative bg-stub p-5 rounded-2xl flex flex-col items-center justify-center mb-2">
          {walletAddress ? (
            <QRCode
              value={walletAddress}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#0B0B0E"
              bgColor="#F1EAD9"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center py-6 px-2">
              <p className="text-onyx/70 text-xs font-semibold">
                Votre pass n&apos;est pas encore activé
              </p>
              <button
                onClick={() => createWallet()}
                className="flex items-center gap-2 bg-onyx hover:bg-onyx-raised text-bone text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Activer mon pass</span>
              </button>
            </div>
          )}
          <div className="mt-3 text-[10px] text-onyx/50 font-medium">
            Présentez ce code à l&apos;entrée
          </div>
        </div>

        <div className="relative flex justify-between items-center pt-4 text-xs">
          <span className="text-bone-faint">Membre</span>
          <span className="text-bone font-medium truncate max-w-[190px]">{userEmail}</span>
        </div>
      </div>

      {/* Talon — détaché du pass par la perforation, comme sur un vrai billet. */}
      <div className="ticket-seam bg-onyx-raised border border-bone/10 rounded-b-[28px] px-7 py-4 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.08em] text-bone-faint">N° {serial}</span>
        <button
          onClick={handleCopy}
          disabled={!walletAddress}
          className="flex items-center gap-1.5 font-mono text-xs text-bone-muted hover:text-bone bg-bone/[0.04] hover:bg-bone/[0.08] px-2.5 py-1 rounded-md border border-bone/10 transition-colors disabled:opacity-50"
        >
          <span>{truncatedAddress}</span>
          {copied ? <Check className="w-3 h-3 text-cobalt-soft" /> : <Copy className="w-3 h-3 text-bone-faint" />}
        </button>
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 text-[11px] text-bone-faint hover:text-bone transition-colors py-3 font-medium"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
}

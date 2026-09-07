'use client';

import { usePrivy, useCreateWallet, WalletWithMetadata } from '@privy-io/react-auth';
import QRCode from 'qrcode.react';
import { ShieldCheck, LogOut, Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function TicketPass() {
  const { user, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const [copied, setCopied] = useState(false);

  const embeddedWallet = user?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' && account.walletClientType === 'privy'
  );

  const walletAddress = embeddedWallet?.address || user?.wallet?.address;

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}···${walletAddress.slice(-4)}`
    : 'Non activé';

  const userEmail = user?.email?.address || user?.google?.email || 'Membre iorti';

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto my-4">
      {/* Carte membre métallique */}
      <div className="metal-card relative bg-gradient-to-br from-[#1c1c24] via-[#151519] to-[#0d0d10] border border-white/10 rounded-[28px] p-7 shadow-2xl shadow-black/60">

        {/* Lueur d'ambiance */}
        <div className="absolute -top-20 -left-16 w-56 h-56 bg-indigo/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-16 w-56 h-56 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />

        {/* En-tête */}
        <div className="relative flex items-center justify-between pb-5 mb-6 border-b border-white/8">
          <div className="leading-none">
            <p className="font-display text-lg font-bold tracking-tightest text-ink">iorti</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint mt-1">Membership Pass</p>
          </div>
          <div className="flex items-center gap-1.5 text-gold-soft text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vérifié</span>
          </div>
        </div>

        {/* Zone QR Code */}
        <div className="relative bg-ink p-5 rounded-2xl flex flex-col items-center justify-center mb-6">
          {walletAddress ? (
            <QRCode
              value={walletAddress}
              size={188}
              level="H"
              includeMargin={false}
              fgColor="#0A0A0D"
              bgColor="#F6F5F2"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center py-6 px-2">
              <p className="text-void/70 text-xs font-semibold">
                Votre pass n'est pas encore activé
              </p>
              <button
                onClick={() => createWallet()}
                className="flex items-center gap-2 bg-void hover:bg-surface text-ink text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Activer mon Pass</span>
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-void/50 font-medium tracking-wide">
            <span>Présentez ce code à l'entrée</span>
          </div>
        </div>

        {/* Informations membre */}
        <div className="relative space-y-3 text-xs mb-6">
          <div className="flex justify-between items-center">
            <span className="text-ink-faint">Membre</span>
            <span className="text-ink font-medium truncate max-w-[210px]">{userEmail}</span>
          </div>

          <div className="pt-3 border-t border-dashed border-white/10 flex justify-between items-center">
            <span className="text-ink-faint">Identifiant du pass</span>
            <button
              onClick={handleCopy}
              disabled={!walletAddress}
              className="flex items-center gap-1.5 font-mono text-ink-muted hover:text-ink bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-md border border-white/8 transition-colors disabled:opacity-50"
            >
              <span>{truncatedAddress}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-ink-faint" />}
            </button>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={logout}
          className="relative w-full flex items-center justify-center gap-2 text-[11px] text-ink-faint hover:text-ink transition-colors py-1 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Se déconnecter</span>
        </button>

      </div>
    </div>
  );
}

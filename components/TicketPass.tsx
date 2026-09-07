'use client';

import { usePrivy, useCreateWallet, WalletWithMetadata } from '@privy-io/react-auth';
import QRCode from 'qrcode.react';
import { Ticket, ShieldCheck, LogOut, Wallet, Sparkles, Copy, Check } from 'lucide-react';
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
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Aucun wallet détecté';

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
      {/* Carte Pass VIP */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl">
        
        {/* Glows d'arrière-plan */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* En-tête de la carte */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-wide text-white">iorti PASS</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pass Vérifié</span>
          </div>
        </div>

        {/* Zone QR Code */}
        <div className="relative bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-2xl mb-6">
          {walletAddress ? (
            <QRCode 
              value={walletAddress} 
              size={190}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center py-6 px-2">
              <p className="text-slate-700 text-xs font-semibold">
                Génération de votre Pass Solana...
              </p>
              <button
                onClick={() => createWallet()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30"
              >
                <Wallet className="w-4 h-4" />
                <span>Activer mon Pass</span>
              </button>
            </div>
          )}
          
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>QR Code d'accès unique</span>
          </div>
        </div>

        {/* Informations Utilisateur & Solana Wallet */}
        <div className="relative bg-slate-950/80 border border-white/5 rounded-xl p-3.5 space-y-2.5 text-xs mb-6">
          <div className="flex justify-between items-center text-slate-400">
            <span>Membre</span>
            <span className="text-white font-medium truncate max-w-[200px]">{userEmail}</span>
          </div>
          
          <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-white/5">
            <span>Adresse Solana</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 font-mono text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 px-2.5 py-1 rounded-md border border-indigo-800/40 transition-colors"
            >
              <span>{truncatedAddress}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Bouton de déconnexion */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors py-1 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Se déconnecter</span>
        </button>

      </div>
    </div>
  );
}

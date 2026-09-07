'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, ShieldCheck, LogOut } from 'lucide-react';

export default function TicketPass() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();

  // On récupère le wallet Solana créé par Privy
  const solanaWallet = wallets.find((w) => w.walletClientType === 'privy') || wallets[0];
  const walletAddress = solanaWallet?.address || 'Adresse en cours de création...';

  const truncatedAddress = walletAddress.length > 12 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress;

  const userEmail = user?.email?.address || user?.google?.email || 'Membre iorti';

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl backdrop-blur-xl">
      {/* En-tête du Pass */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2 text-indigo-400">
          <Ticket className="w-6 h-6" />
          <span className="font-bold text-xl tracking-wide text-white">iorti Pass</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs px-2,5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3,5 h-3,5" />
          <span>Pass Membre</span>
        </div>
      </div>

      {/* Zone QR Code unique du client */}
      <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-inner mb-6">
        {solanaWallet ? (
          <QRCodeSVG 
            value={walletAddress} 
            size={180}
            level="H"
            includeMargin={true}
          />
        ) : (
          <div className="h-[180px] flex items-center justify-center text-slate-500 text-sm">
            Génération du QR...
          </div>
        )}
        <p className="text-[10px] text-slate-500 font-mono mt-2 tracking-tight">
          SCANNER À L'ENTRÉE DES SOIRÉES
        </p>
      </div>

      {/* Infos Profil / Wallet */}
      <div className="bg-slate-950/60 p-3,5 rounded-lg border border-slate-800 space-y-2 mb-6 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Titulaire :</span>
          <span className="text-slate-200 font-medium">{userEmail}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Adresse SVM (Solana) :</span>
          <span className="font-mono text-indigo-300 bg-indigo-950/50 px-2 py-0,5 rounded border border-indigo-800/40">
            {truncatedAddress}
          </span>
        </div>
      </div>

      {/* Déconnexion */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors py-2"
      >
        <LogOut className="w-3,5 h-3,5" />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { ShieldCheck, LogOut, Copy, Check } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function TicketPass() {
  const [userEmail, setUserEmail] = useState<string>('Membre TYKS');
  const [userId, setUserId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || 'Membre TYKS');
        setUserId(user.id);
      }
    });
  }, []);

  const serial = userId ? userId.slice(-6).toUpperCase() : '——————';

  const handleCopy = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="max-w-sm mx-auto my-4">
      <div className="metal-card relative bg-gradient-to-br from-onyx-raised via-[#131217] to-onyx border border-bone/10 border-b-0 rounded-t-[28px] pt-7 px-7 pb-9 shadow-2xl shadow-black/60">
        <div className="absolute -top-20 -left-16 w-56 h-56 bg-cobalt/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative flex items-center justify-between pb-5 mb-6 border-b border-bone/10">
          <div className="leading-none">
            <p className="font-display text-lg font-extrabold tracking-tightest text-bone">TYKS</p>
            <p className="text-[10px] tracking-[0.14em] text-bone-faint mt-1">Pass membre</p>
          </div>
          <div className="ink-stamp flex items-center justify-center w-11 h-11 text-cobalt-soft shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="relative bg-stub p-5 rounded-2xl flex flex-col items-center justify-center mb-2">
          {userId ? (
            <QRCode
              value={userId}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#0B0B0E"
              bgColor="#F1EAD9"
            />
          ) : (
            <div className="w-7 h-7 border-2 border-cobalt/60 border-t-transparent rounded-full animate-spin" />
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

      <div className="ticket-seam bg-onyx-raised border border-bone/10 rounded-b-[28px] px-7 py-4 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.08em] text-bone-faint">N° {serial}</span>
        <button
          onClick={handleCopy}
          disabled={!userId}
          className="flex items-center gap-1.5 font-mono text-xs text-bone-muted hover:text-bone bg-bone/[0.04] hover:bg-bone/[0.08] px-2.5 py-1 rounded-md border border-bone/10 transition-colors disabled:opacity-50"
        >
          <span>{serial}</span>
          {copied ? <Check className="w-3 h-3 text-cobalt-soft" /> : <Copy className="w-3 h-3 text-bone-faint" />}
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 text-[11px] text-bone-faint hover:text-bone transition-colors py-3 font-medium"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
}

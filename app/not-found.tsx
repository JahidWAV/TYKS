'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ShieldAlert, TicketX } from 'lucide-react';

export default function NotFound() {
  const [homeUrl, setHomeUrl] = useState('/');
  const [homeLabel, setHomeLabel] = useState("Retour à l'agenda");

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('pro.')) {
      setHomeUrl('https://pro.iorti.app');
      setHomeLabel("Retour à l'espace Pro");
    } else {
      setHomeUrl('https://iorti.app');
      setHomeLabel("Retour à l'accueil");
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111110] flex flex-col items-center justify-center px-6 relative overflow-hidden selection:bg-[#111110] selection:text-[#F7F5F0]">
      
      <div className="max-w-md w-full space-y-8 relative z-10 text-center">
        
        {/* Animation du ticket barré */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 relative animate-bounce duration-1000 shadow-sm">
          <TicketX className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>

        {/* Badge d'alerte */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-700 text-xs font-mono uppercase tracking-widest">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Contrôle d&apos;accès · 404</span>
        </div>

        {/* Titre éditorial percutant */}
        <div className="space-y-3">
          <h1 className="font-display text-6xl md:text-7xl font-black tracking-tight text-[#111110] leading-[1.05]">
            Pas sur
            <br />
            <span className="italic font-light opacity-45 transition-all duration-75 hover:opacity-100">la liste.</span>
          </h1>
          <p className="text-xs font-mono opacity-50 uppercase tracking-widest pt-2">
            Le videur est formel : cette page n&apos;existe pas.
          </p>
        </div>

        {/* Action de redirection */}
        <div className="pt-4">
          <a
            href={homeUrl}
            className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-[#111110] text-[#F7F5F0] py-4 text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:bg-black cursor-pointer shadow-sm"
          >
            <span>{homeLabel}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ShieldAlert } from 'lucide-react';

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
      {/* Grille de fond industrielle discrète en phase avec la DA */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#11111005_1px,transparent_1px),linear-gradient(to_bottom,#11111005_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10 text-center">
        
        {/* Badge "Refusé à l'entrée" */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-700 text-xs font-mono uppercase tracking-widest">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Contrôle d&apos;accès · 404</span>
        </div>

        {/* Titre éditorial percutant */}
        <div className="space-y-3">
          <h1 className="font-display text-6xl md:text-7xl font-black tracking-tight text-[#111110] leading-[1.05]">
            Pas sur
            <br />
            <span className="italic font-light opacity-40">la liste.</span>
          </h1>
          <p className="text-xs font-mono opacity-50 uppercase tracking-widest pt-2">
            Le videur est formel : cette page n&apos;existe pas.
          </p>
        </div>

        {/* Bloc d'explication style pass refusé épuré */}
        <div className="rounded-3xl border border-[#111110]/15 bg-white/70 backdrop-blur-md p-6 text-left space-y-3 font-mono text-xs shadow-sm">
          <div className="flex justify-between opacity-40 pb-3 border-b border-[#111110]/10">
            <span>ID Requête</span>
            <span className="text-red-600 font-bold">ACCÈS REFUSÉ (404)</span>
          </div>
          <p className="text-[#111110]/70 font-light leading-relaxed font-sans">
            L&apos;URL demandée est invalide, a expiré ou l&apos;événement a été retiré de la programmation par l&apos;organisateur.
          </p>
        </div>

        {/* Action de redirection */}
        <div className="pt-2">
          <a
            href={homeUrl}
            className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-[#111110] text-[#F7F5F0] py-4 text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] cursor-pointer shadow-sm"
          >
            <span>{homeLabel}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </main>
  );
}

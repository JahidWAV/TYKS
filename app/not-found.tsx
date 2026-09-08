'use client';

import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';

export default function NotFound() {
  const [homeUrl, setHomeUrl] = useState('/');
  const [homeLabel, setHomeLabel] = useState("Retour à l'accueil");

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('pro.')) {
      setHomeUrl('https://pro.tyks.app');
      setHomeLabel("Retour à l'espace Pro");
    } else {
      setHomeUrl('https://tyks.app');
      setHomeLabel("Retour à l'accueil");
    }
  }, []);

  return (
    <div className="min-h-screen bg-onyx bg-night-glow text-bone flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Lueur d'ambiance design */}
      <div className="absolute w-96 h-96 bg-cobalt/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-md text-center space-y-6 relative z-10">
        <div className="font-display text-8xl font-black tracking-wider text-cobalt animate-bounce">
          404
        </div>
        
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-bone">
            Page introuvable
          </h1>
          <p className="text-sm text-bone-faint">
            L'adresse que vous avez demandée n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="pt-4">
          <a
            href={homeUrl}
            className="inline-flex items-center gap-2 bg-cobalt hover:bg-cobalt-soft text-bone font-semibold px-8 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-cobalt/20 hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{homeLabel}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

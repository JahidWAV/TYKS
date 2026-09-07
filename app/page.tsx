'use client';

import { usePrivy } from '@privy-io/react-auth';
import TicketPass from '@/components/TicketPass';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { authenticated, login, ready } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Chargement d'iorti...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      {authenticated ? (
        <TicketPass />
      ) : (
        <div className="max-w-xl text-center space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            iorti
          </h1>
          <p className="text-lg text-slate-300">
            Ton pass d'accès unique pour toutes tes soirées.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Accéder à mon iorti Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </main>
  );
}

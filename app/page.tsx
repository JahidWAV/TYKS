'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import TicketPass from '@/components/TicketPass';
import { 
  Ticket, 
  Compass, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

// Données de démonstration pour le catalogue d'événements
const UPCOMING_EVENTS = [
  {
    id: 'neon-nights-2026',
    title: 'Neon Nights Festival 2026',
    date: '12 SEP. 2026 • 23:00',
    location: 'Le Warehouse, Paris',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    tag: 'Techno / Industrial',
    price: '25 €',
  },
  {
    id: 'solaris-sunset',
    title: 'Solaris Rooftop Sessions',
    date: '18 SEP. 2026 • 18:00',
    location: 'Rooftop 52, Lyon',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    tag: 'House / Deep',
    price: '18 €',
  },
  {
    id: 'cyber-vault',
    title: 'Cyber Vault: Underground',
    date: '02 OCT. 2026 • 00:00',
    location: 'Nuits Fauves, Paris',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    tag: 'Acid / Dark Electro',
    price: '20 €',
  },
];

// Historique / Palmarès de démonstration
const PAST_EVENTS = [
  {
    id: 'past-1',
    title: 'Aura Open Air 2025',
    date: '14 JUIN 2025',
    location: 'Bois de Vincennes',
    badge: 'NFT Verifié',
  },
  {
    id: 'past-2',
    title: 'Klubraum W/ Charlotte K.',
    date: '08 NOV 2025',
    location: 'Rex Club',
    badge: 'NFT Verifié',
  },
];

export default function Home() {
  const { authenticated, login, ready } = usePrivy();
  const [activeTab, setActiveTab] = useState<'pass' | 'events' | 'history'>('pass');

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Chargement d'iorti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white pb-24 md:pb-12">
      
      {/* 1. Header Global & Branding */}
      <header className="sticky top-0 z-40 bg-[#07090e]/80 backdrop-blur-md border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              iorti<span className="text-indigo-500">.</span>
            </span>
          </div>

          {authenticated ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Pass Actif</span>
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/30"
            >
              Se connecter
            </button>
          )}
        </div>
      </header>

      {/* 2. Hero Section quand NON authentifié */}
      {!authenticated && (
        <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Billetterie On-Chain & Pass Permanent
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-white">
            L'accès aux soirées, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              sans aucune friction.
            </span>
          </h1>
          
          <p className="max-w-xl mx-auto text-slate-400 text-base md:text-lg">
            Un QR code unique pour entrer partout. Vos billets sont conservés en souvenirs infalsifiables dans votre palmarès.
          </p>

          <div className="pt-4">
            <button
              onClick={login}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/25 hover:scale-[1.02]"
            >
              <span>Obtenir mon iorti Pass</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* 3. Navigation par Onglets (quand connecté) */}
      {authenticated && (
        <main className="max-w-4xl mx-auto px-4 pt-6">
          
          {/* Menu Desktop */}
          <div className="hidden md:flex items-center justify-center gap-2 p-1.5 bg-slate-900/80 border border-white/5 rounded-2xl max-w-md mx-auto mb-8 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('pass')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pass'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Mon Pass</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Événements</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Palmarès</span>
            </button>
          </div>

          {/* VUE 1 : MON PASS */}
          {activeTab === 'pass' && (
            <div className="animate-in fade-in duration-300">
              <TicketPass />
            </div>
          )}

          {/* VUE 2 : ÉVÉNEMENTS & BILLETTERIE */}
          {activeTab === 'events' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">À l'affiche</h2>
                  <p className="text-xs text-slate-400">Réservez vos accès directement sur votre Pass</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {UPCOMING_EVENTS.map((evt) => (
                  <div 
                    key={evt.id}
                    className="group bg-slate-900/60 border border-white/5 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={evt.image} 
                        alt={evt.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                        {evt.tag}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                          {evt.title}
                        </h3>
                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{evt.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{evt.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-white">{evt.price}</span>
                        <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all">
                          <span>Réserver</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VUE 3 : PALMARÈS & SOUVENIRS */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-2xl font-bold text-white">Mon Palmarès</h2>
                <p className="text-xs text-slate-400">Historique des soirées validées sur la blockchain</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PAST_EVENTS.map((item) => (
                  <div key={item.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.badge}
                        </span>
                        <span className="text-xs text-slate-400">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-base">{item.title}</h4>
                      <p className="text-xs text-slate-400">{item.location}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      )}

      {/* 4. Bottom Bar pour Navigation Mobile */}
      {authenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07090e]/90 backdrop-blur-xl border-t border-white/10 px-6 py-2.5 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('pass')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'pass' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] font-medium">Mon Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'events' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium">Événements</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'history' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium">Palmarès</span>
          </button>
        </nav>
      )}

    </div>
  );
}

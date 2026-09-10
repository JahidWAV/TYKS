import Link from 'next/link';
import { LayoutDashboard, Calendar, BarChart3, Megaphone, Users, Wallet, Globe, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex">
      {/* Menu Latéral Pro */}
      <aside className="w-64 border-r border-[#111110]/10 bg-white/40 backdrop-blur-md flex flex-col justify-between sticky top-0 h-screen shrink-0">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-xl bg-[#111110] text-[#F7F5F0] flex items-center justify-center font-bold text-xs tracking-wider">T</span>
            <span className="font-display font-bold text-base tracking-tight">TYKS Pro</span>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider opacity-40 px-3 pb-2">Navigation</p>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition">
              <LayoutDashboard className="w-4 h-4" /> Overview
            </Link>
            <Link href="/events" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition">
              <Calendar className="w-4 h-4" /> Events
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition">
              <BarChart3 className="w-4 h-4" /> Analytics
            </Link>
            <Link href="/marketing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition">
              <Megaphone className="w-4 h-4" /> Marketing
            </Link>
            <Link href="/community" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition">
              <Users className="w-4 h-4" /> Community
            </Link>
            <Link href="/banking" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition">
              <Wallet className="w-4 h-4" /> Banking & Payouts
            </Link>
            <Link href="/page" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 hover:bg-[#111110]/5 transition">
              <Globe className="w-4 h-4" /> My Page
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-[#111110]/10 space-y-2 bg-white/30">
          <div className="grid grid-cols-2 gap-1 pt-1">
            <Link href="/settings" className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-[#111110]/10 bg-white/60 hover:bg-white text-[#111110] transition">
              <Settings className="w-3.5 h-3.5" />
              <span>Réglages</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Contenu dynamique injecté selon l'URL */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

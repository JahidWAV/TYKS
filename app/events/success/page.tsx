"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Ticket } from 'lucide-react';

export default function EventSuccessPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  return (
    <main className="min-h-screen bg-[#111110] text-[#F7F5F0] flex items-center justify-center px-6 selection:bg-[#F7F5F0] selection:text-[#111110]">
      <div className="max-w-md w-full bg-[#111110] border border-[#F7F5F0]/15 rounded-3xl p-8 md:p-10 space-y-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow de succès */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Paiement validé</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Vos places sont réservées !</h1>
          <p className="text-xs text-[#F7F5F0]/60 font-mono leading-relaxed pt-1">
            Merci pour votre achat. Un e-mail de confirmation vient de vous être envoyé avec vos billets.
          </p>
        </div>

        <div className="pt-4 border-t border-[#F7F5F0]/10 flex flex-col gap-3 relative z-10">
          {slug && (
            <Link
              href={`/events/${slug}`}
              className="w-full rounded-full bg-[#F7F5F0] text-[#111110] py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-white hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 font-bold shadow-lg"
            >
              <Ticket className="w-4 h-4" />
              <span>Retourner à l'événement</span>
            </Link>
          )}

          <Link
            href="/events"
            className="w-full rounded-full bg-[#F7F5F0]/5 text-[#F7F5F0]/80 py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-[#F7F5F0]/10 hover:text-[#F7F5F0] flex items-center justify-center gap-2 border border-[#F7F5F0]/10"
          >
            <span>Explorer l'agenda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}

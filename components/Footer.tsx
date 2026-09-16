"use client";

import Link from "next/link";

interface FooterProps {
  isDarkMode?: boolean;
}

export default function Footer({}: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#0f0f0f] text-white font-grotesque uppercase">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link href="/" className="font-bold tracking-wider text-xs flex items-center gap-2 text-white">
            <span className="h-4 w-4 border border-white/20 bg-white text-black flex items-center justify-center text-[9px] font-bold rounded-md">T</span>
            TYKS LIVE
          </Link>
          <p className="text-[10px] text-white/50 tracking-wider font-bold">
            © {new Date().getFullYear()} TYKS. TOUS DROITS RÉSERVÉS.
          </p>
        </div>

        {/* Liens utiles */}
        <div className="flex items-center gap-6 text-[10px] tracking-wider font-bold text-white/70">
          <Link href="/legal" className="hover:text-white transition-colors">
            MENTIONS LÉGALES
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            CONFIDENTIALITÉ
          </Link>
          <Link href="https://pro.tyks.app" className="hover:text-white transition-colors">
            ESPACE PRO
          </Link>
        </div>

      </div>
    </footer>
  );
}

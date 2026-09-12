"use client";

import Link from "next/link";

interface FooterProps {
  isDarkMode?: boolean;
}

export default function Footer({}: FooterProps) {
  return (
    <footer className="border-t border-neutral-800 bg-[#0a0b0e] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1 font-mono">
          <Link href="/" className="font-bold uppercase tracking-widest text-sm flex items-center gap-2 text-white">
            <span className="h-5 w-5 border border-neutral-700 bg-[#E5D4B4] text-black flex items-center justify-center text-[10px] font-bold">T</span>
            TYKS Live
          </Link>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            © {new Date().getFullYear()} TYKS. Tous droits réservés.
          </p>
        </div>

        {/* Liens utiles */}
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest font-bold text-neutral-400">
          <Link href="/legal" className="hover:text-white transition-colors">
            Mentions légales
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Confidentialité
          </Link>
          <Link href="https://pro.tyks.app" className="hover:text-[#E5D4B4] transition-colors">
            Espace Pro
          </Link>
        </div>

      </div>
    </footer>
  );
}

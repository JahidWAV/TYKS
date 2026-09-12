"use client";

import Link from "next/link";

interface FooterProps {
  isDarkMode?: boolean;
}

export default function Footer({}: FooterProps) {
  return (
    <footer className="border-t-2 border-black bg-white text-black">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link href="/" className="font-mono font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <span className="h-5 w-5 border-2 border-black bg-black text-white flex items-center justify-center text-[10px]">T</span>
            TYKS Live
          </Link>
          <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
            © {new Date().getFullYear()} TYKS. Tous droits réservés.
          </p>
        </div>

        {/* Liens utiles */}
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest font-bold">
          <Link href="/legal" className="border-b-2 border-transparent hover:border-black transition-colors">
            Mentions légales
          </Link>
          <Link href="/privacy" className="border-b-2 border-transparent hover:border-black transition-colors">
            Confidentialité
          </Link>
          <Link href="https://pro.tyks.app" className="border-b-2 border-transparent hover:border-black transition-colors">
            Espace Pro
          </Link>
        </div>

      </div>
    </footer>
  );
}

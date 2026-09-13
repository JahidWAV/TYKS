"use client";

import Link from "next/link";

interface FooterProps {
  isDarkMode?: boolean;
}

export default function Footer({}: FooterProps) {
  return (
    <footer className="border-t border-[#1e3932]/10 bg-white text-[#1e3932]">
      <div className="mx-auto max-w-7xl px-6 py-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-0.5">
          <Link href="/" className="font-medium tracking-wider text-xs flex items-center gap-2 text-[#1e3932]">
            <span className="h-4 w-4 border border-[#1e3932]/20 bg-[#1e3932] text-white flex items-center justify-center text-[9px] font-medium rounded">T</span>
            TYKS Live
          </Link>
          <p className="text-[11px] text-[#1e3932]/60 tracking-wide font-light">
            © {new Date().getFullYear()} TYKS. Tous droits réservés.
          </p>
        </div>

        {/* Liens utiles */}
        <div className="flex items-center gap-6 text-[11px] tracking-wide font-medium text-[#1e3932]/70">
          <Link href="/legal" className="hover:text-[#1e3932] transition-colors">
            Mentions légales
          </Link>
          <Link href="/privacy" className="hover:text-[#1e3932] transition-colors">
            Confidentialité
          </Link>
          <Link href="https://pro.tyks.app" className="hover:text-[#1e3932] transition-colors font-semibold">
            Espace Pro
          </Link>
        </div>

      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";

interface FooterProps {
  isDarkMode?: boolean;
}

export default function Footer({ isDarkMode = false }: FooterProps) {
  return (
    <footer className={`border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#111110] border-[#F7F5F0]/10 text-[#F7F5F0]' 
        : 'bg-[#F7F5F0] border-[#111110]/10 text-[#111110]'
    }`}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link href="/" className="font-display text-lg font-bold tracking-tighter">
            TYKS
          </Link>
          <p className={`text-xs ${isDarkMode ? 'text-[#F7F5F0]/40' : 'text-[#111110]/40'}`}>
            © {new Date().getFullYear()} TYKS. Tous droits réservés.
          </p>
        </div>

        {/* Liens utiles */}
        <div className="flex items-center gap-6 text-xs font-medium">
          <Link href="/legal" className={`transition-colors ${isDarkMode ? 'text-[#F7F5F0]/60 hover:text-[#F7F5F0]' : 'text-[#111110]/60 hover:text-[#111110]'}`}>
            Mentions légales
          </Link>
          <Link href="/privacy" className={`transition-colors ${isDarkMode ? 'text-[#F7F5F0]/60 hover:text-[#F7F5F0]' : 'text-[#111110]/60 hover:text-[#111110]'}`}>
            Confidentialité
          </Link>
          <Link href="https://pro.tyks.app" className={`transition-colors ${isDarkMode ? 'text-[#F7F5F0]/60 hover:text-[#F7F5F0]' : 'text-[#111110]/60 hover:text-[#111110]'}`}>
            Espace Pro
          </Link>
        </div>

      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tyks Pro — Organisateurs & Billetterie',
  description: 'Reprenez le contrôle de votre billetterie et de vos marges.',
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-onyx text-bone flex flex-col font-sans selection:bg-bone selection:text-onyx">
      {/* Header / Navigation Pro */}
      <header className="border-b border-onyx-line bg-onyx/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-tight text-bone">TYKS</span>
            <span className="font-mono text-[10px] bg-onyx-raised border border-onyx-line px-2 py-0.5 rounded text-bone-muted uppercase tracking-wider">
              Pro
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-bone-muted hover:text-bone transition-colors"
            >
              Se connecter / S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal de la page */}
      <main className="flex-1">{children}</main>

      {/* Footer Pro */}
      <footer className="border-t border-onyx-line bg-onyx-raised/20 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-bone-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bone inline-block"></span>
            <span>TYKS LIVE — © {new Date().getFullYear()} Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="hover:text-bone transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-bone transition-colors">
              Confidentialité
            </Link>
            <Link href="/" className="hover:text-bone transition-colors">
              Espace Pro
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

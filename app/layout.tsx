import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
});

export const metadata: Metadata = {
  title: 'TYKS - Billetterie Premium',
  description: 'Gérez vos événements en toute simplicité',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  
  // Détection basée sur ton nouveau domaine d'application
  const isAppDomain = hostname.includes('tyks.app');
  const isPro = hostname.startsWith('pro.'); // Gardé au cas où tu gardes un sous-domaine pro

  return (
    <html
      lang="fr"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans selection:bg-white selection:text-black">
        
        {/* Navbar publique masquée sur tyks.app */}
        {!isAppDomain && <Navbar isPro={isPro} />}

        {/* Contenu de la page courante */}
        <main className="relative z-10 flex-1">{children}</main>
        
        {/* Footer public masqué sur tyks.app */}
        {!isAppDomain && <Footer />}

      </body>
    </html>
  );
}

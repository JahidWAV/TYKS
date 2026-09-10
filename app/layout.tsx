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
  const isPro = hostname.startsWith('pro.');
  const isDashboard = hostname.startsWith('dashboard.');

  return (
    <html
      lang="fr"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-onyx bg-night-glow text-bone flex flex-col selection:bg-bone/20 selection:text-bone font-sans">
        <div className="grain" aria-hidden="true" />
        
        {/* La Navbar s'affiche sur tyks.app et pro.tyks.app, mais masquée sur dashboard.tyks.app */}
        {!isDashboard && <Navbar isPro={isPro} />}

        <main className="relative z-10 flex-1">{children}</main>
        
        {/* Idem pour le footer */}
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}

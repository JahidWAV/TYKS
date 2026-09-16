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
  
  const isDashboard = hostname.startsWith('dashboard.');
  const isPro = hostname.startsWith('pro.');

  return (
    <html
      lang="fr"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable} snap-y snap-mandatory scroll-smooth`}
    >
      <body className="min-h-screen bg-white text-[#1e3932] flex flex-col selection:bg-[#1e3932]/20 selection:text-[#1e3932] font-sans">
        
        {/* Navbar affichée partout sauf sur le dashboard (elle défilera naturellement avec la page) */}
        {!isDashboard && <Navbar isPro={isPro} />}

        <main className="relative z-10 flex-1">{children}</main>
        
        {/* Footer affiché partout sauf sur le dashboard */}
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}

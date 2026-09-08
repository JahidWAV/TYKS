import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

// Ajustez ces trois fonts selon votre charte d'origine si ce n'était pas
// exactement celles-ci — ce qui compte est de bien exposer les variables
// CSS attendues par tailwind.config.ts : --font-body, --font-display, --font-mono
const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tyks Pro - Billetterie',
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

  return (
    <html
      lang="fr"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-onyx text-bone flex flex-col selection:bg-bone/20 selection:text-bone font-sans">
        <Navbar isPro={isPro} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

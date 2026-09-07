import type { Metadata } from 'next';
import { Unbounded, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const display = Unbounded({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
});

const body = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'TYKS — Billetterie premium',
  description:
    "TYKS est la billetterie premium des soirées d'exception : pass d'accès vérifié, entrée instantanée, aucun frais caché.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-onyx text-bone antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

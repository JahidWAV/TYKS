import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
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

  return (
    <html
      lang="fr"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-white text-[#1e3932] font-sans">
        {/* Le layout ne gère plus la navbar/footer globaux pour les pages publiques, 
            tout est intégré directement dans la page pour un contrôle total du flux. */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'iorti. — Pass & Billetterie Nightlife',
  description: 'Accès exclusifs et billetterie sans friction.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-void text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

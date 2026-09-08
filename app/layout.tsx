import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Tyks Pro - Billetterie',
  description: 'Gérez vos événements en toute simplicité',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-onyx text-bone flex flex-col selection:bg-bone/20 selection:text-bone font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

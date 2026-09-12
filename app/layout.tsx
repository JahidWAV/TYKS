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
  
  // Next.js transmet l'URL complète ou le chemin via ces en-têtes selon la configuration
  const referer = headersList.get('referer') || '';
  const xUrl = headersList.get('x-url') || '';
  
  // On détecte si on est à la racine exacte de l'app publique
  // (Par sécurité, on analyse si l'URL se termine par le domaine ou '/' sans sous-dossier de dashboard/pro)
  const isDashboard = hostname.startsWith('dashboard.');
  const isPro = hostname.startsWith('pro.');

  // Si tu utilises le fichier app/page.tsx comme racine publique :
  // On peut s'assurer que c'est masqué si l'en-tête indique la racine (ou via un header de requête interne)
  const path = headersList.get('x-invoke-path') || '';
  const isRootPublicPage = path === '/' || (!isDashboard && !isPro && referer.endsWith('/')); // Ajustement selon ton infra

  // Solution la plus propre et robuste en Server Component avec Next.js App Router :
  // Next.js injecte souvent l'URL complète dans 'x-forwarded-url' ou 'x-invoke-url'
  const fullUrl = headersList.get('x-invoke-url') || '';
  const isHome = fullUrl === '/' || fullUrl === '' || hostname.includes('tyks.app') && !isDashboard && !isPro && !fullUrl.includes('/events');

  // Alternative radicale si ta page PublicHome est dans app/page.tsx : 
  // On peut masquer la navbar dès qu'on est sur le domaine principal racine (hors dashboard/pro)
  const hideNavbarAndFooter = isDashboard || (!isPro && !isDashboard); // <--- Ajuste ici selon si tu veux garder la navbar sur les autres pages publiques (comme /events/[slug])

  return (
    <html
      lang="fr"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-onyx bg-night-glow text-bone flex flex-col selection:bg-bone/20 selection:text-bone font-sans">
        <div className="grain" aria-hidden="true" />
        
        {/* Affichage conditionnel affiné */}
        {!isDashboard && !isHome && <Navbar isPro={isPro} />}

        <main className="relative z-10 flex-1">{children}</main>
        
        {!isDashboard && !isHome && <Footer />}
      </body>
    </html>
  );
}

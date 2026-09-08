import { headers } from 'next/headers';
import OrganizerDashboardContent from '@/components/OrganizerDashboardContent';

export default async function Page() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  // Si on est sur le site public principal (tyks.app)
  if (!hostname.startsWith('pro.')) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center space-y-6">
        <h1 className="font-display text-5xl font-extrabold text-bone">TYKS</h1>
        <p className="text-bone-muted text-lg">La billetterie nouvelle génération.</p>
        <div>
          <a 
            href="https://pro.tyks.app" 
            className="inline-block rounded-full bg-bone px-6 py-3 text-sm font-semibold text-onyx hover:bg-white transition"
          >
            Espace Organisateur (Pro)
          </a>
        </div>
      </div>
    );
  }

  // Si on est sur pro.tyks.app, on affiche ton dashboard organisateur complet
  return <OrganizerDashboardContent />;
}

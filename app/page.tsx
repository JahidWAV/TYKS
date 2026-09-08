import { headers } from 'next/headers';
import PublicHome from '@/components/PublicHome';
import OrganizerDashboard from '@/components/OrganizerDashboard';

export default async function Page() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const isPro = hostname.startsWith('pro.');

  // pro.tyks.app -> dashboard organisateur
  if (isPro) {
    return <OrganizerDashboard />;
  }

  // tyks.app -> vitrine publique
  return <PublicHome />;
}

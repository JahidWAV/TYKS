import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tyks Pro — Organisateurs & Billetterie',
  description: 'Reprenez le contrôle de votre billetterie et de vos marges.',
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-onyx text-bone font-sans selection:bg-bone selection:text-onyx">
      {children}
    </div>
  );
}

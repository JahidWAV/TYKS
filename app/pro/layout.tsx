import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tyks Pro — Espace Organisateur',
  description: 'Reprenez le contrôle de votre billetterie et de vos marges.',
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0f0f0f] text-white selection:bg-white selection:text-black font-grotesque antialiased min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}

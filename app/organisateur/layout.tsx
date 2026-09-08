import Header from '@/components/Header'; // Ajuste le chemin si ton fichier est dans app/components/Header

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-onyx text-bone flex flex-col selection:bg-cobalt selection:text-bone">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
